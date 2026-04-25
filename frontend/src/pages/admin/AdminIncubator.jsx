import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
    CheckBadgeIcon, 
    XCircleIcon, 
    UserGroupIcon, 
    LightBulbIcon 
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const AdminIncubator = () => {
    const { adminUser } = useAdminAuth();
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Smart Match Panel
    const [matchPanelOpen, setMatchPanelOpen] = useState(false);
    const [activeIdeaForMatch, setActiveIdeaForMatch] = useState(null);
    const [matches, setMatches] = useState([]);
    const [matchingLoading, setMatchingLoading] = useState(false);

    useEffect(() => {
        fetchIdeas();
    }, []);

    const fetchIdeas = async () => {
        try {
            const res = await api.get('/admin/incubator');
            setIdeas(res.data.data || []);
        } catch (err) {
            console.error("Failed to load admin ideas", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/incubator/${id}/status`, { status });
            fetchIdeas(); // refresh data
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    const openSmartMatch = async (idea) => {
        setActiveIdeaForMatch(idea);
        setMatchPanelOpen(true);
        setMatchingLoading(true);
        
        try {
            const res = await api.get(`/admin/incubator/${idea.id}/matches`);
            setMatches(res.data.data || []);
        } catch (error) {
            console.error(error);
            alert('Failed to fetch matches');
        } finally {
            setMatchingLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 flex h-[calc(100vh-8rem)] gap-8">
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                            Incubator Curator
                            <LightBulbIcon className="w-8 h-8 text-indigo-600" />
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                            Moderate submitted business ideas and connect founders.
                        </p>
                    </div>
                </div>

                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading ideas...</div>
                        ) : ideas.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No ideas submitted</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Idea & Founder</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Needs / Vision</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Community</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Moderation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                    {ideas.map((idea) => (
                                        <tr key={idea.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="px-8 py-5 align-top">
                                                <div className="flex flex-col gap-2">
                                                    <span className="text-sm font-black text-zinc-900 dark:text-white leading-tight block mb-1">
                                                        {idea.title}
                                                    </span>
                                                    <span className="text-[10px] font-black text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-3 py-1 rounded-md w-max border border-sky-100 dark:border-sky-900/50 uppercase tracking-widest">
                                                        Founder: {idea.founder?.first_name} {idea.founder?.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 align-top">
                                                <p className="text-xs font-medium text-zinc-500 mb-3 line-clamp-2 leading-relaxed max-w-sm">{idea.vision_purpose}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(idea.needs_json || []).map((need, idx) => (
                                                        <span key={idx} className="bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 px-2 py-0.5 font-black text-[10px] rounded-md uppercase tracking-widest">
                                                            {need}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 align-top">
                                                <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg w-max">
                                                    <LightBulbIcon className="w-4 h-4 text-amber-500" />
                                                    {idea._count?.feedbacks || 0} Feedbacks
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 align-top text-center">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                    idea.status === 'Validated' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50' :
                                                    idea.status === 'Submitted' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                                    idea.status === 'Launched' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' :
                                                    'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                                                }`}>
                                                    {idea.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 align-top text-right">
                                                <div className="flex justify-end gap-2 isolate">
                                                    {idea.status === 'Submitted' && (
                                                        <button 
                                                            onClick={() => updateStatus(idea.id, 'Validated')} 
                                                            title="Approve for Community Review" 
                                                            className="p-2 text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 rounded-xl transition-all group"
                                                        >
                                                            <CheckBadgeIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    
                                                    {idea.status !== 'Draft' && (
                                                        <button 
                                                            onClick={() => openSmartMatch(idea)}
                                                            title="Smart Match Mentors" 
                                                            className="p-2 text-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/30 rounded-xl transition-all group relative"
                                                        >
                                                            <UserGroupIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                                                        </button>
                                                    )}

                                                    {idea.status !== 'Draft' && idea.status !== 'Launched' && (
                                                        <button 
                                                            onClick={() => updateStatus(idea.id, 'Draft')} 
                                                            title="Reject/Revert to Draft" 
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all group"
                                                        >
                                                            <XCircleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
            </div>

            {/* Right Sidebar: Smart Match Panel */}
            {matchPanelOpen && (
                <div className="w-96 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col overflow-hidden max-h-[800px] sticky top-0 animate-in slide-in-from-right-8 duration-300">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-950 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-black">Smart Match</h2>
                            <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase mt-1">Mentor Connections</p>
                        </div>
                        <button onClick={() => setMatchPanelOpen(false)} className="text-zinc-400 hover:text-white relative z-10 p-1 bg-zinc-800 rounded-lg">
                            <XCircleIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Target Idea</p>
                        <h3 className="font-black text-zinc-900 dark:text-white leading-tight">{activeIdeaForMatch?.title}</h3>
                        <div className="flex gap-2 mt-4 flex-wrap">
                            {(activeIdeaForMatch?.needs_json || []).map(n => (
                                <span key={n} className="bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md border border-sky-100 dark:border-sky-900/50">{n}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-900 space-y-4">
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-4">Suggested Curators & Mentors</p>
                        
                        {matchingLoading ? (
                            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
                        ) : matches.length > 0 ? (
                            matches.map(match => (
                                <div key={match.id} className="border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-zinc-950">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center font-black text-sm uppercase">
                                            {match.first_name?.[0]}{match.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{match.first_name} {match.last_name}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-0.5">{match.role}</p>
                                        </div>
                                    </div>
                                    <button className="text-[10px] font-black tracking-widest uppercase bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        Recommend
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm font-medium text-zinc-400 text-center py-10 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">No explicit mentor matches found in the directory.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminIncubator;
