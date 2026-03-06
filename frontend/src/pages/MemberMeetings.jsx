import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
    CalendarDaysIcon, 
    MapPinIcon, 
    CheckCircleIcon, 
    QuestionMarkCircleIcon, 
    XCircleIcon, 
    XMarkIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const MemberMeetings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const userIdParam = user ? `?user_id=${user.id}` : '';
                const res = await api.get(`/meetings${userIdParam}`);
                setMeetings(res.data);
            } catch (error) {
                console.error("Failed to fetch meetings", error);
            } finally {
                setLoading(false);
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
            setSelectedMeeting(meeting);
            setPaymentModalOpen(true);
        } else {
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
                value: method
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

    const getTodayStr = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return (new Date(d - offset)).toISOString().slice(0, 10);
    };
    const todayStr = getTodayStr();

    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const formatTime = (timeStr) => timeStr?.substring(0, 5) || ''; 

    // Filter current vs past meetings
    const upcomingMeetings = meetings.filter(m => m.meeting_date >= todayStr);
    const pastMeetings = meetings.filter(m => m.meeting_date < todayStr);
    
    // Group past meetings by stream
    const pastMeetingsByStream = pastMeetings.reduce((acc, meeting) => {
        const stream = meeting.stream_name || 'General';
        if (!acc[stream]) acc[stream] = [];
        acc[stream].push(meeting);
        return acc;
    }, {});

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#2D2D46]">Meetings</h1>
                <p className="text-gray-500 mt-2">Manage your stream events, RSVP, and check in below.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="max-w-3xl">
                    {/* UPCOMING / TODAY MEETINGS */}
                    <div>
                        <h2 className="text-xl font-bold border-b pb-2 mb-6 text-indigo-900 border-indigo-100 uppercase tracking-widest text-sm">Upcoming & Today</h2>
                        {upcomingMeetings.length === 0 ? (
                            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-dashed border-gray-300">
                                <p className="text-gray-500">No upcoming meetings scheduled.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {upcomingMeetings.map(meeting => (
                                    <MeetingCard 
                                        key={meeting.id} 
                                        meeting={meeting} 
                                        todayStr={todayStr}
                                        navigate={navigate}
                                        onRSVP={handleRSVP}
                                        onCheckIn={() => handleCheckInClick(meeting)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* PAST MEETINGS GROUPED BY STREAM */}
                    {pastMeetings.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Past Meetings & Recaps</h2>
                            <div className="space-y-12">
                                {Object.keys(pastMeetingsByStream).map((streamName) => (
                                    <div key={streamName}>
                                        <h3 className="text-lg font-bold border-b pb-2 mb-6 text-gray-600 border-gray-200 uppercase tracking-widest text-sm">
                                            {streamName} Stream
                                        </h3>
                                        <div className="space-y-4">
                                            {pastMeetingsByStream[streamName].map(meeting => (
                                                <MeetingCard 
                                                    key={meeting.id} 
                                                    meeting={meeting} 
                                                    todayStr={todayStr}
                                                    navigate={navigate}
                                                    onRSVP={handleRSVP}
                                                    onCheckIn={() => handleCheckInClick(meeting)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            {paymentModalOpen && selectedMeeting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                        <button onClick={() => setPaymentModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-500">
                            <XMarkIcon className="w-6 h-6" />
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
                                className="w-full px-6 py-2.5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2"
                            >
                                Paid Online (UPI/Bank)
                            </button>
                            <button 
                                onClick={() => handlePayment('paid_cash')}
                                className="w-full px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm inline-flex items-center justify-center gap-2"
                            >
                                Paid Cash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );

    function MeetingCard({ meeting, todayStr, navigate, onRSVP, onCheckIn }) {
        const isPast = meeting.meeting_date < todayStr;
        const isToday = meeting.meeting_date === todayStr;

        return (
            <div className={`bg-white rounded-2xl p-5 shadow-sm border-2 overflow-hidden transition-all ${isToday ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-indigo-100' : 'border-transparent hover:border-gray-100 relative'}`}>
                {meeting.stream_color && (
                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: meeting.stream_color }}></div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                    <div className={meeting.stream_color ? "pl-3" : ""}>
                        <div className="flex items-center gap-2 mb-1">
                            {meeting.stream_name && (
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                    {meeting.stream_name}
                                </span>
                            )}
                            <span className={`text-xs font-bold uppercase ${isToday ? 'text-indigo-600' : (isPast ? 'text-gray-400' : 'text-sky-600')}`}>
                                {isToday ? 'TODAY' : formatDateHeader(meeting.meeting_date)} at {formatTime(meeting.start_time)}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {meeting.location_name || 'TBA'}
                        </div>
                    </div>
                    {meeting.is_paid == 1 && (
                        <div className="shrink-0 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center">
                            ₹ {meeting.payment_amount}
                        </div>
                    )}
                </div>

                <div className={`pt-4 border-t border-gray-50 flex items-center justify-between ${meeting.stream_color ? 'pl-3' : ''}`}>
                    {/* Actions Block */}
                    {!isPast ? (
                        <div className="flex gap-2 w-full">
                            {isToday ? (
                                <div className="w-full">
                                    {meeting.my_checkin == 1 ? (
                                        <div className="flex justify-between items-center w-full">
                                             <span className="inline-flex items-center text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                                                <CheckIcon className="w-5 h-5 mr-2" /> Checked In
                                            </span>
                                            <button 
                                                onClick={() => navigate(`/meetings/${meeting.id}`)}
                                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center group"
                                            >
                                                Meeting Resources <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={onCheckIn}
                                            className="w-full px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2"
                                        >
                                            Check In Now {meeting.is_paid == 1 ? (meeting.my_payment_status === 'pending' ? '(Includes Payment)' : '') : ''}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => onRSVP(meeting.id, 'going')} 
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${meeting.my_rsvp === 'going' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                                        <CheckCircleIcon className="w-5 h-5" />
                                        Going
                                    </button>
                                    <button onClick={() => onRSVP(meeting.id, 'not_sure')} 
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${meeting.my_rsvp === 'not_sure' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                                        <QuestionMarkCircleIcon className="w-5 h-5" />
                                        Maybe
                                    </button>
                                    <button onClick={() => onRSVP(meeting.id, 'cant_go')} 
                                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${meeting.my_rsvp === 'cant_go' ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                                        <XCircleIcon className="w-5 h-5" />
                                        Can't Go
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // IS PAST MEETING
                        <div className="flex items-center justify-between w-full">
                            <span className="text-gray-500 text-sm font-medium">
                                {meeting.my_checkin == 1 
                                    ? <span className="text-green-600">Attended ✔</span> 
                                    : (meeting.my_rsvp === 'going' 
                                        ? 'RSVP: Going (Not checked in)' 
                                        : 'Event Concluded')}
                            </span>
                            
                            {/* Recap Button (Always show for past meetings so they can view notes) */}
                            <button 
                                onClick={() => navigate(`/meetings/${meeting.id}`)}
                                className="bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold px-4 py-2 rounded-xl text-sm transition-colors border border-sky-100 shadow-sm"
                            >
                                Open Recap / Notes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default MemberMeetings;
