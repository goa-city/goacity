import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ArrowDownTrayIcon, HandThumbUpIcon, HandThumbDownIcon, NoSymbolIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const AdminMentorship = () => {
    const { adminUser } = useAdminAuth();
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelations();
    }, []);

    const fetchRelations = async () => {
        try {
            const res = await api.get('/admin/mentorship');
            setRelations(res.data.data || []);
        } catch (err) {
            console.error("Failed to load admin mentorships", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/mentorship/${id}/status`, { status });
            // refresh data
            fetchRelations();
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    const exportReport = async () => {
        try {
            const res = await api.get('/admin/mentorship/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'mentorship_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Export failed');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Mentorship Administration
                        <UserGroupIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Manage covenant-based relations and export reports.
                    </p>
                </div>
                <Button 
                    onClick={exportReport}
                    className="px-8 shadow-xl shadow-indigo-600/20"
                >
                    <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                    Export Impact Report
                </Button>
            </div>

            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading mentorships...</div>
                    ) : relations.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No mentorship relations requested.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Covenant Pair</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Focus / Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Health / Progress</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Intervention</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {relations.map((relation) => (
                                    <tr key={relation.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1 rounded-lg w-max">
                                                    Mentor: {relation.mentor?.first_name} {relation.mentor?.last_name}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-lg w-max">
                                                    Mentee: {relation.mentee?.first_name} {relation.mentee?.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{relation.focus_area || 'General'}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-2 py-1 rounded-md w-max mt-2 border border-sky-100 dark:border-sky-900/50">{relation.type}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="w-32">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-zinc-900 dark:text-white">{relation.completion_percentage}%</span>
                                                    <span className="text-zinc-400">Goals Met</span>
                                                </div>
                                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner">
                                                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${relation.completion_percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                                relation.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' :
                                                relation.status === 'Requested' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                                relation.status === 'Completed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50' :
                                                'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:border-red-900/50'
                                            }`}>
                                                {relation.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                {relation.status === 'Requested' && (
                                                    <button onClick={() => updateStatus(relation.id, 'Active')} title="Approve Pairing" className="p-2 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 rounded-xl transition-all">
                                                        <HandThumbUpIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {relation.status === 'Active' && (
                                                    <>
                                                        <button onClick={() => updateStatus(relation.id, 'Completed')} title="Mark Completed" className="p-2 text-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/30 rounded-xl transition-all">
                                                            <HandThumbUpIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => updateStatus(relation.id, 'Declined')} title="End / Reassign" className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 rounded-xl transition-all">
                                                            <NoSymbolIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
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
export default AdminMentorship;
