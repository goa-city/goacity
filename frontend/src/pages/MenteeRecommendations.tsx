import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMenteeRecommendations } from '../features/mentorship/api/mentorship.api';
import DashboardLayout from '../layouts/DashboardLayout';
import { SparklesIcon } from '@heroicons/react/24/outline';

const MenteeRecommendations: React.FC = () => {
    const [searchParams] = useSearchParams();
    const responseId = searchParams.get('response_id');
    const navigate = useNavigate();

    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['mentee-recommendations', responseId],
        queryFn: () => fetchMenteeRecommendations(Number(responseId)),
        enabled: !!responseId
    });

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
                        <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase italic">Recommended Matches</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-4 text-lg font-medium italic">Based on your assessment, these leaders are best positioned to guide your current growth journey.</p>
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

                                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 mb-8">
                                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 italic leading-relaxed">
                                        "{rec.match_why}"
                                    </p>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-8">
                                        {Array.isArray(rec.expertise) && rec.expertise.slice(0, 3).map((e: string) => (
                                            <span key={e} className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 uppercase tracking-widest rounded-lg">{e}</span>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/profile/${rec.mentor_id}`)}
                                    className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-indigo-600 dark:hover:bg-zinc-100 transition-all shadow-xl active:scale-95 mt-auto"
                                >
                                    View Strategy Profile
                                </button>
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
        </DashboardLayout>
    );
};

export default MenteeRecommendations;
