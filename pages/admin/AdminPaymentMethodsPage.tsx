
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { PaymentMethod } from '../../types';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { fileToBase64 } from '../../utils';

const AdminPaymentMethodsPage: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

    const fetchMethods = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('payment_methods').select('*');
        if (error) console.error('Error fetching payment methods:', error);
        else setMethods(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchMethods();
    }, [fetchMethods]);

    const handleOpenModal = (method: PaymentMethod | null = null) => {
        setEditingMethod(method);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMethod(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchMethods();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Payment Methods</h1>
                <button onClick={() => handleOpenModal()} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">
                    + Add Method
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="space-y-4">
                    {methods.map(method => (
                        <div key={method.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg">{method.method_name}</h2>
                                <p>Name: {method.account_name}</p>
                                <p>Number: {method.account_number}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${method.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {method.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={() => handleOpenModal(method)} className="text-blue-500 hover:underline">Edit</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingMethod ? 'Edit Method' : 'Add Method'}>
                <PaymentMethodForm method={editingMethod} onSave={handleSave} />
            </Modal>
        </div>
    );
};


const PaymentMethodForm: React.FC<{ method: PaymentMethod | null, onSave: () => void }> = ({ method, onSave }) => {
    const [formData, setFormData] = useState({
        method_name: method?.method_name || '',
        account_name: method?.account_name || '',
        account_number: method?.account_number || '',
        is_active: method?.is_active ?? true,
    });
    const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(method?.qr_code_base64 || null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setQrCodeBase64(base64);
            } catch (error) {
                console.error("File to base64 conversion error", error);
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToSave = { ...formData, qr_code_base64: qrCodeBase64 };
        
        let error;
        if (method) {
            ({ error } = await supabase.from('payment_methods').update(dataToSave).eq('id', method.id));
        } else {
            ({ error } = await supabase.from('payment_methods').insert(dataToSave));
        }

        if (error) {
            alert('Error saving method.');
            console.error(error);
        } else {
            alert(`Method ${method ? 'updated' : 'added'} successfully!`);
            onSave();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="method_name" placeholder="Method Name (e.g., GCash)" value={formData.method_name} onChange={handleChange} required className="w-full p-2 border rounded" />
            <input type="text" name="account_name" placeholder="Account Name" value={formData.account_name} onChange={handleChange} required className="w-full p-2 border rounded" />
            <input type="text" name="account_number" placeholder="Account Number" value={formData.account_number} onChange={handleChange} required className="w-full p-2 border rounded" />
            <div>
                <label className="block text-sm font-medium">QR Code (Optional)</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
                {qrCodeBase64 && <img src={qrCodeBase64} alt="QR Preview" className="mt-2 h-32 w-auto object-contain rounded" />}
            </div>
             <div className="flex items-center">
                <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Active
                </label>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-gray-400">
                {loading ? 'Saving...' : 'Save Method'}
            </button>
        </form>
    );
};


export default AdminPaymentMethodsPage;
