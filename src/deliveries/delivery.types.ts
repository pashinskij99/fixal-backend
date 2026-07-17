import { Carrier } from './carrier.enum';
import { DeliveryMethod } from './delivery-method.enum';
import { DeliveryStatus } from './delivery-status.enum';
import { OrderStatus } from './order-status.enum';
import { PaymentStatus } from './payment-status.enum';
import { PaymentType } from './payment-type.enum';
import { PayerType } from './payer-type.enum';

export const carrierValues = Object.values(Carrier);
export const deliveryMethodValues = Object.values(DeliveryMethod);
export const deliveryStatusValues = Object.values(DeliveryStatus);
export const orderStatusValues = Object.values(OrderStatus);
export const paymentTypeValues = Object.values(PaymentType);
export const paymentStatusValues = Object.values(PaymentStatus);
export const payerTypeValues = Object.values(PayerType);
