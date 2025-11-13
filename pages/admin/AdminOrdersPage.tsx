
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { OrderStatus, OrderWithItems } from '../../types';
import Spinner from '../../components/ui/Spinner';
import { formatCurrency } from '../../utils';
import Modal from '../../components/ui/Modal';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`*, order_items ( *, products ( name, image_base64 ) ), profiles ( name, email, phone, address )`)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data as OrderWithItems[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ order_status: newStatus })
            .eq('id', orderId);
        
        if (error) {
            alert('Failed to update status');
            console.error(error);
        } else {
            fetchOrders();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                <th className="p-3">Date</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Payment</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b">
                                    <td className="p-3 text-sm">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="p-3">{order.profiles?.name || 'N/A'}</td>
                                    <td className="p-3 font-semibold">{formatCurrency(order.total_amount)}</td>
                                    <td className="p-3">{order.payment_method}</td>
                                    <td className="p-3">
                                        <select
                                            value={order.order_status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className="p-1 border rounded-md text-sm"
                                        >
                                            {ORDER_STATUSES.map(status => (
                                                <option key={status} value={status} className="capitalize">{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => setSelectedOrder(order)} className="text-blue-500 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order Details: ${selectedOrder?.id}`}>
                {selectedOrder && (
                    <div className="space-y-4">
                       <div>
                           <h3 className="font-bold">Customer Info</h3>
                           <p>Name: {selectedOrder.profiles?.name}</p>
                           <p>Email: {selectedOrder.profiles?.email}</p>
                           <p>Phone: {selectedOrder.profiles?.phone}</p>
                           <p>Address: {selectedOrder.profiles?.address}</p>
                       </div>
                       <div>
                           <h3 className="font-bold">Order Items</h3>
                           {selectedOrder.order_items.map(item => (
                               <div key={item.id} className="flex items-center my-2 text-sm">
                                   <img src={item.products?.image_base64} alt={item.products?.name} className="w-12 h-12 object-cover rounded mr-3"/>
                                   <div>
                                     <p>{item.products?.name} x {item.quantity}</p>
                                     <p className="text-gray-600">{formatCurrency(item.price_at_purchase)} each</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                       {selectedOrder.payment_method === 'GCash' && (
                           <div>
                               <h3 className="font-bold">Payment Proof</h3>
                               {selectedOrder.payment_proof_base64 ? 
                                   <img src={selectedOrder.payment_proof_base64} alt="Payment Proof" className="mt-2 max-w-sm rounded-lg" />
                                   : <p>No proof uploaded.</p>
                               }
                           </div>
                       )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminOrdersPage;
