
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Product } from '../types';
import { useCart } from '../hooks/useCart';
import Spinner from '../components/ui/Spinner';
import { formatCurrency } from '../utils';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching product:', error);
        navigate('/products');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`${quantity} of ${product.name} added to cart!`);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Spinner /></div>;
  if (!product) return <p className="text-center py-10">Product not found.</p>;

  const finalPrice = product.discount
    ? product.price - (product.price * (product.discount / 100))
    : product.price;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.image_base64} alt={product.name} className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg bg-gray-100" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="mb-4">
              <span className="font-bold text-3xl text-yellow-600">{formatCurrency(finalPrice)}</span>
              {product.discount && (
                <span className="text-gray-500 line-through ml-2 text-xl">{formatCurrency(product.price)}</span>
              )}
          </div>
          <p className={`text-lg mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} items in stock` : 'Out of Stock'}
          </p>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{product.description}</p>
          
          <div className="flex items-center space-x-4 mb-6">
            <label htmlFor="quantity" className="font-semibold">Quantity:</label>
            <input 
              type="number" 
              id="quantity" 
              min="1" 
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 p-2 border rounded-md"
              disabled={product.stock === 0}
            />
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
