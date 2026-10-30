import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';
import { trackAddToCart, trackViewContent } from '../utils/fbPixel';
import Seo from '../components/Seo';
import RecommendationSection from '../components/RecommendationSection';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  rating: number;
  stock: number;
  sku: string;
  reviews: Array<{ userId: string; comment: string; rating: number; createdAt: string }>;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        trackViewContent({
          _id: data._id,
          name: data.name,
          price: data.discountedPrice || data.price,
        });
      } catch (error) {
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      _id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.images[0] || '/placeholder.jpg',
      quantity,
    });
    trackAddToCart({
      _id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      quantity,
    });
    toast.success(`${quantity} item(s) added to cart!`);
    setQuantity(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Seo
          title="Product Details | Palpali Dhaka Textiles"
          description="Explore authentic Dhaka textiles and Nepali handcrafted products from Palpali."
        />
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <Seo
          title="Product Not Found | Palpali Dhaka Textiles"
          description="The requested Palpali Dhaka textile product could not be found."
        />
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Seo
        title={`${product.name} | Palpali Dhaka Textiles`}
        description={product.description}
        image={product.images[0]}
        type="product"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 h-96">
            <img
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`border-2 rounded-lg overflow-hidden h-20 ${
                  selectedImage === idx ? 'border-primary' : 'border-gray-300'
                }`}
              >
                <img src={img} alt={`${product.name} detail view ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <h1 className="text-4xl font-serif font-bold mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-6">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < Math.round(product.rating) ? 'fill-accent text-accent' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">({product.reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.discountedPrice ? (
              <>
                <span className="text-3xl font-bold text-primary">Rs. {product.discountedPrice.toFixed(2)}</span>
                <span className="ml-2 text-lg text-gray-500 line-through">Rs. {product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary">Rs. {product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Stock Status */}
          <div className="mb-6">
            <p className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </p>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-0 outline-none"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <ShoppingCart size={20} />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 mb-2"><strong>SKU:</strong> {product.sku}</p>
            <p className="text-sm text-gray-600"><strong>Category:</strong> {product.sku}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < review.rating ? 'fill-accent text-accent' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <RecommendationSection
        title="Customers who bought this also bought"
        endpoint={`/api/recommendations/product/${product._id}`}
      />
    </div>
  );
}
