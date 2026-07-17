import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Business } from '../business/business.entity';
import { Delivery } from './delivery.entity';
import { Order } from './order.entity';
import { CreateDeliveryDto } from './create-delivery.dto';
import { UpdateDeliveryDto } from './update-delivery.dto';
import { FindDeliveriesQueryDto } from './find-deliveries-query.dto';
import { OrderStatus } from './order-status.enum';
import { PaymentStatus } from './payment-status.enum';
import { DeliveryStatus } from './delivery-status.enum';
import { PaymentType } from './payment-type.enum';
import { Carrier } from './carrier.enum';
import { DeliveryMethod } from './delivery-method.enum';
import { PayerType } from './payer-type.enum';

type NovaPoshtaCarrierMetadata = {
  cityRef: string;
  warehouseRef: string;
  serviceType: string;
};

type UkrposhtaCarrierMetadata = {
  postcode: string;
  regionId: string;
  districtId: string;
  cityId: string;
  streetId: string;
  house: string;
  apartment?: string;
};

type RozetkaCarrierMetadata = {
  rozetkaPointId: string;
  cityId: string;
};

type HeavyCargoCarrierMetadata = {
  cargoType: string;
  departureWarehouseId: string;
  arrivalWarehouseId: string;
  length: number;
  width: number;
  height: number;
};

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async createForBusiness(
    userId: number,
    businessId: number,
    dto: CreateDeliveryDto,
  ): Promise<Delivery> {
    const business = await this.getOwnedBusinessOrThrow(userId, businessId);

    const orderNumber =
      dto.orderNumber?.trim() || (await this.generateOrderNumber(businessId));

    const existingOrder = await this.ordersRepository.findOne({
      where: { orderNumber },
    });

    if (existingOrder) {
      throw new BadRequestException('Order number already exists');
    }

    const carrierMetadata = this.normalizeAndValidateCarrierMetadata(
      dto.carrier as Carrier,
      dto.carrierMetadata,
    );

    const orderPayload: DeepPartial<Order> = {
      business,
      orderNumber,
      totalAmount: dto.totalAmount,
      currency: dto.currency ?? 'UAH',
      status: (dto.orderStatus as OrderStatus | undefined) ?? OrderStatus.NEW,
      paymentType: dto.paymentType as PaymentType,
      paymentStatus:
        (dto.paymentStatus as PaymentStatus | undefined) ??
        PaymentStatus.PENDING,
      recipientName: dto.recipientName,
      recipientPhone: dto.recipientPhone,
      recipientEmail: dto.recipientEmail ?? null,
    };

    const order = this.ordersRepository.create(orderPayload);

    const savedOrder = await this.ordersRepository.save(order);

    const deliveryPayload: DeepPartial<Delivery> = {
      order: savedOrder,
      carrier: dto.carrier as Carrier,
      deliveryMethod: dto.deliveryMethod as DeliveryMethod,
      trackingNumber: null,
      status: DeliveryStatus.DRAFT,
      weight: dto.weight,
      volume: dto.volume ?? null,
      seatsCount: dto.seatsCount ?? 1,
      declaredValue: dto.declaredValue,
      codAmount: dto.codAmount ?? null,
      payerType: dto.payerType as PayerType,
      shippingCost: dto.shippingCost ?? null,
      formattedAddress: dto.formattedAddress,
      carrierMetadata,
    };

    const delivery = this.deliveriesRepository.create(deliveryPayload);

    return this.deliveriesRepository.save(delivery);
  }

  async findByBusiness(
    userId: number,
    businessId: number,
    queryDto: FindDeliveriesQueryDto,
  ): Promise<{ data: Delivery[]; totalCount: number }> {
    await this.getOwnedBusinessOrThrow(userId, businessId);

    const { page = 1, limit = 10, search, status } = queryDto;

    const query = this.deliveriesRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.business', 'business')
      .where('business.id = :businessId', { businessId })
      .orderBy('delivery.createdAt', 'DESC');

    if (search?.trim()) {
      query.andWhere(
        '(order.orderNumber ILIKE :search OR order.recipientName ILIKE :search OR order.recipientPhone ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    if (status) {
      query.andWhere('delivery.status = :status', { status });
    }

    const totalCount = await query.getCount();
    const data = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, totalCount };
  }

  async findOne(
    userId: number,
    businessId: number,
    deliveryId: string,
  ): Promise<Delivery> {
    return this.getOwnedDeliveryOrThrow(userId, businessId, deliveryId);
  }

  async update(
    userId: number,
    businessId: number,
    deliveryId: string,
    dto: UpdateDeliveryDto,
  ): Promise<Delivery> {
    const delivery = await this.getOwnedDeliveryOrThrow(
      userId,
      businessId,
      deliveryId,
    );

    if (
      ![DeliveryStatus.DRAFT, DeliveryStatus.CREATED].includes(delivery.status)
    ) {
      throw new ForbiddenException(
        'Only draft or created deliveries can be edited',
      );
    }

    if (dto.orderNumber && dto.orderNumber !== delivery.order.orderNumber) {
      const existingOrder = await this.ordersRepository.findOne({
        where: { orderNumber: dto.orderNumber },
      });

      if (existingOrder) {
        throw new BadRequestException('Order number already exists');
      }

      delivery.order.orderNumber = dto.orderNumber;
    }

    if (dto.totalAmount !== undefined) {
      delivery.order.totalAmount = dto.totalAmount;
    }

    if (dto.currency !== undefined) {
      delivery.order.currency = dto.currency;
    }

    if (dto.orderStatus !== undefined) {
      delivery.order.status = dto.orderStatus as OrderStatus;
    }

    if (dto.paymentType !== undefined) {
      delivery.order.paymentType = dto.paymentType as PaymentType;
    }

    if (dto.paymentStatus !== undefined) {
      delivery.order.paymentStatus = dto.paymentStatus as PaymentStatus;
    }

    if (dto.recipientName !== undefined) {
      delivery.order.recipientName = dto.recipientName;
    }

    if (dto.recipientPhone !== undefined) {
      delivery.order.recipientPhone = dto.recipientPhone;
    }

    if (dto.recipientEmail !== undefined) {
      delivery.order.recipientEmail = dto.recipientEmail ?? null;
    }

    const effectiveCarrier =
      (dto.carrier as Carrier | undefined) ?? delivery.carrier;
    const effectiveCarrierMetadata =
      dto.carrierMetadata !== undefined
        ? dto.carrierMetadata
        : delivery.carrierMetadata;
    const normalizedCarrierMetadata = this.normalizeAndValidateCarrierMetadata(
      effectiveCarrier,
      effectiveCarrierMetadata,
    );

    if (dto.carrier !== undefined) {
      delivery.carrier = dto.carrier as Carrier;
    }

    if (dto.deliveryMethod !== undefined) {
      delivery.deliveryMethod = dto.deliveryMethod as DeliveryMethod;
    }

    if (dto.status !== undefined) {
      delivery.status = dto.status as DeliveryStatus;
    }

    if (dto.trackingNumber !== undefined) {
      delivery.trackingNumber = dto.trackingNumber ?? null;
    }

    if (dto.weight !== undefined) {
      delivery.weight = dto.weight;
    }

    if (dto.volume !== undefined) {
      delivery.volume = dto.volume ?? null;
    }

    if (dto.seatsCount !== undefined) {
      delivery.seatsCount = dto.seatsCount;
    }

    if (dto.declaredValue !== undefined) {
      delivery.declaredValue = dto.declaredValue;
    }

    if (dto.codAmount !== undefined) {
      delivery.codAmount = dto.codAmount ?? null;
    }

    if (dto.payerType !== undefined) {
      delivery.payerType = dto.payerType as PayerType;
    }

    if (dto.shippingCost !== undefined) {
      delivery.shippingCost = dto.shippingCost ?? null;
    }

    if (dto.formattedAddress !== undefined) {
      delivery.formattedAddress = dto.formattedAddress;
    }

    if (dto.carrierMetadata !== undefined) {
      delivery.carrierMetadata = normalizedCarrierMetadata;
    } else if (dto.carrier !== undefined) {
      delivery.carrierMetadata = normalizedCarrierMetadata;
    }

    await this.ordersRepository.save(delivery.order);
    return this.deliveriesRepository.save(delivery);
  }

  private async generateOrderNumber(businessId: number): Promise<string> {
    const count = await this.ordersRepository.count({
      where: { business: { id: businessId } },
    });

    return `#${count + 1001}`;
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

  private async getOwnedDeliveryOrThrow(
    userId: number,
    businessId: number,
    deliveryId: string,
  ): Promise<Delivery> {
    await this.getOwnedBusinessOrThrow(userId, businessId);

    const delivery = await this.deliveriesRepository.findOne({
      where: { id: deliveryId, order: { business: { id: businessId } } },
      relations: ['order', 'order.business'],
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found in this business');
    }

    return delivery;
  }

  private normalizeAndValidateCarrierMetadata(
    carrier: Carrier,
    metadata?: Record<string, unknown>,
  ): Record<string, unknown> {
    const safeMetadata = this.ensureObject(metadata, 'carrierMetadata');

    switch (carrier) {
      case Carrier.NOVA_POSHTA:
        return this.validateNovaPoshtaMetadata(safeMetadata);
      case Carrier.UKRPOSHTA:
        return this.validateUkrposhtaMetadata(safeMetadata);
      case Carrier.ROZETKA:
        return this.validateRozetkaMetadata(safeMetadata);
      case Carrier.SAT:
      case Carrier.DELIVERY_GROUP:
        return this.validateHeavyCargoMetadata(safeMetadata);
      case Carrier.MEEST:
        return safeMetadata;
      default:
        return safeMetadata;
    }
  }

  private ensureObject(
    value: Record<string, unknown> | undefined,
    fieldName: string,
  ): Record<string, unknown> {
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      throw new BadRequestException(`${fieldName} must be an object`);
    }

    return value;
  }

  private getRequiredString(
    metadata: Record<string, unknown>,
    fieldName: string,
  ): string {
    const value = metadata[fieldName];

    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`carrierMetadata.${fieldName} is required`);
    }

    return value.trim();
  }

  private getOptionalString(
    metadata: Record<string, unknown>,
    fieldName: string,
  ): string | undefined {
    const value = metadata[fieldName];

    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException(
        `carrierMetadata.${fieldName} must be a string`,
      );
    }

    return value.trim();
  }

  private getRequiredPositiveNumber(
    metadata: Record<string, unknown>,
    fieldName: string,
  ): number {
    const value = metadata[fieldName];
    const parsed = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException(
        `carrierMetadata.${fieldName} must be a positive number`,
      );
    }

    return parsed;
  }

  private validateNovaPoshtaMetadata(
    metadata: Record<string, unknown>,
  ): NovaPoshtaCarrierMetadata {
    return {
      cityRef: this.getRequiredString(metadata, 'cityRef'),
      warehouseRef: this.getRequiredString(metadata, 'warehouseRef'),
      serviceType: this.getRequiredString(metadata, 'serviceType'),
    };
  }

  private validateUkrposhtaMetadata(
    metadata: Record<string, unknown>,
  ): UkrposhtaCarrierMetadata {
    return {
      postcode: this.getRequiredString(metadata, 'postcode'),
      regionId: this.getRequiredString(metadata, 'regionId'),
      districtId: this.getRequiredString(metadata, 'districtId'),
      cityId: this.getRequiredString(metadata, 'cityId'),
      streetId: this.getRequiredString(metadata, 'streetId'),
      house: this.getRequiredString(metadata, 'house'),
      apartment: this.getOptionalString(metadata, 'apartment'),
    };
  }

  private validateRozetkaMetadata(
    metadata: Record<string, unknown>,
  ): RozetkaCarrierMetadata {
    return {
      rozetkaPointId: this.getRequiredString(metadata, 'rozetkaPointId'),
      cityId: this.getRequiredString(metadata, 'cityId'),
    };
  }

  private validateHeavyCargoMetadata(
    metadata: Record<string, unknown>,
  ): HeavyCargoCarrierMetadata {
    return {
      cargoType: this.getRequiredString(metadata, 'cargoType'),
      departureWarehouseId: this.getRequiredString(
        metadata,
        'departureWarehouseId',
      ),
      arrivalWarehouseId: this.getRequiredString(
        metadata,
        'arrivalWarehouseId',
      ),
      length: this.getRequiredPositiveNumber(metadata, 'length'),
      width: this.getRequiredPositiveNumber(metadata, 'width'),
      height: this.getRequiredPositiveNumber(metadata, 'height'),
    };
  }
}
