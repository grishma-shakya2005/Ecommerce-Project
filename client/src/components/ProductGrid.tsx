import { useEffect, useRef, useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { trackAddToCart, trackProductClick, trackProductImpression } from '../utils/fbPixel';

export interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  rating: number;
  category: string;
}

interface ProductGridProps {
  selectedCategory?: string;
}

const PAGE_SIZE = 8;

export default function ProductGrid({ selectedCategory }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params: Record<string, string | number> = {
          limit: 1000,
        };

        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        const { data } = await axios.get('/api/products', { params });
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.items)
          ? data.items
          : [];

        setProducts(list);
        setVisibleCount(PAGE_SIZE);
      } catch (error) {
        console.error('Failed loading products:', error);
        toast.error('Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const displayedProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  const handleAddToCart = (product: Product) => {
    addItem({
      _id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.images[0] || '/placeholder.jpg',
      quantity: 1,
    });
    trackAddToCart({
      _id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-serif font-bold mb-12 text-center">Our Collection</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayedProducts.map((product) => (
          <ProductCard key={product._id} product={product} onAddToCart={handleAddToCart} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, products.length))}
            className="px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}

export function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (product: Product) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const price = product.discountedPrice || product.price;

  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          trackProductImpression({ _id: product._id, name: product.name, price });
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [price, product._id, product.name]);

  return (
    <div
      ref={cardRef}
      onClick={() => trackProductClick({ _id: product._id, name: product.name, price })}
      className="card overflow-hidden group"
    >
            <div className="relative overflow-hidden bg-gray-200 h-48">
              <img
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {product.discountedPrice && (
                <div className="absolute top-2 right-2 bg-secondary text-white px-3 py-1 rounded text-sm font-semibold">
                  Sale
                </div>
              )}
            </div>

            <div className="p-4">
              <Link to={`/product/${product._id}`}>
                <h3 className="font-serif font-bold text-lg hover:text-primary transition line-clamp-2">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center my-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(product.rating) ? 'fill-accent text-accent' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">({product.rating})</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  {product.discountedPrice ? (
                    <>
                      <span className="text-lg font-bold text-primary">Rs. {product.discountedPrice.toFixed(2)}</span>
                      <span className="ml-2 text-sm text-gray-500 line-through">Rs. {product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">Rs. {product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToCart(product);
                }}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
  );
}
