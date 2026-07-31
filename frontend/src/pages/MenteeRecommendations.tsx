import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMenteeRecommendations, requestMentorship } from '../features/mentorship/api/mentorship.api';
import DashboardLayout from '../layouts/DashboardLayout';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MenteeRecommendations: React.FC = () => {
    const [searchParams] = useSearchParams();
    const responseId = searchParams.get('response_id');
    const navigate = useNavigate();

    // Modal States
    const [selectedMentor, setSelectedMentor] = useState<any>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [mentorshipType, setMentorshipType] = useState('long-term');
    const [focusArea, setFocusArea] = useState('');
    const [submittingRequest, setSubmittingRequest] = useState(false);

    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['mentee-recommendations', responseId],
        queryFn: () => fetchMenteeRecommendations(Number(responseId)),
        enabled: !!responseId
    });

    const handleMentorshipRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMentor) return;
        setSubmittingRequest(true);
        try {
            await requestMentorship({
                mentor_id: selectedMentor.mentor_id,
                type: mentorshipType,
                focus_area: focusArea
            });
            alert('Mentorship request submitted successfully! Pending mentor review.');
            setIsRequestModalOpen(false);
            setFocusArea('');
        } catch (error: any) {
            console.error('Request failed:', error);
            alert(error.response?.data?.message || 'Failed to request mentorship.');
        } finally {
            setSubmittingRequest(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-8" />
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-widest animate-pulse">Running Smart Match...</h2>
                    <p className="text-zinc-500 mt-4 italic">Aligning your goals with Kingdom mentors.</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto py-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1 bg-indigo-500/10 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">Phase 1: Alignment</span>
                        </div>
                        <h1 className="page-heading">Recommended Mentors</h1>
                        <p className="page-description">Based on your assessment, these mentors are best positioned to guide your current growth journey.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {recommendations?.map((rec: any) => (
                        <div key={rec.mentor_id} className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                            <div className="relative bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 h-full flex flex-col">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-xl shrink-0">
                                        {rec.profile_photo ? (
                                            <img src={rec.profile_photo} alt={rec.first_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-2xl text-zinc-400 uppercase">
                                                {rec.first_name?.[0]}{rec.last_name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic leading-tight">{rec.first_name} {rec.last_name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <SparklesIcon className="w-4 h-4 text-amber-500" />
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Match Score: {rec.match_score}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {rec.match_why && (
                                    <div className="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 mb-8">
                                        <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 italic leading-relaxed">
                                            "{rec.match_why}"
                                        </p>
                                    </div>
                                )}

                                <div className="flex-1">
                                    {rec.company && (
                                        <div className="mb-8">
                                            <span className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest rounded-lg">
                                                {rec.company}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => navigate(`/profile/${rec.mentor_id}`)}
                                        className="flex-1 py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black uppercase tracking-[0.05em] text-[9px] rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-95 text-center"
                                    >
                                        View Profile
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedMentor(rec);
                                            setIsRequestModalOpen(true);
                                        }}
                                        className="flex-1 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black uppercase tracking-[0.05em] text-[9px] rounded-xl hover:bg-indigo-600 dark:hover:bg-zinc-100 transition-all shadow-md active:scale-95 text-center"
                                    >
                                        Request Mentorship
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-20 p-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 text-center">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase italic mb-4">Not finding the right alignment?</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic mb-8 max-w-2xl mx-auto">Our ecosystem is constantly growing. You can also explore the full directory or request a custom matching session with an admin.</p>
                    <button
                        onClick={() => navigate('/mentors')}
                        className="px-10 py-4 border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-all shadow-sm"
                    >
                        Explore Full Directory
                    </button>
                </div>
            </div>

            {isRequestModalOpen && selectedMentor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-fadeIn">
                    <div className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={() => setIsRequestModalOpen(false)}
                            className="absolute right-6 top-6 w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <div className="p-10 md:p-12">
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight italic">Request Mentorship</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium italic mt-1 font-sans">
                                    Initiate your growth journey with <span className="text-zinc-900 dark:text-white font-bold">{selectedMentor.first_name}</span>.
                                </p>
                            </div>

                            <form onSubmit={handleMentorshipRequestSubmit} className="space-y-8">
                                <div className="bg-zinc-50 dark:bg-zinc-800/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Mentorship Format</label>
                                    <div className="flex flex-wrap gap-8">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="mentorshipType"
                                                value="long-term"
                                                checked={mentorshipType === 'long-term'}
                                                onChange={e => setMentorshipType(e.target.value)}
                                                className="appearance-none w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 checked:border-emerald-500 checked:border-[6px] transition-all cursor-pointer"
                                            />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors">Long-term (Ongoing)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="mentorshipType"
                                                value="micro"
                                                checked={mentorshipType === 'micro'}
                                                onChange={e => setMentorshipType(e.target.value)}
                                                className="appearance-none w-5 h-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700 checked:border-emerald-500 checked:border-[6px] transition-all cursor-pointer"
                                            />
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-500 transition-colors">Micro (One-off)</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 ml-2">Focus Areas & Personal Goals</label>
                                    <textarea
                                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl p-6 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-zinc-900 dark:text-white font-medium leading-relaxed min-h-[140px] shadow-inner"
                                        required
                                        placeholder="What primary areas or challenges do you hope to tackle together?"
                                        value={focusArea}
                                        onChange={e => setFocusArea(e.target.value)}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submittingRequest}
                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {submittingRequest ? 'Submitting Request...' : 'Send Mentorship Request'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MenteeRecommendations;
