import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useSingleMeeting } from '../hooks/useSingleMeeting';
import { useMeetingPosterFavicon } from '../hooks/useMeetingPosterFavicon';
import { useAuth } from '../../auth/context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import DashboardLayout from '../../../layouts/DashboardLayout';
import logo from '../../../assets/Goa.City.Logo.svg';
import { DocumentTextIcon, LinkIcon, VideoCameraIcon, PhotoIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, QuestionMarkCircleIcon, XCircleIcon, ArrowTopRightOnSquareIcon, XMarkIcon, SparklesIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import { formatDate } from '../../../utils/date';
import api from '../../../api/axios';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import CheckInModal from './CheckInModal';
import RsvpConfirmationModal from './RsvpConfirmationModal';
import GuestRegistrationModal from './GuestRegistrationModal';
import GuestRegistrationForm from './GuestRegistrationForm';

const MeetingPageWrapper: React.FC<{ user: any; children: React.ReactNode }> = ({ user, children }) => {
    const { theme, toggleTheme } = useTheme();
    if (user) {
        return <DashboardLayout>{children}</DashboardLayout>;
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#fbfbfb] to-[#f9f6e8] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
            <header className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 sticky top-0 z-40 px-6 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <img src={logo} alt="Goa.City" className="w-32 h-auto object-contain dark:invert" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                        </button>
                        <Link
                            to={`/?redirect=${encodeURIComponent(window.location.pathname)}`}
                            className="text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                            Member Sign In
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8">
                {children}
            </main>
            <footer className="border-t border-zinc-200/60 dark:border-zinc-800/80 py-8 px-6 text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                &copy; {new Date().getFullYear()} Goa.City Community
            </footer>
        </div>
    );
};

const getLocalYYYYMMDD = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
};

const SingleMeetingView: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchParams] = useSearchParams();
    const { user, loginWithToken } = useAuth();
    const { meeting, isLoading, refetch, rsvp, isRsvping } = useSingleMeeting(slug);
    useMeetingPosterFavicon(meeting);
    const [showPosterModal, setShowPosterModal] = React.useState(false);
    const [showCheckIn, setShowCheckIn] = React.useState(false);
    const [showGuestModal, setShowGuestModal] = React.useState(false);
    const [toast, setToast] = React.useState<string | null>(null);
    const [rsvpModalStatus, setRsvpModalStatus] = React.useState<string | null>(null);

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authToken = searchParams.get('auth_token') || urlParams.get('auth_token');
        const recordedStatus = searchParams.get('rsvp_recorded') || urlParams.get('rsvp_recorded');

        if (authToken) {
            loginWithToken(authToken).then((res) => {
                if (res.success) {
                    refetch();
                }
            });
        }

        if (recordedStatus) {
            setRsvpModalStatus(recordedStatus);
            refetch();
        }

        if (authToken || recordedStatus) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, '', cleanUrl);
        }
    }, []);

    const handleRsvpClick = async (status: string) => {
        try {
            await rsvp(status);
            setRsvpModalStatus(status);
        } catch (err) {
            console.error('RSVP failed:', err);
        }
    };

    const isDev = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';
    const isPast = meeting ? getLocalYYYYMMDD(meeting.meeting_date) < getLocalYYYYMMDD(new Date()) : false;

    const handleDevTest = async () => {
        if (!meeting) return;
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
            <MeetingPageWrapper user={user}>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Event Details...</p>
                </div>
            </MeetingPageWrapper>
        );
    }
    if (!meeting) {
        return (
            <MeetingPageWrapper user={user}>
                <div className="text-center py-40">
                    <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Meeting Not Found</h2>
                    <p className="text-zinc-500 font-medium">The meeting details could not be retrieved.</p>
                </div>
            </MeetingPageWrapper>
        );
    }
    if (!meeting.is_public && !user) {
        return (
            <MeetingPageWrapper user={user}>
                <div className="text-center py-24 sm:py-32 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <LockClosedIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-3">
                        Member-Only Event
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                        This meeting is private for Goa.City community members. Please sign in with your registered account to view event details and RSVP.
                    </p>
                    <Link
                        to={`/?redirect=${encodeURIComponent(window.location.pathname)}`}
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                        Sign In as Member
                    </Link>
                </div>
            </MeetingPageWrapper>
        );
    }
    return (
        <MeetingPageWrapper user={user}>
            {toast && (
                <div className="fixed bottom-10 right-10 bg-emerald-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] font-black uppercase text-xs tracking-wider flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{toast}</span>
                </div>
            )}
            <div className="mb-12">
                {/* Header */}
                <div className="flex flex-col items-start gap-4 mb-6">
                    <div>
                        {user && (
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-4">
                                Meeting Dashboard
                            </div>
                        )}
                        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">{meeting.title}</h1>
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

                    {/* Member RSVP Buttons directly below the meeting date and time row (ONLY for logged-in members) */}
                    {user && (
                        <div className="pt-2 flex flex-wrap items-center gap-3 w-full">
                            {Boolean(meeting.is_paid) && (
                                meeting.my_payment_status === 'paid_online' || 
                                meeting.my_payment_status === 'paid_cash' || 
                                meeting.my_payment_status === 'completed' || 
                                meeting.my_payment_status === 'paid' || 
                                Boolean(meeting.my_payment_proof)
                            ) ? (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-sm">
                                        <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Payment completed</span>
                                    </div>
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        (Seat Confirmed)
                                    </span>
                                </div>
                            ) : new Date(meeting.meeting_date).toDateString() === new Date().toDateString() && !meeting.checked_in ? (
                                <Button onClick={() => setShowCheckIn(true)} className="shadow-xl shadow-indigo-600/20 px-8">
                                    Check In Now
                                </Button>
                            ) : (
                                !isPast && !meeting.checked_in && (
                                    <div className="flex flex-wrap gap-2.5">
                                        <button
                                            onClick={() => handleRsvpClick('going')}
                                            disabled={isRsvping}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'going' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'}`}
                                        >
                                            <CheckCircleIcon className="w-4 h-4" />
                                            {isRsvping && meeting.my_rsvp === 'going' ? '...' : 'Going'}
                                        </button>
                                        <button
                                            onClick={() => handleRsvpClick('not_sure')}
                                            disabled={isRsvping}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'not_sure' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50'}`}
                                        >
                                            <QuestionMarkCircleIcon className="w-4 h-4" />
                                            {isRsvping && meeting.my_rsvp === 'not_sure' ? '...' : 'Maybe'}
                                        </button>
                                        <button
                                            onClick={() => handleRsvpClick('cant_go')}
                                            disabled={isRsvping}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${meeting.my_rsvp === 'cant_go' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50'}`}
                                        >
                                            <XCircleIcon className="w-4 h-4" />
                                            {isRsvping && meeting.my_rsvp === 'cant_go' ? '...' : 'No'}
                                        </button>
                                    </div>
                                )
                            )}
                            {Boolean(meeting.is_paid) && meeting.checked_in !== 1 && !(
                                meeting.my_payment_status === 'paid_online' || 
                                meeting.my_payment_status === 'paid_cash' || 
                                meeting.my_payment_status === 'completed' || 
                                meeting.my_payment_status === 'paid' || 
                                Boolean(meeting.my_payment_proof)
                            ) && (meeting.upi_link || meeting.payment_amount) && (
                                <a
                                    href={`/pay/${meeting.slug || meeting.id}${user?.id ? `?m=${user.id}` : ''}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                >
                                    <span>Pay ₹{meeting.payment_amount || ''} Online</span>
                                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                </a>
                            )}
                            {meeting.checked_in == 1 && (
                                <div className="flex flex-col items-start gap-1">
                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-emerald-100 dark:border-emerald-800">
                                        ✓ Checked In
                                    </div>
                                    {meeting.is_paid == 1 && meeting.my_payment_status && (
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1 italic">
                                            Paid {meeting.my_payment_status === 'paid_cash' ? 'via Cash' : 'Online'}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!user ? (
                    /* ── Public / Guest View: Sleek Poster on Left, Inline Registration Form & Payment on Right ── */
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Sleek Poster (Click to Enlarge) */}
                            {meeting.poster_image_url && (
                                <div className="lg:col-span-5">
                                    <div
                                        onClick={() => setShowPosterModal(true)}
                                        className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/40"
                                    >
                                        <img
                                            src={meeting.poster_image_url}
                                            alt={`${meeting.title} Poster`}
                                            className="w-full h-auto object-contain rounded-3xl group-hover:scale-[1.015] transition-transform duration-300 block"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-end justify-end p-4 pointer-events-none">
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md">
                                                Click to Enlarge
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Right Column: Embedded Registration Form with Payment Info */}
                            <div className={meeting.poster_image_url ? 'lg:col-span-7' : 'max-w-2xl mx-auto w-full'}>
                                <GuestRegistrationForm
                                    meeting={meeting}
                                    onSuccess={() => {
                                        refetch();
                                        setToast('Registration successful! Check your WhatsApp/email for confirmation.');
                                    }}
                                />
                            </div>
                        </div>

                        {/* Recap / Notes & Resources for Guests if available */}
                        {(meeting.recap_content || (meeting.resources && meeting.resources.length > 0)) && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-8 border-t border-zinc-200/80 dark:border-zinc-800">
                                {meeting.recap_content && (
                                    <div className="lg:col-span-2">
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
                                    </div>
                                )}
                                {meeting.resources && meeting.resources.length > 0 && (
                                    <div className="flex flex-col gap-4">
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
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Logged-in Member View: Full Member Experience ── */
                    <div className="space-y-8">
                        {/* Sleek Poster Card for Members */}
                        {meeting.poster_image_url && (
                            <div className="w-full mt-2 max-w-xl">
                                <div
                                    onClick={() => setShowPosterModal(true)}
                                    className="relative group cursor-pointer rounded-3xl overflow-hidden shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/40"
                                >
                                    <img
                                        src={meeting.poster_image_url}
                                        alt={`${meeting.title} Poster`}
                                        className="w-full h-auto max-h-[32rem] object-contain rounded-3xl group-hover:scale-[1.015] transition-transform duration-300 block"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-end justify-end p-4 pointer-events-none">
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl backdrop-blur-md">
                                            Click to Enlarge
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

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
                )}
            </div>

            {showCheckIn && (
                <CheckInModal
                    meeting={meeting}
                    onClose={() => setShowCheckIn(false)}
                    onSuccess={() => refetch()}
                />
            )}

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
                                {meeting.title}
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
                isPaid={meeting.is_paid}
                paymentAmount={meeting.payment_amount}
                paymentLink={`/pay/${meeting.slug || meeting.id}${user?.id ? `?m=${user.id}` : ''}`}
                onClose={() => setRsvpModalStatus(null)}
            />

            {/* Guest Registration Modal */}
            <GuestRegistrationModal
                isOpen={showGuestModal}
                meeting={meeting}
                onClose={() => setShowGuestModal(false)}
                onSuccess={() => {
                    refetch();
                    setToast('Registration successful! Check your WhatsApp/email for confirmation.');
                }}
            />
        </MeetingPageWrapper>
    );
};

export default SingleMeetingView;
