import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../api/axios';
import { useAuth } from '../features/auth/context/AuthContext';
import confetti from 'canvas-confetti';
import { 
    ArrowTopRightOnSquareIcon, 
    CheckIcon, 
    ClipboardDocumentIcon, 
    ShieldCheckIcon, 
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    CameraIcon,
    XMarkIcon,
    ArrowUpTrayIcon,
    BanknotesIcon
} from '@heroicons/react/24/solid';

interface MeetingPaymentInfo {
    id: number;
    title: string;
    slug?: string;
    meeting_date?: string;
    start_time?: string;
    location_name?: string;
    is_paid?: number;
    payment_amount?: number | string;
    upi_link?: string;
    payment_qr_image_url?: string | null;
    my_payment_status?: string | null;
    my_payment_proof?: string | null;
    my_payment_proof_url?: string | null;
}

export const PaymentView: React.FC = () => {
    const { slugOrId } = useParams<{ slugOrId?: string }>();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const [loading, setLoading] = useState<boolean>(!!slugOrId);
    const [meeting, setMeeting] = useState<MeetingPaymentInfo | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [autoRedirectAttempted, setAutoRedirectAttempted] = useState<boolean>(false);

    // Modal state for screenshot upload
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [memberIdentifier, setMemberIdentifier] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string>('');
    const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
    const [showCashModal, setShowCashModal] = useState<boolean>(false);
    const [cashSaving, setCashSaving] = useState<boolean>(false);
    const [cashError, setCashError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // True if member is known via authentication or explicit query parameters
    const hasIdentifiedMember = Boolean(
        user?.id || 
        searchParams.get('m') || 
        searchParams.get('member_id') || 
        searchParams.get('phone') || 
        searchParams.get('email')
    );

    // Fetch meeting details if slug or ID is provided in route
    useEffect(() => {
        if (!slugOrId) return;

        let isMounted = true;
        setLoading(true);

        api.get(`/meetings/${slugOrId}`)
            .then(res => {
                if (isMounted) {
                    setMeeting(res.data);
                    if (res.data?.my_payment_status === 'paid_online' || 
                        res.data?.my_payment_status === 'paid_cash' || 
                        res.data?.my_payment_status === 'completed' ||
                        res.data?.my_payment_status === 'paid' ||
                        Boolean(res.data?.my_payment_proof)) {
                        setPaymentSuccess(true);
                    }
                }
            })
            .catch(err => {
                console.error('Failed to load meeting payment info:', err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [slugOrId]);

    // Derive member identifier from search params or logged in user
    useEffect(() => {
        if (user?.email) {
            setMemberIdentifier(user.email);
        } else if (user?.phone) {
            setMemberIdentifier(user.phone);
        } else if (searchParams.get('email')) {
            setMemberIdentifier(searchParams.get('email') || '');
        } else if (searchParams.get('phone')) {
            setMemberIdentifier(searchParams.get('phone') || '');
        } else if (searchParams.get('m') || searchParams.get('member_id')) {
            setMemberIdentifier(searchParams.get('m') || searchParams.get('member_id') || '');
        }
    }, [user, searchParams]);

    // Derive raw UPI deep-link and payment details
    const paymentDetails = useMemo(() => {
        // Query params fallback / override
        const queryPa = searchParams.get('pa') || '';
        const queryPn = searchParams.get('pn') || '';
        const queryAm = searchParams.get('am') || '';
        const queryTn = searchParams.get('tn') || '';
        const rawQueryUpi = searchParams.get('upi_link') || '';

        // Check if meeting has existing upi_link
        let upiUri = '';
        let upiId = '';
        let amount = '';
        let payeeName = '';
        let note = '';
        let title = meeting?.title || searchParams.get('title') || 'Payment Request';

        const rawInput = (meeting?.upi_link || rawQueryUpi || '').trim();

        if (rawInput) {
            if (rawInput.startsWith('upi://pay')) {
                upiUri = rawInput;
                try {
                    const urlObj = new URL(rawInput.replace('upi://pay', 'https://dummy.local'));
                    const pa = urlObj.searchParams.get('pa') || '';
                    upiId = pa;
                    payeeName = urlObj.searchParams.get('pn') || '';
                    amount = urlObj.searchParams.get('am') || '';
                    note = urlObj.searchParams.get('tn') || '';

                    // Ensure currency is set
                    if (!urlObj.searchParams.get('cu')) {
                        urlObj.searchParams.set('cu', 'INR');
                    }

                    if (meeting?.payment_amount && !amount) {
                        amount = String(meeting.payment_amount);
                        urlObj.searchParams.set('am', amount);
                    }
                    upiUri = urlObj.toString().replace('https://dummy.local', 'upi://pay');
                } catch (e) {
                    // Fallback to rawInput
                }
            } else if (rawInput.includes('@')) {
                // Admin entered a raw UPI VPA/ID (e.g. atashadmello@okicici)
                const vpa = rawInput;
                upiId = vpa;
                const amt = meeting?.payment_amount ? String(meeting.payment_amount) : queryAm;
                const pn = meeting?.title ? 'Goa City' : queryPn || 'Goa City';
                const tn = meeting ? `Meeting Registration - ${meeting.title}` : (queryTn || 'Event Registration');
                
                const params = new URLSearchParams();
                params.set('pa', vpa);
                if (pn) params.set('pn', pn);
                if (amt) params.set('am', amt);
                params.set('cu', 'INR');
                if (tn) params.set('tn', tn);

                upiUri = `upi://pay?${params.toString()}`;
                amount = amt;
                payeeName = pn;
                note = tn;
            } else {
                upiUri = rawInput;
            }
        } else if (queryPa) {
            // Construct UPI URI from query parameters
            upiId = queryPa;
            const params = new URLSearchParams();
            params.set('pa', queryPa);
            if (queryPn) params.set('pn', queryPn);
            if (queryAm) params.set('am', queryAm);
            params.set('cu', 'INR');
            if (queryTn) params.set('tn', queryTn);
            upiUri = `upi://pay?${params.toString()}`;

            amount = queryAm;
            payeeName = queryPn;
            note = queryTn;
        }

        // If amount still unset, pull from meeting
        if (!amount && meeting?.payment_amount) {
            amount = String(meeting.payment_amount);
        }

        return {
            upiUri,
            upiId,
            amount: amount ? Number(amount).toFixed(2) : '',
            payeeName: payeeName || 'Goa.City Organizers',
            note: note || (meeting ? `Registration for ${meeting.title}` : ''),
            title
        };
    }, [meeting, searchParams]);

    // Detect mobile browser
    const isMobile = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    }, []);

    // Auto-redirect to UPI App on mobile devices if UPI link exists (only if not already marked paid)
    useEffect(() => {
        if (!isMobile || !paymentDetails.upiUri || autoRedirectAttempted || loading || paymentSuccess) return;

        setAutoRedirectAttempted(true);
        const timer = setTimeout(() => {
            try {
                window.location.href = paymentDetails.upiUri;
            } catch (e) {
                console.warn('Auto redirect failed:', e);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [isMobile, paymentDetails.upiUri, autoRedirectAttempted, loading, paymentSuccess]);

    const handleCopy = () => {
        if (!paymentDetails.upiUri) return;
        navigator.clipboard.writeText(paymentDetails.upiUri);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            setUploadError('');
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setUploadError('Please select a payment screenshot or transaction receipt image.');
            return;
        }

        const meetingTarget = meeting?.id || slugOrId;
        if (!meetingTarget) {
            setUploadError('Meeting not identified.');
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const formData = new FormData();
            formData.append('payment_proof', selectedFile);
            formData.append('method', 'paid_online');
            if (paymentDetails.amount) {
                formData.append('amount', paymentDetails.amount);
            }

            // Member association
            const memberIdParam = searchParams.get('m') || searchParams.get('member_id');
            if (user?.id) {
                formData.append('member_id', String(user.id));
            } else if (memberIdParam) {
                formData.append('member_id', memberIdParam);
            } else if (memberIdentifier.trim()) {
                if (memberIdentifier.includes('@')) {
                    formData.append('email', memberIdentifier.trim());
                } else {
                    formData.append('phone', memberIdentifier.trim());
                }
            }

            const response = await api.post(`/meetings/${meetingTarget}/pay`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setPaymentSuccess(true);
                setShowUploadModal(false);
                confetti({
                    particleCount: 90,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 9999
                });
            } else {
                setUploadError(response.data.message || 'Failed to submit payment proof.');
            }
        } catch (err: any) {
            console.error('Payment upload failed:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to submit payment proof. Please check and try again.';
            setUploadError(msg);
        } finally {
            setUploading(false);
        }
    };

    const handlePayCash = async () => {
        const meetingTarget = meeting?.id || slugOrId;
        if (!meetingTarget) {
            setCashError('Meeting not identified.');
            return;
        }

        // Validate member identifier if not authenticated
        const memberIdParam = searchParams.get('m') || searchParams.get('member_id');
        if (!user?.id && !memberIdParam && !memberIdentifier.trim()) {
            setShowCashModal(true);
            return;
        }

        setCashSaving(true);
        setCashError('');

        try {
            const formData = new FormData();
            formData.append('method', 'paid_cash');
            if (paymentDetails.amount) {
                formData.append('amount', paymentDetails.amount);
            }

            if (user?.id) {
                formData.append('member_id', String(user.id));
            } else if (memberIdParam) {
                formData.append('member_id', memberIdParam);
            } else if (memberIdentifier.trim()) {
                if (memberIdentifier.includes('@')) {
                    formData.append('email', memberIdentifier.trim());
                } else {
                    formData.append('phone', memberIdentifier.trim());
                }
            }

            const response = await api.post(`/meetings/${meetingTarget}/pay`, formData);

            if (response.data.success) {
                setPaymentSuccess(true);
                setShowCashModal(false);
                confetti({
                    particleCount: 90,
                    spread: 70,
                    origin: { y: 0.6 },
                    zIndex: 9999
                });
            } else {
                setCashError(response.data.message || 'Failed to record cash payment preference.');
            }
        } catch (err: any) {
            console.error('Cash payment selection failed:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to record cash payment. Please try again.';
            setCashError(msg);
        } finally {
            setCashSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-xs tracking-widest animate-pulse">Loading Payment Details...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col">
            {/* Minimal Top Header */}
            <header className="px-6 py-5 flex items-center justify-between max-w-xl mx-auto w-full">
                <Link to="/" className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 transition-colors">
                    <span className="font-black text-lg tracking-tight uppercase">Goa<span className="text-indigo-600">.City</span></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">Pay</span>
                </Link>

                {meeting && (
                    <Link 
                        to={`/meetings/${meeting.slug || meeting.id}`}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5" /> Meeting Details
                    </Link>
                )}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 pb-12 w-full max-w-md mx-auto">
                <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl shadow-zinc-200/60 dark:shadow-none p-6 sm:p-8 space-y-6 text-center">
                    
                    {/* Security Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider mx-auto border border-emerald-100 dark:border-emerald-800/60">
                        <ShieldCheckIcon className="w-4 h-4" /> Official UPI Payment
                    </div>

                    {/* Amount & Title */}
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Amount Due</p>
                        <h1 className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
                            {paymentDetails.amount ? `₹${paymentDetails.amount}` : 'Open Amount'}
                        </h1>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                            {paymentDetails.title}
                        </p>
                    </div>

                    {/* Success Alert if Already Confirmed */}
                    {paymentSuccess && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl flex items-center justify-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                            <CheckCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="text-left">
                                <p className="font-black text-xs uppercase tracking-wider">Payment completed</p>
                                <p className="text-[11px] font-medium opacity-90">
                                    {meeting?.my_payment_status === 'paid_cash' 
                                        ? 'Registered to pay cash at the venue.' 
                                        : 'Your proof has been submitted and RSVP is confirmed.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center pt-2">
                        <div className="p-4 bg-white rounded-2xl shadow-inner border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                            {paymentDetails.upiUri ? (
                                <QRCode 
                                    value={paymentDetails.upiUri} 
                                    size={200}
                                    level="M"
                                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                                />
                            ) : meeting?.payment_qr_image_url ? (
                                <img 
                                    src={meeting.payment_qr_image_url} 
                                    alt="Payment QR" 
                                    className="w-48 h-48 object-contain"
                                />
                            ) : (
                                <div className="w-48 h-48 flex items-center justify-center text-center p-4 text-xs font-bold text-zinc-400">
                                    No QR code or UPI link provided for this event.
                                </div>
                            )}
                        </div>

                        {/* Device Guidance */}
                        <div className="flex flex-col items-center justify-center text-center mt-4 space-y-2">
                            <p className="text-sm sm:text-base font-bold text-zinc-850 dark:text-zinc-100">
                                Please scan the QR code to complete the payment.
                            </p>
                            {paymentDetails.upiId && (
                                <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60 w-full text-center">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                        UPI ID:
                                    </p>
                                    <p className="text-base sm:text-lg font-black tracking-wide text-zinc-900 dark:text-white select-all">
                                        {paymentDetails.upiId}
                                    </p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                                        Make payment to this ID directly from any UPI app
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                        {/* Mark Payment Done Button */}
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(true)}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-[0.98] ${
                                paymentSuccess 
                                    ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
                                    : 'bg-[#059669] hover:bg-[#047857] text-white shadow-emerald-700/25'
                            }`}
                        >
                            {paymentSuccess ? (
                                <>
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Payment Completed (Update Proof)</span>
                                </>
                            ) : (
                                <>
                                    <CameraIcon className="w-5 h-5" />
                                    <span>Mark Payment Done</span>
                                </>
                            )}
                        </button>

                        {/* Pay Cash At Venue Button */}
                        <button
                            type="button"
                            onClick={handlePayCash}
                            disabled={cashSaving}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-md bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-600/25 disabled:opacity-50"
                        >
                            <BanknotesIcon className="w-5 h-5" />
                            <span>{cashSaving ? 'Saving...' : 'Pay cash at venue'}</span>
                        </button>
                    </div>

                    {/* Supported Apps Badges */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Supported Apps</p>
                        <div className="flex items-center justify-center flex-wrap gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">Google Pay</span>
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">PhonePe</span>
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">Paytm</span>
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">BHIM</span>
                            <span className="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">Cred</span>
                        </div>
                    </div>
                </div>

                {/* Footer Assurance */}
                <p className="text-[11px] text-zinc-400 font-medium text-center mt-6 max-w-xs">
                    Payments are handled securely and directly through NPCI UPI protocol between your bank and the host.
                </p>
            </main>

            {/* Screenshot Upload Modal */}
            {showUploadModal && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setShowUploadModal(false)}
                >
                    <div 
                        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800">
                                <CameraIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                    Upload Payment Proof
                                </h3>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Attach screenshot of your completed UPI payment
                                </p>
                            </div>
                        </div>

                        {uploadError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
                                {uploadError}
                            </div>
                        )}

                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            {/* Member identifier input only if not identified via user, params, or link */}
                            {!hasIdentifiedMember && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1.5">
                                        Your Phone Number or Email <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={memberIdentifier}
                                        onChange={(e) => setMemberIdentifier(e.target.value)}
                                        placeholder="e.g. 9876543210 or your email"
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-1">Please enter your phone number so we can link your payment proof to your registration.</p>
                                </div>
                            )}

                            {/* File Upload Box */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-1.5">
                                    Payment Screenshot <span className="text-red-500">*</span>
                                </label>
                                
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                {previewUrl ? (
                                    <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-2 text-center">
                                        <img 
                                            src={previewUrl} 
                                            alt="Proof Preview" 
                                            className="w-full max-h-56 object-contain rounded-xl mx-auto"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                            }}
                                            className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-zinc-900 text-white p-1.5 rounded-full text-xs shadow-md transition-all"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                        <p className="text-[11px] font-bold text-zinc-500 mt-2 truncate">
                                            {selectedFile?.name}
                                        </p>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-zinc-50/50 dark:bg-zinc-950/50 group"
                                    >
                                        <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-zinc-400 group-hover:text-emerald-600 transition-colors mb-2" />
                                        <p className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-200">
                                            Tap to select screenshot
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG, or WEBP up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            {/* Submit & Cancel Buttons */}
                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-50"
                                >
                                    {uploading ? 'Uploading...' : 'Confirm & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Cash at Venue Confirmation Modal (for Unauthenticated Guests) */}
            {showCashModal && (
                <div 
                    className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setShowCashModal(false)}
                >
                    <div 
                        className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 sm:p-8 relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 text-left"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setShowCashModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                <BanknotesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                    Pay Cash at Venue
                                </h3>
                                <p className="text-xs text-zinc-500 font-medium">
                                    Confirm your registration to pay at the registration desk
                                </p>
                            </div>
                        </div>

                        {cashError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
                                {cashError}
                            </div>
                        )}

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                handlePayCash();
                            }} 
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-200 mb-1.5">
                                    Your Phone Number or Email <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    value={memberIdentifier}
                                    onChange={(e) => setMemberIdentifier(e.target.value)}
                                    placeholder="e.g. 9876543210 or your email"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <p className="text-[10px] text-zinc-400 mt-1">Please enter your phone number so we can identify your RSVP and check you in at the venue.</p>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCashModal(false)}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={cashSaving || !memberIdentifier.trim()}
                                    className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
                                >
                                    {cashSaving ? 'Confirming...' : 'Confirm Cash Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentView;
