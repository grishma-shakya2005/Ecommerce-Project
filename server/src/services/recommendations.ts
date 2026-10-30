import Product, { IProduct } from '../models/Product.js';
import Order from '../models/Order.js';

const DEFAULT_LIMIT = 4;

function exactEmailRegex(email: string) {
  return new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
}

type OrderItem = {
  productId?: string;
  quantity?: number;
};

type LeanOrder = {
  customer?: { email?: string };
  items?: OrderItem[];
};

function productIdsFromOrders(orders: LeanOrder[]) {
  return orders
    .flatMap((order) => order.items || [])
    .map((item) => item.productId)
    .filter((productId): productId is string => Boolean(productId));
}

async function popularProducts(limit: number, excludedIds = new Set<string>()) {
  const popular = await Order.aggregate<{ _id: string; score: number }>([
    { $unwind: '$items' },
    { $match: { 'items.productId': { $exists: true, $ne: '' } } },
    {
      $group: {
        _id: '$items.productId',
        score: { $sum: { $ifNull: ['$items.quantity', 1] } }
      }
    },
    { $sort: { score: -1 } },
    { $limit: limit + excludedIds.size }
  ]);

  const ids = popular
    .map((item) => item._id)
    .filter((id) => !excludedIds.has(id))
    .slice(0, limit);
  return productsInOrder(ids);
}

async function productsInOrder(ids: string[]) {
  if (ids.length === 0) return [];
  const products = await Product.find({ _id: { $in: ids } }).lean<IProduct[]>();
  const byId = new Map(products.map((product) => [String(product._id), product]));
  return ids.map((id) => byId.get(String(id))).filter((product): product is IProduct => Boolean(product));
}

async function categoryFallback(category: string | undefined, limit: number, excludedIds = new Set<string>()) {
  if (!category) return [];
  return Product.find({
    category,
    _id: { $nin: [...excludedIds] }
  })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .lean<IProduct[]>();
}

export async function recommendForProduct(productId: string, limit = DEFAULT_LIMIT) {
  const product = await Product.findById(productId).lean<IProduct>();
  if (!product) return [];

  const orders = await Order.find({ 'items.productId': productId })
    .select({ items: 1 })
    .lean<LeanOrder[]>();
  const scores = new Map<string, number>();

  for (const order of orders) {
    const itemIds = new Set(productIdsFromOrders([order]));
    itemIds.delete(productId);
    for (const id of itemIds) scores.set(id, (scores.get(id) || 0) + 1);
  }

  const rankedIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
  const recommendations = await productsInOrder(rankedIds);
  if (recommendations.length >= limit) return recommendations;

  const excluded = new Set([productId, ...recommendations.map((item) => String(item._id))]);
  const categoryProducts = await categoryFallback(product.category, limit - recommendations.length, excluded);
  if (recommendations.length + categoryProducts.length > 0) {
    return [...recommendations, ...categoryProducts];
  }

  const popular = await popularProducts(limit, excluded);
  return [...recommendations, ...popular].slice(0, limit);
}

export async function recommendForUser(email: string | undefined, limit = DEFAULT_LIMIT) {
  const normalizedEmail = email?.trim().toLowerCase();
  const orders = normalizedEmail
    ? await Order.find({ 'customer.email': exactEmailRegex(normalizedEmail) }).select({ items: 1 }).lean<LeanOrder[]>()
    : [];
  const purchasedIds = new Set(productIdsFromOrders(orders));
  const scores = new Map<string, number>();

  for (const order of orders) {
    const orderIds = new Set(productIdsFromOrders([order]));
    for (const sourceId of purchasedIds) {
      if (!orderIds.has(sourceId)) continue;
      for (const candidateId of orderIds) {
        if (candidateId !== sourceId && !purchasedIds.has(candidateId)) {
          scores.set(candidateId, (scores.get(candidateId) || 0) + 1);
        }
      }
    }
  }

  const rankedIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
  const recommendations = await productsInOrder(rankedIds);
  if (recommendations.length >= limit) return recommendations;

  const categories = purchasedIds.size
    ? await Product.find({ _id: { $in: [...purchasedIds] } }).distinct('category')
    : [];
  const excluded = new Set([...purchasedIds, ...recommendations.map((item) => String(item._id))]);
  const categoryProducts = categories.length
    ? await categoryFallback(categories[0], limit - recommendations.length, excluded)
    : [];
  const withCategoryFallback = [...recommendations, ...categoryProducts];
  if (withCategoryFallback.length >= limit) return withCategoryFallback.slice(0, limit);

  const popular = await popularProducts(limit - withCategoryFallback.length, excluded);
  return [...withCategoryFallback, ...popular].slice(0, limit);
}
