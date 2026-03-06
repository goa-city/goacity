import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
    CheckBadgeIcon, 
    XCircleIcon, 
    UserGroupIcon, 
    LightBulbIcon 
} from '@heroicons/react/24/outline';

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
        <div className="flex h-full gap-8">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46]">Incubator Curator</h1>
                        <p className="text-gray-500 mt-2">Moderate submitted business ideas and connect founders with kingdom mentors.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                        <th className="p-4 font-medium uppercase tracking-wider">Idea & Founder</th>
                                        <th className="p-4 font-medium uppercase tracking-wider">Needs / Vision</th>
                                        <th className="p-4 font-medium uppercase tracking-wider">Community</th>
                                        <th className="p-4 font-medium uppercase tracking-wider text-center">Status</th>
                                        <th className="p-4 font-medium uppercase tracking-wider text-right">Moderation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {ideas.map((idea) => (
                                        <tr key={idea.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 align-top pt-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-lg font-black text-gray-900 leading-tight block mb-1">
                                                        {idea.title}
                                                    </span>
                                                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md w-max shadow-sm border border-sky-100 uppercase tracking-widest">
                                                        Founder: {idea.founder?.first_name} {idea.founder?.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-top pt-6">
                                                <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed max-w-sm">{idea.vision_purpose}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {(idea.needs_json || []).map((need, idx) => (
                                                        <span key={idx} className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 font-bold text-[10px] rounded uppercase tracking-wider">
                                                            {need}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4 align-top pt-6">
                                                <div className="flex items-center gap-2 text-gray-500 font-bold bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg w-max">
                                                    <LightBulbIcon className="w-4 h-4 text-amber-500" />
                                                    {idea._count?.feedbacks || 0} Feedbacks
                                                </div>
                                            </td>
                                            <td className="p-4 align-top pt-6 text-center">
                                                <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg border ${
                                                    idea.status === 'Validated' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                    idea.status === 'Submitted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    idea.status === 'Launched' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {idea.status}
                                                </span>
                                            </td>
                                            <td className="p-4 align-top pt-6 text-right">
                                                <div className="flex justify-end gap-2 isolate">
                                                    {idea.status === 'Submitted' && (
                                                        <button 
                                                            onClick={() => updateStatus(idea.id, 'Validated')} 
                                                            title="Approve for Community Review" 
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200 group"
                                                        >
                                                            <CheckBadgeIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                    
                                                    {idea.status !== 'Draft' && (
                                                        <button 
                                                            onClick={() => openSmartMatch(idea)}
                                                            title="Smart Match Mentors" 
                                                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-200 group relative"
                                                        >
                                                            <UserGroupIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white"></span>
                                                        </button>
                                                    )}

                                                    {idea.status !== 'Draft' && idea.status !== 'Launched' && (
                                                        <button 
                                                            onClick={() => updateStatus(idea.id, 'Draft')} 
                                                            title="Reject/Revert to Draft" 
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 group"
                                                        >
                                                            <XCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {ideas.length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-gray-500 bg-gray-50/50 font-medium">No ideas submitted for review.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Smart Match Panel */}
            {matchPanelOpen && (
                <div className="w-96 bg-white rounded-3xl shadow-lg border border-gray-100 flex flex-col overflow-hidden max-h-[800px] sticky top-8 animate-in slide-in-from-right-8 duration-300">
                    <div className="p-6 border-b border-gray-100 bg-slate-900 text-white flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-black">Smart Match</h2>
                            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">Mentor Connections</p>
                        </div>
                        <button onClick={() => setMatchPanelOpen(false)} className="text-slate-400 hover:text-white relative z-10">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="p-6 bg-slate-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Target Idea</p>
                        <h3 className="font-black text-slate-900 leading-tight">{activeIdeaForMatch?.title}</h3>
                        <div className="flex gap-1 mt-3 flex-wrap">
                            {(activeIdeaForMatch?.needs_json || []).map(n => (
                                <span key={n} className="bg-sky-100 text-sky-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-sky-200">{n}</span>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-white space-y-4">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Suggested Curators & Mentors</p>
                        
                        {matchingLoading ? (
                            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div></div>
                        ) : matches.length > 0 ? (
                            matches.map(match => (
                                <div key={match.id} className="border border-gray-100 p-4 rounded-2xl flex items-center justify-between group hover:border-sky-200 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold font-serif shadow-inner">
                                            {match.first_name?.[0]}{match.last_name?.[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{match.first_name} {match.last_name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{match.role}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Recommend
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">No explicit mentor matches found in the directory.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminIncubator;
