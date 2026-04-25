import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getWhatsAppStatus, refreshWhatsApp, restartWhatsApp } from '../../features/admin-whatsapp/api/whatsapp.api';
import { 
    SignalIcon, 
    ArrowPathIcon, 
    PowerIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/ui/Card';

const AdminWhatsAppStatus: React.FC = () => {
    const { data: status, isLoading, refetch } = useQuery({
        queryKey: ['whatsapp-status'],
        queryFn: getWhatsAppStatus,
        refetchInterval: 5000
    });

    const refreshMutation = useMutation({
        mutationFn: refreshWhatsApp,
        onSuccess: () => refetch()
    });

    const restartMutation = useMutation({
        mutationFn: restartWhatsApp,
        onSuccess: () => refetch()
    });

    const isConnected = status?.status === 'CONNECTED' || status?.status === 'READY';

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3 italic uppercase">
                        System <span className="text-indigo-600">Connectivity</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Real-time status of the WhatsApp messaging engine.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Status Card */}
                <Card className={`p-8 border-2 transition-all ${
                    isConnected 
                        ? 'border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10' 
                        : 'border-rose-500/20 bg-rose-50/10 dark:bg-rose-950/10'
                }`}>
                    <div className="flex flex-col h-full justify-between gap-8">
                        <div className="flex items-center justify-between">
                            <div className={`p-3 rounded-xl ${isConnected ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                <SignalIcon className="w-6 h-6" />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                isConnected 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 border-emerald-200' 
                                    : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 border-rose-200'
                            }`}>
                                {status?.status || 'UNKNOWN'}
                            </span>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic leading-none mb-2">Engine Status</h2>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                {isConnected ? 'All systems operational. Incoming and outgoing messages are active.' : 'Connection lost. The system is attempting to recover.'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Device Info */}
                <Card className="p-8">
                    <div className="flex flex-col h-full justify-between gap-8">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-zinc-900 text-white rounded-xl">
                                <DevicePhoneMobileIcon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Server Side Browser</span>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic leading-none mb-2">Active Session</h2>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                                    <CheckBadgeIcon className="w-4 h-4 text-indigo-600" /> WhatsApp Web Core v3.0
                                </p>
                                <p className="text-[10px] text-zinc-400 font-medium">LAST ACTIVE: {status?.last_active ? new Date(status.last_active).toLocaleString() : 'Never'}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Controls */}
                <Card className="p-8 lg:bg-zinc-50 dark:lg:bg-zinc-900/50 border-dashed">
                    <div className="flex flex-col h-full gap-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Management Controls</h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => refreshMutation.mutate()}
                                disabled={refreshMutation.isPending}
                                className="w-full py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-zinc-50 transition-all text-zinc-600 dark:text-zinc-300 active:scale-[0.98]"
                            >
                                <ArrowPathIcon className={`w-4 h-4 text-indigo-600 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                                Refresh Connection
                            </button>
                            
                            <button 
                                onClick={() => restartMutation.mutate()}
                                disabled={restartMutation.isPending}
                                className="w-full py-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg shadow-sm font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-rose-100 transition-all text-rose-600 active:scale-[0.98]"
                            >
                                <PowerIcon className={`w-4 h-4 ${restartMutation.isPending ? 'animate-spin' : ''}`} />
                                Force Restart
                            </button>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 flex gap-3">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                                Use Restart only if the connection is completely stuck. It will clear all browser cache.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {status?.qr_code && status.status === 'DISCONNECTED' && (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-xl border-2 border-indigo-500 border-dashed animate-in zoom-in duration-500 shadow-2xl">
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic tracking-tight mb-8">Scan QR Code</h2>
                    <div className="p-6 bg-white rounded-2xl shadow-inner border border-zinc-100">
                        <img src={status.qr_code} alt="WhatsApp QR Code" className="w-64 h-64" />
                    </div>
                    <p className="mt-8 text-zinc-500 text-sm font-medium animate-pulse">Open WhatsApp on your phone &rarr; Menu &rarr; Linked Devices &rarr; Link a Device</p>
                </div>
            )}
        </div>
    );
};

export default AdminWhatsAppStatus;
