import React from 'react';
import { useParams } from 'react-router-dom';
import { useSingleMeeting } from '../hooks/useSingleMeeting';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { DocumentTextIcon, LinkIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, QuestionMarkCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { formatDate } from '../../../utils/date';
import api from '../../../api/axios';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import CheckInModal from './CheckInModal';

const getLocalYYYYMMDD = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
};

const SingleMeetingView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { meeting, isLoading, refetch, rsvp, isRsvping } = useSingleMeeting(slug);
    const [showCheckIn, setShowCheckIn] = React.useState(false);

    const isDev = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
    const isPast = meeting ? getLocalYYYYMMDD(meeting.meeting_date) < getLocalYYYYMMDD(new Date()) : false;

    const handleDevTest = async () => {
        if (!meeting) return;
        // In a real refactor, we might want to move this to a mutation
        alert("ACCESS GRANTED — Resources now visible\nADMIN CHECK — Verify submission appears in /admin/meetings/" + meeting.id);
        try {
            if (meeting.feedback_form_id) {
                await api.post('/member/submit-form', {
                    form_id: meeting.feedback_form_id,
                    meeting_id: meeting.id,
                    test_field: "Test Meeting Response"
                });
                alert("FORM SUBMITTED — Response linked to Meeting ID: " + meeting.id);
                refetch();
            }
        } catch (err) {
            console.error(err);
        }
    };
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Event Details...</p>
                </div>
            </DashboardLayout>
        );
    }
    if (!meeting) {
        return (
            <DashboardLayout>
                <div className="text-center py-40">
                    <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Meeting Not Found</h2>
                    <p className="text-zinc-500 font-medium">The meeting details could not be retrieved.</p>
                </div>
            </DashboardLayout>
        );
    }
    return (
        <DashboardLayout>
            <div className="mb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-4">
                            Meeting Dashboard
                        </div>
                        <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">{meeting.title}</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-bold text-xs italic flex flex-wrap items-center gap-2 mt-3 uppercase tracking-wide">
                            {formatDate(meeting.meeting_date)}
                            <span className="opacity-30">|</span>
                            {meeting.start_time_display} - {meeting.end_time_display}
                            <span className="opacity-30">|</span>
                            {meeting.location_name}
                            {meeting.map_link && (
                                <a href={meeting.map_link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1 ml-2">
                                    <LinkIcon className="w-4 h-4" /> Map
                                </a>
                            )}
                        </p>
                    </div>

                    <div className="pt-2">
                        {new Date(meeting.meeting_date).toDateString() === new Date().toDateString() && !meeting.checked_in ? (
                            <Button onClick={() => setShowCheckIn(true)} className="shadow-xl shadow-indigo-600/20 px-8">
                                Check In Now
                            </Button>
                        ) : (
                            !isPast && !meeting.checked_in && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => rsvp('going')}
                                        disabled={isRsvping}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'going' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        {isRsvping && meeting.my_rsvp === 'going' ? '...' : 'Going'}
                                    </button>
                                    <button
                                        onClick={() => rsvp('not_sure')}
                                        disabled={isRsvping}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'not_sure' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                                    >
                                        <QuestionMarkCircleIcon className="w-4 h-4" />
                                        {isRsvping && meeting.my_rsvp === 'not_sure' ? '...' : 'Maybe'}
                                    </button>
                                    <button
                                        onClick={() => rsvp('cant_go')}
                                        disabled={isRsvping}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'cant_go' ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                                    >
                                        <XCircleIcon className="w-4 h-4" />
                                        {isRsvping && meeting.my_rsvp === 'cant_go' ? '...' : 'No'}
                                    </button>
                                </div>
                            )
                        )}
                        {meeting.checked_in == 1 && (
                            <div className="flex flex-col items-end gap-2">
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-emerald-100 dark:border-emerald-800">
                                    ✓ Checked In
                                </div>
                                {meeting.is_paid == 1 && meeting.my_payment_status && (
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 italic">
                                        Paid {meeting.my_payment_status === 'paid_cash' ? 'via Cash' : 'Online'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        {/* Recap / Synthesis */}
                        {meeting.recap_content && meeting.recap_content.length > 10 && (
                            <Card className="overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                                <CardContent className="p-8 md:p-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                                            <DocumentTextIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Meeting Recap & Notes</h2>
                                        </div>
                                    </div>
                                    <div
                                        className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-a:text-indigo-600"
                                        dangerouslySetInnerHTML={{ __html: meeting.recap_content }}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Feedback Link (Onboarding Style) */}
                        {meeting.feedback_form_id && (
                            <a
                                href={`/onboarding/form/${meeting.feedback_form_id}?meeting_id=${meeting.id}`}
                                className="group"
                            >
                                <Card className="p-5 hover:border-indigo-600 border border-transparent transition-all flex items-center gap-5">
                                    <div className="w-1.5 h-12 rounded-full bg-indigo-600 shrink-0 group-hover:scale-y-110 transition-transform" />
                                    <div>
                                        <h4 className="font-black text-sm text-zinc-900 dark:text-white leading-tight">Complete the feedback form</h4>
                                    </div>
                                </Card>
                            </a>
                        )}

                        {/* Meeting Resources */}
                        {meeting.resources && meeting.resources.length > 0 && (
                            <Card className="overflow-hidden relative">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                            <LinkIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm text-zinc-900 dark:text-white leading-tight">Meeting Resources</h4>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {meeting.resources.map((res) => (
                                            <a
                                                key={res.id}
                                                href={(res as any).url_display || `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}/uploads/${res.url}`}
                                                download={res.title || 'download'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-indigo-500/20 group"
                                            >
                                                <div className="w-8 h-8 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-center text-[9px] font-black uppercase text-zinc-400 group-hover:text-indigo-600 transition-colors shadow-sm shrink-0">
                                                    {res.url.split('.').pop()?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{res.title}</p>
                                                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">Download</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            
            {showCheckIn && (
                    <CheckInModal
                    meeting={meeting}
                    onClose={() => setShowCheckIn(false)}
                    onSuccess={() => refetch()}
                />
            )}
        </DashboardLayout>
    );
};

export default SingleMeetingView;
