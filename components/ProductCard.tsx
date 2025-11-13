
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const finalPrice = product.discount
    ? product.price - (product.price * (product.discount / 100))
    : product.price;

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
      <Link to={`/products/${product.id}`} className="block">
        <div className="w-full h-48 bg-gray-200">
           <img src={product.image_base64} alt={product.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg truncate">{product.name}</h3>
          <p className="text-gray-600 text-sm h-10 overflow-hidden">{product.description}</p>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="font-bold text-xl text-yellow-600">{formatCurrency(finalPrice)}</span>
              {product.discount && (
                <span className="text-gray-500 line-through ml-2">{formatCurrency(product.price)}</span>
              )}
            </div>
            {product.discount && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {product.discount}% OFF
              </span>
            )}
          </div>
           <p className={`text-sm mt-2 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
