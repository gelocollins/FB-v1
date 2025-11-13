
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase/client';
import { OrderWithItems, Profile } from '../types';
import Spinner from '../components/ui/Spinner';
import { formatCurrency } from '../utils';

const AccountPage: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');

  if (authLoading) return <div className="h-64 flex justify-center items-center"><Spinner /></div>;
  if (!user || !profile) return <p className="text-center py-10">Please log in to view your account.</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 font-semibold ${activeTab === 'orders' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        >
          My Orders
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2 px-4 font-semibold ${activeTab === 'profile' ? 'border-b-2 border-yellow-500 text-yellow-600' : 'text-gray-500'}`}
        >
          My Profile
        </button>
      </div>
      <div>
        {activeTab === 'orders' && <UserOrders />}
        {activeTab === 'profile' && <UserProfile profile={profile} userId={user.id} />}
      </div>
    </div>
  );
};

const UserOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    order_items ( *, products ( * ) ),
                    profiles ( name, email )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
            } else {
                setOrders(data as OrderWithItems[]);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [user]);

    if (loading) return <Spinner />;
    if (orders.length === 0) return <p>You have no orders yet.</p>;

    return (
        <div className="space-y-4">
            {orders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center border-b pb-2 mb-2">
                        <div>
                            <p className="font-bold">Order ID: <span className="font-mono text-sm">{order.id}</span></p>
                            <p className="text-sm text-gray-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`capitalize px-3 py-1 text-sm font-semibold rounded-full ${order.order_status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {order.order_status}
                        </span>
                    </div>
                    <div>
                        {order.order_items.map(item => (
                            <div key={item.id} className="flex items-center text-sm py-1">
                                <img src={item.products?.image_base64} alt={item.products?.name} className="w-10 h-10 object-cover rounded mr-3" />
                                <span>{item.products?.name} x {item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="text-right font-bold mt-2">Total: {formatCurrency(order.total_amount)}</div>
                </div>
            ))}
        </div>
    );
};


interface UserProfileProps {
  profile: Profile;
  userId: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, userId }) => {
    const [name, setName] = useState(profile.name || '');
    const [phone, setPhone] = useState(profile.phone || '');
    const [address, setAddress] = useState(profile.address || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await supabase
            .from('profiles')
            .update({ name, phone, address })
            .eq('id', userId);

        if (error) {
            setMessage('Error updating profile.');
            console.error(error);
        } else {
            setMessage('Profile updated successfully!');
        }
        setLoading(false);
    };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-w-lg">
        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={profile.email} disabled className="w-full p-2 mt-1 bg-gray-100 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 mt-1 border rounded-md" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={3} className="w-full p-2 mt-1 border rounded-md"></textarea>
            </div>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 disabled:bg-gray-400">
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {message && <p className="text-sm mt-2">{message}</p>}
        </form>
    </div>
  );
};


export default AccountPage;
