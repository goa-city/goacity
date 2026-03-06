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
        <div className="flex flex-col bg-white p-6 
            w-full xl:w-80
            xl:fixed xl:right-0 xl:top-0 xl:h-screen xl:border-l xl:overflow-y-auto
            border-t xl:border-t-0 mt-8 xl:mt-0 pb-20
        ">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-bold text-gray-900">Meetings Calendar</h2>
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                     <BellIcon className="w-5 h-5 text-gray-600" />
                     {meetings.length > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full border-2 border-white"></span>
                     )}
                </button>
            </div>

            {/* Calendar List */}
            {meetings.length > 0 ? (
                <div className="flex flex-col gap-8">
                    {Object.keys(groupedMeetings).map((date) => (
                        <div key={date}>
                            <div className="flex justify-between items-center mb-4">
                                <span className={`text-xs font-bold uppercase ${date === todayStr ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {date === todayStr ? 'TODAY' : formatDateHeader(date)}
                                </span>
                            </div>

                            <div className="space-y-6">
                                {groupedMeetings[date].map((meeting) => (
                                    <div key={meeting.id} className="flex flex-col gap-2">
                                        <div className="flex gap-4">
                                            <div className="text-sm font-semibold text-gray-900 w-12 pt-0.5">{formatTime(meeting.start_time)}</div>
                                            <div className="pl-4 border-l-2 flex-1 pb-1" style={getBorderColor(meeting)}>
                                                <h4 className="text-sm font-medium text-gray-500">{meeting.title}</h4>
                                                <div className="flex items-center text-xs text-gray-400 mt-1">
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
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${meeting.my_rsvp === 'going' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                        <CheckCircleIcon className="w-4 h-4" />
                                                        <span>Going</span>
                                                    </button>
                                                    <button onClick={() => handleRSVP(meeting.id, 'not_sure')} 
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${meeting.my_rsvp === 'not_sure' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                        <QuestionMarkCircleIcon className="w-4 h-4" />
                                                        <span>Maybe</span>
                                                    </button>
                                                    <button onClick={() => handleRSVP(meeting.id, 'cant_go')} 
                                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${meeting.my_rsvp === 'cant_go' ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                                        <XCircleIcon className="w-4 h-4" />
                                                        <span>Can't Go</span>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="mt-1">
                                                    {meeting.my_checkin == 1 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckIcon className="w-3 h-3 mr-1" /> Checked In
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleCheckInClick(meeting)}
                                                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
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
                <p className="text-gray-400 text-sm">No upcoming meetings.</p>
            )}

            {/* Payment Modal */}
            {paymentModalOpen && selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                        <button onClick={() => setPaymentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Check-in & Pay</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            This meeting requires a payment.
                        </p>
                        
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
                            <p className="text-xs text-gray-500 uppercase">Amount to Pay</p>
                            <p className="text-2xl font-bold text-gray-900">₹ {selectedMeeting.payment_amount}</p>
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
