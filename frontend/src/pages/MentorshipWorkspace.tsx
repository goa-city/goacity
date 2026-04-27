import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../features/auth/context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { CheckCircleIcon, PlayCircleIcon, SparklesIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

interface Goal {
    text: string;
    completed: boolean;
}

interface MentorshipRelation {
    id: number;
    mentor_id: number;
    mentee_id: number;
    status: string;
    type: string;
    focus_area: string;
    goals_json: Goal[];
    mentor?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    mentee?: {
        id: number;
        first_name: string;
        last_name: string;
    };
}

const MentorshipWorkspace: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const [relation, setRelation] = useState<MentorshipRelation | null>(null);
    const [loading, setLoading] = useState(true);
    const [newGoal, setNewGoal] = useState('');

    useEffect(() => {
        const fetchWorkspace = async () => {
            try {
                const res = await api.get(`/mentorship/${id}`);
                setRelation(res.data.data);
            } catch (err) {
                console.error("Failed to load workspace", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspace();
    }, [id]);

    const toggleGoal = async (index: number) => {
        if (!relation) return;
        let goals = [...(relation.goals_json || [])];
        goals[index].completed = !goals[index].completed;
        updateGoals(goals);
    };

    const addGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal || !relation) return;
        let goals = [...(relation.goals_json || []), { text: newGoal, completed: false }];
        updateGoals(goals);
        setNewGoal('');
    };

    const updateGoals = async (goals: Goal[]) => {
        if (!relation) return;
        setRelation({ ...relation, goals_json: goals });
        try {
            await api.put(`/mentorship/${id}/goals`, { goals_json: goals });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="py-40 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Workspace...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!relation) {
        return (
            <DashboardLayout>
                <div className="text-center py-40">
                    <div className="text-zinc-300 dark:text-zinc-700 font-black text-6xl uppercase italic tracking-tighter mb-4 opacity-20">404</div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">Workspace Not Found</h2>
                    <p className="text-zinc-500 font-medium">The mentorship data could not be retrieved.</p>
                </div>
            </DashboardLayout>
        );
    }

    const isMentor = relation.mentor_id === user?.id;
    const partner = isMentor ? relation.mentee : relation.mentor;
    const roleString = isMentor ? 'Mentee' : 'Mentor';

    const goals = relation.goals_json || [];
    const completedGoals = goals.filter(g => g.completed).length;
    const progress = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    return (
        <DashboardLayout>
            <div className="mb-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${relation.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'}`}>
                                {relation.status}
                            </span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{relation.type}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic mb-2">Development Hub</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg italic max-w-xl">Focusing on {relation.focus_area}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                            <div className="relative w-14 h-14 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-full flex items-center justify-center font-black text-xl border-2 border-white dark:border-zinc-800">
                                {partner?.first_name?.[0]}{partner?.last_name?.[0]}
                            </div>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{roleString}</p>
                            <p className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{partner?.first_name} {partner?.last_name}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Journey Goals */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                                <div>
                                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Strategic Milestones</h2>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Growth Tracking & Progress</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-indigo-600 dark:text-indigo-400 font-black text-2xl tracking-tighter italic">{progress}%</span>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Completion</p>
                                </div>
                            </div>
                            
                            <div className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-full h-2 mb-12 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
                                <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: `${progress}%` }}></div>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {goals.map((g, idx) => (
                                    <li key={idx} className={`group/item flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${g.completed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500/30'}`}>
                                        <button onClick={() => toggleGoal(idx)} className="mt-0.5 relative flex items-center justify-center">
                                            {g.completed ? (
                                                <SolidCheckCircleIcon className="w-6 h-6 text-emerald-500 animate-in zoom-in duration-300" />
                                            ) : (
                                                <CheckCircleIcon className="w-6 h-6 text-zinc-300 dark:text-zinc-700 group-hover/item:text-indigo-500 transition-colors" />
                                            )}
                                        </button>
                                        <span className={`text-sm font-bold uppercase tracking-wide transition-all ${g.completed ? 'line-through text-zinc-400 italic' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                            {g.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <form onSubmit={addGoal} className="flex gap-4 relative">
                                <div className="relative flex-1">
                                    <PlusIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="text"
                                        placeholder="Add a new milestone or goal..."
                                        className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-zinc-900 dark:text-white font-bold placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                        value={newGoal}
                                        onChange={e => setNewGoal(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="px-8 py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-indigo-600 dark:hover:bg-zinc-100 transition-all shadow-xl active:scale-95">
                                    Add Task
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Actions & Resources */}
                    <div className="lg:col-span-4 space-y-10">
                        <section className="bg-indigo-600 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-transparent"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                            
                            <h3 className="font-black text-white mb-6 text-xl uppercase tracking-tight italic relative z-10">Engagement</h3>
                            <button className="relative z-10 w-full bg-white text-indigo-600 py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-xl hover:scale-105 active:scale-95 transition-all mb-4">
                                Schedule Briefing
                            </button>
                            <p className="relative z-10 text-[10px] text-white/60 text-center font-black uppercase tracking-widest leading-relaxed">
                                Propose a gathering for strategic discussion or mentorship check-in.
                            </p>
                        </section>

                        <section className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-3 mb-8">
                                <SparklesIcon className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-black text-zinc-900 dark:text-white text-xl uppercase tracking-tight italic">Knowledge Base</h3>
                            </div>
                            <div className="space-y-6">
                                <a href="/resources" className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
                                        <PlayCircleIcon className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Servant Leadership 101</h4>
                                        <p className="text-[10px] text-zinc-400 mt-1 font-medium italic line-clamp-2">Foundational principles for guiding others within the Kingdom network.</p>
                                    </div>
                                </a>
                                <a href="/resources" className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors">
                                        <PlayCircleIcon className="w-6 h-6 text-indigo-300 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Covenant Relationships</h4>
                                        <p className="text-[10px] text-zinc-400 mt-1 font-medium italic line-clamp-2">Understanding long-term growth and spiritual accompaniment strategies.</p>
                                    </div>
                                </a>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MentorshipWorkspace;
