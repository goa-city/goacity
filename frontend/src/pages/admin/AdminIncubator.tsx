import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
    LightBulbIcon,
    PencilIcon,
    ArchiveBoxIcon,
    TrashIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
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
    _count?: {
        feedbacks?: number;
    };
}

const AdminIncubator: React.FC = () => {
    const navigate = useNavigate();
    const [ideas, setIdeas] = useState<IncubatorIdea[]>([]);
    const [loading, setLoading] = useState(true);

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

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/incubator/${id}/status`, { status });
            fetchIdeas();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteIdea = async (id: number) => {
        if (!window.confirm("Are you sure you want to permanently delete this venture idea?")) return;
        try {
            await api.delete(`/admin/incubator/${id}`);
            fetchIdeas();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
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
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Submitted by</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Idea</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Community</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Moderation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {ideas.map((idea) => (
                                    <tr key={idea.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                        <td className="px-8 py-5 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                    {idea.founder?.first_name?.[0]}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-zinc-900 dark:text-white uppercase tracking-tight text-xs">{idea.founder?.first_name} {idea.founder?.last_name}</h4>
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{idea.founder?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 align-top">
                                            <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight block mb-1">
                                                {idea.title}
                                            </h4>
                                            <p className="text-xs font-medium text-zinc-500 line-clamp-1 leading-relaxed max-w-sm">{idea.vision_purpose}</p>
                                        </td>
                                        <td className="px-8 py-5 align-top">
                                            <div className="flex items-center gap-2 text-zinc-500 font-black uppercase tracking-widest text-[10px] bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg w-max">
                                                {idea.feedbacks?.length || 0} Feedbacks
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 align-top text-center">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                idea.status === 'Validated' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900/50' :
                                                idea.status === 'Submitted' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' :
                                                idea.status === 'Launched' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50' :
                                                'bg-zinc-50 text-zinc-650 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                                            }`}>
                                                {idea.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/admin/incubator/${idea.id}`)} 
                                                    title="View Details" 
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                {idea.status !== 'Archived' && (
                                                    <button 
                                                        onClick={() => updateStatus(idea.id, 'Archived')} 
                                                        title="Archive" 
                                                        className="p-2 rounded-xl text-zinc-300 group-hover:text-amber-600 transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                    >
                                                        <ArchiveBoxIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteIdea(idea.id)} 
                                                    title="Delete Venture" 
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
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
    );
};

export default AdminIncubator;
