import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { Product } from './product.entity';
import { Business } from '../business/business.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';

@Injectable()
export class ProductsService {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'products');

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async createForBusiness(
    userId: number,
    businessId: number,
    dto: CreateProductDto,
    photo?: Express.Multer.File,
  ): Promise<Product> {
    const business = await this.getOwnedBusinessOrThrow(userId, businessId);

    const existing = await this.productsRepository.findOne({
      where: { business: { id: businessId }, sku: dto.sku },
      relations: ['business'],
    });

    if (existing) {
      throw new BadRequestException('SKU must be unique inside business');
    }

    if (
      dto.salePrice !== undefined &&
      dto.salePrice !== null &&
      dto.salePrice >= dto.price
    ) {
      throw new BadRequestException(
        'Sale price must be lower than original price',
      );
    }

    const photoUrl = photo ? await this.optimizeAndStorePhoto(photo) : null;

    const productPayload: DeepPartial<Product> = {
      name: dto.name,
      price: dto.price,
      salePrice: dto.salePrice ?? null,
      sku: dto.sku,
      photoUrl,
      dynamicParameters: dto.dynamicParameters ?? [],
      business,
    };

    const product = this.productsRepository.create(productPayload);

    return this.productsRepository.save(product);
  }

  async findProducts(
    userId: number,
    businessId: number,
    queryDto: FindProductsQueryDto,
  ): Promise<{ data: Product[]; totalCount: number }> {
    await this.getOwnedBusinessOrThrow(userId, businessId);

    const { name, page = 1, limit = 10 } = queryDto;

    const query = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.business', 'business')
      .where('business.id = :businessId', { businessId })
      .orderBy('product.createdAt', 'DESC');

    if (name?.trim()) {
      query.andWhere('product.name ILIKE :name', { name: `%${name.trim()}%` });
    }

    const totalCount = await query.getCount();

    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, totalCount };
  }

  async findByIdProduct(
    userId: number,
    businessId: number,
    productId: number,
  ): Promise<Product> {
    return this.getOwnedProductInBusinessOrThrow(userId, businessId, productId);
  }

  async changeProduct(
    userId: number,
    businessId: number,
    productId: number,
    dto: UpdateProductDto,
    photo?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.getOwnedProductInBusinessOrThrow(
      userId,
      businessId,
      productId,
    );

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productsRepository.findOne({
        where: { business: { id: product.business.id }, sku: dto.sku },
      });

      if (existing) {
        throw new BadRequestException('SKU must be unique inside business');
      }
    }

    if (photo) {
      const newPhotoUrl = await this.optimizeAndStorePhoto(photo);
      await this.deletePhotoIfExists(product.photoUrl);
      product.photoUrl = newPhotoUrl;
    }

    if (dto.name !== undefined) {
      product.name = dto.name;
    }

    const nextPrice = dto.price !== undefined ? dto.price : product.price;
    const nextSalePrice =
      dto.salePrice !== undefined ? dto.salePrice : product.salePrice;

    if (
      nextSalePrice !== null &&
      nextSalePrice !== undefined &&
      nextSalePrice >= nextPrice
    ) {
      throw new BadRequestException(
        'Sale price must be lower than original price',
      );
    }

    if (dto.price !== undefined) {
      product.price = dto.price;
    }

    if (dto.salePrice !== undefined) {
      product.salePrice = dto.salePrice;
    }

    if (dto.sku !== undefined) {
      product.sku = dto.sku;
    }

    if (dto.dynamicParameters !== undefined) {
      product.dynamicParameters = dto.dynamicParameters;
    }

    return this.productsRepository.save(product);
  }

  async removeProduct(
    userId: number,
    businessId: number,
    productId: number,
  ): Promise<void> {
    const product = await this.getOwnedProductInBusinessOrThrow(
      userId,
      businessId,
      productId,
    );
    await this.deletePhotoIfExists(product.photoUrl);
    await this.productsRepository.remove(product);
  }

  private async getOwnedBusinessOrThrow(
    userId: number,
    businessId: number,
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.owner?.id !== userId) {
      throw new ForbiddenException('You do not have access to this business');
    }

    return business;
  }

  private async getOwnedProductInBusinessOrThrow(
    userId: number,
    businessId: number,
    productId: number,
  ): Promise<Product> {
    await this.getOwnedBusinessOrThrow(userId, businessId);

    const product = await this.productsRepository.findOne({
      where: { id: productId, business: { id: businessId } },
      relations: ['business'],
    });

    if (!product) {
      throw new NotFoundException('Product not found in this business');
    }

    return product;
  }

  private async optimizeAndStorePhoto(
    file: Express.Multer.File,
  ): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}.webp`;
    const absolutePath = join(this.uploadDir, filename);

    await sharp(file.buffer)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toFile(absolutePath);

    return `/uploads/products/${filename}`;
  }

  private async deletePhotoIfExists(photoUrl: string | null): Promise<void> {
    if (!photoUrl) {
      return;
    }

    const relativePath = photoUrl.replace(/^\/uploads\//, '');
    const absolutePath = join(process.cwd(), 'uploads', relativePath);

    try {
      await fs.unlink(absolutePath);
    } catch {
      // Ignore missing files to keep update/delete idempotent.
    }
  }
}
