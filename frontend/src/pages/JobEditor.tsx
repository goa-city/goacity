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
    work_arrangement: string;
    salary_min: string;
    salary_max: string;
    salary_currency: string;
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
        expires_at: '',
        work_arrangement: 'Onsite',
        salary_min: '',
        salary_max: '',
        salary_currency: 'INR'
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <button
                    onClick={() => navigate('/jobs')}
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-12 group"
                >
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 shadow-md flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Back to Jobs</span>
                </button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                        <div className="w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center shrink-0 overflow-hidden shadow-xl">
                            <BriefcaseIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">
                                Post Opportunity
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
                                Hire talent from the GOA.CITY network.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 px-2">
                    <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Opportunity Details</h2>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border-none shadow-2xl shadow-zinc-200/40 dark:shadow-none overflow-hidden mb-20">
                    {submitSuccess ? (
                        <div className="p-20 text-center">
                            <div className="w-24 h-24 bg-sky-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircleIcon className="w-12 h-12 text-sky-600 dark:text-sky-400" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-widest italic">Listing Published</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Your job posting has been submitted for review.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-10">
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
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Work Arrangement</label>
                                    <select
                                        name="work_arrangement" value={form.work_arrangement} onChange={handleFormChange}
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="Onsite">Onsite</option>
                                        <option value="Remote">Remote</option>
                                        <option value="Hybrid">Hybrid</option>
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Salary Min</label>
                                    <input
                                        type="number" name="salary_min" value={form.salary_min} onChange={handleFormChange}
                                        placeholder="e.g. 50000"
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Salary Max</label>
                                    <input
                                        type="number" name="salary_max" value={form.salary_max} onChange={handleFormChange}
                                        placeholder="e.g. 100000"
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Currency</label>
                                    <select
                                        name="salary_currency" value={form.salary_currency} onChange={handleFormChange}
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-sky-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
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
                                        style={{ minHeight: '300px' }}
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
                                        style={{ minHeight: '500px' }}
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
