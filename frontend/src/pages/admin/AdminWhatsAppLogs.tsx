import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWhatsAppBroadcasts } from '../../features/admin-whatsapp/api/whatsapp.api';
import {
    MegaphoneIcon,
    CalendarIcon,
    UserGroupIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    ChevronRightIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { Card } from '../../shared/components/ui/Card';

const AdminWhatsAppLogs: React.FC = () => {
    const { data: broadcasts, isLoading, refetch } = useQuery({
        queryKey: ['whatsapp-broadcasts'],
        queryFn: getWhatsAppBroadcasts,
        refetchInterval: 10000,
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: 'always'
    });

    const [toast, setToast] = React.useState<string | null>(null);

    const hideBroadcast = async (e: React.MouseEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Hide this broadcast from history?')) return;

        try {
            await axios.delete(`/admin/whatsapp/broadcasts/${id}`);
            setToast('Broadcast hidden from history');
            setTimeout(() => setToast(null), 3000);
            refetch();
        } catch (err) {
            console.error('Failed to hide broadcast:', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
            {toast && <div className="fixed bottom-4 right-4 bg-zinc-900 text-white px-6 py-3 rounded-lg font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3 italic uppercase">
                        Broadcast <span className="text-indigo-600">History</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Tracking performance of mass communication campaigns.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 transition-all"
                >
                    <ArrowPathIcon className={`w-5 h-5 text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Broadcast Event</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contacts</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Progress</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Timestamp</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                            {isLoading && !broadcasts && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-zinc-400 font-black uppercase text-xs tracking-widest animate-pulse">
                                        Accessing broadcast logs...
                                    </td>
                                </tr>
                            )}

                            {broadcasts?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest italic">No broadcasts found in the last 7 days</p>
                                    </td>
                                </tr>
                            )}

                            {broadcasts?.map((b: any) => (
                                <tr key={b.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                                {b.name?.replace('Broadcast to ', '') || 'Bulk Broadcast'}
                                            </span>
                                            <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[200px] italic">{b.content}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{b.total_count}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-2 w-32">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                                <span>{b.sent_count} / {b.total_count}</span>
                                                <span>{Math.round((b.sent_count / b.total_count) * 100)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${b.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                    style={{ width: `${(b.sent_count / b.total_count) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border ${b.status === 'COMPLETED'
                                            ? 'bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-100 dark:border-emerald-900/50'
                                            : b.status === 'FAILED'
                                                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 border-rose-100 dark:border-rose-900/50'
                                                : b.status === 'ONGOING'
                                                    ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-100 dark:border-indigo-900/50 animate-pulse'
                                                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-zinc-500">
                                            <CalendarIcon className="w-4 h-4" />
                                            <span className="text-xs font-bold">{format(new Date(b.created_at), 'MMM d, HH:mm')}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button
                                                onClick={(e) => hideBroadcast(e, b.id)}
                                                className="p-2 text-zinc-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                                title="Hide from history"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                            <Link
                                                to={`/admin/whatsapp/logs/${b.id}`}
                                                className="p-2 rounded-lg text-zinc-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                                            >
                                                <ChevronRightIcon className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminWhatsAppLogs;
