import React from 'react';
import { Card, CardContent, CardTitle } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { 
    CalendarIcon, 
    MapPinIcon, 
    CheckCircleIcon, 
    QuestionMarkCircleIcon, 
    XCircleIcon,
    ArrowRightIcon
} from '@heroicons/react/24/solid';

const MeetingCard = ({ meeting, onRSVP, onCheckIn, onOpenRecap }) => {
    const isPast = new Date(meeting.meeting_date) < new Date().setHours(0,0,0,0);
    const isToday = new Date(meeting.meeting_date).toDateString() === new Date().toDateString();

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-GB', { 
            day: '2-digit', month: 'long', year: 'numeric' 
        });
    };

    return (
        <Card className={`overflow-hidden border-zinc-100 dark:border-zinc-800 transition-all ${isToday ? 'ring-4 ring-indigo-500/10 border-indigo-500' : 'hover:shadow-lg'}`}>
            <CardContent className="p-6 relative">
                {meeting.stream_color && (
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: meeting.stream_color }} />
                )}

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {meeting.stream_name && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                                    {meeting.stream_name}
                                </span>
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-indigo-600' : (isPast ? 'text-zinc-400' : 'text-sky-600')}`}>
                                {isToday ? 'Today' : formatDate(meeting.meeting_date)}
                            </span>
                        </div>
                        <CardTitle className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                            {meeting.title}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 mt-2 text-sm font-medium">
                            <MapPinIcon className="w-4 h-4 text-zinc-400" />
                            {meeting.location_name || 'TBA'}
                        </div>
                    </div>

                    {meeting.is_paid == 1 && (
                        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-black px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/50">
                            ₹{meeting.payment_amount}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                    {!isPast ? (
                        <div className="flex flex-wrap gap-2 w-full">
                            {isToday ? (
                                <div className="flex items-center justify-between w-full">
                                    {meeting.my_checkin == 1 ? (
                                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2 rounded-xl">
                                            <CheckCircleIcon className="w-5 h-5" />
                                            Checked In
                                        </span>
                                    ) : (
                                        <Button 
                                            onClick={() => onCheckIn(meeting)}
                                            className="w-full rounded-xl py-3"
                                        >
                                            Check In Now
                                        </Button>
                                    )}
                                    {meeting.my_checkin == 1 && (
                                        <Button variant="ghost" onClick={onOpenRecap} className="text-indigo-600 font-bold group">
                                            Resources <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => onRSVP(meeting.id, 'going')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'going' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                                        <CheckCircleIcon className="w-4 h-4" /> Going
                                    </button>
                                    <button onClick={() => onRSVP(meeting.id, 'not_sure')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'not_sure' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                                        <QuestionMarkCircleIcon className="w-4 h-4" /> Maybe
                                    </button>
                                    <button onClick={() => onRSVP(meeting.id, 'cant_go')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'cant_go' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                                        <XCircleIcon className="w-4 h-4" /> No
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                {meeting.my_checkin == 1 ? 'Attended ✔' : 'Event Concluded'}
                            </span>
                            <Button variant="secondary" onClick={onOpenRecap} className="rounded-xl text-sm px-6">
                                View Recap
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default MeetingCard;
