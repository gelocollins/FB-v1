
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount', { count: 'exact' })
        .in('order_status', ['paid', 'processing', 'shipped', 'delivered']);
      
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
        
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (ordersError || productsError || usersError) {
          console.error(ordersError, productsError, usersError);
      }

      const totalSales = orders?.reduce((acc, order) => acc + order.total_amount, 0) || 0;

      setStats({
        totalSales,
        totalOrders: orders?.length || 0,
        totalProducts: productsCount || 0,
        totalUsers: usersCount || 0
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Sales" value={formatCurrency(stats.totalSales)} emoji="💰" />
        <StatCard title="Total Orders" value={stats.totalOrders.toString()} emoji="🛒" />
        <StatCard title="Total Products" value={stats.totalProducts.toString()} emoji="📦" />
        <StatCard title="Total Users" value={stats.totalUsers.toString()} emoji="👥" />
      </div>
      {/* Chart would go here */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold">Sales Chart</h2>
          <p className="mt-2 text-gray-500">Revenue chart functionality would be implemented here.</p>
      </div>
    </div>
  );
};

interface StatCardProps {
    title: string;
    value: string;
    emoji: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, emoji }) => (
    <div className="bg-white p-6 rounded-lg shadow flex items-center">
        <div className="text-4xl mr-4">{emoji}</div>
        <div>
            <p className="text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);


export default AdminDashboardPage;
