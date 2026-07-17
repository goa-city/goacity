import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    PencilSquareIcon, DocumentArrowDownIcon, CalendarIcon, BriefcaseIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';

interface AdminApplication {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    message: string | null;
    cv_url: string;
    status: string;
    notes: string | null;
    created_at: string;
    job: {
        title: string;
        company: string;
    };
    applicant: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

const AdminApplications: React.FC = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState<AdminApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState('');

    const [editingAppId, setEditingAppId] = useState<number | null>(null);
    const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
    const [updating, setUpdating] = useState(false);

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/jobs/applications');
            setApplications(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleEditStatus = (app: AdminApplication) => {
        setEditingAppId(app.id);
        setStatusForm({
            status: app.status || 'submitted',
            notes: app.notes || ''
        });
    };

    const handleSaveStatus = async (appId: number) => {
        setUpdating(true);
        try {
            await api.patch(`/admin/jobs/applications/${appId}/status`, statusForm);
            showToast('Application status updated.');
            setEditingAppId(null);
            fetchApplications();
        } catch (err) {
            console.error(err);
            showToast('Failed to update status.');
        } finally {
            setUpdating(false);
        }
    };

    const filtered = applications.filter(app => {
        const matchesSearch = app.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
            app.job?.company?.toLowerCase().includes(search.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return matchesSearch && app.status === filter;
    });

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Job Applications
                        <BriefcaseIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        {applications.length} total applications submitted
                    </p>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-8 items-center justify-between">
                <div className="flex gap-2">
                    {['all', 'submitted', 'reviewed', 'contacted', 'offered', 'rejected'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 ${
                                filter === s 
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50' 
                                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            <span>{s === 'reviewed' ? 'Under Review' : s}</span>
                        </button>
                    ))}
                </div>
                <div className="relative max-w-md w-full ml-auto">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search applications..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No applications found</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Applicant</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Job Opportunity</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Applied Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(app => (
                                    <tr key={app.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{app.full_name}</p>
                                            <p className="text-xs font-medium text-zinc-400 mt-1">{app.email} · {app.phone || 'No Phone'}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-zinc-700 dark:text-zinc-300">{app.job?.title}</p>
                                            <p className="text-xs font-medium text-zinc-400 mt-1">{app.job?.company}</p>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <span className="text-xs text-zinc-500 font-medium">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${
                                                app.status === 'offered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' : 
                                                app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50' : 
                                                app.status === 'contacted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50' :
                                                app.status === 'reviewed' ? 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/30 dark:border-sky-900/50' :
                                                'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50'
                                            }`}>
                                                {app.status === 'reviewed' ? 'Under Review' : app.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`https://goa.city${app.cv_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-xl text-zinc-400 hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30" 
                                                    title="Download CV"
                                                >
                                                    <DocumentArrowDownIcon className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => handleEditStatus(app)}
                                                    className="p-2 rounded-xl text-zinc-400 hover:text-sky-600 transition-all hover:bg-sky-50 dark:hover:bg-sky-950/30" 
                                                    title="Update Status"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
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

            {/* Edit Status Modal */}
            {editingAppId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full bg-white dark:bg-zinc-950 p-6 space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Application Status</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">Status</label>
                                <select
                                    value={statusForm.status}
                                    onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                    className="w-full border border-gray-300 dark:border-zinc-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                >
                                    <option value="submitted">Submitted</option>
                                    <option value="reviewed">Under Review</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="offered">Offered</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-zinc-300 mb-1">Admin Notes (Optional)</label>
                                <textarea
                                    rows={4}
                                    value={statusForm.notes}
                                    onChange={e => setStatusForm({ ...statusForm, notes: e.target.value })}
                                    placeholder="Enter review notes..."
                                    className="w-full border border-gray-300 dark:border-zinc-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setEditingAppId(null)}
                                className="px-6 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveStatus(editingAppId)}
                                disabled={updating}
                                className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm"
                            >
                                {updating ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminApplications;
