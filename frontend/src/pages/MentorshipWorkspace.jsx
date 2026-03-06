import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { CheckCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

const MentorshipWorkspace = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [relation, setRelation] = useState(null);
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

    const toggleGoal = async (index) => {
        let goals = [...(relation.goals_json || [])];
        goals[index].completed = !goals[index].completed;
        updateGoals(goals);
    };

    const addGoal = async (e) => {
        e.preventDefault();
        if (!newGoal) return;
        let goals = [...(relation.goals_json || []), { text: newGoal, completed: false }];
        updateGoals(goals);
        setNewGoal('');
    };

    const updateGoals = async (goals) => {
        setRelation({ ...relation, goals_json: goals });
        try {
            await api.put(`/mentorship/${id}/goals`, { goals_json: goals });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <DashboardLayout><div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div></DashboardLayout>;
    if (!relation) return <DashboardLayout><div className="p-8 text-center text-gray-500">Workspace not found</div></DashboardLayout>;

    const isMentor = relation.mentor_id === user?.userId;
    const partner = isMentor ? relation.mentee : relation.mentor;
    const roleString = isMentor ? 'Mentee' : 'Mentor';

    const goals = relation.goals_json || [];
    const completedGoals = goals.filter(g => g.completed).length;
    const progress = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    return (
        <DashboardLayout>
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${relation.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {relation.status}
                        </span>
                        <span className="text-sm font-medium text-gray-400">{relation.type}</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Mentorship Workspace</h1>
                    <p className="text-gray-500 mt-1">Focus Area: {relation.focus_area}</p>
                </div>
                
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {partner?.first_name?.[0]}{partner?.last_name?.[0]}
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">{roleString}</p>
                        <p className="text-lg font-bold text-gray-900">{partner?.first_name} {partner?.last_name}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left side: Goals */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Journey Goals</h2>
                            <span className="text-sky-600 font-bold">{progress}% Completed</span>
                        </div>
                        
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8">
                            <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>

                        <ul className="space-y-4 mb-6">
                            {goals.map((g, idx) => (
                                <li key={idx} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                    <button onClick={() => toggleGoal(idx)} className="mt-0.5">
                                        {g.completed ? 
                                            <SolidCheckCircleIcon className="w-6 h-6 text-green-500" /> : 
                                            <CheckCircleIcon className="w-6 h-6 text-gray-300 hover:text-green-500" />
                                        }
                                    </button>
                                    <span className={`text-gray-800 font-medium ${g.completed ? 'line-through text-gray-400' : ''}`}>
                                        {g.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <form onSubmit={addGoal} className="flex gap-3">
                            <input 
                                type="text"
                                placeholder="Add a new milestone or goal..."
                                className="flex-1 px-4 py-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-sky-500 outline-none w-full text-gray-900"
                                value={newGoal}
                                onChange={e => setNewGoal(e.target.value)}
                            />
                            <button type="submit" className="px-6 py-3 bg-[#2D2D46] hover:bg-gray-800 text-white font-bold rounded-xl whitespace-nowrap">
                                Add Goal
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right side: Actions & Resources */}
                <div className="space-y-6">
                    <div className="bg-sky-50 rounded-3xl p-6 border border-sky-100">
                        <h3 className="font-bold text-sky-900 mb-4 text-lg">Quick Actions</h3>
                        <a href="/dashboard" className="flex items-center gap-3 w-full bg-white p-4 rounded-xl shadow-sm text-sky-700 font-bold hover:shadow hover:bg-sky-50 transition-all cursor-pointer mb-3 text-center justify-center">
                            Schedule Meeting
                        </a>
                        <p className="text-xs text-sky-600/80 text-center leading-relaxed">
                            Use the Meetings tool to propose a gathering for prayer or discussion.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Recommended Resources</h3>
                        <div className="space-y-4">
                            <a href="/resources" className="flex items-start gap-3 group">
                                <PlayCircleIcon className="w-8 h-8 text-indigo-200 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Servant Leadership 101</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">A foundational course from the Knowledge Library on guiding others.</p>
                                </div>
                            </a>
                            <a href="/resources" className="flex items-start gap-3 group">
                                <PlayCircleIcon className="w-8 h-8 text-indigo-200 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Building Covenant Relationships</h4>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">Understanding long-term growth and spiritual accompaniment.</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
export default MentorshipWorkspace;
