import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircleIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarDaysIcon,
    SparklesIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    XMarkIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import Button from '../../../shared/components/ui/Button';
import { registerGuestMeeting } from '../api/meetings.api';
import type { Meeting } from '../hooks/useSingleMeeting';

interface GuestRegistrationFormProps {
    meeting: Meeting;
    onSuccess: () => void;
}

export const GuestRegistrationForm: React.FC<GuestRegistrationFormProps> = ({
    meeting,
    onSuccess
}) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    // Modal state for existing/duplicate registration alert
    const [alreadyRegisteredInfo, setAlreadyRegisteredInfo] = useState<{
        is_paid: boolean;
        is_payment_complete: boolean;
        payment_status?: string;
        message?: string;
    } | null>(null);
    const [showAlreadyRegisteredModal, setShowAlreadyRegisteredModal] = useState(false);

    const isPaid = Boolean(meeting.is_paid == 1 || meeting.is_paid === true);

    const handleCustomAnswerChange = (key: string, value: string) => {
        setCustomAnswers(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!name.trim()) {
            setErrorMsg('Please enter your full name.');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }
        if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
            setErrorMsg('Please enter a valid WhatsApp phone number.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('email', email.trim().toLowerCase());
            formData.append('phone', phone.trim());

            if (isPaid) {
                formData.append('payment_status', 'pending');
                formData.append('paid_amount', String(meeting.payment_amount || 0));
            } else {
                formData.append('payment_status', 'none');
                formData.append('paid_amount', '0');
            }

            if (Object.keys(customAnswers).length > 0) {
                formData.append('form_answers', JSON.stringify(customAnswers));
            }

            await registerGuestMeeting(meeting.slug || meeting.id, formData);
            onSuccess();

            if (isPaid) {
                // If paid, proceed to payment details page
                const targetSlug = meeting.slug || meeting.id;
                const payUrl = `/pay/${targetSlug}?phone=${encodeURIComponent(phone.trim())}&email=${encodeURIComponent(email.trim().toLowerCase())}`;
                navigate(payUrl);
            } else {
                // If unpaid, show confirmation screen directly
                setIsRegistered(true);
            }
        } catch (err: any) {
            console.error('Guest registration failed:', err);
            const errData = err.response?.data;
            if (err.response?.status === 409 || errData?.already_registered) {
                setAlreadyRegisteredInfo({
                    is_paid: isPaid,
                    is_payment_complete: Boolean(errData?.is_payment_complete),
                    payment_status: errData?.payment_status,
                    message: errData?.message
                });
                setShowAlreadyRegisteredModal(true);
            } else {
                setErrorMsg(errData?.message || 'Failed to complete registration. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setCustomAnswers({});
        setIsRegistered(false);
        setErrorMsg(null);
    };

    const getGoogleCalendarUrl = () => {
        try {
            const d = new Date(meeting.meeting_date);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const startStr = `${yyyy}${mm}${dd}T090000Z`;
            const endStr = `${yyyy}${mm}${dd}T120000Z`;
            const params = new URLSearchParams({
                action: 'TEMPLATE',
                text: meeting.title,
                dates: `${startStr}/${endStr}`,
                details: meeting.description || `Meeting: ${meeting.title}`,
                location: meeting.location_name || 'Goa'
            });
            return `https://calendar.google.com/calendar/render?${params.toString()}`;
        } catch {
            return '#';
        }
    };

    if (isRegistered) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none p-8 text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/20 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircleIcon className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mx-auto border border-emerald-200 dark:border-emerald-800/60">
                        <ShieldCheckIcon className="w-4 h-4" /> RSVP Confirmed
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                        You're on the list, {name}!
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        We’ve recorded your registration. Event details and updates have been queued for your WhatsApp and email.
                    </p>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-left space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-400 font-bold uppercase tracking-wider">Date & Time</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{meeting.start_time_display || 'Scheduled'} - {meeting.end_time_display || ''}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-400 font-bold uppercase tracking-wider">Venue</span>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{meeting.location_name || 'Venue'}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <a
                        href={getGoogleCalendarUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-200 dark:border-indigo-800/60"
                    >
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Add to Google Calendar</span>
                    </a>
                    <button
                        onClick={resetForm}
                        type="button"
                        className="py-3.5 px-6 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Register Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
            {/* Form Header */}
            <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">
                    <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Guest Registration</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                    Register
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium mt-1">
                    Fill out your contact details below to reserve your seat.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed animate-in fade-in">
                        {errorMsg}
                    </div>
                )}

                {/* Contact Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Firstname Lastname"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            WhatsApp Phone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. +91 98765 43210"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-1 ml-1">
                            Used for entry confirmation and WhatsApp event updates.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. youremailid@example.com"
                                required
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Custom Form Questions (if attached) */}
                {meeting.registration_form?.fields && meeting.registration_form.fields.length > 0 && (
                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                Event Questions ({meeting.registration_form.title || 'Questionnaire'})
                            </p>
                        </div>

                        <div className="space-y-3">
                            {meeting.registration_form.fields.map((field: any) => (
                                <div key={field.id} className="space-y-1">
                                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                        {field.label} {field.is_required ? <span className="text-red-500">*</span> : null}
                                    </label>
                                    {field.subtitle && (
                                        <p className="text-[10px] text-zinc-400">{field.subtitle}</p>
                                    )}

                                    {field.field_type === 'textarea' ? (
                                        <textarea
                                            value={customAnswers[field.name || field.id] || ''}
                                            onChange={(e) => handleCustomAnswerChange(field.name || field.id, e.target.value)}
                                            rows={3}
                                            required={Boolean(field.is_required)}
                                            placeholder={field.placeholder || ''}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                                        />
                                    ) : field.field_type === 'select' ? (
                                        <select
                                            value={customAnswers[field.name || field.id] || ''}
                                            onChange={(e) => handleCustomAnswerChange(field.name || field.id, e.target.value)}
                                            required={Boolean(field.is_required)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select an option</option>
                                            {(field.options || []).map((opt: string, idx: number) => (
                                                <option key={idx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={customAnswers[field.name || field.id] || ''}
                                            onChange={(e) => handleCustomAnswerChange(field.name || field.id, e.target.value)}
                                            required={Boolean(field.is_required)}
                                            placeholder={field.placeholder || ''}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 mt-2"
                >
                    {loading ? 'Processing...' : (isPaid ? 'Continue' : 'Submit Registration')}
                </Button>

                <p className="text-[10px] text-zinc-400 text-center">
                    By registering, you agree to receive event updates on WhatsApp and email.
                </p>
            </form>

            {/* Modal Alert: Already Registered */}
            {showAlreadyRegisteredModal && alreadyRegisteredInfo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200 relative">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowAlreadyRegisteredModal(false)}
                            className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        {/* Status Icon */}
                        <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg ${
                            alreadyRegisteredInfo.is_payment_complete
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-emerald-600/20 border border-emerald-200 dark:border-emerald-800'
                                : alreadyRegisteredInfo.is_paid
                                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shadow-amber-600/20 border border-amber-200 dark:border-amber-800'
                                    : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-indigo-600/20 border border-indigo-200 dark:border-indigo-800'
                        }`}>
                            {alreadyRegisteredInfo.is_payment_complete ? (
                                <CheckCircleIcon className="w-10 h-10" />
                            ) : alreadyRegisteredInfo.is_paid ? (
                                <ExclamationCircleIcon className="w-10 h-10" />
                            ) : (
                                <ShieldCheckIcon className="w-10 h-10" />
                            )}
                        </div>

                        {/* Title & Message */}
                        <div className="space-y-2">
                            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                                Already Registered
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                You are already registered for this event with phone <strong className="text-zinc-800 dark:text-zinc-200">{phone}</strong> or email <strong className="text-zinc-800 dark:text-zinc-200">{email}</strong>.
                            </p>
                        </div>

                        {/* Payment Context Card */}
                        {alreadyRegisteredInfo.is_paid ? (
                            alreadyRegisteredInfo.is_payment_complete ? (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-left space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                            Seat Confirmed & Paid
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed pl-6">
                                        Your payment has already been verified. We look forward to seeing you at the event!
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-left space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                            Payment Required
                                        </span>
                                        {meeting.payment_amount ? (
                                            <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                                                ₹{meeting.payment_amount}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 leading-relaxed">
                                        Your registration is recorded, but your seat requires payment to be confirmed.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-left space-y-1">
                                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                    ✓ RSVP Confirmed
                                </span>
                                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
                                    Your seat is confirmed for this event. See you at the venue!
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2.5 pt-2">
                            {alreadyRegisteredInfo.is_paid && !alreadyRegisteredInfo.is_payment_complete ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAlreadyRegisteredModal(false);
                                            const targetSlug = meeting.slug || meeting.id;
                                            const payUrl = `/pay/${targetSlug}?phone=${encodeURIComponent(phone.trim())}&email=${encodeURIComponent(email.trim().toLowerCase())}`;
                                            navigate(payUrl);
                                        }}
                                        className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer"
                                    >
                                        Continue to Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAlreadyRegisteredModal(false)}
                                        className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : alreadyRegisteredInfo.is_paid && alreadyRegisteredInfo.is_payment_complete ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAlreadyRegisteredModal(false);
                                            const targetSlug = meeting.slug || meeting.id;
                                            const payUrl = `/pay/${targetSlug}?phone=${encodeURIComponent(phone.trim())}&email=${encodeURIComponent(email.trim().toLowerCase())}`;
                                            navigate(payUrl);
                                        }}
                                        className="w-full py-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
                                    >
                                        View Payment Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAlreadyRegisteredModal(false)}
                                        className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a
                                        href={getGoogleCalendarUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border border-indigo-200 dark:border-indigo-800/60"
                                    >
                                        <CalendarDaysIcon className="w-4 h-4" />
                                        <span>Add to Google Calendar</span>
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => setShowAlreadyRegisteredModal(false)}
                                        className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuestRegistrationForm;
