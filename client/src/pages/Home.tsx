import ProductGrid from '../components/ProductGrid';
import Seo from '../components/Seo';

export default function Home() {
  return (
    <div>
      <Seo
        title="Palpali Dhaka Textiles | Nepali Handcrafted Textiles"
        description="Discover authentic Dhaka textiles, fabric bags, scarves, Nepali clothing and traditional handicrafts from Palpali."
      />
      {/* Hero Section */}
      <section
        className="relative text-white py-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/dhaka-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4">
            Palpali Dhaka Textiles
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover authentic, hand-crafted textiles from Dhaka. Each piece tells a story of tradition and craftsmanship.
          </p>
          <a href="/products" className="btn-primary inline-block">
            Shop Now
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-gray-600">Authentic Textiles</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">25+</div>
              <p className="text-gray-600">Years of Tradition</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">500+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <ProductGrid />
    </div>
  );
}
