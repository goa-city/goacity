import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import { CheckCircleIcon, QuestionMarkCircleIcon, XCircleIcon, XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

interface RsvpConfirmationModalProps {
    isOpen: boolean;
    status: 'going' | 'not_sure' | 'cant_go' | string;
    meetingTitle?: string;
    memberName?: string;
    isPaid?: boolean | number;
    paymentAmount?: number | string | null;
    paymentLink?: string | null;
    onClose: () => void;
}

export const RsvpConfirmationModal: React.FC<RsvpConfirmationModalProps> = ({
    isOpen,
    status,
    meetingTitle,
    memberName,
    isPaid,
    paymentAmount,
    paymentLink,
    onClose
}) => {
    if (!isOpen) return null;

    const hasPayment = Boolean(isPaid) && (paymentLink || paymentAmount);
    const isGoing = status === 'going';

    const config = {
        going: {
            icon: CheckCircleIcon,
            iconColor: 'text-emerald-500 dark:text-emerald-400',
            bgColor: 'bg-emerald-500/10 border-emerald-500/20',
            badgeBg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
            title: 'RSVP Confirmed: Going!',
            badgeText: 'Going 🎉',
            message: hasPayment
                ? 'Awesome! Your RSVP is noted. Since this is a paid event, please complete your payment to confirm your seat.'
                : 'Awesome! Your spot is reserved. We look forward to seeing you at the meeting.',
            actionBtnText: hasPayment ? 'Close' : 'Great, see you there'
        },
        not_sure: {
            icon: QuestionMarkCircleIcon,
            iconColor: 'text-amber-500 dark:text-amber-400',
            bgColor: 'bg-amber-500/10 border-amber-500/20',
            badgeBg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
            title: 'RSVP Recorded: Maybe',
            badgeText: 'Tentative 🤔',
            message: 'Thanks for letting us know! We have noted your response. You can update your RSVP anytime before the meeting starts.',
            actionBtnText: 'Got it'
        },
        cant_go: {
            icon: XCircleIcon,
            iconColor: 'text-rose-500 dark:text-rose-400',
            bgColor: 'bg-rose-500/10 border-rose-500/20',
            badgeBg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
            title: 'RSVP Recorded: Can\'t Go',
            badgeText: 'Not Attending',
            message: 'We will miss you! Meeting notes and recap materials will be posted on the portal after the event.',
            actionBtnText: 'Understood'
        }
    }[status] || {
        icon: CheckCircleIcon,
        iconColor: 'text-indigo-500 dark:text-indigo-400',
        bgColor: 'bg-indigo-500/10 border-indigo-500/20',
        badgeBg: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
        title: 'RSVP Updated',
        badgeText: status,
        message: 'Your response for this meeting has been successfully saved.',
        actionBtnText: 'Done'
    };

    const Icon = config.icon;

    // Trigger celebratory confetti burst when modal opens with "going"
    useEffect(() => {
        if (isOpen && isGoing) {
            // Initial center burst
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 9999,
                colors: ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6']
            });

            // Side bursts after a slight delay
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0.1, y: 0.7 },
                    zIndex: 9999,
                    colors: ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6']
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 0.9, y: 0.7 },
                    zIndex: 9999,
                    colors: ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#3B82F6']
                });
            }, 250);

            return () => clearTimeout(timer);
        }
    }, [isOpen, isGoing]);

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-7 sm:p-8 relative border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-30 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    aria-label="Close modal"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center relative z-10">
                    {/* Icon Halo */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border ${config.bgColor}`}>
                        <Icon className={`w-10 h-10 ${config.iconColor}`} />
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-block px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 ${config.badgeBg}`}>
                        {config.badgeText}
                    </span>

                    {/* Modal Title */}
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight tracking-tight uppercase mb-2">
                        {config.title}
                    </h3>

                    {/* Personalized Greeting */}
                    {memberName && (
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                            Hi {memberName}
                        </p>
                    )}

                    {/* Meeting Title */}
                    {meetingTitle && (
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 px-2 mb-3">
                            {meetingTitle}
                        </p>
                    )}

                    {/* Description Message */}
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium leading-relaxed max-w-sm mb-6">
                        {config.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="w-full flex flex-col gap-3">
                        {/* Green Payment Button when Paid & Going (Rupee icon removed as requested) */}
                        {isGoing && hasPayment && (
                            <a
                                href={paymentLink || '#'}
                                className="w-full py-4 px-4 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 bg-[#059669] hover:bg-[#047857] active:bg-[#065f46] text-white shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <span>Make Payment & Confirm Seat {paymentAmount ? `(₹${paymentAmount})` : ''}</span>
                                <ArrowTopRightOnSquareIcon className="w-4 h-4 shrink-0" />
                            </a>
                        )}

                        {/* Dismiss Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className={`w-full py-3.5 px-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all active:scale-[0.98] cursor-pointer ${
                                isGoing && hasPayment
                                    ? 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                            }`}
                        >
                            {config.actionBtnText}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RsvpConfirmationModal;
