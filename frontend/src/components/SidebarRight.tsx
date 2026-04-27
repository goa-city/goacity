import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../features/auth/context/AuthContext';
import { BellIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { formatDate } from '../utils/date';
import CheckInModal from '../features/meetings/components/CheckInModal';
import { useMeetings } from '../features/meetings/hooks/useMeetings';

const SidebarRight: React.FC = () => {
    const { user } = useAuth();
    const { upcoming: meetings, rsvp, refetch } = useMeetings();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

    const handleRSVP = async (meetingId: number, status: string) => {
        if (!user) return alert("Please login to RSVP");
        try {
            await rsvp(meetingId, status);
        } catch (e) {
            console.error(e);
            alert("Failed to update RSVP");
        }
    };

    const handleCheckInClick = (meeting: any) => {
        if (!user) return alert("Please login to Check-in");
        setSelectedMeeting(meeting);
        setPaymentModalOpen(true);
    };

    // Helper: Date Logic (Local YYYY-MM-DD)
    const getLocalYYYYMMDD = (dateInput: any) => {
        const d = new Date(dateInput);
        const offset = d.getTimezoneOffset() * 60000;
        return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
    };
    const todayStr = getLocalYYYYMMDD(new Date());

    // Helper to format time: "10:00"
    const formatTime = (timeStr: string) => {
        return timeStr || '';
    };

    const getBorderColor = (meeting: any) => {
        return meeting.stream_color ? { borderColor: meeting.stream_color } : { borderColor: '#9333ea' };
    };

    // Group meetings by date (normalized string)
    const groupedMeetings = meetings.reduce((acc: any, meeting: any) => {
        const dateStr = getLocalYYYYMMDD(meeting.meeting_date);
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(meeting);
        return acc;
    }, {});

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-950 p-6 
            w-full xl:w-80
            xl:fixed xl:right-0 xl:top-0 xl:h-screen xl:border-l border-zinc-100 dark:border-zinc-800 xl:overflow-y-auto
            border-t xl:border-t-0 mt-8 xl:mt-0 pb-20
        ">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Meetings</h2>
            </div>
            {/* Meetings List */}
            {meetings.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {Object.keys(groupedMeetings).map((date) => (
                        <div key={date}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${date === todayStr ? 'text-indigo-600' : 'text-zinc-400'}`}>
                                    {date === todayStr ? 'TODAY' : date.split('-').reverse().join('/')}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {groupedMeetings[date].map((meeting: any) => (
                                    <div key={meeting.id} className="flex flex-col gap-2">
                                        <div className="flex gap-4">
                                            <div className="text-xs font-black text-zinc-900 dark:text-zinc-100 w-12 pt-0.5">{formatTime(meeting.start_time)}</div>
                                            <div className="pl-4 border-l-2 flex-1 pb-1" style={getBorderColor(meeting)}>
                                                <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">{meeting.title}</h4>
                                                <div className="flex items-center text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-bold uppercase tracking-widest">
                                                    <MapPinIcon className="w-3 h-3 mr-1" />
                                                    {meeting.location_name}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Area */}
                                        <div className="pl-16">
                                            {date > todayStr ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => handleRSVP(meeting.id, 'going')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'going' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        <span>Going</span>
                                                    </button>
                                                    <button onClick={() => handleRSVP(meeting.id, 'not_sure')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'not_sure' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                        <QuestionMarkCircleIcon className="w-4 h-4" />
                                                        <span>Maybe</span>
                                                    </button>
                                                    <button onClick={() => handleRSVP(meeting.id, 'cant_go')}
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'cant_go' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                        <XCircleIcon className="w-4 h-4" />
                                                        <span>No</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    {meeting.my_checkin == 1 || meeting.checked_in == 1 ? (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                                                                <CheckIcon className="w-3 h-3 mr-1" /> Checked In
                                                            </span>
                                                            {(meeting.is_paid == 1 || meeting.is_paid === true) && (meeting.my_payment_status || meeting.payment_status) && (
                                                                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter ml-1">
                                                                    Paid { (meeting.my_payment_status || meeting.payment_status) === 'paid_cash' ? 'Cash' : 'Online'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCheckInClick(meeting)}
                                                            className="inline-flex items-center px-4 py-1.5 border border-transparent text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all"
                                                        >
                                                            Check In {meeting.is_paid == 1 ? '(Pay)' : ''}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">No upcoming meetings.</p>
            )}

            {/* Payment / Check-in Modal */}
            {paymentModalOpen && selectedMeeting && (
                <CheckInModal
                    meeting={selectedMeeting}
                    onClose={() => {
                        setPaymentModalOpen(false);
                        setSelectedMeeting(null);
                    }}
                    onSuccess={() => refetch()}
                />
            )}
        </div>
    );
};
export default SidebarRight;
