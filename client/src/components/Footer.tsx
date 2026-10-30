import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-serif font-bold mb-4">Palpali</h3>
            <p className="text-gray-400 text-sm">
              Authentic textiles from Dhaka, bringing traditional craftsmanship to your home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/" className="hover:text-accent transition">Home</a></li>
              <li><a href="/products" className="hover:text-accent transition">Products</a></li>
              <li><a href="/about" className="hover:text-accent transition">About Us</a></li>
              <li><a href="/contact" className="hover:text-accent transition">Contact</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-accent transition">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition">Shipping Info</a></li>
              <li><a href="#" className="hover:text-accent transition">Returns</a></li>
              <li><a href="#" className="hover:text-accent transition">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+970 1XXX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@palpali.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Palpa, Nepal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-800 pt-8 flex justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; 2024 Palpali. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-accent transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-accent transition">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-accent transition">
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
