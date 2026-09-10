import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../features/auth/context/AuthContext';
import { BellIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { formatDate } from '../utils/date';
import CheckInModal from '../features/meetings/components/CheckInModal';
import { useMeetings } from '../features/meetings/hooks/useMeetings';
import RsvpConfirmationModal from '../features/meetings/components/RsvpConfirmationModal';

const SidebarRight: React.FC = () => {
    const { user } = useAuth();
    const { upcoming: meetings, rsvp, refetch } = useMeetings();
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
    const [rsvpModalStatus, setRsvpModalStatus] = useState<string | null>(null);
    const [rsvpModalMeetingTitle, setRsvpModalMeetingTitle] = useState<string>('');

    const handleRSVP = async (meetingId: number, status: string, meetingTitle?: string) => {
        if (!user) return alert("Please login to RSVP");
        try {
            await rsvp(meetingId, status);
            setRsvpModalMeetingTitle(meetingTitle || '');
            setRsvpModalStatus(status);
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

    // Helper: Get month short string (e.g. "JUL") and day number (e.g. "20")
    const getFormattedDateParts = (dateInput: any) => {
        const d = new Date(dateInput);
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return {
            month: months[d.getMonth()] || 'MEET',
            day: String(d.getDate()).padStart(2, '0')
        };
    };

    // Helper to format full date string like "Wed, 9:00 AM"
    const getFriendlyDateTime = (meeting: any) => {
        const d = new Date(meeting.meeting_date);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = days[d.getDay()];
        
        let timeStr = '';
        if (meeting.start_time) {
            timeStr += `, ${meeting.start_time}`;
        }
        if (meeting.end_time) {
            timeStr += ` - ${meeting.end_time}`;
        }
        return `${dayName}${timeStr}`;
    };

    const isDashboard = window.location.pathname === '/dashboard';

    return (
        <div className={isDashboard 
            ? "flex flex-col w-full pb-4" 
            : "flex flex-col bg-white dark:bg-zinc-950 p-6 w-full xl:w-80 xl:fixed xl:right-0 xl:top-0 xl:h-screen xl:border-l border-zinc-100 dark:border-zinc-800 xl:overflow-y-auto border-t xl:border-t-0 mt-8 xl:mt-0 pb-20"
        }>
            {/* Header outside Card */}
            <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Meetings</h2>
                {isDashboard && (
                    <button onClick={() => window.location.href = '/meetings'} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">
                        View all
                    </button>
                )}
            </div>

            {/* Meetings List */}
            {meetings.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {meetings.map((meeting: any) => {
                        const { month, day } = getFormattedDateParts(meeting.meeting_date);
                        const isUpcoming = new Date(meeting.meeting_date) > new Date();

                        return (
                            <div key={meeting.id} className="bg-white/40 dark:bg-zinc-900/30 p-4 rounded-[1.5rem] border border-white/50 dark:border-zinc-800/30 shadow-sm flex gap-4 hover:shadow-md transition-all duration-300">
                                {/* Left Side Date Box */}
                                <div className="w-16 h-16 bg-white/70 dark:bg-zinc-850 border border-zinc-100/50 dark:border-zinc-750 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm">
                                        <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{month}</span>
                                        <span className="text-xl font-black text-zinc-800 dark:text-zinc-100 leading-none mt-0.5">{day}</span>
                                    </div>

                                    {/* Right Side Info */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                        <div>
                                            <h4 className="font-bold text-sm text-zinc-850 dark:text-zinc-150 leading-snug truncate">{meeting.title}</h4>
                                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                                                {getFriendlyDateTime(meeting)}
                                            </p>
                                            <div className="flex items-center text-[11px] text-zinc-400 dark:text-zinc-500 mt-1.5 font-bold uppercase tracking-wider truncate">
                                                <MapPinIcon className="w-3.5 h-3.5 mr-1" />
                                                {meeting.location_name || 'Online'}
                                            </div>
                                        </div>

                                        {/* Action States */}
                                        <div className="mt-4">
                                            {isUpcoming ? (
                                                <div className="flex flex-col gap-2">
                                                     <div className="flex flex-wrap gap-1.5">
                                                         <button onClick={() => handleRSVP(meeting.id, 'going', meeting.title)}
                                                             className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'going' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-755 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}>
                                                             <CheckCircleIcon className="w-3.5 h-3.5" />
                                                             <span>Going</span>
                                                         </button>
                                                         <button onClick={() => handleRSVP(meeting.id, 'not_sure', meeting.title)}
                                                             className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'not_sure' ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'bg-orange-100 dark:bg-orange-950/30 text-orange-755 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'}`}>
                                                             <QuestionMarkCircleIcon className="w-3.5 h-3.5" />
                                                             <span>Maybe</span>
                                                         </button>
                                                         <button onClick={() => handleRSVP(meeting.id, 'cant_go', meeting.title)}
                                                             className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'cant_go' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-755 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'}`}>
                                                             <XCircleIcon className="w-3.5 h-3.5" />
                                                             <span>No</span>
                                                         </button>
                                                     </div>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    {meeting.my_checkin == 1 || meeting.checked_in == 1 ? (
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
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
                                                             className="inline-flex items-center gap-1 px-3 py-1.5 border border-transparent text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all shadow-indigo-600/20"
                                                         >
                                                             Check In {meeting.is_paid == 1 ? '(Pay)' : ''}
                                                         </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

            {/* RSVP Confirmation Modal */}
            <RsvpConfirmationModal
                isOpen={!!rsvpModalStatus}
                status={rsvpModalStatus || ''}
                meetingTitle={rsvpModalMeetingTitle}
                memberName={user ? `${user.first_name} ${user.last_name || ''}`.trim() : undefined}
                onClose={() => setRsvpModalStatus(null)}
            />
        </div>
    );
};
export default SidebarRight;
