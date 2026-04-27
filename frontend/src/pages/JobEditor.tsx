import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, BriefcaseIcon, MapPinIcon, LinkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import QuillEditor from '../components/QuillEditor';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../features/auth/context/AuthContext';
import api from '../api/axios';

interface JobForm {
    title: string;
    company: string;
    location: string;
    type: string;
    category: string;
    url: string;
    contact_email: string;
    description: string;
    company_profile: string;
    expires_at: string;
}

const JobEditor: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [form, setForm] = useState<JobForm>({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        category: '',
        url: '',
        contact_email: '',
        description: '',
        company_profile: '',
        expires_at: ''
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.company || !form.location) {
            alert('Job Title, Company, and Location are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append('posted_by', String(user?.id || ''));
            await api.post('/jobs', formData);
            setSubmitSuccess(true);
            setTimeout(() => navigate('/jobs'), 2000);
        } catch (err: any) {
            alert('Error posting job: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button
                    onClick={() => navigate('/jobs')}
                    className="flex items-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mb-10 group text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform stroke-[3px]" />
                    Back to Job Postings
                </button>

                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500"></div>
                    
                    <div className="p-10 md:p-12 border-b border-zinc-50 dark:border-zinc-800 bg-sky-500/[0.02]">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <BriefcaseIcon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Post Opportunity</h1>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium italic">Hire talent from the GOA.CITY network.</p>
                            </div>
                        </div>
                    </div>

                    {submitSuccess ? (
                        <div className="p-20 text-center">
                            <div className="w-24 h-24 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircleIcon className="w-12 h-12 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-widest italic">Listing Published</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Your job posting has been submitted for review.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Job Title <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text" name="title" value={form.title} onChange={handleFormChange}
                                        placeholder="e.g. Senior Product Designer" required
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Company <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text" name="company" value={form.company} onChange={handleFormChange}
                                        placeholder="Organization name" required
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Location <span className="text-rose-500">*</span></label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="text" name="location" value={form.location} onChange={handleFormChange}
                                            placeholder="City or Remote" required
                                            className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Contract Type</label>
                                    <select
                                        name="type" value={form.type} onChange={handleFormChange}
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Industry Category</label>
                                    <input
                                        type="text" name="category" value={form.category} onChange={handleFormChange}
                                        placeholder="e.g. Technology"
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Application URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="url" name="url" value={form.url} onChange={handleFormChange}
                                            placeholder="Direct apply link"
                                            className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Contact Email</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                        <input
                                            type="email" name="contact_email" value={form.contact_email} onChange={handleFormChange}
                                            placeholder="careers@..."
                                            className="w-full pl-14 pr-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Listing Expiry Date</label>
                                    <input
                                        type="date" name="expires_at" value={form.expires_at} onChange={handleFormChange}
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                    />
                                    <p className="mt-3 text-[9px] text-zinc-400 font-black uppercase tracking-widest ml-2">The job will be automatically archived after this date.</p>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Company Culture</label>
                                <div className="border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-inner">
                                    <QuillEditor
                                        value={form.company_profile}
                                        onChange={(val) => setForm(f => ({ ...f, company_profile: val }))}
                                        placeholder="Describe your organization's mission..."
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Role Definition</label>
                                <div className="border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-inner">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                        placeholder="Define the role, requirements, and benefits..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSubmitting}
                                className="group relative w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <span className="relative z-10">
                                    {isSubmitting ? 'Syncing Job Board...' : 'Broadcast Opening'}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default JobEditor;
