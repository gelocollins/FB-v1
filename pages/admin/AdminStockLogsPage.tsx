
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { StockLogWithProduct } from '../../types';
import Spinner from '../../components/ui/Spinner';

const AdminStockLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<StockLogWithProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('stock_logs')
            .select('*, products(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching stock logs:', error);
        } else {
            setLogs(data as StockLogWithProduct[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getChangeColor = (changeType: string) => {
        switch(changeType) {
            case 'sale': return 'text-red-600';
            case 'restock': return 'text-green-600';
            case 'manual': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Stock Change History</h1>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                <th className="p-3">Date</th>
                                <th className="p-3">Product</th>
                                <th className="p-3">Change Type</th>
                                <th className="p-3 text-right">Previous Stock</th>
                                <th className="p-3 text-right">New Stock</th>
                                <th className="p-3 text-right">Change</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="border-b">
                                    <td className="p-3 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="p-3 font-semibold">{log.products?.name || 'Unknown Product'}</td>
                                    <td className={`p-3 capitalize font-medium ${getChangeColor(log.change_type)}`}>{log.change_type}</td>
                                    <td className="p-3 text-right">{log.previous_stock}</td>
                                    <td className="p-3 text-right">{log.new_stock}</td>
                                    <td className={`p-3 text-right font-bold ${log.new_stock > log.previous_stock ? 'text-green-600' : 'text-red-600'}`}>
                                        {log.new_stock > log.previous_stock ? '+' : ''}{log.new_stock - log.previous_stock}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminStockLogsPage;
