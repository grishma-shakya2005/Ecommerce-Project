import { Schema, model, Document } from 'mongoose';

export const ORDER_STATUSES = [
  'pending',
  'payment_confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];
export const PAYMENT_METHODS = ['cod', 'esewa', 'khalti', 'mobile_banking', 'card'] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface IOrder extends Document {
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  tax: number;
  shipping: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  bankName?: string;
  paymentStatus: PaymentStatus;
  transactionHash: string;
  transactionSignature: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true, required: true },
    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String
    },
    items: [{
      productId: String,
      quantity: Number,
      price: Number
    }],
    total: Number,
    tax: Number,
    shipping: Number,
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true, default: 'cod' },
    bankName: { type: String, trim: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionHash: { type: String, required: true },
    transactionSignature: { type: String, required: true }
  },
  { timestamps: true }
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await model<IOrder>('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

export default model<IOrder>('Order', orderSchema);
