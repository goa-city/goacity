import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    ArrowDownTrayIcon, 
    NoSymbolIcon, 
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    XMarkIcon,
    EyeIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import { getProfilePhotoUrl } from '../../utils/image';

type TabType = 'active' | 'requests' | 'profiles';

const AdminMentorship: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('requests');
    const [relations, setRelations] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [selectedResponse, setSelectedResponse] = useState<any | null>(null);

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

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleMatch = (request: any) => {
        navigate(`/admin/mentorship/requests/${request.id}`);
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.put(`/admin/mentorship/relations/${id}/status`, { status });
            showToast(`Mentorship status updated to ${status}`);
            fetchData();
        } catch (error) {
            console.error(error);
            showToast('Failed to update status');
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
                                                    {request.answers.find((a: { field_key: string; answer_value?: string }) => a.field_key === 'mentee_category')?.answer_value || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white line-clamp-1">
                                                    {request.answers.find((a: { field_key: string; answer_value?: string }) => a.field_key === 'growth_area')?.answer_value || 'General'}
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
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading profiles...</div>
                        ) : profiles.length === 0 ? (
                            <div className="py-20 text-center">
                                <UserGroupIcon className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                                <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No mentor profiles submitted.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Member</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Form Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {profiles.map((profile) => (
                                        <tr key={profile.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <div 
                                                    className={`flex items-center gap-4 ${profile.reflectionResponse ? 'cursor-pointer group' : ''}`}
                                                    onClick={() => {
                                                        if (profile.reflectionResponse) {
                                                            setSelectedResponse(profile.reflectionResponse);
                                                        }
                                                    }}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 font-black text-sm overflow-hidden shrink-0">
                                                        {profile.member?.profile_photo ? (
                                                            <img src={getProfilePhotoUrl(profile.member.profile_photo)} alt={profile.member.first_name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            profile.member?.first_name?.[0]
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-black text-zinc-900 dark:text-white uppercase tracking-tight text-sm ${profile.reflectionResponse ? 'group-hover:text-indigo-600 transition-colors underline decoration-dotted' : ''}`}>
                                                            {profile.member?.first_name} {profile.member?.last_name}
                                                        </h4>
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{profile.member?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                                                    profile.reflectionResponse 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 cursor-pointer' 
                                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700'
                                                }`}
                                                onClick={() => {
                                                    if (profile.reflectionResponse) {
                                                        setSelectedResponse(profile.reflectionResponse);
                                                    }
                                                }}
                                                >
                                                    {profile.reflectionResponse ? 'SUBMITTED' : 'NOT SUBMITTED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
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
                                            onClick={() => navigate(`/admin/mentorship/relations/${relation.id}`)}
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
                                                    relation.status === 'Completed' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700' :
                                                    relation.status === 'Requested' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-zinc-50 text-zinc-400'
                                                }`}>
                                                    {relation.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/admin/mentorship/relations/${relation.id}`);
                                                        }} 
                                                        title="View Workspace" 
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-zinc-800 rounded-lg"
                                                    >
                                                        <EyeIcon className="w-5 h-5" />
                                                    </button>
                                                    {relation.status !== 'Completed' && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateStatus(relation.id, 'Declined');
                                                            }} 
                                                            title="Archive" 
                                                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg"
                                                        >
                                                            <NoSymbolIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
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
            {/* Reflection Form Submission Answers Modal */}
            {selectedResponse && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800 animate-fadeIn flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-100 dark:border-zinc-850 pb-4 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                                    {selectedResponse.form_title || 'Mentor Reflection Form'}
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                    Submitted {new Date(selectedResponse.submitted_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedResponse(null)} 
                                className="text-zinc-400 hover:text-zinc-650 dark:hover:text-white p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                            {selectedResponse.answers?.map((ans: any, idx: number) => (
                                <div key={idx} className="border-b border-zinc-50 dark:border-zinc-850 pb-4 last:border-0 last:pb-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-650 mb-1 leading-normal">
                                        {ans.field_label || ans.field_key}
                                    </p>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
                                        {ans.answer_value || <span className="text-zinc-300 italic font-normal">No answer submitted</span>}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-850 mt-6 shrink-0">
                            <Button 
                                onClick={() => setSelectedResponse(null)}
                                className="px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 !py-2.5"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminMentorship;
