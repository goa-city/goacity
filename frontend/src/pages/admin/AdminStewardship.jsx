import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { SparklesIcon, CheckCircleIcon, XCircleIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function AdminStewardship() {
    const [pendingLogs, setPendingLogs] = useState([]);
    const [verifiedRecipients, setVerifiedRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState(null);
    const [impactNote, setImpactNote] = useState('');

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

    const handleAddRecipient = async () => {
        const name = prompt('Organization Name:');
        if (!name) return;
        const type = prompt('Organization Type (e.g. NGO, Ministry, Church):');
        if (!type) return;

        try {
            await api.post('/admin/stewardship/recipients', { name, type });
            alert('Organization added');
            fetchAdminData();
        } catch (e) {
            console.error(e);
            alert('Failed to add organization');
        }
    };

    const handleVerifyRecipient = async (id, status) => {
        try {
            await api.put(`/admin/stewardship/recipients/${id}`, { status: status === 'Active' ? 'Inactive' : 'Active' });
            alert(`Recipient status updated`);
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleApproveLog = async (id) => {
        try {
            await api.put(`/admin/stewardship/logs/${id}/verify`);
            alert('Log Verified & Notification Sent');
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddImpactNote = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/admin/stewardship/logs/${selectedLogId}/impact`, { note: impactNote });
            alert('Impact note added successfully!');
            setIsImpactModalOpen(false);
            setImpactNote('');
            setSelectedLogId(null);
            fetchAdminData();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="admin-container">
            <div className="flex items-center gap-4 mb-8">
                <div className="admin-header-icon bg-sky-500">
                    <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Stewardship Moderation</h1>
                    <p className="text-sm text-gray-500">Verify gift logs and manage approved recipients</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Pending Logs Moderation */}
                <div className="admin-card">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">All Gift Logs</h2>
                    </div>
                    {pendingLogs.length === 0 && !loading ? (
                        <div className="p-12 text-center text-gray-400">All caught up! No logs found.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="admin-table-head">Member</th>
                                    <th className="admin-table-head">Details</th>
                                    <th className="admin-table-head text-right">Status / Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4 font-semibold text-gray-900">{log.user_name}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest mr-2 ${log.type === 'Financial' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                                {log.type}
                                            </span>
                                            <div className="mt-1 text-xs text-gray-600">
                                                {log.type === 'Financial' ? `$${log.amount}` : `${log.hours}h (${log.skill_category})`} - {log.recipient_name}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${log.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                     {log.status}
                                                 </span>
                                                <div className="flex gap-2 justify-end mt-1">
                                                    <button onClick={() => { setSelectedLogId(log.id); setIsImpactModalOpen(true); }} className="admin-button-secondary py-1 text-xs text-sky-600 border-sky-200 hover:bg-sky-50">
                                                        <PencilSquareIcon className="w-4 h-4" /> Add Impact
                                                    </button>
                                                    {log.status === 'Pending' && (
                                                        <button onClick={() => handleApproveLog(log.id)} className="admin-button-primary bg-emerald-500 hover:bg-emerald-600 py-1 text-xs">
                                                            <CheckCircleIcon className="w-4 h-4 mr-1" /> Approve
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Verified Recipients Table */}
                <div className="admin-card">
                    <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Verified Organizations</h2>
                        <button onClick={handleAddRecipient} className="text-sm text-sky-600 font-semibold hover:text-sky-700">+ Add Entity</button>
                    </div>
                    {verifiedRecipients.length === 0 && !loading ? (
                        <div className="p-12 text-center text-gray-400">No organizations found.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="admin-table-head">Name</th>
                                    <th className="admin-table-head">Type</th>
                                    <th className="admin-table-head text-right">Status / Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {verifiedRecipients.map(rec => (
                                    <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4 font-semibold text-gray-900">{rec.name}</td>
                                        <td className="px-5 py-4 text-gray-500 text-xs">{rec.type}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${rec.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                                    {rec.status}
                                                </span>
                                                <button onClick={() => handleVerifyRecipient(rec.id, rec.status)} title="Toggle Status" className="text-gray-400 hover:text-sky-600">
                                                    {rec.status === 'Active' ? <XCircleIcon className="w-5 h-5 text-rose-500" /> : <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
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

            {/* Impact Note Modal */}
            {isImpactModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">Add Impact Note</h3>
                            <button onClick={() => setIsImpactModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAddImpactNote} className="p-6">
                            <label className="admin-label">Success Story / Impact Description</label>
                            <textarea 
                                value={impactNote} onChange={e => setImpactNote(e.target.value)} required rows={4}
                                className="admin-input resize-none" placeholder="Provide a brief story on how this gift resulted in kingdom impact..."
                            ></textarea>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsImpactModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg">Cancel</button>
                                <button type="submit" className="admin-button-primary"><PencilSquareIcon className="w-4 h-4 mr-1"/> Save Note</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
