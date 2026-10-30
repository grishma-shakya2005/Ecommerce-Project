import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-serif font-bold text-primary">Palpali Dhaka</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-primary transition">Products</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition">Contact</Link>
          </nav>

          {/* Search & Cart */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex bg-gray-100 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent ml-2 outline-none text-sm w-40"
              />
            </div>

            <Link to="/cart" className="relative">
              <ShoppingCart size={24} className="text-primary hover:text-secondary transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-primary py-2">Home</Link>
            <Link to="/products" className="block text-gray-700 hover:text-primary py-2">Products</Link>
            <Link to="/about" className="block text-gray-700 hover:text-primary py-2">About</Link>
            <Link to="/contact" className="block text-gray-700 hover:text-primary py-2">Contact</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
