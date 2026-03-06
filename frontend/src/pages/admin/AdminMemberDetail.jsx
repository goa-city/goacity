import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    ArrowLeftIcon, UserCircleIcon, ClipboardDocumentListIcon, 
    SignalIcon, ChevronDownIcon, ChevronUpIcon, IdentificationIcon,
    CalendarIcon, AcademicCapIcon, MapPinIcon, EnvelopeIcon, PhoneIcon
} from '@heroicons/react/24/outline';

const AdminMemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [streams, setStreams] = useState([]);
    const [editStreams, setEditStreams] = useState([]);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    
    // For Basic Info Editing
    const [editBasic, setEditBasic] = useState({
        first_name: '', last_name: '', email: '', phone: ''
    });

    // For Accordion
    const [openResponses, setOpenResponses] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, streamsRes] = await Promise.all([
                    api.get(`/admin/users?id=${id}`),
                    api.get('/admin/streams')
                ]);
                setUser(userRes.data);
                setStreams(streamsRes.data);
                setEditStreams(userRes.data.stream_ids ? userRes.data.stream_ids.map(String) : []);
                setEditBasic({
                    first_name: userRes.data.first_name || '',
                    last_name: userRes.data.last_name || '',
                    email: userRes.data.email || '',
                    phone: userRes.data.phone || ''
                });
            } catch (error) {
                console.error("Failed to load member data", error);
                navigate('/admin/members');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const toggleStream = (streamId) => {
        const idStr = String(streamId);
        if (editStreams.includes(idStr)) {
            setEditStreams(editStreams.filter(id => id !== idStr));
        } else {
            setEditStreams([...editStreams, idStr]);
        }
    };

    const handleSaveStreams = async () => {
        setSaving(true);
        try {
            await api.put('/admin/users', {
                user_id: id,
                stream_ids: editStreams
            });
            showToast("Streams updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update streams.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBasic = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/admin/users', {
                user_id: id,
                first_name: editBasic.first_name,
                last_name: editBasic.last_name,
                email: editBasic.email,
                phone: editBasic.phone
            });
            setUser({ ...user, ...editBasic });
            showToast("Member updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update member.");
        } finally {
            setSaving(false);
        }
    };

    const toggleAccordion = (respId) => {
        setOpenResponses(prev => ({ ...prev, [respId]: !prev[respId] }));
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading member profile...</div>;
    if (!user) return null;

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            <button
                onClick={() => navigate('/admin/members')}
                className="flex items-center text-gray-500 hover:text-sky-600 transition-colors mb-8 group text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Directory
            </button>

            {/* Header / Identity */}
            <div className="admin-card mb-8">
                <div className="p-8 flex flex-wrap items-center gap-6 bg-indigo-50/20">
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-sm flex items-center justify-center border border-indigo-100 overflow-hidden shrink-0">
                        {user.profile_photo ? (
                            <img src={`http://localhost:8000/${user.profile_photo}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircleIcon className="w-16 h-16 text-indigo-200" />
                        )}
                    </div>
                    <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-black text-gray-900">{user.first_name} {user.last_name}</h1>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5"><EnvelopeIcon className="w-4 h-4 text-gray-300" />{user.email || 'No Email'}</span>
                            <span className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4 text-gray-300" />{user.phone || 'No Phone'}</span>
                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-gray-300" />Joined {new Date(user.created_at).toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                         <div className="px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-center min-w-[100px]">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Meetings</p>
                            <p className="text-xl font-black text-indigo-600 leading-none">{user.meeting_count || 0}</p>
                         </div>
                         <div className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${user.is_onboarded == 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {user.is_onboarded == 1 ? "Fully Onboarded" : "Onboarding Pending"}
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Basic Info & Access */}
                <div className="space-y-8">
                    {/* Edit Form */}
                    <div className="admin-card">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <IdentificationIcon className="w-5 h-5 text-indigo-500" /> Profile Details
                            </h3>
                        </div>
                        <form onSubmit={handleSaveBasic} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">First Name</label>
                                    <input required type="text" value={editBasic.first_name} onChange={(e) => setEditBasic({...editBasic, first_name: e.target.value})} className="admin-input" />
                                </div>
                                <div>
                                    <label className="admin-label">Last Name</label>
                                    <input required type="text" value={editBasic.last_name} onChange={(e) => setEditBasic({...editBasic, last_name: e.target.value})} className="admin-input" />
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">Email Address</label>
                                <input required type="email" value={editBasic.email} onChange={(e) => setEditBasic({...editBasic, email: e.target.value})} className="admin-input" />
                            </div>
                            <div>
                                <label className="admin-label">Phone Number</label>
                                <input required type="text" value={editBasic.phone} onChange={(e) => setEditBasic({...editBasic, phone: e.target.value})} className="admin-input" />
                            </div>
                            <button type="submit" disabled={saving} className="admin-button-primary w-full justify-center py-2.5">
                                {saving ? "Saving..." : "Update Profile"}
                            </button>
                        </form>
                    </div>

                    {/* Stream Management */}
                    <div className="admin-card">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <SignalIcon className="w-5 h-5 text-indigo-500" /> Stream Access
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {streams.map(stream => (
                                <label key={stream.id} className="flex items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50/50">
                                    <input 
                                        type="checkbox" checked={editStreams.includes(String(stream.id))}
                                        onChange={() => toggleStream(stream.id)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <div className="ml-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: stream.color}}></span>
                                        <span className="text-sm font-semibold text-gray-700">{stream.name}</span>
                                    </div>
                                </label>
                            ))}
                            <button onClick={handleSaveStreams} disabled={saving} className="admin-button-primary w-full justify-center bg-slate-800 hover:bg-slate-900 mt-4 py-2.5">
                                {saving ? 'Saving...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Responses & Profile */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Dynamic Profile */}
                    <div className="admin-card">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <AcademicCapIcon className="w-5 h-5 text-indigo-500" /> Member attributes
                            </h3>
                        </div>
                        <div className="p-8">
                            {user.member_profile && Object.keys(user.member_profile).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                                     {Object.entries(user.member_profile).map(([key, value]) => (
                                         <div key={key}>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{key.replace(/_/g, ' ')}</label>
                                            <p className="text-sm text-gray-700 font-medium">
                                                {Array.isArray(value) ? value.join(', ') : (typeof value === 'object' ? JSON.stringify(value) : (String(value) || <span className="text-gray-300 italic">No value</span>))}
                                            </p>
                                         </div>
                                     ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <MapPinIcon className="w-8 h-8 text-gray-100 mx-auto mb-3" />
                                    <p className="text-sm text-gray-400 italic">No custom profile attributes recorded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Onboarding Responses */}
                    <div className="admin-card">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-500" /> Interaction History
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {user.form_responses && user.form_responses.length > 0 ? (
                                user.form_responses.map((resp) => (
                                    <div key={resp.response_id} className="border border-gray-100 rounded-2xl overflow-hidden group">
                                        <button 
                                            type="button" onClick={() => toggleAccordion(resp.response_id)}
                                            className="w-full px-6 py-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900 text-left">{resp.form_title}</p>
                                                <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wider">
                                                    Submitted: {new Date(resp.submitted_at).toLocaleDateString("en-GB")}
                                                </p>
                                            </div>
                                            <div className="p-1 bgColor-white rounded-lg border border-gray-200 group-hover:border-slate-400 transition-colors">
                                                {openResponses[resp.response_id] ? (
                                                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                                                ) : (
                                                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                        </button>
                                        
                                        {openResponses[resp.response_id] && (
                                            <div className="p-6 bg-white border-t border-gray-100 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                                    {resp.answers && resp.answers.length > 0 ? resp.answers.map((answer, i) => (
                                                        <div key={i}>
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{answer.label}</label>
                                                            <p className="text-sm text-gray-700 font-medium whitespace-pre-wrap">
                                                                {typeof answer.value === 'object' ? JSON.stringify(answer.value, null, 2) : (String(answer.value) || <span className="text-gray-200">-</span>)}
                                                            </p>
                                                        </div>
                                                    )) : (
                                                        <p className="text-sm text-gray-300 italic col-span-2">No data captured.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center text-gray-300 italic text-sm">No submissions recorded.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMemberDetail;
