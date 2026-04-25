import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BellIcon, EllipsisHorizontalIcon, CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon, MapPinIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const SidebarRight = () => {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
             // If no user, maybe don't fetch or fetch public?
             // API handles user_id=0 gracefully.
            try {
                const userIdParam = user ? `?user_id=${user.id}` : '';
                const res = await api.get(`/meetings${userIdParam}`);

                // Generate today string
                const d = new Date();
                const offset = d.getTimezoneOffset() * 60000;
                const todayStr = (new Date(d - offset)).toISOString().slice(0, 10);
                
                // Only keep upcoming and today's meetings
                const upcomingOnly = res.data.filter(m => m.meeting_date >= todayStr);
                setMeetings(upcomingOnly);
            } catch (error) {
                console.error("Failed to fetch meetings", error);
            }
        };
        fetchMeetings();
    }, [user]);

    const handleRSVP = async (meetingId, status) => {
        if (!user) return alert("Please login to RSVP");
        try {
            await api.post('/meeting-actions', {
                user_id: user.id,
                meeting_id: meetingId,
                action: 'rsvp',
                value: status
            });
            // Update local state
            setMeetings(prev => prev.map(m => 
                m.id === meetingId ? { ...m, my_rsvp: status } : m
            ));
        } catch (e) {
            console.error(e);
            alert("Failed to update RSVP");
        }
    };

    const handleCheckInClick = (meeting) => {
        if (!user) return alert("Please login to Check-in");
        
        if (meeting.is_paid == 1 && meeting.my_payment_status !== 'paid_online' && meeting.my_payment_status !== 'paid_cash') {
            // Open Payment Modal
            setSelectedMeeting(meeting);
            setPaymentModalOpen(true);
        } else {
            // Free or already paid, just check in
            performCheckIn(meeting.id);
        }
    };

    const performCheckIn = async (meetingId) => {
        try {
            await api.post('/meeting-actions', {
                user_id: user.id,
                meeting_id: meetingId,
                action: 'checkin',
                value: 1
            });
            setMeetings(prev => prev.map(m => 
                m.id === meetingId ? { ...m, my_checkin: 1 } : m
            ));
            alert("Checked in successfully!");
        } catch (e) {
            console.error(e);
            alert("Failed to check in");
        }
    };

    const handlePayment = async (method) => {
        if (!selectedMeeting || !user) return;
        try {
            // Record Payment
            await api.post('/meeting-actions', {
                user_id: user.id,
                meeting_id: selectedMeeting.id,
                action: 'pay',
                value: method // 'paid_online' or 'paid_cash'
            });
            
            // Then Check-in
            await api.post('/meeting-actions', {
                user_id: user.id,
                meeting_id: selectedMeeting.id,
                action: 'checkin',
                value: 1
            });

            // Update State
            setMeetings(prev => prev.map(m => 
                m.id === selectedMeeting.id ? { ...m, my_checkin: 1, my_payment_status: method } : m
            ));

            setPaymentModalOpen(false);
            setSelectedMeeting(null);
            alert("Payment recorded and Checked in!");

        } catch (e) {
            console.error(e);
            alert("Failed to record payment");
        }
    };

    // Helper: Date Logic
    // We compare strings 'YYYY-MM-DD'
    const getTodayStr = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d - offset)).toISOString().slice(0, 10);
        return localISOTime;
    };
    const todayStr = getTodayStr();

    // Helper to format date header: "Oct 20, 2021"
    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Helper to format time: "10:00"
    const formatTime = (timeStr) => {
        return timeStr?.substring(0, 5) || ''; 
    };

    const getBorderColor = (meeting) => {
        // Use stream color if available, else standard
        return meeting.stream_color ? { borderColor: meeting.stream_color } : { borderColor: '#9333ea' }; // Default purple
    };

    // Group meetings by date
    const groupedMeetings = meetings.reduce((acc, meeting) => {
        const date = meeting.meeting_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(meeting);
        return acc;
    }, {});

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-950 p-6 
            w-full xl:w-80
            xl:fixed xl:right-0 xl:top-0 xl:h-screen xl:border-l border-zinc-100 dark:border-zinc-800 xl:overflow-y-auto
            border-t xl:border-t-0 mt-8 xl:mt-0 pb-20
        ">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Meetings Calendar</h2>
                <button className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 relative transition-colors">
                     <BellIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                     {meetings.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-zinc-950"></span>
                     )}
                </button>
            </div>

            {/* Calendar List */}
            {meetings.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {Object.keys(groupedMeetings).map((date) => (
                        <div key={date}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-xs font-bold uppercase ${date === todayStr ? 'text-indigo-600' : 'text-zinc-400'}`}>
                                    {date === todayStr ? 'TODAY' : formatDateHeader(date)}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {groupedMeetings[date].map((meeting) => (
                                    <div key={meeting.id} className="flex flex-col gap-2">
                                        <div className="flex gap-4">
                                            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 w-12 pt-0.5">{formatTime(meeting.start_time)}</div>
                                            <div className="pl-4 border-l-2 flex-1 pb-1" style={getBorderColor(meeting)}>
                                                <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{meeting.title}</h4>
                                                <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                    <MapPinIcon className="w-3 h-3 mr-1" />
                                                    {meeting.location_name}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions Area */}
                                        <div className="pl-16">
                                            {date > todayStr ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <button onClick={() => handleRSVP(meeting.id, 'going')} 
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${meeting.my_rsvp === 'going' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        <span>Going</span>
                                                    </button>
                                                    <button onClick={() => handleRSVP(meeting.id, 'not_sure')} 
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${meeting.my_rsvp === 'not_sure' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                        <QuestionMarkCircleIcon className="w-4 h-4" />
                                                        <span>Maybe</span>
                                                    </button>
                                                    <button onClick={() => handleRSVP(meeting.id, 'cant_go')} 
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${meeting.my_rsvp === 'cant_go' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                                                        <XCircleIcon className="w-4 h-4" />
                                                        <span>Can't Go</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    {meeting.my_checkin == 1 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400">
                                                            <CheckIcon className="w-3 h-3 mr-1" /> Checked In
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleCheckInClick(meeting)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-bold rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors"
                                                        >
                                                            Check In {meeting.is_paid == 1 ? (meeting.my_payment_status === 'pending' ? '(Pay)' : '') : ''}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-zinc-400 dark:text-zinc-500 text-sm italic">No upcoming meetings.</p>
            )}

            {/* Payment Modal */}
            {paymentModalOpen && selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-sm p-8 relative border border-zinc-100 dark:border-zinc-800">
                        <button onClick={() => setPaymentModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                            <XCircleIcon className="w-8 h-8" />
                        </button>
                        
                        <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Check-in & Pay</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                            This meeting requires a contribution.
                        </p>
                        
                        <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-xl mb-6 text-center border border-zinc-100 dark:border-zinc-800">
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-1">Amount to Pay</p>
                            <p className="text-3xl font-black text-zinc-900 dark:text-white">₹ {selectedMeeting.payment_amount}</p>
                        </div>

                        {selectedMeeting.payment_qr_image_url ? (
                            <div className="mb-6 flex flex-col items-center">
                                <p className="text-sm font-medium text-gray-700 mb-2">Scan QR to Pay</p>
                                <img src={selectedMeeting.payment_qr_image_url} alt="Payment QR" className="w-48 h-48 object-contain border rounded-lg" />
                            </div>
                        ) : (
                            <div className="mb-6 text-center text-gray-500 text-sm italic">
                                No QR Code available. Please pay at the venue.
                            </div>
                        )}

                        <div className="space-y-3">
                            <button 
                                onClick={() => handlePayment('paid_online')}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Paid Online (UPI/Bank)
                            </button>
                            <button 
                                onClick={() => handlePayment('paid_cash')}
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Paid Cash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default SidebarRight;
