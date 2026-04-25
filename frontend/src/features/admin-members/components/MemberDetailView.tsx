import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminMembers } from '../hooks/useAdminMembers';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import httpClient from '../../../shared/api/httpClient';
import { 
    ArrowLeftIcon, 
    UserCircleIcon, 
    ClipboardDocumentListIcon,
    SignalIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    IdentificationIcon,
    AcademicCapIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    CheckIcon
} from '@heroicons/react/24/solid';

const MemberDetailView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { member, isLoading, updateMember, isUpdating } = useAdminMembers(Number(id));

    const [editBasic, setEditBasic] = useState({ first_name: '', last_name: '', email: '', phone: '' });
    const [openResponses, setOpenResponses] = useState<Record<number, boolean>>({});
    const [allStreams, setAllStreams] = useState<any[]>([]);
    const [showStreamPicker, setShowStreamPicker] = useState(false);

    useEffect(() => {
        if (member) {
            setEditBasic({
                first_name: member.first_name || '',
                last_name: member.last_name || '',
                email: member.email || '',
                phone: member.phone || ''
            });
        }
    }, [member]);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const { data } = await httpClient.get('/admin/streams');
                setAllStreams(data);
            } catch (e) { console.error(e); }
        };
        fetchStreams();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateMember(editBasic);
    };

    const toggleStream = async (streamId: number) => {
        const currentIds = member?.stream_ids || [];
        let newIds: number[];
        if (currentIds.includes(streamId)) {
            newIds = currentIds.filter(id => id !== streamId);
        } else {
            newIds = [...currentIds, streamId];
        }
        await updateMember({ stream_ids: newIds });
    };

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-center tracking-widest">Retrieving deep profile metrics...</div>;
    if (!member) return null;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <Button variant="ghost" onClick={() => navigate('/admin/members')} className="mb-8 text-zinc-500 font-black uppercase text-xs tracking-widest group">
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Directory
            </Button>

            {/* Identity Header */}
            <Card className="mb-10 border-zinc-100 dark:border-zinc-800 bg-indigo-50/20 dark:bg-indigo-950/10 overflow-hidden">
                <CardContent className="p-10 flex flex-wrap items-center gap-8">
                    <div className="w-28 h-28 rounded-xl bg-white dark:bg-zinc-900 shadow-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 overflow-hidden">
                        <UserCircleIcon className="w-20 h-20 text-indigo-100 dark:text-indigo-900/50" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-none">
                                {member.first_name} {member.last_name}
                            </h1>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                member.role === 'admin' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'
                            }`}>
                                {member.role}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-6 text-zinc-500 dark:text-zinc-400 font-bold text-sm">
                            <span className="flex items-center gap-2"><EnvelopeIcon className="w-4 h-4 text-zinc-300" /> {member.email}</span>
                            <span className="flex items-center gap-2"><PhoneIcon className="w-4 h-4 text-zinc-300" /> {member.phone || 'No phone'}</span>
                            <span className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-zinc-300" /> Joined {new Date(member.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 px-8 py-5 rounded-xl shadow-xl shadow-indigo-600/5 border border-zinc-100 dark:border-zinc-800 text-center min-w-[140px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Meetings Attended</p>
                        <p className="text-4xl font-black text-indigo-600">{member.meeting_count || 0}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Edit */}
                <div className="space-y-8">
                    <Card className="border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <CardContent className="p-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2">
                                <IdentificationIcon className="w-4 h-4 text-indigo-600" /> Profile Access
                            </h3>
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name" value={editBasic.first_name} onChange={(e) => setEditBasic({...editBasic, first_name: e.target.value})} />
                                    <Input label="Last Name" value={editBasic.last_name} onChange={(e) => setEditBasic({...editBasic, last_name: e.target.value})} />
                                </div>
                                <Input label="Email" value={editBasic.email} onChange={(e) => setEditBasic({...editBasic, email: e.target.value})} />
                                <Input label="Phone" value={editBasic.phone} onChange={(e) => setEditBasic({...editBasic, phone: e.target.value})} />
                                <Button type="submit" isLoading={isUpdating} className="w-full rounded-xl h-12 shadow-lg shadow-indigo-600/10">
                                    Update Details
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                    <SignalIcon className="w-4 h-4 text-indigo-600" /> Stream Enrollment
                                </h3>
                                <button 
                                    onClick={() => setShowStreamPicker(!showStreamPicker)}
                                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>

                            {showStreamPicker && (
                                <div className="mb-6 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 space-y-2 animate-in fade-in slide-in-from-top-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Available Streams</p>
                                    {allStreams.map(s => (
                                        <button 
                                            key={s.id} 
                                            onClick={() => toggleStream(s.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-zinc-800 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{s.name}</span>
                                            </div>
                                            {member.stream_ids?.includes(s.id) && <CheckIcon className="w-4 h-4 text-indigo-500" />}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="space-y-3">
                                {member.streams?.map(s => (
                                    <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-sm font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{s.name}</span>
                                    </div>
                                ))}
                                {member.streams?.length === 0 && (
                                    <p className="text-center py-4 text-xs text-zinc-400 italic">No active enrollments.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Profile Attributes - only show when onboarding is complete */}
                    {member.has_completed_onboarding && (
                    <Card className="border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <CardContent className="p-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4 text-indigo-600" /> Profile Attributes
                            </h3>
                            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {member.profile_attributes?.map((attr, idx) => (
                                    <div key={idx} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-48">{attr.label}</span>
                                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{attr.value || <span className="text-zinc-300 italic font-normal">Not set</span>}</span>
                                    </div>
                                ))}
                                {(!member.profile_attributes || member.profile_attributes.length === 0) && (
                                    <p className="py-8 text-center text-zinc-400 font-medium italic">No profile attributes synced yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Form History - only completed submissions */}
                    <Card className="border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <CardContent className="p-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2">
                                <ClipboardDocumentListIcon className="w-4 h-4 text-indigo-600" /> Form Submissions
                            </h3>
                            
                            <div className="space-y-4">
                                {member.form_responses?.map((resp) => (
                                    <div key={resp.response_id} className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                                        <button 
                                            onClick={() => setOpenResponses(prev => ({ ...prev, [resp.response_id]: !prev[resp.response_id] }))}
                                            className="w-full flex items-center justify-between p-6 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-tight">{resp.form_title}</span>
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Submitted {resp.submitted_at}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {openResponses[resp.response_id] ? <ChevronUpIcon className="w-4 h-4 text-zinc-400" /> : <ChevronDownIcon className="w-4 h-4 text-zinc-400" />}
                                            </div>
                                        </button>
                                        
                                        {openResponses[resp.response_id] && (
                                            <div className="p-6 bg-white dark:bg-zinc-950 space-y-4 divide-y divide-zinc-50 dark:divide-zinc-900">
                                                {resp.answers.map((ans, aidx) => (
                                                    <div key={aidx} className="pt-4 first:pt-0">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{ans.label}</p>
                                                        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{ans.value || <span className="text-zinc-200 italic font-normal">No answer</span>}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {(!member.form_responses || member.form_responses.length === 0) && (
                                    <div className="py-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                                        <p className="text-zinc-300 font-black uppercase tracking-widest text-xs">No completed submissions found</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberDetailView;
