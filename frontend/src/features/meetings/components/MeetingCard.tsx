import React from 'react';
import { formatDate } from '../../../utils/date';
import { Card, CardContent, CardTitle } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import {
    CalendarIcon,
    MapPinIcon,
    CheckCircleIcon,
    QuestionMarkCircleIcon,
    XCircleIcon,
    ArrowRightIcon,
    ClockIcon,
    VideoCameraIcon,
    ArrowTopRightOnSquareIcon,
    LinkIcon
} from '@heroicons/react/24/solid';

const MeetingCard = ({ meeting, onRSVP, onCheckIn, onOpenRecap }) => {
    const isPast = new Date(meeting.meeting_date) < new Date().setHours(0, 0, 0, 0);
    const isToday = new Date(meeting.meeting_date).toDateString() === new Date().toDateString();


    return (
        <Card className={`overflow-hidden transition-all ${isToday ? 'ring-4 ring-indigo-500/10 border-indigo-500' : 'hover:shadow-2xl'}`}>
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
                        <div className="flex flex-col gap-1.5 text-zinc-500 dark:text-zinc-400 mt-2 text-sm font-medium">
                            <div className="flex items-center gap-1.5">
                                <ClockIcon className="w-4 h-4 text-zinc-400" />
                                {meeting.start_time_display} - {meeting.end_time_display}
                            </div>
                            <div className="flex items-start gap-1.5">
                                <MapPinIcon className="w-4 h-4 text-zinc-400 mt-1" />
                                <div className="flex flex-col">
                                    <span className="text-zinc-900 dark:text-white font-bold">{meeting.location_name || 'TBA'}</span>
                                    {meeting.map_link && (
                                        <a href={meeting.map_link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline  break-all">
                                            {meeting.map_link}
                                        </a>
                                    )}
                                </div>
                            </div>
                            {meeting.zoom_link && (
                                <div className="flex items-start gap-1.5">
                                    <VideoCameraIcon className="w-4 h-4 text-sky-500 mt-1" />
                                    <div className="flex flex-col">
                                        <span className="text-sky-600 font-bold">Zoom Meeting</span>
                                        <a href={meeting.zoom_link} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline  break-all">
                                            {meeting.zoom_link}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {meeting.resources && meeting.resources.length > 0 && (
                                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Attached Resources:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {meeting.resources.map((res, i) => (
                                            <a
                                                key={i}
                                                href={res.url_display || `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}/uploads/${res.url}`}
                                                download
                                                className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg  font-bold hover:bg-emerald-100 transition-colors"
                                            >
                                                <LinkIcon className="w-3 h-3" />
                                                {res.title || 'Resource'}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                            size="sm"
                                            className="rounded-xl px-8"
                                        >
                                            Check In
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
