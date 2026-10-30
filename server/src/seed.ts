import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from './models/Order.js';
import { hashOrderData, signOrderHash } from './utils/orderSignature.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/palpali';

interface SeedProduct {
  name: string;
  category: string;
  price: number;
  description: string;
  images: string[];
  stock: number;
  discountedPrice?: number;
  sku?: string;
  rating?: number;
  reviews?: Array<{
    userId: string;
    comment: string;
    rating: number;
    createdAt: Date;
  }>;
  createdAt?: Date;
}

async function loadProductModel() {
  try {
    const productModule = await import('./models/Product.js');
    if (productModule.default) {
      console.log('✓ Using existing Product model from server/src/models/Product.ts');
      return productModule.default as mongoose.Model<any>;
    }
  } catch (error) {
    console.log('ℹ No existing Product model found. Creating a fallback product schema for the seed script.');
  }

  const fallbackSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      category: { type: String, required: true },
      price: { type: Number, required: true },
      description: { type: String, required: true },
      images: [{ type: String, required: true }],
      stock: { type: Number, required: true, default: 0 },
      discountedPrice: { type: Number, min: 0 },
      sku: { type: String, required: true, unique: true },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviews: [{
        userId: String,
        comment: String,
        rating: { type: Number, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now }
      }],
      createdAt: { type: Date, default: Date.now }
    },
    { timestamps: false }
  );

  return mongoose.model('Product', fallbackSchema);
}

function buildImagePath(category: string, filename: string) {
  const categorySegment = category.toLowerCase().replace(/\s+/g, '-');
  return `/images/products/${categorySegment}/${filename}.jpg`;
}

function makeSku(name: string, index: number) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product';

  return `${base}-${index + 1}`;
}

function productSeedData(): SeedProduct[] {
  return [
    {
      name: 'Dhaka Heritage Tote',
      category: 'Bags',
      price: 1850,
      description: 'A refined handwoven tote in Palpali Dhaka fabric, designed for everyday elegance and comfortable carry.',
      images: ['/images/products/bags/dhakabag2.jpg'],
      stock: 12,
      rating: 4.6,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Palpali Dhaka Sling Bag',
      category: 'Bags',
      price: 1650,
      description: 'Compact crossbody sling bag crafted with traditional Dhaka weaving and a soft woven finish.',
      images: ['/images/products/bags/dhakabag3.jpg'],
      stock: 10,
      rating: 4.5,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Royal Dhaka Handbag',
      category: 'Bags',
      price: 2090,
      description: 'Statement handbag in heritage Dhaka textile, perfect for festive wear and stylish daily use.',
      images: ['/images/products/bags/dhakabag4.jpg'],
      stock: 8,
      rating: 4.7,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Aaranya Dhaka Kurthi',
      category: 'Ladies Wear',
      price: 2190,
      description: 'Graceful Dhaka kurthi with a lightweight weave and elegant traditional detailing.',
      images: ['/images/products/ladies-wear/kurthi1.jpg'],
      stock: 11,
      rating: 4.6,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Nila Dhaka Kurthi',
      category: 'Ladies Wear',
      price: 2390,
      description: 'A sleek kurthi silhouette in rich Palpali Dhaka weave for festive and everyday styling.',
      images: ['/images/products/ladies-wear/kurthi2.jpg'],
      stock: 9,
      rating: 4.7,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Rupal Dhaka Lehenga',
      category: 'Ladies Wear',
      price: 3490,
      description: 'Celebrate in a beautifully patterned lehenga-inspired dress woven with authentic Dhaka fabric texture.',
      images: ['/images/products/ladies-wear/lehenga1.jpg'],
      stock: 6,
      rating: 4.8,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Shantika Dhaka Saree',
      category: 'Ladies Wear',
      price: 3290,
      description: 'Elegant saree crafted in premium Dhaka textile with a soft drape and classic woven border.',
      images: ['/images/products/ladies-wear/saree1.jpg'],
      stock: 7,
      rating: 4.9,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Rangbari Cotton Saree',
      category: 'Ladies Wear',
      price: 2490,
      description: 'Lightweight cotton saree in earthy Dhaka pattern, made for comfort with cultural charm.',
      images: ['/images/products/ladies-wear/saree2.jpg'],
      stock: 10,
      rating: 4.7,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Beli Dhaka Saree',
      category: 'Ladies Wear',
      price: 2890,
      description: 'Traditional Dhaka saree with a rich woven texture and graceful movement for special occasions.',
      images: ['/images/products/ladies-wear/saree3.jpg'],
      stock: 8,
      rating: 4.8,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Palpali Dhaka Shirt',
      category: 'Gents Wear',
      price: 2290,
      description: 'Classic shirt in authentic Palpali Dhaka weave, tailored for a relaxed yet refined look.',
      images: ['/images/products/gents-wear/boy1.jpg'],
      stock: 14,
      rating: 4.5,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Heritage Dhaka Shirt',
      category: 'Gents Wear',
      price: 2490,
      description: 'Structured Dhaka shirt with a heritage-inspired texture and elegant everydaywear fit.',
      images: ['/images/products/gents-wear/boy2.jpg'],
      stock: 12,
      rating: 4.6,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Dhaka Traditional Topi',
      category: 'Gents Wear',
      price: 990,
      description: 'Handwoven traditional topi made in Palpali Dhaka fabric for cultural and festive styling.',
      images: ['/images/products/gents-wear/topi1.jpg'],
      stock: 18,
      rating: 4.7,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Royal Dhaka Topi',
      category: 'Gents Wear',
      price: 1180,
      description: 'Premium traditional cap in Dhaka weave, crafted with a crisp finish and classic appeal.',
      images: ['/images/products/gents-wear/topi2.jpg'],
      stock: 16,
      rating: 4.6,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Dhaka Kids Kurta',
      category: 'Kids Wear',
      price: 1490,
      description: 'Comfortable kids kurta in vibrant Dhaka weave, designed for daily ease and festive styling.',
      images: ['/images/products/kids-wear/kid1.jpg'],
      stock: 20,
      rating: 4.5,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Mini Dhaka Set',
      category: 'Kids Wear',
      price: 1590,
      description: 'A cheerful child’s set inspired by Palpali Dhaka patterns and easy, playful movement.',
      images: ['/images/products/kids-wear/kid2.jpg'],
      stock: 17,
      rating: 4.4,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Palpali Kids Shirt',
      category: 'Kids Wear',
      price: 1390,
      description: 'Soft shirt for children in traditional Dhaka fabric with bright patterns and lasting comfort.',
      images: ['/images/products/kids-wear/kid3.jpg'],
      stock: 19,
      rating: 4.4,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Dhaka Child Kurta',
      category: 'Kids Wear',
      price: 1690,
      description: 'A festive kurta for children made in the signature weave of Palpali Dhaka textiles.',
      images: ['/images/products/kids-wear/kid4.jpg'],
      stock: 15,
      rating: 4.6,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Little Dhaka Outfit',
      category: 'Kids Wear',
      price: 1790,
      description: 'A charming kids outfit with rich Dhaka textile texture and a playful everyday silhouette.',
      images: ['/images/products/kids-wear/kid5.jpg'],
      stock: 14,
      rating: 4.5,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Heritage Dhaka Shawl',
      category: 'Scarves',
      price: 1290,
      description: 'Warm woven shawl in classic Palpali Dhaka fabric, designed for comfort and graceful layering.',
      images: ['/images/products/scarves/shawl1.jpg'],
      stock: 18,
      rating: 4.7,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Palpali Dhaka Shawl',
      category: 'Scarves',
      price: 1390,
      description: 'Soft woven shawl with a rich Dhaka textile pattern and a beautifully textured drape.',
      images: ['/images/products/scarves/shawl2.jpg'],
      stock: 16,
      rating: 4.6,
      reviews: [],
      createdAt: new Date()
    },
    {
      name: 'Royal Dhaka Scarf',
      category: 'Scarves',
      price: 1190,
      description: 'Versatile Dhaka scarf with elegant stripe detailing and a premium handcrafted finish.',
      images: ['/images/products/scarves/shawl3.jpg'],
      stock: 20,
      rating: 4.8,
      reviews: [],
      createdAt: new Date()
    }
  ];
}

async function seedProducts() {
  const Product = await loadProductModel();

  await mongoose.connect(MONGODB_URI);
  console.log(`✓ Connected to MongoDB: ${MONGODB_URI}`);

  await Product.deleteMany({});
  console.log('✓ Cleared existing products collection');

  const data = productSeedData();
  const transformed: Record<string, any>[] = data.map((product, index) => {
    const base: Record<string, any> = {
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description,
      images: product.images,
      stock: product.stock,
      discountedPrice: product.discountedPrice,
      sku: product.sku ?? makeSku(product.name, index),
      rating: product.rating ?? 4.5,
      reviews: product.reviews ?? [],
      createdAt: product.createdAt ?? new Date()
    };

    if ('discountedPrice' in Product.schema.paths && product.discountedPrice === undefined) {
      delete base.discountedPrice;
    }

    return base;
  });

  const inserted = await Product.insertMany(transformed as any);
  console.log(`✅ Seeded ${inserted.length} products successfully`);

  await seedRecommendationOrders(inserted);
  await mongoose.disconnect();
  console.log('✓ MongoDB connection closed');
  process.exit(0);
}

async function seedRecommendationOrders(products: Array<{ _id: mongoose.Types.ObjectId; price: number }>) {
  const combinations = [
    [0, 1, 3], [0, 1, 4], [0, 2, 5], [0, 1, 6], [1, 2, 3],
    [1, 3, 7], [0, 3, 4], [2, 4, 6], [0, 2, 7], [1, 3, 5],
    [4, 6, 8], [3, 4, 6], [0, 1, 8], [2, 5, 7], [1, 4, 6],
    [0, 3, 6], [2, 4, 7], [1, 5, 8], [0, 2, 6], [3, 5, 7],
    [0, 1, 3], [0, 1, 4], [1, 2, 3], [0, 3, 4], [2, 4, 6],
    [1, 3, 7], [0, 2, 7], [1, 3, 5], [3, 4, 6], [0, 1, 8]
  ];
  const emails = ['maya@example.com', 'arjun@example.com', 'sita@example.com', 'rohan@example.com', 'nisha@example.com'];

  await Order.deleteMany({ orderNumber: /^DEMO-RECOMMENDATION-/ });
  const orders = combinations.map((combination, index) => {
    const orderNumber = `DEMO-RECOMMENDATION-${String(index + 1).padStart(2, '0')}`;
    const items = combination.map((productIndex) => ({
      productId: products[productIndex % products.length]._id.toString(),
      quantity: 1,
      price: products[productIndex % products.length].price
    }));
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const customerEmail = emails[index % emails.length];
    const signatureData = { orderNumber, items, total, customerEmail };
    const transactionHash = hashOrderData(signatureData);

    return {
      orderNumber,
      customer: {
        firstName: customerEmail.split('@')[0],
        lastName: 'Demo',
        email: customerEmail,
        phone: '0000000000',
        address: 'Demo address',
        city: 'Kathmandu',
        state: 'Bagmati',
        zipCode: '44600'
      },
      items,
      total,
      tax: 0,
      shipping: 0,
      status: 'delivered',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      transactionHash,
      transactionSignature: signOrderHash(transactionHash)
    };
  });

  await Order.insertMany(orders);
  console.log(`✅ Seeded ${orders.length} recommendation demo orders successfully`);
}

seedProducts().catch((error) => {
  console.error('✗ Failed to seed products:', error);
  mongoose.disconnect().finally(() => process.exit(1));
});
