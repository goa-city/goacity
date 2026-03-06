import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, BookOpenIcon
} from '@heroicons/react/24/outline';

const STATUS_COLORS = {
    pending:  'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
};

const AdminResources = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
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

    const handleDelete = async (id) => {
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
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-sky-500">
                        <BookOpenIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
                        <p className="text-sm text-gray-500">
                            {resources.length} resources in database
                            {pendingCount > 0 && (
                                <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {pendingCount} Review Pending
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/resources/new')}
                    className="admin-button-primary"
                >
                    <PlusIcon className="w-4 h-4" /> Add Resource
                </button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex gap-2">
                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`admin-filter-tab ${filter === s ? 'admin-filter-tab-active' : 'admin-filter-tab-inactive'}`}
                        >
                            <span className="capitalize">{s}</span>
                            {s === 'pending' && pendingCount > 0 && (
                                <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-black w-3.5 h-3.5 inline-flex items-center justify-center rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search resources by title or author..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-80"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading resources...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No resources matches your criteria.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Resource</th>
                                <th className="admin-table-head hidden md:table-cell">Category</th>
                                <th className="admin-table-head hidden lg:table-cell">Submitted By</th>
                                <th className="admin-table-head">Status</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(resource => (
                                <tr key={resource.id} className="admin-table-row"
                                    onClick={() => navigate(`/admin/resources/${resource.id}`)}>
                                    <td className="px-5 py-4">
                                        <div className="max-w-xs md:max-w-sm">
                                            <p className="font-semibold text-gray-900 truncate">{resource.title}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">Contributor: {resource.author}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tight">
                                            {resource.category}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                                        {resource.first_name
                                            ? <span className="font-medium text-gray-600">{resource.first_name} {resource.last_name}</span>
                                            : <span className="italic text-gray-300">System Admin</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${STATUS_COLORS[resource.status] || STATUS_COLORS.pending}`}>
                                            {resource.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/resources/${resource.id}`)}
                                                className="admin-action-btn-edit" title="Edit Resource"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(resource.id)}
                                                className="admin-action-btn-delete" title="Delete Resource"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminResources;
