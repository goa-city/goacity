import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetings } from '../hooks/useMeetings';
import MeetingCard from './MeetingCard';
import CheckInModal from './CheckInModal';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { CalendarIcon } from '@heroicons/react/24/solid';

const MeetingsView = () => {
    const navigate = useNavigate();
    const { upcoming, past, isLoading, error, refetch, rsvp, checkIn } = useMeetings();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [checkInMeeting, setCheckInMeeting] = useState<any>(null);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    if (isLoading && !isRefreshing) return (
        <DashboardLayout>
            <div className="p-20 animate-pulse text-zinc-400 font-black tracking-[0.2em] uppercase text-center text-xs">
                Syncing calendar...
            </div>
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-10 text-center">
                <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-100 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 font-black uppercase tracking-widest text-sm">Temporal Sync Failed</p>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">The calendar data could not be retrieved from the server.</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Meetings
                        <CalendarIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium leading-relaxed">
                        Upcoming meetings
                    </p>
                </div>

                {/* Upcoming */}
                <section className="mb-16">
                    <div className="space-y-6">
                        {upcoming.map(meeting => (
                            <MeetingCard
                                key={meeting.id}
                                meeting={meeting}
                                onRSVP={rsvp}
                                onCheckIn={(m) => setCheckInMeeting(m)}
                                onOpenRecap={() => navigate(`/meetings/${meeting.id}`)}
                            />
                        ))}
                        {upcoming.length === 0 && (
                            <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <p className="text-zinc-400 font-bold uppercase tracking-widest text-sm">No meetings scheduled</p>
                                <p className="text-zinc-500 mt-1">Check back soon or contact your stream leader.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Past */}
                {past.length > 0 && (
                    <section>
                        <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                            Past Meetings & Recaps
                        </h2>
                        <div className="space-y-6">
                            {past.map(meeting => (
                                <MeetingCard
                                    key={meeting.id}
                                    meeting={meeting}
                                    onRSVP={rsvp}
                                    onOpenRecap={() => navigate(`/meetings/${meeting.id}`)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

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

export default MeetingsView;
