
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout: React.FC = () => {
    const { signOut } = useAuth();

    const linkClasses = "flex items-center px-4 py-2 text-gray-100 rounded-md hover:bg-yellow-700";
    const activeLinkClasses = "bg-yellow-700";

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white flex-shrink-0">
                <div className="p-4 text-2xl font-bold text-yellow-400 border-b border-gray-700">
                    Admin Panel
                </div>
                <nav className="p-4 space-y-2">
                    <NavLink to="/admin" end className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>📊 Dashboard</NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>📦 Products</NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>🛒 Orders</NavLink>
                    <NavLink to="/admin/payment-methods" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>💳 Payments</NavLink>
                    <NavLink to="/admin/promos" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>🎉 Promos</NavLink>
                    <NavLink to="/admin/stock-logs" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>📈 Stock Logs</NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>👥 Users</NavLink>
                </nav>
                 <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
                    <button onClick={signOut} className="w-full flex items-center px-4 py-2 text-gray-100 rounded-md hover:bg-yellow-700">
                        🚪 Logout
                    </button>
                 </div>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
