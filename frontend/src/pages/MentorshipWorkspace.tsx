import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { useMentorship } from '../features/mentorship/hooks/useMentorship';
import { getProfilePhotoUrl, getUploadAssetUrl } from '../utils/image';
import { formatDate } from '../utils/date';
import {
    CheckCircleIcon,
    CalendarIcon,
    ClipboardDocumentCheckIcon,
    ChatBubbleLeftRightIcon,
    ArrowRightIcon,
    SparklesIcon,
    PlusIcon,
    ExclamationCircleIcon,
    FolderIcon,
    CloudArrowUpIcon,
    LinkIcon,
    BanknotesIcon,
    TrashIcon,
    ArrowPathIcon,
    XMarkIcon,
    PencilIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

const MentorshipWorkspace: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        mentorship,
        myMentorships,
        isLoading,
        addGoal,
        updateGoal,
        deleteGoal,
        logSession,
        updateSession,
        deleteSession,
        submitSessionPayment,
        verifySessionPayment,
        addMaterial,
        submitMaterialResponse,
        deleteMaterial,
        addTask,
        updateTask,
        updatePhase
    } = useMentorship(id);

    const [activeTab, setActiveTab] = useState<'sessions' | 'goals' | 'materials'>('sessions');
    const [isLoggingSession, setIsLoggingSession] = useState(false);
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [isAddingMaterial, setIsAddingMaterial] = useState(false);
    const [respondingMaterialId, setRespondingMaterialId] = useState<string | null>(null);
    const [payingSessionId, setPayingSessionId] = useState<string | null>(null);
    const [isEditingSession, setIsEditingSession] = useState(false);
    const [editingSession, setEditingSession] = useState<any>(null);

    // Form States
    const [sessionData, setSessionData] = useState({
        shared_notes: '',
        next_steps: '',
        session_date: new Date().toISOString().split('T')[0],
        is_paid: false,
        price: '',
    });
    const [editSessionData, setEditSessionData] = useState({
        shared_notes: '',
        next_steps: '',
        session_date: new Date().toISOString().split('T')[0],
        is_paid: false,
        price: '',
    });
    const [goalData, setGoalData] = useState({ title: '', description: '', target_date: '' });
    const [materialData, setMaterialData] = useState({ title: '', description: '', link_url: '' });
    const [materialFile, setMaterialFile] = useState<File | null>(null);
    const [responseNotes, setResponseNotes] = useState('');
    const [responseFile, setResponseFile] = useState<File | null>(null);
    const [paymentNote, setPaymentNote] = useState('');
    const [sessionQrFile, setSessionQrFile] = useState<File | null>(null);
    const [editSessionQrFile, setEditSessionQrFile] = useState<File | null>(null);

    if (isLoading) return (
        <DashboardLayout>
            <div className="py-40 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Workspace...</p>
            </div>
        </DashboardLayout>
    );

    if (!mentorship) return (
        <DashboardLayout>
            <div className="text-center py-40">
                <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Workspace Not Found</h2>
                <p className="text-zinc-500 font-medium">The mentorship data could not be retrieved.</p>
            </div>
        </DashboardLayout>
    );

    const isMentor = mentorship.mentor_id === user?.id;
    const partner = isMentor ? mentorship.mentee : mentorship.mentor;
    const roleString = isMentor ? 'Mentee' : 'Mentor';
    const isCompleted = mentorship.status === 'Completed';

    const phases = ['Foundations', 'Strategy', 'Impact'];
    const currentPhaseIndex = phases.indexOf(mentorship.current_phase || 'Foundations');

    const handleLogSession = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('session_date', sessionData.session_date);
        formData.append('is_paid', String(sessionData.is_paid));
        formData.append('price', sessionData.is_paid && sessionData.price !== '' ? String(sessionData.price) : '');
        formData.append('next_steps', sessionData.next_steps);
        formData.append('shared_notes', sessionData.shared_notes);

        if (sessionQrFile) {
            formData.append('payment_qr_image', sessionQrFile);
        } else {
            const defaultQr = isMentor ? mentorship.mentor?.mentorProfile?.payment_qr_image : null;
            if (defaultQr) {
                formData.append('payment_qr_image', defaultQr);
            }
        }

        await logSession(formData);
        setIsLoggingSession(false);
        setSessionData({ shared_notes: '', next_steps: '', session_date: new Date().toISOString().split('T')[0], is_paid: false, price: '' });
        setSessionQrFile(null);
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        await addGoal(goalData);
        setIsAddingGoal(false);
        setGoalData({ title: '', description: '', target_date: '' });
    };

    const handleAddMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', materialData.title);
        formData.append('description', materialData.description);
        formData.append('link_url', materialData.link_url);
        if (materialFile) {
            formData.append('file', materialFile);
        }
        await addMaterial(formData);
        setIsAddingMaterial(false);
        setMaterialData({ title: '', description: '', link_url: '' });
        setMaterialFile(null);
    };

    const handleSubmitMaterialResponse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!respondingMaterialId) return;
        const formData = new FormData();
        formData.append('response_text', responseNotes);
        if (responseFile) {
            formData.append('response_file', responseFile);
        }
        await submitMaterialResponse({ materialId: respondingMaterialId, formData });
        setRespondingMaterialId(null);
        setResponseNotes('');
        setResponseFile(null);
    };

    const handleSubmitSessionPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!payingSessionId) return;
        await submitSessionPayment({ sessionId: payingSessionId, data: { payment_note: paymentNote } });
        setPayingSessionId(null);
        setPaymentNote('');
    };

    const toggleGoalStatus = async (goal: any) => {
        const newStatus = goal.status === 'Completed' ? 'Pending' : 'Completed';
        await updateGoal({ goalId: goal.id, data: { status: newStatus } });
    };

    const toggleSessionStatus = async (session: any) => {
        const newStatus = session.status === 'Completed' ? 'Pending' : 'Completed';
        await updateSession({ sessionId: session.id, data: { status: newStatus } });
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            await deleteGoal(goalId);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this session?')) {
            await deleteSession(sessionId);
        }
    };

    const handleStartEditSession = (session: any) => {
        setEditingSession(session);
        setEditSessionData({
            shared_notes: session.shared_notes || '',
            next_steps: session.next_steps || '',
            session_date: new Date(session.session_date).toISOString().split('T')[0],
            is_paid: session.is_paid || false,
            price: session.price || ''
        });
        setIsEditingSession(true);
    };

    const handleEditSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSession) return;

        const formData = new FormData();
        formData.append('session_date', editSessionData.session_date);
        formData.append('is_paid', String(editSessionData.is_paid));
        formData.append('price', editSessionData.is_paid && editSessionData.price !== '' ? String(editSessionData.price) : '');
        formData.append('next_steps', editSessionData.next_steps);
        formData.append('shared_notes', editSessionData.shared_notes);

        if (editSessionQrFile) {
            formData.append('payment_qr_image', editSessionQrFile);
        }

        await updateSession({
            sessionId: editingSession.id,
            data: formData
        });
        setIsEditingSession(false);
        setEditingSession(null);
        setEditSessionQrFile(null);
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (window.confirm('Are you sure you want to delete this resource material?')) {
            await deleteMaterial(materialId);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto pb-20">

                {/* ── Header Section ── */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1 bg-indigo-500/10 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                                {mentorship.type} Relation
                            </span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Started {new Date(mentorship.created_at).toLocaleDateString()}</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46] dark:text-zinc-100 tracking-tighter uppercase leading-none mb-3">
                            Mentorship <span className="text-indigo-600">Workspace</span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-2 max-w-xl">
                            A collaborative space focused on <span className="text-zinc-900 dark:text-indigo-400 font-extrabold">{mentorship.focus_area}</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* ── Multiple Mentorships Switcher ── */}
                        {myMentorships && myMentorships.length > 1 && (
                            <div className="flex flex-col">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Switch Pairing</label>
                                <select
                                    value={id}
                                    onChange={(e) => navigate(`/dashboard/mentorship/${e.target.value}`)}
                                    className="border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 outline-none font-bold text-[#2D2D46] dark:text-zinc-300 bg-white dark:bg-zinc-900"
                                >
                                    {myMentorships.map((rel: any) => {
                                        const p = rel.mentor_id === user?.id ? rel.mentee : rel.mentor;
                                        return (
                                            <option key={rel.id} value={rel.id}>
                                                {p?.first_name} {p?.last_name} ({rel.mentor_id === user?.id ? 'Mentee' : 'Mentor'})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        )}

                        <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                                {partner?.profile_photo ? (
                                    <img src={getProfilePhotoUrl(partner.profile_photo)} alt={partner?.first_name || 'Partner'} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-zinc-400 dark:text-zinc-500 uppercase text-sm">
                                        {partner?.first_name?.[0]}{partner?.last_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{roleString}</p>
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase italic">{partner?.first_name} {partner?.last_name}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Phase Stepper ── */}
                <div className="mb-12">
                    <div className="flex items-center justify-between gap-4">
                        {phases.map((phase, idx) => (
                            <React.Fragment key={phase}>
                                <button
                                    onClick={() => isMentor && !isCompleted && updatePhase(phase)}
                                    disabled={!isMentor || isCompleted}
                                    className={`flex flex-col items-center gap-2 transition-all duration-500 ${idx <= currentPhaseIndex ? 'opacity-100' : 'opacity-40'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${idx <= currentPhaseIndex ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500'}`}>
                                        {idx < currentPhaseIndex ? <SolidCheckCircleIcon className="w-5 h-5" /> : <span className="font-bold text-sm">{idx + 1}</span>}
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{phase}</span>
                                </button>
                                {idx < phases.length - 1 && (
                                    <div className={`flex-1 h-0.5 rounded-full transition-all duration-1000 ${idx < currentPhaseIndex ? 'bg-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ── Completed Banner ── */}
                {isCompleted && (
                    <div className="mb-8 flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4">
                        <LockClosedIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300">Mentorship Completed</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                This mentorship has been marked as completed by an admin on {formatDate(mentorship.ended_at)}. All interaction data is preserved below for your reference.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Tab Selector ── */}
                <div className="flex border-b border-gray-100 dark:border-zinc-800 mb-10 gap-6">
                    <button
                        onClick={() => setActiveTab('sessions')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'sessions' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'}`}
                    >
                        Sessions & Booking
                    </button>
                    <button
                        onClick={() => setActiveTab('goals')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'goals' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'}`}
                    >
                        Milestones & Tasks
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`pb-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'materials' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'}`}
                    >
                        Resources & Materials
                    </button>
                </div>

                {/* ── Main Tab Content ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">

                        {/* ── Sessions Tab ── */}
                        {activeTab === 'sessions' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interaction Log</h2>
                                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Schedule and review meeting history.</p>
                                    </div>
                                    {!isCompleted && (
                                        <button
                                            onClick={() => setIsLoggingSession(true)}
                                            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            {isMentor ? 'Schedule Session' : 'Request Session'}
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {mentorship.sessions?.length > 0 ? (
                                        mentorship.sessions.map((session: any) => (
                                            <div key={session.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-start gap-4 justify-between">
                                                <button onClick={() => !isCompleted && toggleSessionStatus(session)} disabled={isCompleted} className="mt-1 shrink-0">
                                                    {session.status === 'Completed' ? (
                                                        <SolidCheckCircleIcon className="w-7 h-7 text-emerald-500" />
                                                    ) : (
                                                        <div className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-zinc-700 hover:border-sky-500 transition-colors" />
                                                    )}
                                                </button>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex items-center gap-4 flex-wrap">
                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                                                            <CalendarIcon className="w-3.5 h-3.5" />
                                                            {new Date(session.session_date).toLocaleDateString()}
                                                        </span>
                                                        {session.is_paid && (
                                                            <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${session.payment_status === 'Paid'
                                                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-455 border border-emerald-100 dark:border-emerald-900/30'
                                                                : session.payment_status === 'Verifying'
                                                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-455 border border-amber-100 dark:border-amber-900/30'
                                                                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-455 border border-rose-100 dark:border-rose-900/30'
                                                                }`}>
                                                                Paid Session: ₹{session.price}
                                                                {session.payment_status === 'Paid' && ' (Paid)'}
                                                                {session.payment_status === 'Verifying' && ' (Verifying)'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {session.next_steps && (
                                                        <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${session.status === 'Completed' ? 'text-zinc-400 line-through' : 'text-indigo-600 dark:text-indigo-400'}`}>
                                                            <ArrowRightIcon className="w-4 h-4" />
                                                            Session Name: {session.next_steps}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wide mb-1">Agenda / Discussion</h4>
                                                        <p className="text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed">{session.shared_notes || 'No agenda recorded.'}</p>
                                                    </div>
                                                </div>

                                                {/* Payment & Admin Actions */}
                                                <div className="shrink-0 flex flex-col justify-center items-end gap-3">
                                                    {!isCompleted && session.is_paid && (
                                                        <>
                                                            {!isMentor && session.payment_status === 'Unpaid' && (
                                                                <button
                                                                    onClick={() => setPayingSessionId(session.id)}
                                                                    className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                                                                >
                                                                    <BanknotesIcon className="w-4 h-4" />
                                                                    Pay & Confirm
                                                                </button>
                                                            )}
                                                            {isMentor && session.payment_status === 'Verifying' && (
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-bold text-zinc-500 mb-2 italic">Proof: {session.payment_note}</p>
                                                                    <button
                                                                        onClick={() => verifySessionPayment(session.id)}
                                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:emerald-700 transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                                                                    >
                                                                        <CheckCircleIcon className="w-4 h-4" />
                                                                        Approve Payment
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {!isCompleted && isMentor && session.status !== 'Completed' && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <button
                                                                onClick={() => handleStartEditSession(session)}
                                                                className="p-1.5 text-zinc-400 hover:text-sky-600 transition-colors"
                                                                title="Edit Session"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSession(session.id)}
                                                                className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                                                                title="Delete Session"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl">
                                            <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No strategy sessions booked yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Goals Tab ── */}
                        {activeTab === 'goals' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Milestones & Action Items</h2>
                                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Track smart goals and checklist items.</p>
                                    </div>
                                    {isMentor && !isCompleted && (
                                        <button
                                            onClick={() => setIsAddingGoal(true)}
                                            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Create Goal
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {mentorship.goals?.length > 0 ? (
                                        mentorship.goals.map((goal: any) => (
                                            <div key={goal.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    <button onClick={() => !isCompleted && toggleGoalStatus(goal)} disabled={isCompleted} className="mt-1 shrink-0">
                                                        {goal.status === 'Completed' ? (
                                                            <SolidCheckCircleIcon className="w-7 h-7 text-emerald-500" />
                                                        ) : (
                                                            <div className="w-7 h-7 rounded-full border-2 border-gray-300 dark:border-zinc-700 hover:border-sky-500 transition-colors" />
                                                        )}
                                                    </button>
                                                    <div className="flex-1">
                                                        <h3 className={`font-bold text-sm uppercase ${goal.status === 'Completed' ? 'text-zinc-400 line-through' : 'text-zinc-950 dark:text-zinc-100'}`}>
                                                            {goal.title}
                                                        </h3>
                                                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">{goal.description}</p>
                                                        {goal.target_date && (
                                                            <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mt-2 inline-flex items-center gap-1">
                                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                                Target Date: {new Date(goal.target_date).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        {goal.status === 'Completed' && goal.completed_at && (
                                                            <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                                                                <CheckCircleIcon className="w-3.5 h-3.5" />
                                                                Completed {goal.completed_by ? `by ${goal.completed_by.first_name || ''} ${goal.completed_by.last_name || ''}` : ''} on {new Date(goal.completed_at).toLocaleDateString()} at {new Date(goal.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {isMentor && !isCompleted && goal.status !== 'Completed' && (
                                                    <button
                                                        onClick={() => handleDeleteGoal(goal.id)}
                                                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors shrink-0"
                                                        title="Delete Goal"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl">
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
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Workspace Library</h2>
                                        <p className="text-gray-500 dark:text-zinc-400 text-xs mt-1">Share worksheets, PDFs, and homework assignments.</p>
                                    </div>
                                    {isMentor && (
                                        <button
                                            onClick={() => setIsAddingMaterial(true)}
                                            className="px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-xs font-bold shadow-md inline-flex items-center gap-2"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Share Resource
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {mentorship.materials?.length > 0 ? (
                                        mentorship.materials.map((mat: any) => (
                                            <div key={mat.id} className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl mt-1 shrink-0">
                                                            <FolderIcon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-sm text-zinc-950 dark:text-white uppercase">{mat.title}</h3>
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
                                                                        Download PDF / File
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

                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${mat.status === 'Responded'
                                                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                                                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 border border-amber-100 dark:border-amber-900/30'
                                                            }`}>
                                                            {mat.status}
                                                        </span>
                                                        {isMentor && !isCompleted && (
                                                            <button
                                                                onClick={() => handleDeleteMaterial(mat.id)}
                                                                className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                                                                title="Delete Resource"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Responded proof or action */}
                                                <div className="border-t border-gray-50 dark:border-zinc-800 pt-4 mt-2">
                                                    {mat.status === 'Responded' ? (
                                                        <div className="bg-zinc-50/50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{roleString === 'Mentee' ? 'My Response' : 'Mentee Response'}</p>
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
                                                    ) : (
                                                        !isMentor && !isCompleted && (
                                                            <button
                                                                onClick={() => setRespondingMaterialId(mat.id)}
                                                                className="px-4 py-2 border border-sky-200 dark:border-zinc-700 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 dark:hover:bg-zinc-800 rounded-xl transition-colors text-xs flex items-center gap-1"
                                                            >
                                                                <ArrowPathIcon className="w-3.5 h-3.5" />
                                                                Read & Respond
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl">
                                            <FolderIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-650 mx-auto mb-4" />
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No worksheets or reading materials shared yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Right Column: Dynamic Status & Info */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                            <h3 className="text-base font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-6 italic border-b border-zinc-50 dark:border-zinc-800 pb-2">
                                Workspace Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Paired Role</span>
                                    <span className="font-extrabold text-[#2D2D46] dark:text-zinc-350">{isMentor ? 'Mentor' : 'Mentee'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Focus Area</span>
                                    <span className="font-extrabold text-sky-600 dark:text-sky-400">{mentorship.focus_area}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Current Phase</span>
                                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{mentorship.current_phase}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Sessions Logged</span>
                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-300">{mentorship.sessions?.length || 0} Sessions</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-50 dark:border-zinc-800 text-xs">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase">Active Milestones</span>
                                    <span className="font-extrabold text-zinc-800 dark:text-zinc-300">{mentorship.goals?.length || 0} Goals</span>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

            </div>

            {/* ── MODALS ── */}

            {/* Log Session Modal */}
            {isLoggingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#2D2D46] dark:text-white uppercase italic tracking-tight">Schedule New Session</h2>
                            <button onClick={() => setIsLoggingSession(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleLogSession} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={isMentor ? "" : "md:col-span-2"}>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Session Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                        value={sessionData.session_date}
                                        onChange={e => setSessionData({ ...sessionData, session_date: e.target.value })}
                                        required
                                    />
                                </div>
                                {isMentor && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col justify-center">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Paid Session?</label>
                                            <input
                                                type="checkbox"
                                                className="w-6 h-6 text-sky-600 focus:ring-sky-500 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md cursor-pointer"
                                                checked={sessionData.is_paid}
                                                onChange={e => setSessionData({ ...sessionData, is_paid: e.target.checked })}
                                            />
                                        </div>
                                        {sessionData.is_paid && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Session Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                                    value={sessionData.price}
                                                    placeholder={mentorship.mentor?.mentorProfile?.default_session_price ? String(mentorship.mentor.mentorProfile.default_session_price) : '0'}
                                                    onChange={e => setSessionData({ ...sessionData, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        )}
                                        {sessionData.is_paid && (
                                            <div className="col-span-2 mt-2">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Upload Session QR Code (Optional)</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setSessionQrFile(e.target.files?.[0] || null)}
                                                    className="text-sm text-gray-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-750 hover:file:bg-indigo-100 cursor-pointer w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Session Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                    placeholder="e.g. Session 1: Foundations or Topic Name"
                                    value={sessionData.next_steps}
                                    onChange={e => setSessionData({ ...sessionData, next_steps: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Shared Agenda / Notes</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                                    placeholder="Outline the core topics or pre-reading for this session..."
                                    value={sessionData.shared_notes}
                                    onChange={e => setSessionData({ ...sessionData, shared_notes: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-6 justify-end">
                                <button type="button" onClick={() => setIsLoggingSession(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md">Create Session</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Session Modal */}
            {isEditingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#2D2D46] dark:text-white uppercase italic tracking-tight">Edit Session</h2>
                            <button onClick={() => setIsEditingSession(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSession} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className={isMentor ? "" : "md:col-span-2"}>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Session Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                        value={editSessionData.session_date}
                                        onChange={e => setEditSessionData({ ...editSessionData, session_date: e.target.value })}
                                        required
                                    />
                                </div>
                                {isMentor && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col justify-center">
                                            <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Paid Session?</label>
                                            <input
                                                type="checkbox"
                                                className="w-6 h-6 text-sky-600 focus:ring-sky-500 border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md cursor-pointer"
                                                checked={editSessionData.is_paid}
                                                onChange={e => setEditSessionData({ ...editSessionData, is_paid: e.target.checked })}
                                            />
                                        </div>
                                        {editSessionData.is_paid && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Session Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                                    value={editSessionData.price}
                                                    placeholder={mentorship.mentor?.mentorProfile?.default_session_price ? String(mentorship.mentor.mentorProfile.default_session_price) : '0'}
                                                    onChange={e => setEditSessionData({ ...editSessionData, price: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        )}
                                        {editSessionData.is_paid && (
                                            <div className="col-span-2 mt-2">
                                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Upload Session QR Code (Optional)</label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setEditSessionQrFile(e.target.files?.[0] || null)}
                                                    className="text-sm text-gray-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-750 hover:file:bg-indigo-100 cursor-pointer w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Session Name</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                    placeholder="e.g. Session 1: Foundations or Topic Name"
                                    value={editSessionData.next_steps}
                                    onChange={e => setEditSessionData({ ...editSessionData, next_steps: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Shared Agenda / Notes</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                                    placeholder="Outline the core topics or pre-reading for this session..."
                                    value={editSessionData.shared_notes}
                                    onChange={e => setEditSessionData({ ...editSessionData, shared_notes: e.target.value })}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="flex gap-4 pt-6 justify-end">
                                <button type="button" onClick={() => setIsEditingSession(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Define Milestone Goal Modal */}
            {isAddingGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#2D2D46] dark:text-white uppercase italic tracking-tight">Create Objective</h2>
                            <button onClick={() => setIsAddingGoal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddGoal} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Objective Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                    placeholder="e.g. Master Financial Stewardship & Forecasting"
                                    value={goalData.title}
                                    onChange={e => setGoalData({ ...goalData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Target Date</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                    value={goalData.target_date}
                                    onChange={e => setGoalData({ ...goalData, target_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Objective Description</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                                    placeholder="Describe the expected outcome and steps to achieve this milestone..."
                                    value={goalData.description}
                                    onChange={e => setGoalData({ ...goalData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="flex gap-4 pt-6 justify-end">
                                <button type="button" onClick={() => setIsAddingGoal(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md">Create Goal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Material Modal */}
            {isAddingMaterial && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#2D2D46] dark:text-white uppercase italic tracking-tight">Share Resource</h2>
                            <button onClick={() => setIsAddingMaterial(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddMaterial} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Resource Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                    placeholder="e.g. Kingdom Business Canvas Template"
                                    value={materialData.title}
                                    onChange={e => setMaterialData({ ...materialData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Description / Homework Prompt</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                                    placeholder="Explain how to use this template or questions to answer..."
                                    value={materialData.description}
                                    onChange={e => setMaterialData({ ...materialData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Suggested Reading Link</label>
                                <input
                                    type="url"
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-bold"
                                    placeholder="e.g. https://example.com/reading"
                                    value={materialData.link_url}
                                    onChange={e => setMaterialData({ ...materialData, link_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Attachment File (PDF/Docs)</label>
                                <input
                                    type="file"
                                    onChange={e => setMaterialFile(e.target.files?.[0] || null)}
                                    className="text-sm text-gray-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-750 hover:file:bg-indigo-100 cursor-pointer w-full"
                                />
                            </div>
                            <div className="flex gap-4 pt-6 justify-end">
                                <button type="button" onClick={() => setIsAddingMaterial(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md">Share Resource</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Read & Respond Modal */}
            {respondingMaterialId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-zinc-800 animate-fadeIn">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#2D2D46] dark:text-white uppercase italic tracking-tight">Submit Response</h2>
                            <button onClick={() => setRespondingMaterialId(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitMaterialResponse} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">My Notes / Answers</label>
                                <textarea
                                    className="w-full border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                                    placeholder="Write your feedback, answers, or notes for your mentor..."
                                    value={responseNotes}
                                    onChange={e => setResponseNotes(e.target.value)}
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-zinc-300 mb-1">Response Upload (PDF/Word/Image)</label>
                                <input
                                    type="file"
                                    onChange={e => setResponseFile(e.target.files?.[0] || null)}
                                    className="text-sm text-gray-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-750 hover:file:bg-indigo-100 cursor-pointer w-full"
                                />
                            </div>
                            <div className="flex gap-4 pt-6 justify-end">
                                <button type="button" onClick={() => setRespondingMaterialId(null)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md">Submit Response</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Pay RSVP Session Modal */}
            {payingSessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-xl border border-gray-100 animate-fadeIn text-center">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#2D2D46] uppercase italic">Confirm Session Payment</h2>
                            <button onClick={() => setPayingSessionId(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitSessionPayment} className="space-y-6 flex flex-col items-center">
                            <p className="text-gray-500 text-xs">
                                Please scan the QR code to send payment of <span className="font-bold text-zinc-900">₹{mentorship.sessions?.find((s: any) => s.id === payingSessionId)?.price || mentorship.mentor?.mentorProfile?.default_session_price || '0'}</span> directly to your mentor.
                            </p>

                            {/* Show QR code */}
                            <div className="w-48 h-48 border border-zinc-200 rounded-3xl p-4 bg-zinc-50 flex items-center justify-center shadow-inner">
                                {(() => {
                                    const currentSession = mentorship.sessions?.find((s: any) => s.id === payingSessionId);
                                    const qrImage = currentSession?.payment_qr_image || mentorship.mentor?.mentorProfile?.payment_qr_image;
                                    return qrImage ? (
                                        <img
                                            src={getUploadAssetUrl(qrImage)}
                                            alt="Payment QR"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-zinc-400 font-bold uppercase tracking-widest text-[9px]">No QR Uploaded</div>
                                    );
                                })()}
                            </div>

                            <div className="w-full text-left">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Transaction Ref / Note</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                    placeholder="Enter UPI reference ID or note..."
                                    value={paymentNote}
                                    onChange={e => setPaymentNote(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-6 justify-end w-full">
                                <button type="button" onClick={() => setPayingSessionId(null)} className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm flex-1">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors text-sm shadow-md flex-1">Submit Proof</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
};

export default MentorshipWorkspace;
