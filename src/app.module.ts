import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users.module';
import { BusinessModule } from './business/business.module';
import { IntegrationsModule } from './onboarding/integrations.module';
import { ProductsModule } from './products/products.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { User } from './user.entity';
import { Business } from './business/business.entity';
import { Product } from './products/product.entity';
import { Order } from './deliveries/order.entity';
import { Delivery } from './deliveries/delivery.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Business, Product, Order, Delivery],
        autoLoadEntities: true,
        synchronize: true, // Note: Set to false in production
      }),
    }),
    UsersModule,
    BusinessModule,
    IntegrationsModule,
    ProductsModule,
    DeliveriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
