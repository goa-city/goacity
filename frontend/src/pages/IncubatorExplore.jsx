import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { LightBulbIcon, HandThumbUpIcon, SparklesIcon, ShareIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

const IncubatorExplore = () => {
    const [ideas, setIdeas] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal feedback state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [feedbackType, setFeedbackType] = useState('Guidance');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    useEffect(() => {
        fetchIdeas();
    }, []);

    const fetchIdeas = async () => {
        try {
            const res = await api.get('/incubator');
            setIdeas(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        try {
            await api.post(`/incubator/${selectedIdea.id}/feedback`, {
                comment: feedback,
                type: feedbackType
            });
            alert('Community Wisdom added!');
            setIsModalOpen(false);
            fetchIdeas();
        } catch (err) {
            console.error('Failed to submit feedback', err);
        } finally {
            setSubmittingFeedback(false);
            setFeedback('');
        }
    };

    const openFeedback = (idea) => {
        setSelectedIdea(idea);
        setFeedback('');
        setFeedbackType('Guidance');
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Idea Lab</h1>
                    <p className="text-gray-500 mt-2">Explore, validate, and nurture business visions from your community.</p>
                </div>
                <Link 
                    to="/incubator/submit"
                    className="flex text-sm font-bold items-center gap-2 px-6 py-3 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl shadow-sm transition-all"
                >
                    <LightBulbIcon className="w-5 h-5" />
                    Submit My Idea
                </Link>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : ideas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ideas.map((idea) => (
                        <div key={idea.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-sky-100/50 text-sky-600 rounded-2xl flex items-center justify-center font-bold">
                                        {idea.founder?.first_name?.[0]}{idea.founder?.last_name?.[0]}
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                        idea.status === 'Validated' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {idea.status}
                                    </span>
                                </div>
                                
                                <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">{idea.title}</h2>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-6 leading-relaxed">
                                    {idea.problem_statement}
                                </p>
                                
                                <div className="space-y-3 mb-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Help Needed</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(idea.needs_json || []).slice(0, 3).map((need, idx) => (
                                            <span key={idx} className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 font-semibold text-xs rounded-full">
                                                {need}
                                            </span>
                                        ))}
                                        {(idea.needs_json || []).length > 3 && (
                                            <span className="bg-gray-50 text-gray-400 border border-gray-100 px-3 py-1 font-semibold text-xs rounded-full">
                                                +{idea.needs_json.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-50 bg-gray-50/30 p-4 flex gap-3">
                                <button 
                                    onClick={() => openFeedback(idea)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-sky-600 rounded-xl text-sm font-bold shadow-sm hover:border-sky-200 transition-colors hover:bg-sky-50"
                                >
                                    <SparklesIcon className="w-5 h-5" />
                                    Give Wisdom
                                </button>
                                <button className="w-auto px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold shadow-sm hover:border-gray-300 transition-colors">
                                    <ShareIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                    <LightBulbIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-500 mb-2">The Idea Lab is quiet right now.</h2>
                    <p className="text-gray-400">Be the first to ignite the room and submit a kingdom-aligned venture.</p>
                </div>
            )}

            {/* Give Wisdom Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-1">Offer Community Wisdom</h3>
                            <p className="text-gray-500 text-sm mb-6">for <span className="font-bold text-sky-600">{selectedIdea?.title}</span></p>

                            <form onSubmit={handleFeedbackSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Contribution Type</label>
                                    <select 
                                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none text-gray-900 font-medium bg-gray-50"
                                        value={feedbackType}
                                        onChange={e => setFeedbackType(e.target.value)}
                                        required
                                    >
                                        <option value="Guidance">Guidance & Advice</option>
                                        <option value="Validation">Market Validation</option>
                                        <option value="Resource_Link">Resource Link/Intro</option>
                                    </select>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Insight</label>
                                    <textarea 
                                        className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-sky-500 outline-none resize-none text-gray-900 bg-gray-50 leading-relaxed"
                                        rows="4"
                                        required
                                        placeholder="Share your experience, an encouraging word, or ask a constructive question..."
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-3.5 bg-white text-gray-600 font-bold rounded-xl hover:bg-gray-50 border border-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={submittingFeedback}
                                        className="flex-1 py-3.5 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submittingFeedback ? 'Posting...' : (
                                            <>
                                                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                Submit Wisdom
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};
export default IncubatorExplore;
