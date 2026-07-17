import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/solid';
import Button from '../../../shared/components/ui/Button';
import api from '../../../api/axios';
import type { Meeting } from '../hooks/useSingleMeeting';

interface CheckInModalProps {
    meeting: Meeting;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({ meeting, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const performCheckIn = async (paymentMethod?: string) => {
        setLoading(true);
        try {
            if (paymentMethod) {
                await api.post(`/member/meeting/${meeting.id}/pay`, {
                    method: paymentMethod,
                    amount: meeting.payment_amount ?? 0
                });
            }

            await api.post(`/member/meeting/${meeting.id}/checkin`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Check-in failed:", error);
            alert("Failed to complete check-in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const isPaid = meeting.is_paid == 1 || meeting.is_paid === true;
    const qrUrl = meeting.payment_qr_image_url || (meeting.payment_qr_image ? `${(import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '')}/uploads/${meeting.payment_qr_image}` : null);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-4">
                        Meeting Check-in
                    </div>
                    <h3 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase italic">
                        {isPaid ? <>Check-in <span className="text-indigo-600">& Pay</span></> : 'Confirm Attendance'}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-2">
                        {meeting.title}
                    </p>
                </div>

                {isPaid ? (
                    <div className="space-y-6">
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl text-center border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1">Amount Due</p>
                            <p className="text-4xl font-black text-zinc-900 dark:text-white">₹{meeting.payment_amount}</p>
                        </div>

                        {qrUrl ? (
                            <div className="flex flex-col items-center">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Scan to Pay via UPI</p>
                                <div className="p-4 bg-white rounded-3xl border border-zinc-100 shadow-xl">
                                    <img src={qrUrl} alt="Payment QR" className="w-48 h-48 object-contain" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black uppercase tracking-widest italic">
                                    No QR Code available. Please pay at the registration desk.
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-3 pt-4">
                            <Button
                                onClick={() => performCheckIn('paid_online')}
                                loading={loading}
                                className="w-full justify-center py-4 rounded-2xl shadow-xl shadow-indigo-600/20"
                            >
                                <CreditCardIcon className="w-5 h-5 mr-2" />
                                Paid Online (UPI/Bank)
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => performCheckIn('paid_cash')}
                                loading={loading}
                                className="w-full justify-center py-4 rounded-2xl"
                            >
                                <BanknotesIcon className="w-5 h-5 mr-2" />
                                Paid Cash at Venue
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-4">
                        <Button
                            onClick={() => performCheckIn()}
                            loading={loading}
                            className="w-full justify-center py-4 rounded-2xl shadow-xl shadow-indigo-600/20"
                        >
                            Confirm Check-in
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckInModal;
