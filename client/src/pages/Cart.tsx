import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import Seo from '../components/Seo';

export default function Cart() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const total = getTotalPrice();
  const tax = total * 0.1;
  const shipping = items.length > 0 ? 10 : 0;
  const grandTotal = total + tax + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Seo
          title="Shopping Cart | Palpali Dhaka Textiles"
          description="Review your selected Dhaka textiles, fabric bags, scarves and Nepali handicrafts before checkout."
        />
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some beautiful textiles to get started!</p>
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Seo
        title="Shopping Cart | Palpali Dhaka Textiles"
        description="Review your selected Dhaka textiles, fabric bags, scarves and Nepali handicrafts before checkout."
      />
      <h1 className="text-4xl font-serif font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item._id} className="card p-4 flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-lg">{item.name}</h3>
                  <p className="text-primary font-semibold">Rs. {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item._id, parseInt(e.target.value) || 1)
                    }
                    min="1"
                    className="w-12 border rounded px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-20">
          <h2 className="text-2xl font-serif font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%)</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>Rs. {shipping.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between mb-6 text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">Rs. {grandTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className="btn-primary w-full text-center block mb-2">
            Proceed to Checkout
          </Link>
          <Link to="/products" className="btn-outline w-full text-center block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
