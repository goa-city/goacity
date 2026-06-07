import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
    RocketLaunchIcon, 
    SparklesIcon, 
    UserGroupIcon, 
    AcademicCapIcon,
    UserIcon,
    CheckIcon,
    XMarkIcon,
    Cog6ToothIcon,
    CreditCardIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../features/auth/context/AuthContext';
import { useMentorship } from '../features/mentorship/hooks/useMentorship';
import { getProfilePhotoUrl } from '../utils/image';

const MentorshipStart: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { 
        myMentorships, 
        mentorProfile, 
        updateProfile, 
        updateStatus,
        isLoading 
    } = useMentorship();

    const [showSettings, setShowSettings] = useState(false);
    const [bio, setBio] = useState('');
    const [capacity, setCapacity] = useState(1);
    const [expertise, setExpertise] = useState('');
    const [price, setPrice] = useState('');
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [qrPreview, setQrPreview] = useState('');
    const [saving, setSaving] = useState(false);

    // Initializing settings fields when profile loads
    React.useEffect(() => {
        if (mentorProfile) {
            setBio(mentorProfile.bio || '');
            setCapacity(mentorProfile.capacity || 1);
            setExpertise(Array.isArray(mentorProfile.expertise) ? mentorProfile.expertise.join(', ') : '');
            setPrice(mentorProfile.default_session_price ? String(mentorProfile.default_session_price) : '');
            if (mentorProfile.payment_qr_image) {
                const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
                setQrPreview(`${baseUrl}/uploads/${mentorProfile.payment_qr_image}`);
            }
        }
    }, [mentorProfile]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('bio', bio);
            formData.append('capacity', String(capacity));
            formData.append('expertise', JSON.stringify(expertise.split(',').map(s => s.trim()).filter(Boolean)));
            formData.append('default_session_price', price);
            if (qrFile) {
                formData.append('payment_qr_image', qrFile);
            }
            await updateProfile(formData);
            setShowSettings(false);
        } catch (err) {
            console.error('Failed to update mentor profile:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleQrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setQrFile(file);
            setQrPreview(URL.createObjectURL(file));
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8" />
                    <h2 className="text-xl font-bold text-[#2D2D46] uppercase tracking-wider animate-pulse">Loading Workspace...</h2>
                </div>
            </DashboardLayout>
        );
    }

    const relations = myMentorships || [];
    const asMentee = relations.filter((r: any) => r.mentee_id === user?.id);
    const asMentor = relations.filter((r: any) => r.mentor_id === user?.id);
    
    // Filter pending/incoming requests (where user is mentor)
    const pendingRequests = asMentor.filter((r: any) => r.status === 'Requested');
    const activeMentees = asMentor.filter((r: any) => r.status === 'Active');
    const activeMentors = asMentee.filter((r: any) => r.status === 'Active' || r.status === 'Requested');

    const hasRelationships = relations.length > 0;

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-10 px-6">
                
                {/* ── Header Section ── */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46] tracking-tight uppercase italic flex items-center gap-3">
                            The Wisdom <span className="text-indigo-600">Exchange</span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm max-w-2xl">
                            A Kingdom-centered ecosystem designed for intentional growth, wisdom transfer, and leadership multiplication.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasRelationships && (
                            <button
                                onClick={() => navigate('/mentorship/assessment/mentorship-mentee-assessment')}
                                className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                            >
                                <RocketLaunchIcon className="w-4 h-4" />
                                Find a Mentor
                            </button>
                        )}
                        {mentorProfile?.is_mentor && (
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="px-5 py-2.5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                            >
                                <Cog6ToothIcon className="w-4 h-4" />
                                {mentorProfile.noProfile ? 'Become a Mentor' : 'Mentor Settings'}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Settings Panel (Slide down / Conditional inline card) ── */}
                {showSettings && (
                    <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-xl mb-10 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-indigo-600" />
                                Mentor Strategy Profile & Settings
                            </h2>
                            <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Expertise / Focus Areas</label>
                                    <input 
                                        type="text" 
                                        placeholder="Leadership, Tech, Faith-Work Integration (comma separated)"
                                        value={expertise}
                                        onChange={(e) => setExpertise(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Active Capacity</label>
                                        <input 
                                            type="number" 
                                            min="1"
                                            value={capacity}
                                            onChange={(e) => setCapacity(Number(e.target.value))}
                                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Session Price (₹)</label>
                                        <input 
                                            type="number" 
                                            placeholder="Leave blank if free"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Bio / Mentoring Philosophy</label>
                                <textarea 
                                    rows={3}
                                    placeholder="Tell potential mentees about your career path and Kingdom focus..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <CreditCardIcon className="w-5 h-5 text-indigo-500" />
                                    Payment QR Code (Required for paid sessions)
                                </label>
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleQrChange}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                    />
                                    {qrPreview && (
                                        <div className="w-24 h-24 border border-zinc-200 rounded-xl overflow-hidden shrink-0 shadow-inner bg-zinc-50 flex items-center justify-center p-2">
                                            <img src={qrPreview} alt="QR Preview" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowSettings(false)}
                                    className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Strategy Settings'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ── Empty State View (No Relationships) ── */}
                {!hasRelationships && (
                    <div className="animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                            <div className="bg-white p-10 rounded-[2rem] shadow-md border border-gray-100 hover:scale-102 transition-transform duration-300">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                    <SparklesIcon className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 uppercase italic mb-3">Intentional Growth</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Move beyond generic advice. Define smart goals, assign actionable homework, and track milestones along your journey.
                                </p>
                            </div>

                            <div className="bg-white p-10 rounded-[2rem] shadow-md border border-gray-100 hover:scale-102 transition-transform duration-300">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                    <UserGroupIcon className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 uppercase italic mb-3">Covenant Pairing</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Build relationships based on shared Kingdom marketplace values, ethics, and a mutual commitment to growth.
                                </p>
                            </div>

                            <div className="bg-white p-10 rounded-[2rem] shadow-md border border-gray-100 hover:scale-102 transition-transform duration-300">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                    <AcademicCapIcon className="w-7 h-7 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 uppercase italic mb-3">Wisdom Transfer</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed">
                                    Connect across generations. Learn from experienced industry mentors, log sessions, and upload reading materials.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-12 text-center shadow-inner">
                            <h2 className="text-2xl font-black text-[#2D2D46] uppercase italic mb-4">Start Your Mentorship Journey</h2>
                            <p className="text-gray-500 max-w-xl text-sm mb-8 leading-relaxed">
                                Complete our quick reflection form to clarify your professional goals and match with recommended Kingdom leaders.
                            </p>
                            <button 
                                onClick={() => navigate('/mentorship/assessment/mentorship-mentee-assessment')}
                                className="px-10 py-5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-2xl transition-all shadow-xl font-black uppercase tracking-wider text-xs flex items-center gap-3 active:scale-95"
                            >
                                Get Matched with a Mentor
                                <RocketLaunchIcon className="w-5 h-5 animate-bounce" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Active Dashboard State ── */}
                {hasRelationships && (
                    <div className="space-y-8 animate-fadeIn">
                        
                        {/* Pending incoming requests (For Mentors) */}
                        {pendingRequests.length > 0 && (
                            <div className="bg-amber-50/50 border border-amber-200/50 rounded-3xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                    <SparklesIcon className="w-5 h-5 text-amber-600" />
                                    Pending Mentee Connections ({pendingRequests.length})
                                </h2>
                                <div className="space-y-4">
                                    {pendingRequests.map((req: any) => (
                                        <div key={req.id} className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                                                    {req.mentee.profile_photo ? (
                                                        <img src={getProfilePhotoUrl(req.mentee.profile_photo)} alt={req.mentee.first_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700">
                                                            {req.mentee.first_name?.[0]}{req.mentee.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-zinc-950 text-sm">{req.mentee.first_name} {req.mentee.last_name}</h4>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 uppercase border border-amber-100 mt-1 inline-block">
                                                        {req.focus_area || 'Marketplace Growth'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button 
                                                    onClick={() => updateStatus({ id: req.id, status: 'Active' })}
                                                    className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors"
                                                    title="Accept Request"
                                                >
                                                    <CheckIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => updateStatus({ id: req.id, status: 'Declined' })}
                                                    className="p-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors"
                                                    title="Decline Request"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Mentors I am learning from */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide italic">
                                Mentors I am Learning From
                            </h2>
                            {activeMentors.length === 0 ? (
                                <div className="py-10 text-center bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                                    <p className="text-zinc-500 text-sm">You are not currently learning from any mentors.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeMentors.map((rel: any) => (
                                        <div key={rel.id} className="border border-gray-100 rounded-2xl p-5 hover:bg-zinc-50/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                                                    {rel.mentor.profile_photo ? (
                                                        <img src={getProfilePhotoUrl(rel.mentor.profile_photo)} alt={rel.mentor.first_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-sky-50 flex items-center justify-center font-bold text-sky-700 text-lg">
                                                            {rel.mentor.first_name?.[0]}{rel.mentor.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-extrabold text-[#2D2D46] text-base">{rel.mentor.first_name} {rel.mentor.last_name}</h3>
                                                        {rel.status === 'Requested' && (
                                                            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 uppercase tracking-widest border border-amber-100">Requested</span>
                                                        )}
                                                    </div>
                                                    <p className="text-zinc-500 text-xs mt-1">Focus Area: <span className="font-bold text-zinc-700">{rel.focus_area || 'General'}</span></p>
                                                    <p className="text-zinc-400 text-[10px] mt-0.5">Commitment: <span className="font-bold uppercase">{rel.type}</span></p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/dashboard/mentorship/${rel.id}`)}
                                                className="w-full sm:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 shrink-0"
                                            >
                                                Open Workspace
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mentees I am guiding */}
                        {activeMentees.length > 0 && (
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wide italic">
                                    Mentees I am Guiding
                                </h2>
                                <div className="space-y-4">
                                    {activeMentees.map((rel: any) => (
                                        <div key={rel.id} className="border border-gray-100 rounded-2xl p-5 hover:bg-zinc-50/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shrink-0">
                                                    {rel.mentee.profile_photo ? (
                                                        <img src={getProfilePhotoUrl(rel.mentee.profile_photo)} alt={rel.mentee.first_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-lg">
                                                            {rel.mentee.first_name?.[0]}{rel.mentee.last_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-extrabold text-[#2D2D46] text-base">{rel.mentee.first_name} {rel.mentee.last_name}</h3>
                                                    <p className="text-zinc-500 text-xs mt-1">Focus Area: <span className="font-bold text-zinc-700">{rel.focus_area || 'General'}</span></p>
                                                    <p className="text-zinc-400 text-[10px] mt-0.5">Commitment: <span className="font-bold uppercase">{rel.type}</span></p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/dashboard/mentorship/${rel.id}`)}
                                                className="w-full sm:w-auto px-5 py-2.5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 shrink-0"
                                            >
                                                Open Workspace
                                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default MentorshipStart;
