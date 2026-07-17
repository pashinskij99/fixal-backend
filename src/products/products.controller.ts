import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Request as ExpressRequest } from 'express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { ProductsService } from './products.service';

type AuthenticatedRequest = ExpressRequest & {
  user: { userId: number; email: string };
};

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('business/:businessId')
  async findProduct(
    @Request() req: AuthenticatedRequest,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query() query: FindProductsQueryDto,
  ) {
    return this.productsService.findProducts(
      req.user.userId,
      businessId,
      query,
    );
  }

  @Get('business/:businessId/:productId')
  async findByIdProduct(
    @Request() req: AuthenticatedRequest,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.productsService.findByIdProduct(
      req.user.userId,
      businessId,
      productId,
    );
  }

  @Post('business/:businessId')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createForBusiness(
    @Request() req: AuthenticatedRequest,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: CreateProductDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.productsService.createForBusiness(
      req.user.userId,
      businessId,
      dto,
      photo,
    );
  }

  @Patch('business/:businessId/:productId')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async changeProduct(
    @Request() req: AuthenticatedRequest,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.productsService.changeProduct(
      req.user.userId,
      businessId,
      productId,
      dto,
      photo,
    );
  }

  @Delete('business/:businessId/:productId')
  async removeProduct(
    @Request() req: AuthenticatedRequest,
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.productsService.removeProduct(
      req.user.userId,
      businessId,
      productId,
    );
    return { message: 'Product removed successfully' };
  }
}
