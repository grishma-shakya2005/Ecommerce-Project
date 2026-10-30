import ProductGrid from '../components/ProductGrid';
import RecommendationSection from '../components/RecommendationSection';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Seo from '../components/Seo';
import { useSearchParams } from 'react-router-dom';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>(['all']);
  const searchQuery = searchParams.get('search')?.trim() || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products', { params: { limit: 1000 } });
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : Array.isArray(data?.items)
          ? data.items
          : [];

        const uniqueCategories = Array.from(
          new Set(list.map((item: { category?: string }) => item.category).filter(Boolean))
        ) as string[];

        const nextCategories = ['all', ...uniqueCategories];
        setCategories(nextCategories);

        if (category !== 'all' && !nextCategories.includes(category)) {
          setCategory('all');
        }
      } catch (error) {
        console.error('Failed to fetch product categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <Seo
        title="Shop Dhaka Textiles, Bags & Nepali Clothing | Palpali"
        description="Shop authentic Dhaka topi, fabric bags, scarves, Nepali clothing and handcrafted textiles from Palpali."
      />
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-serif font-bold">Our Products</h1>
          <p className="text-gray-600 mt-2">Explore our collection of authentic textiles</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </section>

      {category === 'all' && !searchQuery && (
        <RecommendationSection
          title="Recommended for you"
          endpoint={`/api/recommendations/user${localStorage.getItem('palpali_customer_email') ? `?email=${encodeURIComponent(localStorage.getItem('palpali_customer_email') || '')}` : ''}`}
        />
      )}
      <ProductGrid selectedCategory={category} />
    </div>
  );
}
