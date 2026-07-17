import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { HandThumbUpIcon, HandThumbDownIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';

interface CollabPerson {
    first_name?: string;
    last_name?: string;
}

interface CollabRequest {
    id: number;
    type: string;
    status: string;
    requester?: CollabPerson | null;
    provider?: CollabPerson | null;
}

const AdminCollabs: React.FC = () => {
    const [collabs, setCollabs] = useState<CollabRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchCollabs();
    }, []);

    const fetchCollabs = async () => {
        try {
            const res = await api.get('/admin/collabs');
            setCollabs(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const updateStatus = async (id: number, status: string) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;
        try {
            await api.put(`/admin/collabs/${id}/status`, { status });
            showToast(`Collaboration marked as ${status}`);
            fetchCollabs();
        } catch (error) {
            console.error(error);
            showToast('Failed to update.');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 h-full">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Collaboration Control
                        <ShieldCheckIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Oversee formal service & mentorship requests between members.
                    </p>
                </div>
            </div>

            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                    <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center">
                        <ShieldCheckIcon className="w-5 h-5 mr-3 text-indigo-500" /> Administrative Review Pipeline
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading requests...</div>
                    ) : collabs.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Requesting Member</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Target Provider</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Collab Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50 text-sm">
                                {collabs.map(collab => (
                                    <tr key={collab.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-black text-zinc-900 dark:text-white">
                                                {collab.requester?.first_name} {collab.requester?.last_name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                {collab.provider?.first_name} {collab.provider?.last_name}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${
                                                collab.type === 'Paid' ? 'border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                                            }`}>
                                                {collab.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                collab.status === 'Approved' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50' :
                                                collab.status === 'Pending_Admin' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                                collab.status === 'Declined' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50' :
                                                'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                                            }`}>
                                                {collab.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            {collab.status === 'Pending_Admin' && (
                                                <div className="flex justify-end gap-2 isolate">
                                                    <button 
                                                        onClick={() => updateStatus(collab.id, 'Approved')}
                                                        className="text-zinc-300 group-hover:text-emerald-500 p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                                                        title="Approve Collaboration"
                                                    >
                                                        <HandThumbUpIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatus(collab.id, 'Declined')}
                                                        className="text-zinc-300 group-hover:text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                                                        title="Decline Collaboration"
                                                    >
                                                        <HandThumbDownIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center">
                            <ShieldCheckIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No collaboration requests</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminCollabs
