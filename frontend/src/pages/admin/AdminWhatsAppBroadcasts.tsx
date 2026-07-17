import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchAdminMembers, type AdminMember } from '../../features/admin-members/api/admin-members.api';
import { broadcastWhatsApp } from '../../features/admin-whatsapp/api/whatsapp.api';
import { 
    PaperAirplaneIcon, 
    UsersIcon,
    MegaphoneIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Card } from '../../shared/components/ui/Card';
import axios from '../../api/axios';

interface AdminStream {
    id: number;
    name: string;
}

const AdminWhatsAppBroadcasts: React.FC = () => {
    const [selectedStreams, setSelectedStreams] = useState<number[]>([]);
    const [message, setMessage] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const [isAllMembers, setIsAllMembers] = useState(false);

    const { data: streams } = useQuery<AdminStream[]>({ 
        queryKey: ['streams'], 
        queryFn: async () => {
            const res = await axios.get<AdminStream[]>('/admin/streams');
            return res.data;
        } 
    });
    const { data: members } = useQuery<AdminMember[]>({ 
        queryKey: ['admin-members'], 
        queryFn: () => fetchAdminMembers()
    });

    const broadcastMutation = useMutation({
        mutationFn: async () => {
            if (!message) throw new Error('Message is required');
            
            let targetMembers: AdminMember[] = [];
            if (isAllMembers) {
                targetMembers = members || [];
            } else {
                if (selectedStreams.length === 0) throw new Error('Select at least one stream');
                targetMembers = (members || []).filter((member) =>
                    member.streams?.some((stream) => selectedStreams.includes(stream.id))
                );
            }

            if (targetMembers.length === 0) throw new Error('No members found in selected criteria');

            const bulkMessages = targetMembers
                .filter((member) => Boolean(member.phone))
                .map((member) => ({
                to: member.phone,
                content: message,
                memberId: member.id
            }));

            const streamNames = isAllMembers
                ? ['All Members']
                : streams?.filter((stream) => selectedStreams.includes(stream.id)).map((stream) => stream.name);

            return broadcastWhatsApp(bulkMessages, streamNames);
        },
        onSuccess: () => {
            setToast('Broadcast successfully initiated!');
            setMessage('');
            setSelectedStreams([]);
            setTimeout(() => setToast(null), 3000);
        },
        onError: (error: any) => {
            setToast(error.message || 'Failed to send broadcast');
            setTimeout(() => setToast(null), 3000);
        }
    });

    const toggleStream = (id: number) => {
        setIsAllMembers(false);
        setSelectedStreams(prev => 
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
            {toast && <div className="fixed bottom-4 right-4 bg-zinc-900 text-white px-6 py-3 rounded-lg font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3 italic uppercase">
                        WhatsApp <span className="text-indigo-600">Broadcast</span>
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Mass message your community with built-in safety delays.
                    </p>
                </div>
                <Link 
                    to="/admin/whatsapp/logs"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-600 transition-all"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                    View History
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Audience Selection */}
                <Card className="lg:col-span-1 p-8 space-y-8">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-indigo-600" /> Audience Selection
                        </h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    setIsAllMembers(!isAllMembers);
                                    setSelectedStreams([]);
                                }}
                                className={`w-full p-4 rounded-lg border text-left transition-all flex items-center justify-between group ${
                                    isAllMembers 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400'
                                }`}
                            >
                                <span className="text-xs font-black uppercase tracking-widest">All Members</span>
                                <div className={`w-2 h-2 rounded-full ${isAllMembers ? 'bg-white' : 'bg-zinc-300'}`} />
                            </button>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Or Select Streams</p>
                                <div className="space-y-2">
                                    {streams?.map((stream) => (
                                        <button
                                            key={stream.id}
                                            onClick={() => toggleStream(stream.id)}
                                            className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between ${
                                                selectedStreams.includes(stream.id)
                                                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-600 text-indigo-600'
                                                : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50'
                                            }`}
                                        >
                                            <span className="text-xs font-bold">{stream.name}</span>
                                            {selectedStreams.includes(stream.id) && <CheckCircleIcon className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Message Composer */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <MegaphoneIcon className="w-4 h-4 text-indigo-600" /> Message Content
                            </h3>
                            <div className="flex gap-2">
                                <code className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-bold text-indigo-600">{"{firstname}"}</code>
                                <code className="text-[9px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded font-bold text-indigo-600">{"{lastname}"}</code>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hi {firstname}, hope you're having a great day!..."
                                className="admin-input w-full h-48 rounded-lg"
                            />
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
                                    <InformationCircleIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-relaxed">
                                        Personalization: Use <span className="text-indigo-700">{"{firstname}"}</span> or <span className="text-indigo-700">{"{lastname}"}</span> to automatically insert member names.
                                    </p>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                                    <InformationCircleIcon className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
                                        Safety: 8-15 second randomized delay applied between messages.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <button 
                        onClick={() => {
                            if (!isAllMembers && selectedStreams.length === 0) {
                                setToast('Please select at least one stream or choose All Members.');
                                setTimeout(() => setToast(null), 3000);
                                return;
                            }
                            if (!message.trim()) {
                                setToast('Please enter a message content.');
                                setTimeout(() => setToast(null), 3000);
                                return;
                            }
                            broadcastMutation.mutate();
                        }}
                        disabled={broadcastMutation.isPending}
                        className={`w-full py-5 rounded-lg font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                            broadcastMutation.isPending 
                            ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20 active:scale-[0.98]'
                        }`}
                    >
                        {broadcastMutation.isPending ? (
                            <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <PaperAirplaneIcon className="w-5 h-5" />
                                Launch Broadcast
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminWhatsAppBroadcasts;
