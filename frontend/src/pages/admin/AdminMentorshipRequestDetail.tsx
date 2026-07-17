import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    ArrowLeftIcon,
    UserPlusIcon,
    MagnifyingGlassIcon,
    ClipboardDocumentCheckIcon,
    CheckCircleIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

interface AssessmentAnswer {
    field_key: string;
    answer_value: unknown;
}

interface AssessmentField {
    id: number | string;
    field_key: string;
    field_type: string;
    label: string;
}

interface MentorshipUser {
    id: number;
    first_name: string;
    last_name: string;
    email?: string | null;
    profile_photo?: string | null;
}

interface MentorOption extends MentorshipUser {
    mentorProfile?: {
        is_approved?: boolean;
        expertise?: string[];
    } | null;
}

interface MatchedRelation {
    id: string;
    mentor?: MentorOption | null;
}

interface MentorshipRequestDetail {
    id: number | string;
    user_id: number;
    user: MentorshipUser;
    answers: AssessmentAnswer[];
    form_fields: AssessmentField[];
    active_relation?: MatchedRelation | null;
}

interface NotificationTemplate {
    id: number | string;
    title: string;
    subject?: string | null;
    content?: string | null;
    message?: string | null;
    body?: string | null;
}

const AdminMentorshipRequestDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<MentorshipRequestDetail | null>(null);
    const [mentors, setMentors] = useState<MentorOption[]>([]);
    const [mentorSearch, setMentorSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [matchingInProgress, setMatchingInProgress] = useState(false);
    const [toast, setToast] = useState('');

    const [matchedRelation, setMatchedRelation] = useState<MatchedRelation | null>(null);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyType, setNotifyType] = useState<'email' | 'whatsapp'>('email');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [emailTemplates, setEmailTemplates] = useState<NotificationTemplate[]>([]);
    const [whatsappTemplates, setWhatsappTemplates] = useState<NotificationTemplate[]>([]);
    const [notifying, setNotifying] = useState(false);
    const [sendToMentor, setSendToMentor] = useState(false);
    const [sendToMentee, setSendToMentee] = useState(false);

    useEffect(() => {
        fetchData();
        fetchMentors();
        fetchTemplates();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/mentorship/requests/${id}`);
            if (res.data.success && res.data.data) {
                setRequest(res.data.data);
                if (res.data.data.active_relation) {
                    setMatchedRelation(res.data.data.active_relation);
                } else {
                    setMatchedRelation(null);
                }
            } else {
                console.error("Request not found");
                navigate('/admin/mentorship');
            }
        } catch (err) {
            console.error("Failed to load request details", err);
            navigate('/admin/mentorship');
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

    const fetchTemplates = async () => {
        try {
            const [emailRes, whatsappRes] = await Promise.all([
                api.get('/admin/email-templates'),
                api.get('/admin/whatsapp-templates')
            ]);
            setEmailTemplates(emailRes.data || []);
            setWhatsappTemplates(whatsappRes.data || []);
        } catch (err) {
            console.error("Failed to fetch templates", err);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const finalizeMatch = async (mentor: MentorOption) => {
        const confirmed = window.confirm('Are you sure you want to choose this mentor?');
        if (!confirmed) return;

        setMatchingInProgress(true);
        try {
            const focusArea = String(request?.answers.find((a) => a.field_key === 'growth_area')?.answer_value || 'Professional Growth');
            
            const res = await api.post('/admin/mentorship/match', {
                mentee_id: request?.user_id,
                mentor_id: mentor.id,
                focus_area: focusArea,
                type: 'Long-term'
            });
            
            showToast(`Covenant pair created successfully!`);
            if (res.data.success && res.data.data) {
                setMatchedRelation({
                    ...res.data.data,
                    mentor: mentor
                });
            } else {
                // fallback navigation if backend structure differs slightly
                setTimeout(() => navigate('/admin/mentorship'), 2000);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to create mentorship pairing');
        } finally {
            setMatchingInProgress(false);
        }
    };

    const removeMentor = async () => {
        if (!window.confirm('Are you sure you want to remove this mentor assignment? This will permanently delete the covenant pairing.')) return;
        if (!matchedRelation) return;
        
        setMatchingInProgress(true);
        try {
            await api.delete(`/admin/mentorship/relations/${matchedRelation.id}`);
            showToast('Mentor assignment removed successfully!');
            setMatchedRelation(null);
            setMentorSearch('');
        } catch (err) {
            console.error(err);
            showToast('Failed to remove mentor assignment');
        } finally {
            setMatchingInProgress(false);
        }
    };

    const handleNotify = (type: 'email' | 'whatsapp') => {
        setNotifyType(type);
        setSendToMentor(false);
        setSendToMentee(false);
        const templates: NotificationTemplate[] = type === 'email' ? emailTemplates : whatsappTemplates;
        if (templates.length > 0) {
            setSelectedTemplateId(String(templates[0].id));
        } else {
            setSelectedTemplateId('');
        }
        setShowNotifyModal(true);
    };

    const executeNotify = async () => {
        if (!selectedTemplateId) {
            showToast("Please select a template first.");
            return;
        }
        if (!matchedRelation) {
            showToast("No matched relation found.");
            return;
        }

        const recipients: string[] = [];
        if (sendToMentor) recipients.push('mentor');
        if (sendToMentee) recipients.push('mentee');

        if (recipients.length === 0) {
            showToast("Please select at least one recipient.");
            return;
        }

        const confirmMsg = `Send ${notifyType} notifications to ${recipients.join(' and ')}?`;
        if (!window.confirm(confirmMsg)) return;

        setNotifying(true);
        setShowNotifyModal(false);
        try {
            await api.post(`/admin/mentorship/relations/${matchedRelation.id}/notify`, {
                type: notifyType,
                templateId: selectedTemplateId,
                recipients
            });
            showToast("Notifications sent successfully!");
        } catch (err) {
            console.error(err);
            showToast("Failed to send notifications.");
        } finally {
            setNotifying(false);
        }
    };

    const filteredMentors = mentorSearch.trim() === '' ? [] : mentors.filter((m) => {
        if (m.id === request?.user_id) return false;
        
        const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
        const email = (m.email || '').toLowerCase();
        const search = mentorSearch.toLowerCase();
        const matchesNameOrEmail = fullName.includes(search) || email.includes(search);
        
        const matchesExpertise = m.mentorProfile?.expertise?.some((e: string) => 
            e.toLowerCase().includes(search)
        );
        
        return matchesNameOrEmail || matchesExpertise;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Loading Details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            <button 
                onClick={() => navigate('/admin/mentorship')}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] mb-8 group"
            >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Left: Mentee Assessment */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-600/30">
                            {request?.user?.first_name?.[0]}
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Mentee Review</h1>
                            <p className="text-zinc-500 font-black mt-1 uppercase tracking-widest text-sm flex items-center gap-2">
                                {request?.user?.first_name} {request?.user?.last_name}
                                <span className="text-zinc-300">/</span>
                                <span className="text-indigo-600">{request?.user?.email}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {request?.form_fields?.map((field) => {
                            const answer = request.answers.find((a) => a.field_key === field.field_key);
                            
                            // If it's a section/header with no answer needed, we can still show it or skip
                            if (field.field_type === 'header' || field.field_type === 'section') return null;

                            return (
                                <Card key={field.id} className="p-8 border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow bg-zinc-50/30 dark:bg-zinc-900/10">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 border-b border-indigo-50 dark:border-indigo-950/30 pb-3 flex items-center gap-2">
                                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                        {field.label}
                                    </p>
                                    <div className="text-lg font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {(() => {
                                            if (!answer) return <span className="text-zinc-400 italic">No response provided</span>;
                                            const value = answer.answer_value;
                                            if (value === undefined || value === null || value === '') {
                                                return <span className="text-zinc-400 italic">No response provided</span>;
                                            }
                                            
                                            let parsed = value;
                                            if (typeof value === 'string') {
                                                const trimmed = value.trim();
                                                if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                                                    try {
                                                        parsed = JSON.parse(trimmed);
                                                    } catch (e) {
                                                        // ignore
                                                    }
                                                }
                                            }
                                            
                                            if (Array.isArray(parsed)) {
                                                return (
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {parsed.map((item: any, idx: number) => (
                                                            <li key={idx}>{String(item)}</li>
                                                        ))}
                                                    </ul>
                                                );
                                            }
                                            
                                            return String(value);
                                        })()}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Mentor Matcher or Alert controls */}
                <div className="w-full lg:w-[400px]">
                    <div className="sticky top-10 space-y-6">
                        {matchedRelation ? (
                            <Card className="p-8 border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xl shadow-emerald-600/5">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-4 border border-emerald-200 dark:border-emerald-900/50">
                                    <CheckCircleIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Covenant Pair Created!</h3>
                                {matchedRelation.mentor && (
                                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-4 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800">
                                        Assigned Mentor: <span className="text-indigo-600 font-black">{matchedRelation.mentor.first_name} {matchedRelation.mentor.last_name}</span>
                                    </p>
                                )}
                                <p className="text-zinc-500 text-xs font-medium mb-6">
                                    Mentor assigned successfully. You can now send connection alerts to both the mentor and the mentee.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleNotify('email')}
                                        disabled={notifying}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        <EnvelopeIcon className="w-4 h-4" />
                                        Send Email Alert
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleNotify('whatsapp')}
                                        disabled={notifying}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                        Send WhatsApp Alert
                                    </button>
                                    <button
                                        type="button"
                                        onClick={removeMentor}
                                        disabled={matchingInProgress}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-650/5 disabled:opacity-50 mt-2"
                                    >
                                        Remove Mentor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/mentorship')}
                                        className="text-center text-[10px] text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-300 font-black uppercase tracking-widest mt-4"
                                    >
                                        Finish & Go to Dashboard
                                    </button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-8 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/20 dark:bg-indigo-950/10 shadow-xl shadow-indigo-600/5">
                                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Assign Mentor</h3>
                                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-8">Select wisdom partner to connect</p>

                                <div className="relative mb-6">
                                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search mentors..."
                                        value={mentorSearch}
                                        onChange={(e) => setMentorSearch(e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-600/20 shadow-inner"
                                    />
                                </div>

                                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {mentorSearch.trim() === '' ? (
                                        <p className="text-center py-10 text-zinc-400 font-black uppercase tracking-widest text-[10px]">Start typing to search members...</p>
                                    ) : filteredMentors.length === 0 ? (
                                        <p className="text-center py-10 text-zinc-400 font-black uppercase tracking-widest text-[10px]">No matching members found.</p>
                                    ) : (
                                        filteredMentors.map((mentor) => (
                                            <button 
                                                key={mentor.id}
                                                onClick={() => finalizeMatch(mentor)}
                                                disabled={matchingInProgress}
                                                className="w-full flex items-center justify-between p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-600 hover:shadow-lg transition-all text-left group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-400 text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                        {mentor.first_name?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-xs group-hover:text-indigo-600 transition-colors">
                                                                {mentor.first_name} {mentor.last_name}
                                                            </h4>
                                                            {mentor.mentorProfile?.is_approved ? (
                                                                <span className="text-[7px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-1.5 py-0.5 rounded text-emerald-600">Mentor</span>
                                                            ) : (
                                                                <span className="text-[7px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-850 px-1.5 py-0.5 rounded text-zinc-450 border border-zinc-200 dark:border-zinc-800">Member</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 lowercase mt-0.5">{mentor.email}</p>
                                                        {mentor.mentorProfile?.expertise && mentor.mentorProfile.expertise.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1.5">
                                                                {mentor.mentorProfile.expertise.slice(0, 2).map((e: string) => (
                                                                    <span key={e} className="text-[8px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{e}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-indigo-600 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-indigo-600/30">
                                                    <UserPlusIcon className="w-4 h-4" />
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </Card>
                        )}

                        <div className="bg-zinc-900 dark:bg-zinc-800 p-6 rounded-3xl text-white">
                            <h4 className="font-black uppercase tracking-widest text-[10px] text-indigo-400 mb-2">Instructions</h4>
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                Review the mentee's assessment answers on the left. Once you identify a suitable mentor, click their card on the right to establish a new Covenant relation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Modal */}
            {showNotifyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-8 relative border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
                        <button 
                            onClick={() => setShowNotifyModal(false)} 
                            className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest mb-4 ${notifyType === 'email' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
                                {notifyType === 'email' ? 'Email Alert System' : 'WhatsApp Alert System'}
                            </div>
                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase italic">
                                Select <span className={notifyType === 'email' ? 'text-indigo-600' : 'text-emerald-600'}>Template</span>
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-2">
                                Choose a template to alert both the mentor and the mentee.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Available Templates</label>
                                <div className="relative">
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                                    <select 
                                        value={selectedTemplateId}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-6 h-14 font-medium appearance-none"
                                    >
                                        {(notifyType === 'email' ? emailTemplates : whatsappTemplates).map(t => (
                                            <option key={t.id} value={t.id}>{t.title} {t.subject ? `(${t.subject})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Select Recipients</label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900 transition-colors flex-1 min-w-[200px]">
                                        <input 
                                            type="checkbox" 
                                            checked={sendToMentor}
                                            onChange={(e) => setSendToMentor(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <p className="text-xs font-black uppercase text-zinc-900 dark:text-white">Mentor</p>
                                            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold lowercase">
                                                {matchedRelation?.mentor?.first_name} {matchedRelation?.mentor?.last_name}
                                            </p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 cursor-pointer select-none hover:bg-zinc-100/50 dark:hover:bg-zinc-900 transition-colors flex-1 min-w-[200px]">
                                        <input 
                                            type="checkbox" 
                                            checked={sendToMentee}
                                            onChange={(e) => setSendToMentee(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-700 text-indigo-650 focus:ring-indigo-500"
                                        />
                                        <div>
                                            <p className="text-xs font-black uppercase text-zinc-900 dark:text-white">Mentee</p>
                                            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 font-bold lowercase">
                                                {request?.user?.first_name} {request?.user?.last_name}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-3">Content Preview</p>
                                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(() => {
                                        const templates = notifyType === 'email' ? emailTemplates : whatsappTemplates;
                                        const selected = templates.find(t => String(t.id) === String(selectedTemplateId));
                                        if (!selected) return <p className="text-zinc-400 italic text-sm">No template selected</p>;
                                        return (
                                            <div className="space-y-4">
                                                {selected.subject && (
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-400">Subject:</p>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{selected.subject}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-zinc-400">Message Body:</p>
                                                    <div 
                                                        className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap mt-1"
                                                        dangerouslySetInnerHTML={{ __html: selected.content || selected.message || selected.body || '' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={executeNotify}
                                    loading={notifying}
                                    disabled={!sendToMentor && !sendToMentee}
                                    className={`flex-1 justify-center py-4 rounded-2xl shadow-xl ${notifyType === 'email' ? 'shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}
                                >
                                    Confirm & Send {notifyType === 'email' ? 'Email' : 'WhatsApp'}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowNotifyModal(false)}
                                    className="px-8 justify-center py-4 rounded-2xl"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMentorshipRequestDetail;
