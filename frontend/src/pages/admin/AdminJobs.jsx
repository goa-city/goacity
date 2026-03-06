import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    PencilSquareIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon, BriefcaseIcon
} from '@heroicons/react/24/outline';

const STATUS_COLORS = {
    pending:  'bg-amber-100 text-amber-800 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border border-red-200',
};

const TYPE_COLORS = {
    'Full Time':  'bg-sky-100 text-sky-700',
    'Part Time':  'bg-violet-100 text-violet-700',
    'Freelance':  'bg-emerald-100 text-emerald-700',
    'Internship': 'bg-amber-100 text-amber-700',
};

const AdminJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => { fetchJobs(); }, [filter]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? `?status=${filter}` : '';
            const res = await api.get(`/admin/jobs${params}`);
            setJobs(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job permanently?')) return;
        try {
            await api.delete(`/admin/jobs?id=${id}`);
            showToast('Job deleted.');
            fetchJobs();
        } catch (e) { alert(e.message); }
    };

    const filtered = jobs.filter(j =>
        j.title?.toLowerCase().includes(search.toLowerCase()) ||
        j.company?.toLowerCase().includes(search.toLowerCase())
    );

    const pendingCount = jobs.filter(j => (j.status || 'pending') === 'pending').length;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {toast && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
                        <p className="text-sm text-gray-500">
                            {jobs.length} total
                            {pendingCount > 0 && (
                                <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {pendingCount} pending review
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/jobs/new')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-semibold shadow"
                >
                    <PlusIcon className="w-4 h-4" /> Add Job
                </button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${
                            filter === s ? 'bg-slate-900 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-slate-400'
                        }`}
                    >
                        {s}
                        {s === 'pending' && pendingCount > 0 && (
                            <span className="ml-1.5 bg-amber-400 text-white text-[10px] font-bold w-4 h-4 inline-flex items-center justify-center rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search jobs..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No jobs found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Type</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Submitted By</th>
                                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/admin/jobs/${job.id}`)}>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900 truncate max-w-xs">{job.title}</p>
                                        <p className="text-xs text-gray-500">{job.company} · {job.location}</p>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${TYPE_COLORS[job.type] || 'bg-gray-100 text-gray-600'}`}>
                                            {job.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                                        {job.first_name ? `${job.first_name} ${job.last_name}` : <span className="italic text-gray-300">Admin</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[job.status] || STATUS_COLORS.pending}`}>
                                            {job.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                                title="Edit"
                                                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.id)}
                                                title="Delete"
                                                className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
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

export default AdminJobs;
