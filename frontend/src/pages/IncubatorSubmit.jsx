import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { LightBulbIcon } from '@heroicons/react/24/outline';

const IncubatorSubmit = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        problem_statement: '',
        vision_purpose: '',
        is_aligned: false,
        needs_json: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const toggleNeed = (need) => {
        setForm(prev => {
            const has = prev.needs_json.includes(need);
            return {
                ...prev,
                needs_json: has ? prev.needs_json.filter(n => n !== need) : [...prev.needs_json, need]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.is_aligned) {
            setError("You must confirm alignment with Kingdom values.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/incubator', form);
            alert("Idea successfully submitted to the Incubator!");
            navigate('/incubator/explore');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit idea.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-4 bg-sky-100/50 rounded-2xl">
                        <LightBulbIcon className="w-8 h-8 text-sky-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46]">Submit Business Idea</h1>
                        <p className="text-gray-500 mt-1">Pre-accelerator for God-inspired ventures.</p>
                    </div>
                </div>

                {error && <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Idea Title</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none"
                            placeholder="e.g. Genesis Tech Solutions"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Problem Statement</label>
                        <p className="text-xs text-gray-500 mb-2">What earthly or spiritual need are you solving?</p>
                        <textarea 
                            required 
                            rows="3"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none resize-none"
                            value={form.problem_statement}
                            onChange={e => setForm({...form, problem_statement: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Vision & Purpose</label>
                        <textarea 
                            required 
                            rows="3"
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all outline-none resize-none"
                            placeholder="How does this align with Kingdom impact?"
                            value={form.vision_purpose}
                            onChange={e => setForm({...form, vision_purpose: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">What kind of help do you need?</label>
                        <div className="flex flex-wrap gap-3">
                            {['Funding / Capital', 'Tech & Engineering', 'Legal & Compliance', 'Mentorship', 'Marketing Strategy'].map(need => (
                                <button 
                                    type="button"
                                    key={need}
                                    onClick={() => toggleNeed(need)}
                                    className={`px-4 py-2 text-sm font-bold rounded-full transition-colors border ${
                                        form.needs_json.includes(need) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {need}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="flex-shrink-0 mt-0.5">
                                <input 
                                    type="checkbox" 
                                    required
                                    className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 border-gray-300"
                                    checked={form.is_aligned}
                                    onChange={e => setForm({...form, is_aligned: e.target.checked})}
                                />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 mb-1 group-hover:text-sky-700 transition-colors">Kingdom Alignment Pledge</span>
                                <span className="block text-xs text-gray-500 leading-relaxed">I confirm that this idea is God-inspired, and I pledge to steward it ethically, honorably, and in alignment with Biblical values.</span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`px-8 py-4 font-bold rounded-xl text-white transition-all ${submitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700 shadow-md hover:shadow-lg'}`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Idea for Validation'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};
export default IncubatorSubmit;
