import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import StreamCard from './StreamCard';
import DashboardLayout from '../../../layouts/DashboardLayout';
import GlobalSearch from '../../../components/GlobalSearch';
import PullToRefresh from '../../../components/mobile/PullToRefresh';
import { 
    PlusIcon, 
    SparklesIcon, 
    ArrowPathIcon 
} from '@heroicons/react/24/solid';

const DashboardView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, collabs, isLoading, refetch } = useDashboard();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const dateString = new Date().toLocaleDateString('en-GB', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });

    if (isLoading && !isRefreshing) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 animate-pulse text-zinc-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Platform Nodes...</div>;
    }

    return (
        <DashboardLayout>
            <PullToRefresh onRefresh={refetch}>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                            Hello, {data?.user?.first_name || user?.first_name || 'Member'}
                        </h1>
                        <p className="text-zinc-400 font-black mt-2 uppercase tracking-[0.1em] text-[10px]">
                            {dateString}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto pt-2">
                        <div className="flex-1 md:flex-none">
                            <GlobalSearch />
                        </div>
                        <Button onClick={() => navigate('/stewardship')} className="shadow-xl shadow-indigo-600/20 px-8 hidden md:flex">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Log Gift
                        </Button>
                    </div>
                </div>

                {/* Grid Sections */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    
                    {/* Main Content Area (Full Width) */}
                    <div className="xl:col-span-3 space-y-16">
                        
                        {/* Streams Grid */}
                        <section>
                            <div className="mb-6 px-2">
                                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Joined Streams</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {data?.streams.map((stream: any) => (
                                    <StreamCard key={stream.id} stream={stream} />
                                ))}
                                {(!data?.streams || data.streams.length === 0) && !isLoading && (
                                    <Card className="col-span-full border-dashed border-2 border-zinc-100 dark:border-zinc-800 p-12 text-center bg-transparent rounded-xl">
                                        <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest italic">No streams joined yet. Contact an admin to get plugged in.</p>
                                    </Card>
                                )}
                            </div>
                        </section>

                        {/* Action Items / Impact */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 px-2">Action Items</h2>
                                <div className="space-y-4">
                                    {data?.pending_actions?.length > 0 ? (
                                        data.pending_actions.map((action: any, idx: number) => (
                                            <Card key={idx} onClick={() => action.form_id && navigate(`/onboarding/form/${action.form_id}`)} className="p-5 cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-600 transition-all flex items-center gap-5 group rounded-xl border-zinc-100 dark:border-zinc-800">
                                                <div className="w-2 h-12 rounded-full shrink-0 group-hover:scale-y-110 transition-transform" style={{ backgroundColor: action.stream_color || '#6366f1' }} />
                                                <div>
                                                    <h4 className="font-black text-sm text-zinc-900 dark:text-white leading-tight">{action.message}</h4>
                                                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.1em] mt-1">Pending Onboarding</p>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="p-10 text-center bg-zinc-50 dark:bg-zinc-900/50 border-none shadow-none rounded-xl">
                                            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">No actions pending. You're all caught up!</p>
                                        </Card>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 px-2">Kingdom Impact</h2>
                                <Card onClick={() => navigate('/stewardship')} className="bg-primary text-white p-10 cursor-pointer hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all border-none rounded-xl relative overflow-hidden group">
                                    <SparklesIcon className="w-20 h-20 mb-6 opacity-20 absolute -right-4 -bottom-4 group-hover:scale-125 transition-transform" />
                                    <h3 className="text-2xl font-black leading-tight relative z-10">Every gift tells a story of the kingdom.</h3>
                                    <p className="text-white/70 text-sm mt-4 font-bold relative z-10">Log your time and resources to track collective impact across Goa.</p>
                                </Card>
                            </div>
                        </section>

                        {/* Collaborations Feed */}
                        <section>
                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 px-2">Recent Collaborations</h2>
                            <div className="space-y-4">
                                {collabs?.map((collab: any) => (
                                    <div key={collab.id} className="flex items-center gap-5 p-5 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                                        <div className="w-12 h-12 bg-white dark:bg-zinc-800 text-primary font-black rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-zinc-100 dark:border-zinc-800">
                                            {collab.requester.first_name?.[0]}{collab.provider.first_name?.[0]}
                                        </div>
                                        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            <span className="font-black text-zinc-900 dark:text-white">{collab.requester.first_name}</span> is collaborating with <span className="font-black text-zinc-900 dark:text-white">{collab.provider.first_name}</span> on a <span className="text-[10px] font-black bg-white dark:bg-zinc-800 px-3 py-1 rounded-full border dark:border-zinc-700 ml-1 uppercase tracking-widest text-primary">{collab.type} project</span>.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                </div>
            </PullToRefresh>
        </DashboardLayout>
    );
};

export default DashboardView;
