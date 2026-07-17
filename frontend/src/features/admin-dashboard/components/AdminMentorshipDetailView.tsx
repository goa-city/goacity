import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { formatDate } from '../../../utils/date';
import { getProfilePhotoUrl, getUploadAssetUrl } from '../../../utils/image';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
    ArrowRightIcon,
    FolderIcon,
    CloudArrowUpIcon,
    LinkIcon,
    ExclamationTriangleIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MentorshipMember {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo: string | null;
}

interface MentorshipSession {
    id: string;
    session_date: string;
    shared_notes: string | null;
    next_steps: string | null;
    status: string;
    is_paid: boolean;
    price: number | null;
    payment_status: string;
    payment_qr_image: string | null;
    payment_note: string | null;
}

interface MentorshipGoal {
    id: string;
    title: string;
    description: string | null;
    status: string;
    target_date: string | null;
    completed_at: string | null;
    completed_by: MentorshipMember | null;
}

interface MentorshipMaterial {
    id: string;
    title: string;
    description: string | null;
    file_url: string | null;
    link_url: string | null;
    status: string;
    response_text: string | null;
    response_file: string | null;
}

interface MentorshipRelation {
    id: string;
    type: string;
    focus_area: string;
    status: string;
    current_phase: string | null;
    created_at: string;
    ended_at: string | null;
    mentor: MentorshipMember;
    mentee: MentorshipMember;
    sessions: MentorshipSession[];
    goals: MentorshipGoal[];
    materials: MentorshipMaterial[];
}

interface AdminMentorshipDetailViewProps {
    relationId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AdminMentorshipDetailView: React.FC<AdminMentorshipDetailViewProps> = ({ relationId }) => {
    const navigate = useNavigate();

    const [mentorship, setMentorship] = useState<MentorshipRelation | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'sessions' | 'goals' | 'materials'>('sessions');
    const [toast, setToast] = useState('');
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const [completing, setCompleting] = useState(false);

    const showToast = (msg: string): void => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    const fetchMentorship = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const res = await api.get<MentorshipRelation>(`/admin/mentorship/relations/${relationId}`);
            setMentorship(res.data);
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })
                .response?.data?.message || 'Failed to load mentorship data';
            showToast(message);
            console.error('Fetch mentorship error:', error);
        } finally {
            setLoading(false);
        }
    }, [relationId]);

    useEffect(() => {
        fetchMentorship();
    }, [fetchMentorship]);

    const handleMarkComplete = async (): Promise<void> => {
        setCompleting(true);
        try {
            await api.put(`/admin/mentorship/relations/${relationId}/status`, { status: 'Completed' });
            showToast('Mentorship marked as completed. All interactions are now locked.');
            setShowCompleteConfirm(false);
            await fetchMentorship();
        } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } })
                .response?.data?.message || 'Failed to update status';
            showToast(message);
            console.error('Complete mentorship error:', error);
        } finally {
            setCompleting(false);
        }
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="py-40 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">
                    Loading Workspace...
                </p>
            </div>
        );
    }

    if (!mentorship) {
        return (
            <div className="py-40 text-center">
                <p className="text-zinc-500 font-bold">Mentorship record not found.</p>
                <button
                    onClick={() => navigate('/admin/mentorship')}
                    className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                    Back to Mentorship Hub
                </button>
            </div>
        );
    }

    const phases = ['Foundations', 'Strategy', 'Impact'];
    const currentPhaseIndex = phases.indexOf(mentorship.current_phase || 'Foundations');
    const isCompleted = mentorship.status === 'Completed';

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 pb-20">
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}

            {/* Back Nav */}
            <button
                onClick={() => navigate('/admin/mentorship')}
                className="mb-8 inline-flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-sm transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Mentorship Hub
            </button>

            {/* ── Completed Banner ── */}
            {isCompleted && (
                <div className="mb-8 flex items-center gap-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-lg px-6 py-4">
                    <LockClosedIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                            Mentorship Completed
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                            This relationship was completed on {formatDate(mentorship.ended_at || mentorship.created_at)}.
                            All interactions are now locked for both mentor and mentee.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Header ── */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <span className="px-4 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                            {mentorship.type} Relation
                        </span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Started {formatDate(mentorship.created_at)}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                            isCompleted
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
                                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40'
                        }`}>
                            {mentorship.status}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46] dark:text-zinc-100 tracking-tighter uppercase leading-none mb-3">
                        Mentorship <span className="text-indigo-600">Workspace</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-xl">
                        Admin view focused on{' '}
                        <span className="text-zinc-900 dark:text-indigo-400 font-extrabold">
                            {mentorship.focus_area}
                        </span>
                        . Read-only — no changes can be made from this view.
                    </p>
                </div>

                <div className="flex items-center gap-6 flex-wrap">
                    {/* Mentor Card */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                            {mentorship.mentor.profile_photo ? (
                                <img src={getProfilePhotoUrl(mentorship.mentor.profile_photo)} alt={mentorship.mentor.first_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 text-xs uppercase">
                                    {mentorship.mentor.first_name[0]}{mentorship.mentor.last_name[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Mentor</p>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase italic">
                                {mentorship.mentor.first_name} {mentorship.mentor.last_name}
                            </h3>
                        </div>
                    </div>

                    {/* Mentee Card */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                            {mentorship.mentee.profile_photo ? (
                                <img src={getProfilePhotoUrl(mentorship.mentee.profile_photo)} alt={mentorship.mentee.first_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 text-xs uppercase">
                                    {mentorship.mentee.first_name[0]}{mentorship.mentee.last_name[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Mentee</p>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase italic">
                                {mentorship.mentee.first_name} {mentorship.mentee.last_name}
                            </h3>
                        </div>
                    </div>

                    {/* Reopen / Mark as Completed Actions */}
                    {isCompleted ? (
                        <button
                            onClick={async () => {
                                const confirmReopen = window.confirm("Are you sure you want to reopen this mentorship? This will restore active features for both mentor and mentee.");
                                if (!confirmReopen) return;
                                try {
                                    await api.put(`/admin/mentorship/relations/${relationId}/status`, { status: 'Active' });
                                    showToast('Mentorship relationship has been reopened and is now Active.');
                                    await fetchMentorship();
                                } catch (error: unknown) {
                                    const message = (error as { response?: { data?: { message?: string } } })
                                        .response?.data?.message || 'Failed to reopen status';
                                    showToast(message);
                                }
                            }}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md inline-flex items-center gap-2 transition-colors"
                        >
                            <SolidCheckCircleIcon className="w-5 h-5" />
                            Reopen Relationship
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowCompleteConfirm(true)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md inline-flex items-center gap-2 transition-colors"
                        >
                            <SolidCheckCircleIcon className="w-5 h-5" />
                            Mark as Completed
                        </button>
                    )}
                </div>
            </div>

            {/* ── Phase Stepper (Read-only) ── */}
            <div className="mb-12">
                <div className="flex items-center justify-between gap-4">
                    {phases.map((phase, idx) => (
                        <React.Fragment key={phase}>
                            <div className={`flex flex-col items-center gap-2 transition-all ${idx <= currentPhaseIndex ? 'opacity-100' : 'opacity-40'}`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${idx <= currentPhaseIndex ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'}`}>
                                    {idx < currentPhaseIndex ? (
                                        <SolidCheckCircleIcon className="w-5 h-5" />
                                    ) : (
                                        <span className="font-bold text-sm">{idx + 1}</span>
                                    )}
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{phase}</span>
                            </div>
                            {idx < phases.length - 1 && (
                                <div className={`flex-1 h-0.5 rounded-full transition-all ${idx < currentPhaseIndex ? 'bg-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 mb-10 gap-6">
                {(['sessions', 'goals', 'materials'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'}`}
                    >
                        {tab === 'sessions' && 'Sessions & Booking'}
                        {tab === 'goals' && 'Milestones & Tasks'}
                        {tab === 'materials' && 'Resources & Materials'}
                    </button>
                ))}
            </div>

            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8">

                    {/* ── Sessions Tab ── */}
                    {activeTab === 'sessions' && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interaction Log</h2>
                                <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Session history for this mentorship pairing.</p>
                            </div>

                            <div className="space-y-4">
                                {mentorship.sessions.length > 0 ? (
                                    mentorship.sessions.map((session) => (
                                        <div key={session.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                            <div className="mt-1 shrink-0">
                                                {session.status === 'Completed' ? (
                                                    <SolidCheckCircleIcon className="w-7 h-7 text-emerald-500" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-zinc-700" />
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-4 flex-wrap">
                                                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                        <CalendarIcon className="w-3.5 h-3.5" />
                                                        {formatDate(session.session_date)}
                                                    </span>
                                                    {session.is_paid && (
                                                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                            session.payment_status === 'Paid'
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                                                                : session.payment_status === 'Verifying'
                                                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                                                                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                                                        }`}>
                                                            Paid Session: ₹{session.price}
                                                            {session.payment_status === 'Paid' && ' (Paid)'}
                                                            {session.payment_status === 'Verifying' && ' (Verifying)'}
                                                            {session.payment_status === 'Unpaid' && ' (Unpaid)'}
                                                        </span>
                                                    )}
                                                </div>
                                                {session.next_steps && (
                                                    <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${session.status === 'Completed' ? 'text-zinc-400 line-through' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                        <ArrowRightIcon className="w-4 h-4" />
                                                        Session Name: {session.next_steps}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Agenda / Discussion</h4>
                                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{session.shared_notes || 'No agenda recorded.'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                                        <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No sessions logged yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Goals Tab ── */}
                    {activeTab === 'goals' && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Milestones & Action Items</h2>
                                <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Goals and milestones set for this pairing.</p>
                            </div>

                            <div className="space-y-4">
                                {mentorship.goals.length > 0 ? (
                                    mentorship.goals.map((goal) => (
                                        <div key={goal.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                                            <div className="mt-1 shrink-0">
                                                {goal.status === 'Completed' ? (
                                                    <SolidCheckCircleIcon className="w-7 h-7 text-emerald-500" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full border-2 border-gray-200 dark:border-zinc-700" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold text-sm uppercase ${goal.status === 'Completed' ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                                    {goal.title}
                                                </h3>
                                                <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">{goal.description}</p>
                                                {goal.target_date && (
                                                    <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-2 inline-flex items-center gap-1">
                                                        <CalendarIcon className="w-3.5 h-3.5" />
                                                        Target: {formatDate(goal.target_date)}
                                                    </span>
                                                )}
                                                {goal.status === 'Completed' && goal.completed_at && (
                                                    <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                                                        <CheckCircleIcon className="w-3.5 h-3.5" />
                                                        Completed {goal.completed_by
                                                            ? `by ${goal.completed_by.first_name} ${goal.completed_by.last_name}`
                                                            : ''} on {formatDate(goal.completed_at)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                                        <ClipboardDocumentCheckIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No milestones established yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Materials Tab ── */}
                    {activeTab === 'materials' && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Library</h2>
                                <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Worksheets, PDFs, and shared materials for this pairing.</p>
                            </div>

                            <div className="space-y-4">
                                {mentorship.materials.length > 0 ? (
                                    mentorship.materials.map((mat) => (
                                        <div key={mat.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl mt-1 shrink-0">
                                                        <FolderIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase">{mat.title}</h3>
                                                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">{mat.description}</p>
                                                        <div className="flex items-center gap-3 mt-3">
                                                            {mat.file_url && (
                                                                <a
                                                                    href={getUploadAssetUrl(mat.file_url)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline uppercase tracking-wide flex items-center gap-1 bg-sky-50 dark:bg-sky-950/30 px-2.5 py-1 rounded-md border border-sky-100 dark:border-sky-900/30"
                                                                >
                                                                    <CloudArrowUpIcon className="w-3.5 h-3.5" />
                                                                    Download File
                                                                </a>
                                                            )}
                                                            {mat.link_url && (
                                                                <a
                                                                    href={mat.link_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-wide flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/30"
                                                                >
                                                                    <LinkIcon className="w-3.5 h-3.5" />
                                                                    Reading Link
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${mat.status === 'Responded'
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                                                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                                                }`}>
                                                    {mat.status}
                                                </span>
                                            </div>

                                            {/* Mentee Response */}
                                            {mat.status === 'Responded' && (
                                                <div className="border-t border-gray-50 dark:border-zinc-800 pt-4">
                                                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Mentee Response</p>
                                                        <p className="text-zinc-700 dark:text-zinc-300 text-xs italic">{mat.response_text || 'No response note submitted.'}</p>
                                                        {mat.response_file && (
                                                            <a
                                                                href={getUploadAssetUrl(mat.response_file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-[9px] font-bold text-sky-600 dark:text-sky-400 hover:underline uppercase tracking-wide flex items-center gap-1 mt-2 inline-flex"
                                                            >
                                                                <CloudArrowUpIcon className="w-3 h-3" />
                                                                View Response Upload
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl">
                                        <FolderIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">No materials shared yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* ── Right Column: Overview ── */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-6 italic border-b border-zinc-50 dark:border-zinc-800 pb-2">
                            Workspace Overview
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Focus Area</span>
                                <span className="font-extrabold text-sky-600 dark:text-sky-400">{mentorship.focus_area}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Type</span>
                                <span className="font-extrabold text-zinc-800 dark:text-zinc-300">{mentorship.type}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Current Phase</span>
                                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{mentorship.current_phase}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Sessions Logged</span>
                                <span className="font-extrabold text-zinc-800 dark:text-zinc-300">{mentorship.sessions.length} Sessions</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Milestones</span>
                                <span className="font-extrabold text-zinc-800 dark:text-zinc-300">{mentorship.goals.length} Goals</span>
                            </div>
                            <div className="flex justify-between items-center py-2 text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Materials</span>
                                <span className="font-extrabold text-zinc-800 dark:text-zinc-300">{mentorship.materials.length} Shared</span>
                            </div>
                        </div>
                    </section>

                    {/* Admin Note */}
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Admin View</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            This is a read-only view. Only admins can see this workspace. Use the <strong>Mark as Completed</strong> button to close this relationship and lock all interactions for the mentor and mentee.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Confirm Complete Modal ── */}
            {showCompleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl shrink-0">
                                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-1">
                                    Mark as Completed?
                                </h2>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    This will permanently close the mentorship relationship between{' '}
                                    <strong className="text-zinc-900 dark:text-white">{mentorship.mentor.first_name} {mentorship.mentor.last_name}</strong>
                                    {' '}and{' '}
                                    <strong className="text-zinc-900 dark:text-white">{mentorship.mentee.first_name} {mentorship.mentee.last_name}</strong>.
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 font-bold">
                                    Both the mentor and mentee will be locked out of adding new sessions, tasks, or materials. All existing data remains visible.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCompleteConfirm(false)}
                                className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkComplete}
                                disabled={completing}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors text-sm shadow-md inline-flex items-center gap-2"
                            >
                                {completing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <SolidCheckCircleIcon className="w-4 h-4" />
                                )}
                                {completing ? 'Completing...' : 'Yes, Mark Complete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMentorshipDetailView;
