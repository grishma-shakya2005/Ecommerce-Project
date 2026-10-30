import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  images: string[];
  stock: number;
  sku: string;
  rating: number;
  reviews: Array<{
    userId: string;
    comment: string;
    rating: number;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, min: 0 },
    sku: { type: String, required: true, unique: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [{
      userId: String,
      comment: String,
      rating: { type: Number, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

export default model<IProduct>('Product', productSchema);
