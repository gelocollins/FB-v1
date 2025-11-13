
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching featured products:', error);
      } else {
        setFeaturedProducts(data);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-yellow-50 text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-yellow-800">Boost Your Flock's Health</h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">Premium vitamins and supplements to ensure your poultry thrives.</p>
        <Link to="/products" className="mt-8 inline-block bg-yellow-500 text-white font-bold py-3 px-8 rounded-full hover:bg-yellow-600 transition-colors">
          Shop Now
        </Link>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* About Us Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">About FeatherBoost</h2>
          <p className="max-w-3xl mx-auto text-gray-600">
            At FeatherBoost, we are dedicated to the health and productivity of your flock. Our scientifically-formulated supplements provide essential nutrients for stronger growth, better egg production, and enhanced immunity. Trust us to be your partner in poultry success.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
