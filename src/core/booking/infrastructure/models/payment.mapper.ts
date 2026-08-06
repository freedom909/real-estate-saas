

import { Payment, PaymentProvider } from "@/core/payment/domain/entity/payment.entity";
import PaymentModel from "@/core/payment/infra/model/payment.model";
import { v4 as uuidv4 } from "uuid";

export class PaymentMapper {

 static toPersistence(payment: Payment) {

   return {
     id: payment.id,
     booking_id: payment.bookingId,
     amount: payment.amount,
     transaction_id: payment.transactionId,
   };

 }


 static toDomain(raw: PaymentModel) {
const payment = Payment.create({

  id: uuidv4(),//

  bookingId: raw.id,

  customerId: raw.customerId,

  tenantId: raw.tenantId,

  dateRange: raw.dateRange,

  paymentProvider: PaymentProvider.MOCK,

  amount: raw.price,

  transactionId: `transaction_${uuidv4()}`
});
return payment
 }

}