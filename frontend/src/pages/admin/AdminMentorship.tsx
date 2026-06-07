import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
    ArrowDownTrayIcon, 
    HandThumbDownIcon, 
    NoSymbolIcon, 
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    CheckCircleIcon,
    PencilIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

type TabType = 'active' | 'requests' | 'profiles';

const AdminMentorship: React.FC = () => {
    const { adminUser } = useAdminAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('requests');
    const [relations, setRelations] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [mentors, setMentors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'active') {
                const res = await api.get('/admin/mentorship');
                setRelations(res.data.data || []);
            } else if (activeTab === 'requests') {
                const res = await api.get('/admin/mentorship/requests');
                setRequests(res.data.data || []);
            } else if (activeTab === 'profiles') {
                const res = await api.get('/admin/mentorship/profiles');
                setProfiles(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load mentorship data", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMentors = async () => {
        try {
            const res = await api.get('/admin/mentorship/mentors');
            setMentors(res.data.data || []);
        } catch (err) {
            console.error("Failed to fetch mentors", err);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleMatch = (request: any) => {
        navigate(`/admin/mentorship/requests/${request.id}`);
    };

    const finalizeMatch = async (mentor: any) => {
        setMatchingInProgress(true);
        try {
            // Get focus area from assessment answers if possible
            const focusArea = selectedRequest.answers.find(a => a.field_key === 'growth_area')?.answer_value || 'Professional Growth';
            
            await api.post('/admin/mentorship/match', {
                mentee_id: selectedRequest.user_id,
                mentor_id: mentor.id,
                focus_area: focusArea,
                type: 'Long-term'
            });
            
            showToast(`Covenant pair created successfully!`);
            setMatchModalOpen(false);
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Failed to create mentorship pairing');
        } finally {
            setMatchingInProgress(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/admin/mentorship/${id}/status`, { status });
            showToast(`Mentorship status updated to ${status}`);
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Failed to update status');
        }
    };

    const toggleApproval = async (userId: number, isApproved: boolean) => {
        try {
            await api.post(`/admin/mentorship/${userId}/approve`, { is_approved: isApproved });
            showToast(isApproved ? 'Mentor profile approved!' : 'Mentor profile unapproved');
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Failed to update approval status');
        }
    };

    const exportReport = async () => {
        try {
            const res = await api.get('/admin/mentorship/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'mentorship_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            showToast('Export failed');
        }
    };

    const filteredMentors = mentors.filter(m => 
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(mentorSearch.toLowerCase()) ||
        m.mentorProfile?.expertise?.some(e => e.toLowerCase().includes(mentorSearch.toLowerCase()))
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}
            
            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Mentorship Hub
                        <UserGroupIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Manual matching and relationship management.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={exportReport}
                        className="px-8 shadow-xl shadow-indigo-600/20"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-max">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    Pending Requests ({requests.length})
                </button>
                <button 
                    onClick={() => setActiveTab('profiles')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profiles' ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    Mentor Profiles
                </button>
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
                >
                    Active Relations
                </button>
            </div>

            {activeTab === 'requests' && (
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading requests...</div>
                        ) : requests.length === 0 ? (
                            <div className="py-20 text-center">
                                <ClipboardDocumentCheckIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No pending mentorship requests.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Member</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Category</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Growth Area</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Submitted</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {requests.map((request) => (
                                        <tr key={request.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 font-black text-sm">
                                                        {request.user?.first_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-sm">{request.user?.first_name} {request.user?.last_name}</h4>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{request.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                                    {request.answers.find(a => a.field_key === 'mentee_category')?.answer_value || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white line-clamp-1">
                                                    {request.answers.find(a => a.field_key === 'growth_area')?.answer_value || 'General'}
                                                </p>
                                            </td>
                                            <td className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                {new Date(request.submitted_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Button 
                                                    onClick={() => handleMatch(request)}
                                                    className="px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 !py-2"
                                                >
                                                    Review & Match
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            )}

            {activeTab === 'profiles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading profiles...</div>
                    ) : profiles.length === 0 ? (
                        <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                            <UserGroupIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No mentor profiles submitted.</p>
                        </div>
                    ) : (
                        profiles.map((profile) => (
                            <Card key={profile.id} className="p-6 border-zinc-100 dark:border-zinc-800 hover:shadow-2xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 text-xl">
                                            {profile.member?.first_name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-sm">{profile.member?.first_name} {profile.member?.last_name}</h3>
                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mentor Candidate</p>
                                        </div>
                                    </div>
                                    {profile.is_approved ? (
                                        <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
                                    ) : (
                                        <NoSymbolIcon className="w-8 h-8 text-zinc-200" />
                                    )}
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Expertise</p>
                                        <div className="flex flex-wrap gap-1">
                                            {profile.expertise?.map((e: string) => (
                                                <span key={e} className="text-[10px] font-bold bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded text-zinc-500 border border-zinc-100 dark:border-zinc-800">{e}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Bio</p>
                                        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 line-clamp-3">{profile.bio}</p>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => toggleApproval(profile.member_id, !profile.is_approved)}
                                    className={`w-full ${profile.is_approved ? 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'}`}
                                >
                                    {profile.is_approved ? 'Revoke Approval' : 'Approve Mentor'}
                                </Button>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'active' && (
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading relations...</div>
                        ) : relations.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No active mentorship relations.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Covenant Pair</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Focus / Type</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Progress</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {relations.map((relation) => (
                                        <tr 
                                            key={relation.id} 
                                            onClick={() => relation.request_id && navigate(`/admin/mentorship/requests/${relation.request_id}`)}
                                            className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1 rounded-lg w-max">
                                                        Mentor: {relation.mentor?.first_name} {relation.mentor?.last_name}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-lg w-max">
                                                        Mentee: {relation.mentee?.first_name} {relation.mentee?.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">{relation.focus_area || 'General'}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-2 py-1 rounded-md w-max mt-2 border border-sky-100 dark:border-sky-900/50">{relation.type}</p>
                                            </td>
                                            <td className="px-8 py-5 text-sm font-black text-zinc-400 uppercase tracking-[0.2em]">
                                                {relation._count?.sessions || 0} Sessions
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                                    relation.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                    relation.status === 'Requested' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-zinc-50 text-zinc-400'
                                                }`}>
                                                    {relation.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {relation.request_id && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/admin/mentorship/requests/${relation.request_id}`);
                                                            }} 
                                                            title="Edit Assignment" 
                                                            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-850 rounded-xl"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateStatus(relation.id, 'Declined');
                                                        }} 
                                                        title="Archive" 
                                                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                                                    >
                                                        <NoSymbolIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            )}

        </div>
    );
};

export default AdminMentorship;
