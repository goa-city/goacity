import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhatsAppLogs, sendWhatsAppMessage } from '../api/whatsapp.api';
import { 
    PaperAirplaneIcon, 
    ChatBubbleLeftRightIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface MemberWhatsAppTabProps {
    memberId: number;
    phoneNumber: string;
}

const MemberWhatsAppTab: React.FC<MemberWhatsAppTabProps> = ({ memberId, phoneNumber }) => {
    const [message, setMessage] = useState('');
    const queryClient = useQueryClient();
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: logs, isLoading, refetch } = useQuery({
        queryKey: ['whatsapp-logs', memberId],
        queryFn: () => getWhatsAppLogs(memberId),
        refetchInterval: 5000 // Poll every 5s for new messages
    });

    const mutation = useMutation({
        mutationFn: (content: string) => sendWhatsAppMessage(phoneNumber, content, memberId),
        onSuccess: () => {
            setMessage('');
            queryClient.invalidateQueries({ queryKey: ['whatsapp-logs', memberId] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.error || 'Failed to send WhatsApp message. Please check connection.');
        }
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || mutation.isPending) return;
        mutation.mutate(message);
    };

    if (!phoneNumber) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-slate-300">
                    <ChatBubbleLeftRightIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                    <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-sm">No Phone Number</p>
                    <p className="text-slate-500 text-xs font-medium max-w-xs">This member doesn't have a phone number linked to their profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-zinc-950 rounded-[2rem] border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="px-8 py-4 border-b border-slate-50 dark:border-zinc-900 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Interaction History</span>
                </div>
                <button 
                    onClick={() => refetch()} 
                    className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-full transition-all text-slate-400"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Messages */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
            >
                {isLoading && !logs && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading history...</p>
                    </div>
                )}

                {logs?.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                        <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-300" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No messages yet</p>
                    </div>
                )}

                {[...(logs || [])].reverse().map((log: any) => (
                    <div 
                        key={log.id} 
                        className={`flex flex-col ${log.direction === 'out' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium shadow-sm ${
                            log.direction === 'out' 
                                ? 'bg-sky-500 text-white rounded-br-none' 
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-zinc-700/50'
                        }`}>
                            {log.content}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2 px-1">
                            {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                            {log.direction === 'out' && (
                                <span className="ml-2 text-sky-500">
                                    {log.status === 'sent' ? '✓' : log.status === 'delivered' ? '✓✓' : log.status === 'read' ? '✓✓' : ''}
                                </span>
                            )}
                        </span>
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-slate-50 dark:border-zinc-900 bg-slate-50/30 dark:bg-zinc-900/30">
                <div className="relative flex items-center gap-3 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-200 dark:border-zinc-700 p-2 shadow-inner focus-within:border-sky-500 transition-all">
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message to send via WhatsApp..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-4 py-2 dark:text-white"
                    />
                    <button 
                        type="submit"
                        disabled={!message.trim() || mutation.isPending}
                        className={`p-3 rounded-xl transition-all ${
                            message.trim() && !mutation.isPending 
                                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95' 
                                : 'bg-slate-100 dark:bg-zinc-700 text-slate-300'
                        }`}
                    >
                        <PaperAirplaneIcon className={`w-5 h-5 ${mutation.isPending ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MemberWhatsAppTab;
