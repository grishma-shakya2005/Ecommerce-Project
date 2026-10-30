import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';
import { trackAddToCart } from '../utils/fbPixel';
import { Product, ProductCard } from './ProductGrid';

interface RecommendationSectionProps {
  title: string;
  endpoint: string;
}

export default function RecommendationSection({ title, endpoint }: RecommendationSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let active = true;
    axios.get(endpoint)
      .then(({ data }) => {
        if (active) setProducts(Array.isArray(data?.products) ? data.products : []);
      })
      .catch((error) => {
        console.error('Failed to load recommendations:', error);
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, [endpoint]);

  const handleAddToCart = (product: Product) => {
    const price = product.discountedPrice || product.price;
    addItem({
      _id: product._id,
      name: product.name,
      price,
      image: product.images[0] || '/placeholder.jpg',
      quantity: 1,
    });
    trackAddToCart({ _id: product._id, name: product.name, price, quantity: 1 });
    toast.success(`${product.name} added to cart!`);
  };

  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-serif font-bold mb-8 text-center">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>
    </section>
  );
}
