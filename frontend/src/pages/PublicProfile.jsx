import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { BriefcaseIcon, HandRaisedIcon, LinkIcon } from '@heroicons/react/24/outline';

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    // Collaboration Request Modal State
    const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
    const [collabType, setCollabType] = useState('Paid');
    const [collabDesc, setCollabDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await api.get(`/profile/${id}`);
            setMember(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCollabRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/collaboration/request', {
                provider_id: member.id,
                type: collabType,
                description: collabDesc
            });
            alert('Collaboration requested successfully! Pending Admin Approval.');
            setIsCollabModalOpen(false);
        } catch (error) {
            console.error('Request failed:', error);
            alert('Failed to request collaboration.');
        } finally {
            setSubmitting(false);
            setCollabDesc('');
        }
    };

    const triggerDevAutoTest = async () => {
        try {
            await api.post(`/dev/collab-test/${id}`);
            alert('Auto-Test ran successfully.');
            fetchProfile(); // reload profile to show services
        } catch (err) {
            console.error(err);
            alert('Dev auto-test failed');
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
        </DashboardLayout>
    );

    if (!member) return (
        <DashboardLayout>
            <div className="text-center py-20 text-gray-500 font-bold">Member mapping not found.</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            {/* Developer Mode Banner (Hidden normally, but rendered for dev as requested) */}
            {import.meta.env.MODE === 'development' && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 flex justify-between items-center text-orange-900 shadow-sm">
                    <div>
                        <span className="font-bold block">Developer Auto-Test My People & Collab</span>
                        <span className="text-xs">Automatically seed services & initiate collaboration requests.</span>
                    </div>
                    <button 
                        onClick={triggerDevAutoTest}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 font-bold rounded-lg text-sm shadow-sm transition-colors"
                    >
                        Auto-Run Initializer
                    </button>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-8 slide-in-bottom relative">
                <div className="h-32 bg-slate-900 w-full relative">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 via-sky-600 to-transparent"></div>
                </div>
                
                <div className="px-8 pb-8 relative">
                    <div className="flex justify-between items-end -mt-16 mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-slate-100 text-slate-800 flex items-center justify-center text-4xl font-extrabold flex-shrink-0 relative overflow-hidden group">
                            {member.profile_photo ? (
                                <img src={member.profile_photo} alt={member.first_name} className="w-full h-full object-cover" />
                            ) : (
                                `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`
                            )}
                        </div>
                        <div className="pb-2">
                            <button 
                                onClick={() => setIsCollabModalOpen(true)}
                                className="bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white px-6 py-3 rounded-xl font-bold font-sans shadow-lg hover:shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                            >
                                <HandRaisedIcon className="w-5 h-5" />
                                Propose Collab
                            </button>
                        </div>
                    </div>

                    <h1 className="text-3xl font-black text-gray-900 leading-tight">
                        {member.first_name} {member.last_name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2 font-medium text-gray-500">
                        {member.job_title && <span className="flex items-center gap-1.5"><BriefcaseIcon className="w-4 h-4"/>{member.job_title}</span>}
                        {member.businesses?.[0]?.business_name && (
                            <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-100 text-sm">{member.businesses[0].business_name}</span>
                        )}
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-lg text-sm uppercase tracking-widest font-black leading-tight shadow-inner">
                            {member.role || 'Member'}
                        </span>
                    </div>

                    {member.bio && (
                        <p className="mt-8 text-gray-600 leading-relaxed font-serif max-w-3xl">
                            {member.bio}
                        </p>
                    )}
                </div>
            </div>

            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Service Marketplace</h3>
            {member.services && member.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {member.services.map(srv => (
                        <div key={srv.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 flex items-center justify-end pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                                <LinkIcon className="w-16 h-16 text-slate-800" />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                                    srv.type === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                                }`}>
                                    {srv.type}
                                </span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2 relative z-10">{srv.title}</h4>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 block relative z-10">{srv.description || 'Offers specialized collaboration and services in this area.'}</p>
                            
                            <button 
                                onClick={() => {
                                    setCollabType(srv.type);
                                    setIsCollabModalOpen(true);
                                }}
                                className="text-sky-600 text-sm font-bold bg-sky-50 px-4 py-2 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors block w-max mt-auto relative z-10"
                            >
                                Request Service
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-2xl text-center flex flex-col items-center">
                    <p className="text-gray-500 font-medium my-2">No active marketplace listings linked to this profile.</p>
                </div>
            )}

            {/* Collab Request Modal */}
            {isCollabModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-1">Collaboration Request</h3>
                            <p className="text-gray-500 text-sm mb-6">Outline your intent with <span className="font-bold">{member.first_name}</span>.</p>

                            <form onSubmit={handleCollabRequest}>
                                <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-3">
                                    <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">Collab Method</label>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="type" 
                                                value="Paid"
                                                checked={collabType === 'Paid'}
                                                onChange={e => setCollabType(e.target.value)}
                                                className="w-4 h-4 text-sky-500 border-slate-300 focus:ring-sky-500 cursor-pointer"
                                            />
                                            <span className="font-medium text-slate-800 group-hover:text-sky-700">Paid Service</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input 
                                                type="radio" 
                                                name="type" 
                                                value="Gifted"
                                                checked={collabType === 'Gifted'}
                                                onChange={e => setCollabType(e.target.value)}
                                                className="w-4 h-4 text-sky-500 border-slate-300 focus:ring-sky-500 cursor-pointer"
                                            />
                                            <span className="font-medium text-slate-800 group-hover:text-sky-700">Gifted/Mentorship</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Scope & Vision</label>
                                    <textarea 
                                        className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-sky-500 outline-none resize-none text-gray-900 bg-gray-50 leading-relaxed min-h-[140px]"
                                        required
                                        placeholder="Describe the project specifics or questions..."
                                        value={collabDesc}
                                        onChange={e => setCollabDesc(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCollabModalOpen(false)}
                                        className="flex-1 py-3.5 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 border border-gray-200 shadow-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="flex-1 py-3.5 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 disabled:opacity-50 transition-colors"
                                    >
                                        {submitting ? 'Sending Request...' : 'Send Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default PublicProfile;
