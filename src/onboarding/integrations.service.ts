import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Integration } from './integration.entity';
import { GetDeliveriesFilterDto } from './dto/get-deliveries-filter.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    @InjectRepository(Integration)
    private integrationRepository: Repository<Integration>,
  ) {}

  async findByBusiness(businessId: number): Promise<Integration[]> {
    return this.integrationRepository.find({
      where: { business: { id: businessId } },
    });
  }

  async connectNovaPoshta(
    businessId: number,
    apiKey: string,
  ): Promise<Integration> {
    let integration = await this.integrationRepository.findOne({
      where: { business: { id: businessId }, type: 'nova-poshta' },
    });

    if (integration) {
      integration.apiKey = apiKey;
    } else {
      integration = this.integrationRepository.create({
        type: 'nova-poshta',
        apiKey,
        business: { id: businessId },
      });
    }
    return this.integrationRepository.save(integration);
  }

  async getNovaPoshtaDeliveries(
    businessId: number,
    filter: GetDeliveriesFilterDto,
  ) {
    const integration = await this.integrationRepository.findOne({
      where: { business: { id: businessId }, type: 'nova-poshta' },
    });

    if (!integration) {
      throw new HttpException(
        'Nova Poshta integration not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const methodProperties = Object.fromEntries(
      Object.entries(filter).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
      ),
    );

    try {
      console.log({ apiKey: integration.apiKey, methodProperties });

      const response = await axios.post(
        'https://api.novaposhta.ua/v2.0/json/',
        {
          apiKey: integration.apiKey,
          modelName: 'InternetDocument',
          calledMethod: 'getDocumentList',
          methodProperties,
        },
      );

      if (!response.data.success) {
        console.error('Nova Poshta API Error:', response.data.errors);
        throw new HttpException(
          `Nova Poshta API Error: ${response.data.errors.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        data: response.data.data,
        totalCount: response.data.info?.totalCount || 0,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios Error fetching Nova Poshta:', error.message);
        if (error.response) {
          console.error('Response Data:', error.response.data);
        }
      } else {
        console.error('Unknown Error fetching Nova Poshta:', error);
      }

      // If it's already an HttpException, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch data from Nova Poshta',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
