import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    PencilSquareIcon as PencilIcon, PlusIcon, UserGroupIcon, 
    MagnifyingGlassIcon, UserCircleIcon, 
    XMarkIcon, LockClosedIcon, EnvelopeIcon, UserIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

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
        <div className="max-w-7xl mx-auto py-10 px-6">
            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Admin Users
                        <UserGroupIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">Manage system administrators</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Admin
                </Button>
            </div>

            {/* Search */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search admins..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading admins...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No admin users found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Full Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Email Address</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Created</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map((admin) => (
                                    <tr 
                                        key={admin.id} 
                                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                                        onClick={() => handleOpenModal(admin)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-black uppercase text-sm">
                                                    {admin.full_name?.charAt(0) || 'A'}
                                                </div>
                                                <span className="font-black text-zinc-900 dark:text-white text-sm">{admin.full_name || 'Admin'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            {admin.email}
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell text-zinc-400 text-xs font-black tracking-widest uppercase">
                                            {new Date(admin.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleOpenModal(admin)}
                                                className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <UserGroupIcon className="w-6 h-6 text-indigo-500" />
                                {editingAdmin ? 'Edit Admin' : 'New Admin'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 rounded-xl text-sm font-black flex items-center gap-2">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="text" required
                                        value={formData.full_name}
                                        onChange={e => setFormData({...formData, full_name: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 pl-12 font-medium"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Email Address</label>
                                <div className="relative">
                                    <EnvelopeIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="email" required
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 pl-12 font-medium"
                                        placeholder="admin@goa.city"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                    {editingAdmin ? 'New Password (Optional)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <LockClosedIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="password"
                                        required={!editingAdmin}
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 pl-12 font-medium"
                                        placeholder={editingAdmin ? "Leave blank to keep same" : "Minimum 6 characters"}
                                    />
                                </div>
                                {editingAdmin && <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1"><LockClosedIcon className="w-3 h-3" /> Only fill this if you want to change the password.</p>}
                            </div>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full justify-center py-4 text-sm mt-4"
                            >
                                {saving ? 'Saving...' : editingAdmin ? 'Update Administrator' : 'Create Administrator'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdmins;
