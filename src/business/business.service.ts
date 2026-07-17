import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './business.entity';
import { User } from '../user.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { Carrier } from '../deliveries/carrier.enum';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    userId: number,
    createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const business = this.businessRepository.create({
      ...createBusinessDto,
      owner: user,
    });
    return this.businessRepository.save(business);
  }

  async findAllByUser(userId: number): Promise<Business[]> {
    return this.businessRepository.find({ where: { owner: { id: userId } } });
  }

  async updateSettings(
    userId: number,
    businessId: number,
    dto: UpdateBusinessSettingsDto,
  ): Promise<Business> {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: ['owner'],
    });

    if (!business || business.owner?.id !== userId) {
      throw new Error('Business not found');
    }

    if (dto.defaultCarrier !== undefined) {
      business.defaultCarrier = dto.defaultCarrier as Carrier;
    }

    return this.businessRepository.save(business);
  }
}
