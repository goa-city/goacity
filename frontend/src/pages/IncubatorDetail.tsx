import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIncubatorIdea, useIncubator } from '../features/incubator/hooks/useIncubator';
import { formatDate } from '../utils/date';
import DashboardLayout from '../layouts/DashboardLayout';
import { ChevronLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Card, CardContent } from '../shared/components/ui/Card';
import Button from '../shared/components/ui/Button';

const IncubatorDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: idea, isLoading, error } = useIncubatorIdea(id || '');
    const { submitFeedback, isSubmittingFeedback } = useIncubator();
    const [commentText, setCommentText] = useState('');
    const [commentType, setCommentType] = useState('Encouragement');
    const [feedbackError, setFeedbackError] = useState<string | null>(null);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !id) return;
        setFeedbackError(null);

        try {
            await submitFeedback({
                ideaId: id,
                feedback: {
                    comment: commentText,
                    type: commentType
                }
            });
            setCommentText('');
        } catch (err: any) {
            console.error(err);
            setFeedbackError(err.response?.data?.message || 'Failed to submit feedback.');
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Loading Venture Details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !idea) {
        return (
            <DashboardLayout>
                <div className="text-center py-40">
                    <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Venture Not Found</h2>
                    <p className="text-zinc-500 font-medium">The venture mapping requested could not be resolved.</p>
                </div>
            </DashboardLayout>
        );
    }

    const statusColors: Record<string, string> = {
        Draft: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700',
        Submitted: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50',
        Under_Review: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50',
        Validated: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50',
        Launched: 'bg-indigo-600 text-white border-indigo-600'
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                {/* Back Link */}
                <Link to="/incubator/explore" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-12 group">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ChevronLeftIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Back to Explore</span>
                </Link>

                {/* Header Card */}
                <Card className="mb-8 overflow-hidden rounded-[2rem] border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <CardContent className="p-8 md:p-12 relative flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-zinc-100 overflow-hidden shrink-0 border-4 border-white dark:border-zinc-800 shadow-xl relative">
                            {idea.founder?.profile_photo ? (
                                <img src={idea.founder.profile_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-500">
                                    {idea.founder?.first_name?.[0]}
                                </div>
                            )}
                        </div>
                        {/* Details */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border ${statusColors[idea.status] || 'bg-zinc-100 text-zinc-600'}`}>
                                    {idea.status}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                    Submitted on {formatDate(idea.created_at)}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight mb-2">
                                {idea.title}
                            </h1>
                            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                                by {idea.founder?.first_name} {idea.founder?.last_name}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Venture Details Card */}
                <Card className="mb-8 overflow-hidden rounded-[2rem] border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <CardContent className="p-8 md:p-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 pb-4 border-b border-zinc-55 dark:border-zinc-800/50">Venture Profile</h2>

                        <div className="grid grid-cols-1 gap-8">
                            <div className="border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">The Challenge</span>
                                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                                    {idea.problem_statement}
                                </div>
                            </div>

                            <div className="border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Vision & Strategy</span>
                                <div className="text-sm font-bold text-zinc-850 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                                    {idea.vision_purpose}
                                </div>
                            </div>

                            <div>
                                <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Resource Requirements</span>
                                <div className="flex flex-wrap gap-2">
                                    {idea.needs_json && (typeof idea.needs_json === 'string' ? JSON.parse(idea.needs_json) : idea.needs_json).map((need: string, idx: number) => (
                                        <span
                                            key={idx}
                                            className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-100/50 dark:border-amber-900/50 px-3 py-1.5 font-black text-[9px] rounded-lg uppercase tracking-widest"
                                        >
                                            {need}
                                        </span>
                                    ))}
                                    {(!idea.needs_json || Object.keys(idea.needs_json).length === 0) && (
                                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest italic">No specific needs logged</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Community Inputs Card */}
                <Card className="mb-8 overflow-hidden rounded-[2rem] border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <CardContent className="p-8 md:p-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-50 dark:border-zinc-800/50 pb-4 mb-8">
                            Community Inputs ({idea.feedbacks?.length || 0})
                        </h2>

                        <div className="space-y-6">
                            {idea.feedbacks?.map((fb: any) => (
                                <div key={fb.id} className="flex gap-4 p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100/50 dark:border-zinc-800/50">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-white dark:border-zinc-800 shadow-sm">
                                        {fb.contributor?.profile_photo ? (
                                            <img src={fb.contributor.profile_photo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                                                {fb.contributor?.first_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-zinc-900 dark:text-white">
                                                    {fb.contributor?.first_name} {fb.contributor?.last_name}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border border-indigo-100/50 dark:border-indigo-900/50">
                                                    {fb.type}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                                                {formatDate(fb.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-300 text-xs leading-relaxed font-medium">
                                            {fb.comment}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {(!idea.feedbacks || idea.feedbacks.length === 0) && (
                                <p className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 italic py-12">
                                    No feedback yet. Be the first to add a seed of encouragement!
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Collaboration & Feedback Lab Card */}
                <Card className="mb-8 overflow-hidden rounded-[2rem] border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900">
                    <CardContent className="p-8 md:p-12">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 pb-4 border-b border-zinc-55 dark:border-zinc-800/50">Collaboration & Feedback</h2>

                        {/* Form */}
                        <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                            {feedbackError && (
                                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl">
                                    {feedbackError}
                                </div>
                            )}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Feedback Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Encouragement', 'Critique', 'Resource Offer', 'Mentorship Offer'].map(type => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setCommentType(type)}
                                            className={`px-4 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${commentType === type
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-150 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Write Your Input</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium"
                                    placeholder="Offer suggestions, connections, or words of faith..."
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSubmittingFeedback || !commentText.trim()}
                                    className="px-8 shadow-xl shadow-indigo-600/20"
                                >
                                    Submit Feedback
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default IncubatorDetail;
