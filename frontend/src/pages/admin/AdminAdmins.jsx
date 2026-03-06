import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    PencilIcon, PlusIcon, UserGroupIcon, 
    MagnifyingGlassIcon, UserCircleIcon, 
    XMarkIcon, LockClosedIcon, EnvelopeIcon, UserIcon
} from '@heroicons/react/24/outline';

const AdminAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/admins');
            setAdmins(res.data);
        } catch (error) {
            console.error("Failed to fetch admins:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (admin = null) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                full_name: admin.full_name || '',
                email: admin.email || '',
                password: '' // Don't show existing password
            });
        } else {
            setEditingAdmin(null);
            setFormData({
                full_name: '',
                email: '',
                password: ''
            });
        }
        setError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingAdmin) {
                await api.put('/admin/admins', {
                    id: editingAdmin.id,
                    ...formData
                });
            } else {
                if (!formData.password) {
                    throw new Error("Password is required for new admin");
                }
                await api.post('/admin/admins', formData);
            }
            setShowModal(false);
            fetchAdmins();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to save admin");
        } finally {
            setSaving(false);
        }
    };

    const filtered = admins.filter(a => {
        const full = `${a.full_name || ''} ${a.email || ''}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-indigo-500">
                        <UserGroupIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Users</h1>
                        <p className="text-sm text-gray-500">Manage system administrators</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="admin-button-primary"
                >
                    <PlusIcon className="h-4 w-4" /> Add Admin
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search admins..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 w-80"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading admins...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No admin users found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 font-bold border-b border-gray-100">
                                <th className="px-6 py-4">Full Name</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4 hidden md:table-cell">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((admin) => (
                                <tr 
                                    key={admin.id} 
                                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    onClick={() => handleOpenModal(admin)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-100 font-bold uppercase text-xs">
                                                {admin.full_name?.charAt(0) || 'A'}
                                            </div>
                                            <span className="font-semibold text-gray-900">{admin.full_name || 'Admin'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium">
                                        {admin.email}
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell text-gray-400 text-xs">
                                        {new Date(admin.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleOpenModal(admin)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingAdmin ? 'Edit Admin' : 'New Admin'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" required
                                        value={formData.full_name}
                                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <EnvelopeIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="email" required
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                                        placeholder="admin@goa.city"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                                    {editingAdmin ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="password"
                                        required={!editingAdmin}
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                                        placeholder={editingAdmin ? "Leave blank to keep same" : "Minimum 6 characters"}
                                    />
                                </div>
                                {editingAdmin && <p className="mt-1.5 text-[10px] text-gray-400 flex items-center gap-1 italic"><LockClosedIcon className="w-3 h-3" /> Only fill this if you want to change the password.</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {saving ? 'Saving...' : editingAdmin ? 'Update Administrator' : 'Create Administrator'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdmins;
