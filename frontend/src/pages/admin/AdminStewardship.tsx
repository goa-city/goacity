import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { SparklesIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

export default function AdminStewardship(): React.JSX.Element {
    const [pendingLogs, setPendingLogs] = useState<any[]>([]);
    const [verifiedRecipients, setVerifiedRecipients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState<any>(null);
    const [impactNote, setImpactNote] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Mocking for now since endpoints might not exist
            const logsData = await api.get('/admin/stewardship/pending');
            setPendingLogs(logsData.data || []);

            const verifyData = await api.get('/admin/stewardship/recipients');
            setVerifiedRecipients(verifyData.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleAddRecipient = async () => {
        const name = prompt('Organization Name:');
        if (!name) return;
        const type = prompt('Organization Type (e.g. NGO, Ministry, Church):');
        if (!type) return;

        try {
            await api.post('/admin/stewardship/recipients', { name, type });
            showToast('Organization added');
            fetchAdminData();
        } catch (e) {
            console.error(e);
            showToast('Failed to add organization');
        }
    };

    const handleVerifyRecipient = async (id: number, status: string): Promise<void> => {
        try {
            await api.put(`/admin/stewardship/recipients/${id}`, { status: status === 'Active' ? 'Inactive' : 'Active' });
            showToast(`Recipient status updated`);
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleApproveLog = async (id: number): Promise<void> => {
        try {
            await api.put(`/admin/stewardship/logs/${id}/verify`);
            showToast('Log Verified & Notification Sent');
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddImpactNote = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            await api.post(`/admin/stewardship/logs/${selectedLogId}/impact`, { note: impactNote });
            showToast('Impact note added successfully!');
            setIsImpactModalOpen(false);
            setImpactNote('');
            setSelectedLogId(null);
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Stewardship Moderation
                        <SparklesIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">Verify gift logs and manage approved recipients</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Pending Logs Moderation */}
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                        <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center">All Gift Logs</h2>
                    </div>
                    {pendingLogs.length === 0 && !loading ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">All caught up!</p>
                            <p className="text-zinc-500 mt-1">No logs found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Member</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Details</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Status / Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {pendingLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">{log.user_name}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border shadow-sm mr-2 ${log.type === 'Financial' ? 'border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600'}`}>
                                                    {log.type}
                                                </span>
                                                <div className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                    {log.type === 'Financial' ? `$${log.amount}` : `${log.hours}h (${log.skill_category})`} - {log.recipient_name}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${log.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50'}`}>
                                                         {log.status}
                                                     </span>
                                                    <div className="flex gap-2 justify-end mt-2 isolate">
                                                        <button onClick={() => { setSelectedLogId(log.id); setIsImpactModalOpen(true); }} className="text-[10px] font-black tracking-widest uppercase bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 px-3 py-1.5 rounded-lg border border-sky-100 dark:border-sky-900/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors flex items-center gap-1">
                                                            <PencilSquareIcon className="w-3 h-3" /> Add Impact
                                                        </button>
                                                        {log.status === 'Pending' && (
                                                            <button onClick={() => handleApproveLog(log.id)} className="text-[10px] font-black tracking-widest uppercase bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                                <CheckCircleIcon className="w-3 h-3" /> Approve
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Verified Recipients Table */}
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden h-fit">
                    <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                        <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center">Verified Organizations</h2>
                        <button onClick={handleAddRecipient} className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/30 px-3 py-1 rounded-md border border-sky-100 dark:border-sky-900/50 transition-colors">+ Add Entity</button>
                    </div>
                    {verifiedRecipients.length === 0 && !loading ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No organizations found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Name</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Status / Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {verifiedRecipients.map(rec => (
                                        <tr key={rec.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">{rec.name}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{rec.type}</p>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${rec.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50'}`}>
                                                        {rec.status}
                                                    </span>
                                                    <button onClick={() => handleVerifyRecipient(rec.id, rec.status)} title="Toggle Status" className="p-1 rounded-lg text-zinc-300 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all">
                                                        {rec.status === 'Active' ? <XCircleIcon className="w-6 h-6 text-rose-500" /> : <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Impact Note Modal */}
            {isImpactModalOpen && (
                <div className="fixed inset-0 bg-zinc-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                            <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                                Add Impact Note
                            </h3>
                            <button onClick={() => setIsImpactModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddImpactNote} className="p-8">
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Success Story / Impact Description</label>
                            <textarea 
                                value={impactNote} onChange={e => setImpactNote(e.target.value)} required rows={4}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium resize-none" placeholder="Provide a brief story on how this gift resulted in kingdom impact..."
                            ></textarea>
                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsImpactModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                                <Button type="submit" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20"><PencilSquareIcon className="w-4 h-4 mr-2"/> Save Note</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
