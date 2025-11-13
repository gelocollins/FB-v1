
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils';
import { useAuth } from '../hooks/useAuth';

const CartPage: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
      if(user) {
          navigate('/checkout');
      } else {
          alert('Please login to proceed to checkout.');
          navigate('/login');
      }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {cartCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
            {cartItems.map(item => {
              const finalPrice = item.product.discount
                ? item.product.price - (item.product.price * (item.product.discount / 100))
                : item.product.price;
                
              return (
                <div key={item.product.id} className="flex items-center py-4 border-b last:border-b-0">
                  <img src={item.product.image_base64} alt={item.product.name} className="w-24 h-24 object-cover rounded-md mr-4" />
                  <div className="flex-grow">
                    <Link to={`/products/${item.product.id}`} className="font-semibold hover:underline">{item.product.name}</Link>
                    <p className="text-gray-600">{formatCurrency(finalPrice)}</p>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 text-sm hover:underline">Remove</button>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                      className="w-16 p-1 border rounded-md text-center"
                    />
                  </div>
                  <div className="w-24 text-right font-semibold">
                    {formatCurrency(finalPrice * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal ({cartCount} items)</span>
                <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">Calculated at checkout</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500 mb-4">Your cart is empty 🛒</p>
          <Link to="/products" className="bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
