import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useDashboard } from '../hooks/useDashboard';
import { useMeetings } from '../../meetings/hooks/useMeetings';
import CheckInModal from '../../meetings/components/CheckInModal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import StreamCard from './StreamCard';
import DashboardLayout from '../../../layouts/DashboardLayout';
import SidebarRight from '../../../components/SidebarRight';
import GlobalSearch from '../../../components/GlobalSearch';
import PullToRefresh from '../../../components/mobile/PullToRefresh';
import {
    PlusIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/solid';

import { formatDate } from '../../../utils/date';
const DashboardView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data, collabs, isLoading, refetch } = useDashboard();
    const { checkIn } = useMeetings();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [checkInMeeting, setCheckInMeeting] = useState<any>(null);

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const dateString = formatDate(new Date());

    if (isLoading && !isRefreshing) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 animate-pulse text-zinc-400 font-black uppercase tracking-[0.2em] text-xs">Accessing Platform Nodes...</div>;
    }

    return (
        <DashboardLayout>
            <PullToRefresh onRefresh={refetch}>
                <div className="min-h-screen bg-gradient-to-br from-[#fbfbfb] to-[#f9f6e8] text-zinc-900 p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h1 className="page-heading">
                                Hello, {data?.member?.first_name || user?.first_name || 'there'}
                            </h1>
                            <p className="text-zinc-400 font-bold mt-2 uppercase tracking-[0.15em] text-[10px]">
                                {dateString}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 flex-1 md:flex-none">
                                <div className="flex-1 md:flex-none bg-white/80 rounded-2xl border border-zinc-200/50 shadow-sm">
                                    <GlobalSearch />
                                </div>
                                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl p-3 shadow-md border-none flex items-center justify-center h-[46px] w-[46px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Grid Sections */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                        {/* Meetings Section */}
                        <div className="order-first xl:order-last xl:col-span-4 h-fit">
                            <SidebarRight />
                        </div>

                        {/* Main Content Area */}
                        <div className="xl:col-span-8 space-y-12">
                            {/* Streams Section */}
                            <section>
                                <div className="flex justify-between items-center mb-6 px-2">
                                    <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Streams</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {data?.streams?.map((stream: any) => (
                                        <StreamCard key={stream.id} stream={stream} />
                                    ))}
                                </div>
                            </section>

                            {/* Action Items / Impact */}
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-2 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-center mb-6 px-2">
                                            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Action Items</h2>
                                            {data?.pending_actions?.some((action: any) => action.type === 'onboarding') && (
                                                <span className="text-[10px] bg-zinc-200 text-zinc-700 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    {data.pending_actions.filter((action: any) => action.type === 'onboarding').length} Pending
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {data?.pending_actions?.length > 0 ? (
                                                data.pending_actions.map((action: any, idx: number) => (
                                                    <div
                                                        key={action.id || idx}
                                                        onClick={() => {
                                                            if (action.type === 'onboarding') navigate(`/onboarding/form/${action.form_id}`);
                                                            if (action.type === 'mentorship') navigate(`/dashboard/mentorship/${action.mentorship_id}`);
                                                            if (action.type === 'checkin') setCheckInMeeting({
                                                                id: action.meeting_id,
                                                                title: action.title || action.message.replace('Check-in for ', ''),
                                                                is_paid: action.is_paid,
                                                                payment_amount: action.payment_amount,
                                                                payment_qr_image: action.payment_qr_image
                                                            });
                                                        }}
                                                        className="p-4 cursor-pointer hover:bg-white/80 transition-all flex items-center justify-between gap-4 group rounded-2xl border border-zinc-200/50 bg-white/40 shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-8 rounded-full shrink-0" style={{ backgroundColor: action.stream_color || '#FBBF24' }} />
                                                            <div>
                                                                <h4 className="font-bold text-xs text-zinc-800 leading-tight">{action.message}</h4>
                                                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.1em] mt-1">
                                                                    {action.type === 'onboarding' ? 'Onboarding' : action.type === 'mentorship' ? 'Mentorship' : 'Check-in'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {action.type === 'checkin' && (
                                                            <Button size="sm" className="bg-amber-400 hover:bg-amber-500 text-zinc-950 rounded-xl px-3 py-1.5 text-[9px] uppercase font-black tracking-widest h-auto border-none shadow-md shadow-amber-400/10">
                                                                Check In
                                                            </Button>
                                                        )}
                                                        {action.type === 'mentorship' && (
                                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                                                                View
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center bg-white/20 border border-zinc-200/40 rounded-2xl">
                                                    <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest">All caught up!</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-[#FEF8DE] text-zinc-800 p-6 sm:p-8 rounded-[2rem] border border-amber-900/5 shadow-sm flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                                    <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <SparklesIcon className="w-48 h-48 text-zinc-900" />
                                    </div>
                                    <div className="relative z-10">
                                        <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Kingdom Impact</h2>
                                        <h3 className="text-2xl sm:text-3xl font-black text-zinc-800 leading-tight font-display mt-2">Every gift tells a story of the kingdom.</h3>
                                        <p className="text-zinc-600 text-xs mt-4 font-semibold max-w-sm">Log your time and resources to track collective impact across Goa.</p>
                                    </div>
                                    <div className="relative z-10 pt-4">
                                        <Button onClick={() => navigate('/stewardship')} className="bg-zinc-900 text-white hover:bg-zinc-850 transition-all font-bold rounded-2xl shadow-md px-6 py-2.5 text-[10px] uppercase tracking-widest border-none">
                                            Log Impact
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        </div>



                    </div>
                </div>
            </PullToRefresh>

            {checkInMeeting && (
                <CheckInModal
                    meeting={checkInMeeting}
                    onClose={() => setCheckInMeeting(null)}
                    onSuccess={() => refetch()}
                />
            )}
        </DashboardLayout>
    );
};

export default DashboardView;
