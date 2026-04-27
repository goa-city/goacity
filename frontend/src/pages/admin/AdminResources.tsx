import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, BookOpenIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const STATUS_COLORS = {
    pending:  'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
};

const AdminResources: React.FC = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => { fetchResources(); }, [filter]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const res = await api.get(`/admin/resources${params}`);
            setResources(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this resource permanently?')) return;
        try {
            await api.delete(`/admin/resources?id=${id}`);
            showToast('Resource deleted successfully.');
            fetchResources();
        } catch (e) { alert(e.message); }
    };

    const filtered = resources.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.author?.toLowerCase().includes(search.toLowerCase())
    );

    const pendingCount = resources.filter(r => (r.status || 'pending') === 'pending').length;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Resources
                        <BookOpenIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        {resources.length} resources in database
                        {pendingCount > 0 && (
                            <span className="ml-3 bg-amber-100 text-amber-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {pendingCount} Review Pending
                            </span>
                        )}
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/resources/new')} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Resource
                </Button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-8 items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${
                                filter === s 
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50' 
                                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <span>{s}</span>
                            {s === 'pending' && pendingCount > 0 && (
                                <span className="bg-amber-500 text-white text-[9px] font-black w-4 h-4 inline-flex items-center justify-center rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="relative max-w-md w-full ml-auto">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources by title or author..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading resources...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No resources matches your criteria</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Resource</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Submitted By</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(resource => (
                                    <tr key={resource.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/admin/resources/${resource.id}`)}>
                                        <td className="px-8 py-5">
                                            <div className="max-w-xs md:max-w-sm">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white truncate">{resource.title}</p>
                                                <p className="text-xs font-medium text-zinc-400 mt-1">Contributor: {resource.author}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <span className="text-[10px] font-black px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">
                                                {resource.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 hidden lg:table-cell">
                                            {resource.first_name
                                                ? <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{resource.first_name} {resource.last_name}</span>
                                                : <span className="text-sm font-medium italic text-zinc-400">System Admin</span>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                                                resource.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' : 
                                                resource.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50' : 
                                                'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50'
                                            }`}>
                                                {resource.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/resources/${resource.id}`)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30" title="Edit Resource"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30" title="Delete Resource"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminResources;
