
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-yellow-600">FeatherBoost 🐔</h3>
            <p className="mt-2 text-gray-600">Your #1 source for premium poultry vitamins and supplements.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Quick Links</h4>
            <ul className="mt-2 space-y-1">
              <li><Link to="/products" className="text-gray-600 hover:text-yellow-600">Shop All</Link></li>
              <li><Link to="/account" className="text-gray-600 hover:text-yellow-600">My Account</Link></li>
              <li><Link to="/cart" className="text-gray-600 hover:text-yellow-600">Shopping Cart</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Contact Us</h4>
             <p className="mt-2 text-gray-600">Email: support@featherboost.com</p>
             <p className="text-gray-600">Phone: +63 917 123 4567</p>
          </div>
        </div>
        <div className="mt-8 border-t pt-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} FeatherBoost. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
