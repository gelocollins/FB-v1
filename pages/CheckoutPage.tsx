
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase/client';
import { PaymentMethod } from '../types';
import { formatCurrency, fileToBase64 } from '../utils';
import Spinner from '../components/ui/Spinner';

const CheckoutPage: React.FC = () => {
    const { cartItems, totalPrice, clearCart, cartCount } = useCart();
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedGcash, setSelectedGcash] = useState<PaymentMethod | null>(null);
    const [paymentProof, setPaymentProof] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setPhone(profile.phone || '');
            setAddress(profile.address || '');
        }
    }, [profile]);

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('payment_methods').select('*');
            if (error) console.error('Error fetching payment methods:', error);
            else setPaymentMethods(data);
            setLoading(false);
        };
        fetchPaymentMethods();
    }, []);
    
    useEffect(() => {
      if (paymentMethod === 'GCash' && paymentMethods.length > 0) {
        setSelectedGcash(paymentMethods.find(p => p.method_name === 'GCash') || null);
      } else {
        setSelectedGcash(null);
      }
    }, [paymentMethod, paymentMethods])


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setPaymentProof(base64);
            } catch (error) {
                console.error("Error converting file to base64", error);
                alert("Failed to upload proof of payment.");
            }
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || cartCount === 0) return;
        if(paymentMethod === 'GCash' && !paymentProof) {
            alert('Please upload your proof of payment for GCash.');
            return;
        }
        
        setPlacingOrder(true);
        
        // 1. Create Order
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: totalPrice,
                payment_method: paymentMethod,
                payment_proof_base64: paymentProof,
                order_status: paymentMethod === 'GCash' ? 'paid' : 'pending',
            })
            .select()
            .single();

        if (orderError || !orderData) {
            console.error('Error creating order:', orderError);
            alert('Failed to place order. Please try again.');
            setPlacingOrder(false);
            return;
        }

        // 2. Create Order Items
        const orderItems = cartItems.map(item => {
            const finalPrice = item.product.discount
                ? item.product.price - (item.product.price * (item.product.discount / 100))
                : item.product.price;
            return {
                order_id: orderData.id,
                product_id: item.product.id,
                quantity: item.quantity,
                price_at_purchase: finalPrice
            };
        });

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

        if (itemsError) {
            console.error('Error creating order items:', itemsError);
            // Here you might want to delete the created order to avoid inconsistency
            alert('Failed to save order details. Please contact support.');
            setPlacingOrder(false);
            return;
        }
        
        // 3. Update stock and log changes
        for (const item of cartItems) {
            const previous_stock = item.product.stock;
            const newStock = previous_stock - item.quantity;
            const { error: stockError } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.product.id);

            if (stockError) {
                console.error(`Failed to update stock for product ${item.product.id}:`, stockError);
            } else {
                // Log the stock change
                const { error: logError } = await supabase
                    .from('stock_logs')
                    .insert({
                        product_id: item.product.id,
                        previous_stock: previous_stock,
                        new_stock: newStock,
                        change_type: 'sale'
                    });
                if (logError) {
                    console.error(`Failed to log stock change for product ${item.product.id}:`, logError);
                }
            }
        }

        // 4. Clear cart and navigate
        clearCart();
        setPlacingOrder(false);
        navigate(`/order-confirmation/${orderData.id}`);
    };
    
    if (cartCount === 0 && !placingOrder) {
        return (
            <div className="text-center py-20">
                <p className="text-xl">Your cart is empty. Cannot proceed to checkout.</p>
                <button onClick={() => navigate('/products')} className="mt-4 bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">Go Shopping</button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping & Payment */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2" />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                            <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"></textarea>
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4 has-[:checked]:bg-yellow-50 has-[:checked]:border-yellow-500">
                            <input type="radio" id="cod" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={e => setPaymentMethod(e.target.value)} className="mr-2" />
                            <label htmlFor="cod" className="font-semibold">Cash on Delivery (COD)</label>
                            <p className="text-sm text-gray-600 ml-6">Pay with cash upon delivery.</p>
                        </div>
                         <div className="border rounded-lg p-4 has-[:checked]:bg-yellow-50 has-[:checked]:border-yellow-500">
                            <input type="radio" id="gcash" name="payment" value="GCash" checked={paymentMethod === 'GCash'} onChange={e => setPaymentMethod(e.target.value)} className="mr-2" />
                            <label htmlFor="gcash" className="font-semibold">GCash</label>
                            {paymentMethod === 'GCash' && (
                                loading ? <Spinner /> : selectedGcash ? (
                                    <div className="mt-4 ml-6 p-4 bg-gray-50 rounded-md">
                                        <p><strong>Account Name:</strong> {selectedGcash.account_name}</p>
                                        <p><strong>Account Number:</strong> {selectedGcash.account_number}</p>
                                        <p className="mt-2">Please upload proof of payment after sending.</p>
                                        {selectedGcash.qr_code_base64 && <img src={selectedGcash.qr_code_base64} alt="GCash QR" className="my-4 max-w-xs" />}
                                        <input type="file" accept="image/*" onChange={handleFileChange} required className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
                                        {paymentProof && <img src={paymentProof} alt="Payment proof preview" className="mt-4 h-32 w-auto object-contain rounded-md" />}
                                    </div>
                                ) : <p className="mt-2 ml-6 text-red-500">GCash payment method not configured.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                        <h2 className="text-2xl font-bold mb-4">Your Order</h2>
                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                           {cartItems.map(item => (
                               <div key={item.product.id} className="flex justify-between text-sm">
                                   <span>{item.product.name} x {item.quantity}</span>
                                   <span>{formatCurrency(item.product.price * item.quantity)}</span>
                               </div>
                           ))}
                        </div>
                        <div className="border-t pt-4 flex justify-between font-bold text-xl">
                            <span>Total</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                        <button type="submit" disabled={placingOrder} className="w-full mt-6 bg-yellow-600 text-white font-bold py-3 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center disabled:bg-gray-400">
                            {placingOrder && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>}
                            {placingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;
