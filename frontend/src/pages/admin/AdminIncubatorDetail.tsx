import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeftIcon, LightBulbIcon } from '@heroicons/react/24/solid';
import { Card, CardContent } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

interface IncubatorFounder {
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface IncubatorIdea {
    id: number;
    title: string;
    problem_statement?: string;
    vision_purpose?: string;
    needs_json?: string[];
    status: string;
    founder?: IncubatorFounder | null;
    feedbacks?: any[];
}

const AdminIncubatorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [idea, setIdea] = useState<IncubatorIdea | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchIdeaDetails();
    }, [id]);

    const fetchIdeaDetails = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/member/incubator/${id}`);
            if (res.data.success && res.data.data) {
                setIdea(res.data.data);
            } else {
                navigate('/admin/incubator');
            }
        } catch (err) {
            console.error('Failed to load incubator details', err);
            navigate('/admin/incubator');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleUpdateStatus = async (status: string) => {
        if (!idea) return;
        try {
            await api.put(`/admin/incubator/${idea.id}/status`, { status });
            showToast(`Venture status updated to ${status}`);
            fetchIdeaDetails();
        } catch (err) {
            console.error(err);
            showToast('Failed to update venture status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Loading Details...</p>
            </div>
        );
    }

    if (!idea) return null;

    const statusColors: Record<string, string> = {
        Draft: 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700',
        Submitted: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50',
        Under_Review: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50',
        Validated: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50',
        Launched: 'bg-indigo-600 text-white border-indigo-600'
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            {toast && (
                <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}

            {/* Back Button */}
            <button
                onClick={() => navigate('/admin/incubator')}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] mb-8 group"
            >
                <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
            </button>

            {/* Title / Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2">Venture Submission Details</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        {idea.founder?.first_name} {idea.founder?.last_name}
                        <span className="text-zinc-300">/</span>
                        <span className="text-indigo-600">{idea.founder?.email}</span>
                    </p>
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-widest ${statusColors[idea.status] || 'bg-zinc-150 text-zinc-650'}`}>
                    {idea.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Section: Form Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-zinc-150 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                        <CardContent className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Venture Title</label>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">{idea.title}</p>
                            </div>
                            
                            <div className="border-t border-zinc-50 dark:border-zinc-800/50 pt-6">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">The Challenge (Problem Statement)</label>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {idea.problem_statement || "No problem statement provided"}
                                </p>
                            </div>

                            <div className="border-t border-zinc-50 dark:border-zinc-800/50 pt-6">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Vision & Strategy</label>
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {idea.vision_purpose || "No vision provided"}
                                </p>
                            </div>

                            <div className="border-t border-zinc-50 dark:border-zinc-800/50 pt-6">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Resource Requirements</label>
                                <div className="flex flex-wrap gap-2">
                                    {(idea.needs_json || []).map((need: string, idx: number) => (
                                        <span key={idx} className="bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 px-3 py-1 font-black text-[9px] rounded-lg uppercase tracking-widest">
                                            {need}
                                        </span>
                                    ))}
                                    {(!idea.needs_json || idea.needs_json.length === 0) && (
                                        <span className="text-zinc-400 italic text-xs font-medium">No requirements logged</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Bar */}
                    <div className="flex justify-end gap-3 bg-zinc-55 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-md">
                        <button 
                            onClick={() => handleUpdateStatus('Draft')}
                            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                            Disapprove
                        </button>
                        <button 
                            onClick={() => handleUpdateStatus('Validated')}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all"
                        >
                            Approve
                        </button>
                    </div>
                </div>

                {/* Right Section: Interactions & Comments */}
                <div>
                    <Card className="border-zinc-150 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                        <CardContent className="p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 dark:border-zinc-800/50 pb-4 mb-6">
                                Interactions & Feedbacks ({idea.feedbacks?.length || 0})
                            </h3>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {idea.feedbacks?.map((fb: any) => (
                                    <div key={fb.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                                        <div className="flex justify-between items-center gap-2 mb-2">
                                            <span className="text-xs font-black text-zinc-900 dark:text-white">
                                                {fb.contributor?.first_name} {fb.contributor?.last_name}
                                            </span>
                                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border border-indigo-100/50 dark:border-indigo-900/50">
                                                {fb.type}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed font-medium">
                                            {fb.comment}
                                        </p>
                                        <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-2">
                                            {fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                ))}
                                {(!idea.feedbacks || idea.feedbacks.length === 0) && (
                                    <p className="text-xs text-zinc-400 font-medium italic py-6 text-center">No community interactions logged yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminIncubatorDetail;
