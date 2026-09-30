import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
    XMarkIcon, CheckCircleIcon, CurrencyRupeeIcon,
    UserIcon, EnvelopeIcon, PhoneIcon,
    PhotoIcon, ArrowTopRightOnSquareIcon,
    CalendarDaysIcon, SparklesIcon, DocumentTextIcon
} from '@heroicons/react/24/solid';
import Button from '../../../shared/components/ui/Button';
import { registerGuestMeeting } from '../api/meetings.api';
import type { Meeting } from '../hooks/useSingleMeeting';

interface GuestRegistrationModalProps {
    meeting: Meeting;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const GuestRegistrationModal: React.FC<GuestRegistrationModalProps> = ({
    meeting,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMode, setPaymentMode] = useState<'online' | 'cash'>('online');
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);

    if (!isOpen) return null;

    const isPaid = meeting.is_paid == 1 || meeting.is_paid === true;
    const qrUrl = meeting.payment_qr_image_url || (
        meeting.payment_qr_image
            ? `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}/uploads/${meeting.payment_qr_image}`
            : null
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProofPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

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
            setErrorMsg('Please enter a valid phone number (at least 8 digits).');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('email', email.trim().toLowerCase());
            formData.append('phone', phone.trim());

            if (isPaid) {
                const targetPaymentStatus = paymentMode === 'cash'
                    ? 'paid_cash'
                    : (paymentProofFile ? 'paid_online' : 'pending');
                formData.append('payment_status', targetPaymentStatus);
                formData.append('paid_amount', String(meeting.payment_amount || 0));
                if (paymentProofFile) {
                    formData.append('payment_proof', paymentProofFile);
                }
            }

            if (Object.keys(customAnswers).length > 0) {
                formData.append('form_answers', JSON.stringify(customAnswers));
            }

            await registerGuestMeeting(meeting.slug || meeting.id, formData);
            setIsRegistered(true);
            onSuccess();
        } catch (err: any) {
            console.error('Guest registration failed:', err);
            setErrorMsg(err.response?.data?.message || 'Failed to complete registration. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Google Calendar URL generator
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

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="p-6 sm:p-8 pb-4 relative shrink-0 border-b border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 sm:top-8 sm:right-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Close"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Public & Guest Registration</span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase italic">
                        {isRegistered ? (
                            <>Seat <span className="text-emerald-600">Confirmed!</span></>
                        ) : (
                            <>Register for <span className="text-indigo-600">Event</span></>
                        )}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium mt-1 truncate">
                        {meeting.title}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                    {isRegistered ? (
                        <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/20 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircleIcon className="w-12 h-12" />
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                                    You're on the list, {name}!
                                </h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                                    We’ve recorded your registration. A confirmation and event details have been queued for your email and WhatsApp number.
                                </p>
                            </div>

                            <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-left space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Date</span>
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{meeting.start_time_display || 'Scheduled'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Location</span>
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">{meeting.location_name || 'Venue'}</span>
                                </div>
                                {isPaid && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-zinc-400 font-bold uppercase tracking-wider">Payment Status</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                            {paymentMode === 'cash' ? 'Pay Cash at Venue' : (paymentProofFile ? 'Proof Submitted' : 'Pending')}
                                        </span>
                                    </div>
                                )}
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
                                <Button
                                    onClick={onClose}
                                    className="py-3.5 px-6 rounded-2xl"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errorMsg && (
                                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-bold leading-relaxed animate-in fade-in">
                                    {errorMsg}
                                </div>
                            )}

                            {/* Section 1: Contact Info */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">1. Your Details</p>

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
                                            placeholder="e.g. Rahul Sharma"
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
                                        Used for entry confirmation and event alert messages.
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
                                            placeholder="e.g. rahul@example.com"
                                            required
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Paid Meeting details */}
                            {isPaid && (
                                <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">2. Event Ticket / Fee</p>
                                        <span className="text-xs font-black px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
                                            ₹{meeting.payment_amount}
                                        </span>
                                    </div>

                                    {/* Payment Method Switcher */}
                                    <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode('online')}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${paymentMode === 'online' ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-md' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                        >
                                            Pay via UPI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMode('cash')}
                                            className={`py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${paymentMode === 'cash' ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-md' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                                        >
                                            Pay Cash at Venue
                                        </button>
                                    </div>

                                    {paymentMode === 'online' && (
                                        <div className="bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                                            {qrUrl && (
                                                <div className="flex flex-col items-center">
                                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                                                        <img
                                                            src={qrUrl}
                                                            alt="Payment QR"
                                                            className="w-44 h-44 object-contain rounded-lg"
                                                        />
                                                    </div>
                                                    <a
                                                        href={`/pay/${meeting.slug || meeting.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-2 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 inline-flex items-center gap-1"
                                                    >
                                                        <span>Open UPI App / Pay Page</span>
                                                        <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                                                    Upload Payment Proof / Screenshot
                                                </label>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-indigo-500 transition-colors cursor-pointer bg-white dark:bg-zinc-900">
                                                        <PhotoIcon className="w-5 h-5 text-zinc-400" />
                                                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">
                                                            {paymentProofFile ? paymentProofFile.name : 'Choose Screenshot / Image'}
                                                        </span>
                                                        <input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    {paymentProofPreview && (
                                                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                                                            <img src={paymentProofPreview} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentMode === 'cash' && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium">
                                            ℹ️ You can pay <strong>₹{meeting.payment_amount}</strong> in cash at the registration desk upon arrival. Your seat will be tentatively reserved.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Section 3: Custom Form Questions (if attached) */}
                            {meeting.registration_form?.fields && meeting.registration_form.fields.length > 0 && (
                                <div className="space-y-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2">
                                        <DocumentTextIcon className="w-4 h-4 text-indigo-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                            3. Event Questions ({meeting.registration_form.title || 'Questionnaire'})
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
                                                        value={customAnswers[field.field_key] || ''}
                                                        onChange={(e) => handleCustomAnswerChange(field.field_key, e.target.value)}
                                                        placeholder={field.placeholder || ''}
                                                        required={Boolean(field.is_required)}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                                                        rows={3}
                                                    />
                                                ) : field.field_type === 'select' && Array.isArray(field.options) ? (
                                                    <select
                                                        value={customAnswers[field.field_key] || ''}
                                                        onChange={(e) => handleCustomAnswerChange(field.field_key, e.target.value)}
                                                        required={Boolean(field.is_required)}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="">-- Select an option --</option>
                                                        {field.options.map((opt: any, i: number) => (
                                                            <option key={i} value={typeof opt === 'string' ? opt : opt.value || opt.label}>
                                                                {typeof opt === 'string' ? opt : opt.label || opt.value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={customAnswers[field.field_key] || ''}
                                                        onChange={(e) => handleCustomAnswerChange(field.field_key, e.target.value)}
                                                        placeholder={field.placeholder || ''}
                                                        required={Boolean(field.is_required)}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 h-12 text-sm text-zinc-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit CTA */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    className="w-full justify-center py-4 rounded-2xl shadow-xl shadow-indigo-600/20 text-sm font-black uppercase tracking-wider"
                                >
                                    {isPaid ? `Confirm & Register (₹${meeting.payment_amount})` : 'Confirm Registration'}
                                </Button>
                                <p className="text-center text-[10px] text-zinc-400 font-medium mt-2">
                                    By registering, you agree to receive event updates on WhatsApp and email.
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GuestRegistrationModal;
