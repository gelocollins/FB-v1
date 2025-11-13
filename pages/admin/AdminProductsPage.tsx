
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { Product, ProductInsert } from '../../types';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { fileToBase64, formatCurrency } from '../../utils';

const AdminProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) console.error('Error fetching products:', error);
        else setProducts(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };
    
    const handleSave = () => {
        handleCloseModal();
        fetchProducts();
    }

    const handleDelete = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase.from('products').delete().eq('id', productId);
            if (error) {
                alert('Error deleting product.');
                console.error(error);
            } else {
                alert('Product deleted successfully.');
                fetchProducts();
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Products</h1>
                <button onClick={() => handleOpenModal()} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600">
                    + Add Product
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                <th className="p-3">Image</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Price</th>
                                <th className="p-3">Stock</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="border-b">
                                    <td className="p-3"><img src={product.image_base64} alt={product.name} className="h-12 w-12 object-cover rounded"/></td>
                                    <td className="p-3 font-semibold">{product.name}</td>
                                    <td className="p-3">{formatCurrency(product.price)}</td>
                                    <td className="p-3">{product.stock}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleOpenModal(product)} className="text-blue-500 hover:underline mr-4">Edit</button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
                <ProductForm product={editingProduct} onSave={handleSave} />
            </Modal>
        </div>
    );
};

const ProductForm: React.FC<{ product: Product | null, onSave: () => void }> = ({ product, onSave }) => {
    const [formData, setFormData] = useState<ProductInsert>({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        stock: product?.stock || 0,
        discount: product?.discount || null,
        image_base64: product?.image_base64 || ''
    });
    const [imageBase64, setImageBase64] = useState<string | null>(product?.image_base64 || null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' || name === 'discount' ? Number(value) : value }));
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setImageBase64(base64);
            } catch (error) {
                console.error("File to base64 conversion error", error);
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const dataToSave = {
            ...formData,
            image_base64: imageBase64 || '',
        };
        
        if (!dataToSave.image_base64) {
            alert('Product image is required.');
            setLoading(false);
            return;
        }

        let error;
        if (product) { // This is an update
            ({ error } = await supabase.from('products').update(dataToSave).eq('id', product.id));
            if (!error && product.stock !== dataToSave.stock) { // Log if stock changed
                const { error: logError } = await supabase.from('stock_logs').insert({
                    product_id: product.id,
                    previous_stock: product.stock,
                    new_stock: dataToSave.stock,
                    change_type: 'manual'
                });
                if (logError) console.error("Failed to log stock change:", logError);
            }
        } else { // This is an insert
            const { data: newProduct, error: insertError } = await supabase.from('products').insert(dataToSave).select().single();
            error = insertError;
            if (!error && newProduct) { // Log initial stock
                const { error: logError } = await supabase.from('stock_logs').insert({
                    product_id: newProduct.id,
                    previous_stock: 0,
                    new_stock: dataToSave.stock,
                    change_type: 'manual'
                });
                if (logError) console.error("Failed to log stock change:", logError);
            }
        }
        
        if (error) {
            alert('Error saving product.');
            console.error(error);
        } else {
            alert(`Product ${product ? 'updated' : 'added'} successfully!`);
            onSave();
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="block text-sm font-medium">Product Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
                {imageBase64 && <img src={imageBase64} alt="Preview" className="mt-2 h-32 w-auto object-contain rounded" />}
            </div>
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full p-2 border rounded" />
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="w-full p-2 border rounded" />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required className="w-full p-2 border rounded" />
                <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>
            <input type="number" name="discount" placeholder="Discount % (e.g., 10)" value={formData.discount || ''} onChange={handleChange} className="w-full p-2 border rounded" />
            <button type="submit" disabled={loading} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-600 disabled:bg-gray-400">
                {loading ? 'Saving...' : 'Save Product'}
            </button>
        </form>
    );
};

export default AdminProductsPage;
