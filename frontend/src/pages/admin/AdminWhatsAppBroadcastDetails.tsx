import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getWhatsAppBroadcastById } from '../../features/admin-whatsapp/api/whatsapp.api';
import { 
    ChevronLeftIcon,
    UserCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    MegaphoneIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { formatDate, formatDateTime } from '../../utils/date';
import { Card } from '../../shared/components/ui/Card';
import { getWhatsAppBroadcastById, retryWhatsAppBroadcast } from '../../features/admin-whatsapp/api/whatsapp.api';

const AdminWhatsAppBroadcastDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [retrying, setRetrying] = React.useState(false);
    const [toast, setToast] = React.useState('');
    
    const { data: broadcast, isLoading, refetch } = useQuery({
        queryKey: ['whatsapp-broadcast', id],
        queryFn: () => getWhatsAppBroadcastById(Number(id)),
        refetchInterval: (query) => query.state.data?.status === 'ONGOING' ? 3000 : false
    });

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleRetry = async () => {
        if (!window.confirm('Retry failed messages in this broadcast?')) return;
        setRetrying(true);
        try {
            await retryWhatsAppBroadcast(Number(id));
            refetch();
        } catch (err) {
            console.error('Retry failed:', err);
            showToast('Failed to initiate retry');
        } finally {
            setRetrying(false);
        }
    };

    if (isLoading && !broadcast) {
        return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}
            <div className="flex items-center gap-4">
                <Link to="/admin/whatsapp/logs" className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 transition-all">
                    <ChevronLeftIcon className="w-5 h-5 text-zinc-500" />
                </Link>
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight">
                        Broadcast <span className="text-indigo-600">Breakdown</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                        ID #{id} &bull; {broadcast.name?.replace('Broadcast to ', '')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900 rounded-lg p-8 text-white space-y-8 shadow-xl">
                        <div className="space-y-2">
                            <p className="text-indigo-400 font-black uppercase tracking-widest text-[10px]">Session Overview</p>
                            <h3 className="text-2xl font-black tracking-tight uppercase italic leading-none">{broadcast.status}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total</p>
                                <p className="text-2xl font-black">{broadcast.total_count}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Sent</p>
                                <p className="text-2xl font-black text-indigo-400">{broadcast.sent_count}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-start gap-4">
                                <MegaphoneIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                                <p className="text-xs font-medium text-zinc-300 leading-relaxed italic">"{broadcast.content}"</p>
                            </div>
                        </div>

                        {broadcast.status !== 'ONGOING' && broadcast.logs?.some((l: any) => l.status.startsWith('failed')) && (
                            <button
                                onClick={handleRetry}
                                disabled={retrying}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
                            >
                                {retrying ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Initiating...
                                    </>
                                ) : (
                                    <>
                                        <ArrowPathIcon className="w-4 h-4" />
                                        Retry Failed ({broadcast.logs.filter((l: any) => l.status.startsWith('failed')).length})
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Recipient Table */}
                <div className="lg:col-span-2">
                    <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Recipient</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                        <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                    {broadcast.logs?.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                                        <UserCircleIcon className="w-5 h-5 text-zinc-400" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-zinc-900 dark:text-white">
                                                            {log.member ? `${log.member.first_name} ${log.member.last_name}` : 'Unknown Member'}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400">{log.member?.phone || 'No phone'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-2">
                                                    {log.status.startsWith('failed') ? (
                                                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                    ) : (
                                                        <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                                    )}
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${log.status.startsWith('failed') ? 'text-rose-600' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-[10px] font-bold text-zinc-500">
                                                <div className="flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4" />
                                                    {formatDateTime(log.timestamp)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminWhatsAppBroadcastDetails;
