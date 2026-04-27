import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { LightBulbIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface IncubatorForm {
    title: string;
    problem_statement: string;
    vision_purpose: string;
    is_aligned: boolean;
    needs_json: string[];
}

const IncubatorSubmit: React.FC = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<IncubatorForm>({
        title: '',
        problem_statement: '',
        vision_purpose: '',
        is_aligned: false,
        needs_json: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleNeed = (need: string) => {
        setForm(prev => {
            const has = prev.needs_json.includes(need);
            return {
                ...prev,
                needs_json: has ? prev.needs_json.filter(n => n !== need) : [...prev.needs_json, need]
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!form.is_aligned) {
            setError("You must confirm alignment with Kingdom values.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/incubator', form);
            navigate('/incubator/explore');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to submit idea.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto mb-20">
                <div className="mb-12 flex items-center gap-6">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center shadow-inner">
                        <LightBulbIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-2">
                            Accelerator
                        </div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Incubator Portal</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium italic">Transforming God-inspired visions into reality.</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-black uppercase tracking-widest p-5 rounded-2xl flex items-center gap-4">
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-zinc-900 p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                    
                    <div className="relative">
                        <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 mb-3 ml-2">Project Identity</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-zinc-900 dark:text-white font-bold placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            placeholder="e.g. Genesis Ecosystem"
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                        />
                    </div>
                    
                    <div className="relative">
                        <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 mb-3 ml-2">The Challenge</label>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-3 ml-2 font-medium">Describe the specific spiritual or earthly need being addressed.</p>
                        <textarea 
                            required 
                            rows={4}
                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-zinc-900 dark:text-white font-medium resize-none"
                            value={form.problem_statement}
                            onChange={e => setForm({...form, problem_statement: e.target.value})}
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 mb-3 ml-2">Vision & Strategy</label>
                        <textarea 
                            required 
                            rows={4}
                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-zinc-900 dark:text-white font-medium resize-none"
                            placeholder="Explain the long-term Kingdom impact and strategy."
                            value={form.vision_purpose}
                            onChange={e => setForm({...form, vision_purpose: e.target.value})}
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400 mb-4 ml-2">Resource Requirements</label>
                        <div className="flex flex-wrap gap-3">
                            {['Funding / Capital', 'Tech & Engineering', 'Legal & Compliance', 'Mentorship', 'Marketing Strategy'].map(need => (
                                <button 
                                    type="button"
                                    key={need}
                                    onClick={() => toggleNeed(need)}
                                    className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                                        form.needs_json.includes(need) 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/20 scale-105' 
                                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {need}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 relative">
                        <label className="flex items-start gap-6 cursor-pointer group">
                            <div className="flex-shrink-0 mt-1 relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    required
                                    className="peer appearance-none w-6 h-6 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 checked:bg-emerald-500 checked:border-emerald-500 transition-all"
                                    checked={form.is_aligned}
                                    onChange={e => setForm({...form, is_aligned: e.target.checked})}
                                />
                                <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <div>
                                <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">Kingdom Alignment Pledge</span>
                                <span className="block text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed font-medium">I confirm that this idea is God-inspired, and I pledge to steward it ethically, honorably, and in alignment with Biblical values.</span>
                            </div>
                        </label>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`group relative px-10 py-5 font-black uppercase tracking-[0.3em] rounded-2xl text-[11px] text-white transition-all overflow-hidden ${submitting ? 'bg-zinc-400' : 'bg-zinc-950 hover:bg-indigo-600 shadow-2xl active:scale-95'}`}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-4 h-4" />
                                        Launch Validation
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default IncubatorSubmit;
