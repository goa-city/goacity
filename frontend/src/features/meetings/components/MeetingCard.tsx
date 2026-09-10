import React from 'react';
import { formatDate } from '../../../utils/date';
import { Card, CardContent, CardTitle } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import type { Meeting, MeetingResource } from '../hooks/useSingleMeeting';
import RsvpConfirmationModal from './RsvpConfirmationModal';
import { useAuth } from '../../auth/context/AuthContext';
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
    LinkIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

interface MeetingCardProps {
    meeting: Meeting;
    onRSVP: (meetingId: number, status: string) => Promise<unknown>;
    onCheckIn?: (meeting: Meeting) => void;
    onOpenRecap: () => void | Promise<void>;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onRSVP, onCheckIn, onOpenRecap }) => {
    const { user } = useAuth();
    const [showPosterModal, setShowPosterModal] = React.useState(false);
    const [rsvpModalStatus, setRsvpModalStatus] = React.useState<string | null>(null);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isPast = new Date(meeting.meeting_date).getTime() < todayStart.getTime();
    const isToday = new Date(meeting.meeting_date).toDateString() === new Date().toDateString();

    const handleRsvpClick = async (status: string) => {
        try {
            await onRSVP(meeting.id, status);
            setRsvpModalStatus(status);
        } catch (err) {
            console.error('Failed to RSVP:', err);
        }
    };

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
                                        {meeting.resources.map((res: MeetingResource, i: number) => (
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

                {/* Poster Invite Thumbnail on Card if available */}
                {meeting.poster_image_url && (
                    <div className="mb-6 flex justify-start">
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-zinc-200/80 dark:border-zinc-800 group cursor-pointer transition-all max-w-sm"
                            onClick={() => setShowPosterModal(true)}
                        >
                            <img
                                src={meeting.poster_image_url}
                                alt={`${meeting.title} Poster`}
                                className="max-h-80 w-auto object-contain rounded-2xl group-hover:scale-[1.02] transition-transform duration-300 block"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-black uppercase tracking-widest rounded-2xl">
                                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                                <span>View Poster</span>
                            </div>
                        </div>
                    </div>
                )}

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
                                        <button
                                            onClick={() => onCheckIn?.(meeting)}
                                            disabled={!onCheckIn}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                        >
                                            Check In
                                        </button>
                                    )}
                                    {meeting.my_checkin == 1 && (
                                        <Button variant="ghost" onClick={onOpenRecap} className="member-btn bg-primary text-white group hover:bg-primary/90">
                                            Resources <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                     <button onClick={() => handleRsvpClick('going')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'going' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}>
                                         <CheckCircleIcon className="w-4 h-4" /> Going
                                     </button>
                                     <button onClick={() => handleRsvpClick('not_sure')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'not_sure' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'}`}>
                                         <QuestionMarkCircleIcon className="w-4 h-4" /> Maybe
                                     </button>
                                     <button onClick={() => handleRsvpClick('cant_go')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'cant_go' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-750 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'}`}>
                                         <XCircleIcon className="w-4 h-4" /> No
                                     </button>
                                     {Boolean(meeting.is_paid) && (meeting.upi_link || meeting.payment_amount) && (
                                         <a
                                             href={`/pay/${meeting.slug || meeting.id}`}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                         >
                                             <span>Pay ₹{meeting.payment_amount || ''}</span>
                                             <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                         </a>
                                     )}
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

            {/* Poster Lightbox Modal */}
            {showPosterModal && meeting.poster_image_url && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setShowPosterModal(false)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-2 border border-zinc-100 dark:border-zinc-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 truncate pr-4">
                                {meeting.title} - Poster Invite
                            </h4>
                            <button
                                onClick={() => setShowPosterModal(false)}
                                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-2 flex items-center justify-center max-h-[80vh] overflow-auto">
                            <img
                                src={meeting.poster_image_url}
                                alt={`${meeting.title} Poster Full`}
                                className="max-h-[75vh] w-auto object-contain rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* RSVP Confirmation Modal */}
            <RsvpConfirmationModal
                isOpen={!!rsvpModalStatus}
                status={rsvpModalStatus || ''}
                meetingTitle={meeting.title}
                memberName={user ? `${user.first_name} ${user.last_name || ''}`.trim() : undefined}
                onClose={() => setRsvpModalStatus(null)}
            />
        </Card>
    );
};

export default MeetingCard;
