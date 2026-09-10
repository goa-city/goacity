import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import api from '../api/axios';
import { 
    ArrowTopRightOnSquareIcon, 
    CheckIcon, 
    ClipboardDocumentIcon, 
    ShieldCheckIcon, 
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ArrowLeftIcon
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
}

export const PaymentView: React.FC = () => {
    const { slugOrId } = useParams<{ slugOrId?: string }>();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState<boolean>(!!slugOrId);
    const [meeting, setMeeting] = useState<MeetingPaymentInfo | null>(null);
    const [copied, setCopied] = useState<boolean>(false);
    const [autoRedirectAttempted, setAutoRedirectAttempted] = useState<boolean>(false);

    // Fetch meeting details if slug or ID is provided in route
    useEffect(() => {
        if (!slugOrId) return;

        let isMounted = true;
        setLoading(true);

        api.get(`/meetings/${slugOrId}`)
            .then(res => {
                if (isMounted) {
                    setMeeting(res.data);
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

    // Auto-redirect to UPI App on mobile devices if UPI link exists
    useEffect(() => {
        if (!isMobile || !paymentDetails.upiUri || autoRedirectAttempted || loading) return;

        setAutoRedirectAttempted(true);
        // Small delay to let user see the screen if they come back from app
        const timer = setTimeout(() => {
            try {
                window.location.href = paymentDetails.upiUri;
            } catch (e) {
                console.warn('Auto redirect failed:', e);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [isMobile, paymentDetails.upiUri, autoRedirectAttempted, loading]);

    const handleCopy = () => {
        if (!paymentDetails.upiUri) return;
        navigator.clipboard.writeText(paymentDetails.upiUri);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                        {paymentDetails.payeeName && (
                            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
                                Payee: <span className="font-bold text-zinc-700 dark:text-zinc-300">{paymentDetails.payeeName}</span>
                            </p>
                        )}
                    </div>

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
                        <div className="flex items-center gap-2 mt-4 text-[11px] text-zinc-400 font-medium">
                            {isMobile ? (
                                <>
                                    <DevicePhoneMobileIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <span>Tap the button below to launch your UPI app</span>
                                </>
                            ) : (
                                <>
                                    <ComputerDesktopIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                                    <span>Scan this QR with Google Pay, PhonePe, Paytm, or BHIM</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* One-Tap Action Button */}
                    {paymentDetails.upiUri ? (
                        <div className="space-y-3 pt-2">
                            <a 
                                href={paymentDetails.upiUri}
                                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
                            >
                                <span>Open in UPI App</span>
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                            </a>

                            <div className="flex items-center justify-center gap-3 pt-1">
                                <button
                                    onClick={handleCopy}
                                    type="button"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <CheckIcon className="w-4 h-4 text-emerald-500" />
                                            <span className="text-emerald-500">Copied UPI Link</span>
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardDocumentIcon className="w-4 h-4" />
                                            <span>Copy UPI URI</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300">
                            Please scan the QR code above or pay directly at the venue.
                        </div>
                    )}

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
        </div>
    );
};

export default PaymentView;
