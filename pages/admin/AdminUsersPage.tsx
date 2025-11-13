
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase/client';
import { UserProfile } from '../../types';
import Spinner from '../../components/ui/Spinner';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('email');

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data as UserProfile[]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
        const { error } = await supabase
            .from('users')
            .update({ role: newRole })
            .eq('id', userId);
        
        if (error) {
            alert('Failed to update user role.');
            console.error(error);
        } else {
            alert('User role updated successfully.');
            fetchUsers();
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
            {loading ? <Spinner /> : (
                <div className="bg-white shadow rounded-lg overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-600">
                                <th className="p-3">Name</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b">
                                    <td className="p-3">{user.name || 'N/A'}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.phone || 'N/A'}</td>
                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin')}
                                            className="p-1 border rounded-md text-sm"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        {/* Future actions like view orders, suspend, etc. */}
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

export default AdminUsersPage;
