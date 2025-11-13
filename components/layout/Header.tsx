
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Header: React.FC = () => {
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();

  const activeLinkStyle = {
    textDecoration: 'underline',
    color: '#ca8a04' // yellow-500
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-yellow-600">
          FeatherBoost 🐔
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-600 hover:text-yellow-600">Home</NavLink>
          <NavLink to="/products" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-600 hover:text-yellow-600">Shop</NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/cart" className="relative text-gray-600 hover:text-yellow-600">
            <span>🛒</span>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartCount}
            </span>
          </Link>
          {user ? (
            <div className="relative group">
              <Link to="/account" className="text-gray-600 hover:text-yellow-600">
                👤 <span className="hidden sm:inline">{userProfile?.name || userProfile?.email}</span>
              </Link>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</Link>
                )}
                <button onClick={signOut} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-yellow-600">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
