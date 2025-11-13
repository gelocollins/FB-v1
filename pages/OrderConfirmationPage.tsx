
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { Order } from '../types';
import Spinner from '../components/ui/Spinner';

const OrderConfirmationPage: React.FC = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();
            if (error) {
                console.error('Error fetching order', error);
            } else {
                setOrder(data);
            }
            setLoading(false);
        };
        fetchOrder();
    }, [orderId]);

    if (loading) {
        return <div className="h-64 flex justify-center items-center"><Spinner /></div>;
    }

    if (!order) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-red-600">Order Not Found</h1>
                <p className="mt-4">We couldn't find the details for this order.</p>
                <Link to="/products" className="mt-6 inline-block bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md max-w-2xl mx-auto mb-8">
                <p className="font-bold">🎉 Thank you for your order!</p>
                <p>Your order has been placed successfully.</p>
            </div>
            <h1 className="text-3xl font-bold">Order Confirmation</h1>
            <p className="mt-2 text-gray-600">Order ID: <span className="font-mono">{order.id}</span></p>

            <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-left">
                <h2 className="text-xl font-semibold border-b pb-2 mb-4">Summary</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold">{new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method:</span>
                        <span className="font-bold">{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-bold capitalize px-2 py-1 text-sm rounded-full bg-yellow-200 text-yellow-800">{order.order_status}</span>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-gray-700">You can track the status of your order in your account page.</p>
            <div className="mt-6 space-x-4">
                <Link to="/account" className="inline-block bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors">
                    Go to My Account
                </Link>
                <Link to="/products" className="inline-block bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
