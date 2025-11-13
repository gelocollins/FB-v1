
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/client';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/ui/Spinner';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState(5000);
  const [onSale, setOnSale] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => p.price <= priceRange)
      .filter(p => (onSale ? p.discount !== null && p.discount > 0 : true));
  }, [products, searchTerm, priceRange, onSale]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      
      {/* Filters */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-1">
          <input
            type="text"
            placeholder="🔍 Search by name..."
            className="w-full p-2 border rounded-md"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700">
            Price up to: ₱{priceRange}
          </label>
          <input
            type="range"
            min="100"
            max="5000"
            step="100"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            value={priceRange}
            onChange={e => setPriceRange(Number(e.target.value))}
          />
        </div>
        <div className="md:col-span-1 flex items-center justify-end">
          <input
            id="on-sale"
            type="checkbox"
            className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
            checked={onSale}
            onChange={e => setOnSale(e.target.checked)}
          />
          <label htmlFor="on-sale" className="ml-2 block text-sm text-gray-900">
            On Sale Only
          </label>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No products found matching your criteria.</p>
        )
      )}
    </div>
  );
};

export default ProductsPage;
