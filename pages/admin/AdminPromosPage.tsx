
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { Promo, Product } from '../../types';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';

const AdminPromosPage: React.FC = () => {
    const [promos, setPromos] = useState<Promo[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promo | null>(null);

    const fetchPromos = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('promos').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching promos:', error);
        else setPromos(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPromos();
    }, [fetchPromos]);
    
    const handleOpenModal = (promo: Promo | null = null) => {
        setEditingPromo(promo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPromo(null);
    };

    const handleSave = () => {
        handleCloseModal();
        fetchPromos();
    };
    
    const handleDelete = async (promoId: string) => {
        if (window.confirm('Are you sure you want to delete this promo?')) {
            const { error } = await supabase.from('promos').delete().eq('id', promoId);
            if (error) alert('Error deleting promo.');
            else {
                alert('Promo deleted.');
                fetchPromos();
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Promotions</h1>
                <button onClick={() => handleOpenModal()} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">
                    + Add Promo
                </button>
            </div>
            {loading ? <Spinner /> : (
                 <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                <th className="p-3">Code</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Value</th>
                                <th className="p-3">Product ID</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promos.map(promo => (
                                <tr key={promo.id} className="border-b">
                                    <td className="p-3 font-mono">{promo.code || 'N/A'}</td>
                                    <td className="p-3 capitalize">{promo.promo_type}</td>
                                    <td className="p-3">{promo.promo_type === 'percentage' ? `${promo.value}%` : `₱${promo.value}`}</td>
                                    <td className="p-3 font-mono text-xs">{promo.product_id || 'Global'}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleOpenModal(promo)} className="text-blue-500 hover:underline mr-4">Edit</button>
                                        <button onClick={() => handleDelete(promo.id)} className="text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingPromo ? 'Edit Promo' : 'Add Promo'}>
                <PromoForm promo={editingPromo} onSave={handleSave} />
            </Modal>
        </div>
    );
};

const PromoForm: React.FC<{ promo: Promo | null, onSave: () => void }> = ({ promo, onSave }) => {
    const [formData, setFormData] = useState({
        code: promo?.code || '',
        promo_type: promo?.promo_type || 'percentage',
        value: promo?.value || 0,
        product_id: promo?.product_id || '',
    });
    const [loading, setLoading] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const dataToSave = {
            ...formData,
            product_id: formData.product_id === '' ? null : formData.product_id,
            code: formData.code === '' ? null : formData.code,
        };

        let error;
        if (promo) {
            ({ error } = await supabase.from('promos').update(dataToSave).eq('id', promo.id));
        } else {
            ({ error } = await supabase.from('promos').insert(dataToSave));
        }
        
        if (error) {
            alert('Error saving promo.');
            console.error(error);
        }
        else {
            alert('Promo saved.');
            onSave();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="code" placeholder="Promo Code (e.g., SALE10)" value={formData.code || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            <select name="promo_type" value={formData.promo_type} onChange={handleChange} className="w-full p-2 border rounded">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="global">Global</option>
            </select>
            <input type="number" name="value" placeholder="Value (e.g., 10 for 10%)" value={formData.value} onChange={handleChange} required className="w-full p-2 border rounded" />
            <input type="text" name="product_id" placeholder="Product ID (optional)" value={formData.product_id || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-gray-400">
                {loading ? 'Saving...' : 'Save Promo'}
            </button>
        </form>
    );
};

export default AdminPromosPage;
