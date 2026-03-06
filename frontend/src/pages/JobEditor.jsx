import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, BriefcaseIcon, MapPinIcon, LinkIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import QuillEditor from '../components/QuillEditor';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const JobEditor = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [form, setForm] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full Time',
        category: '',
        url: '',
        contact_email: '',
        description: '',
    });

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.company || !form.location) {
            alert('Job Title, Company, and Location are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append('posted_by', user?.id || '');
            await api.post('/jobs', formData);
            setSubmitSuccess(true);
            setTimeout(() => navigate('/jobs'), 2000);
        } catch (err) {
            alert('Error posting job: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate('/jobs')}
                    className="flex items-center text-gray-500 hover:text-sky-600 transition-colors mb-8 group"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Job Postings
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-sky-50 bg-sky-50/30">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                                <BriefcaseIcon className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-light text-gray-900">Post a Job</h1>
                        </div>
                        <p className="text-gray-500">Hire talent from the GOA.CITY professional network.</p>
                    </div>

                    {submitSuccess ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-12 h-12 text-sky-500" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Job Posted!</h3>
                            <p className="text-gray-500">Your listing has been submitted for review.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" name="title" value={form.title} onChange={handleFormChange}
                                        placeholder="e.g. Senior Frontend Engineer" required
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" name="company" value={form.company} onChange={handleFormChange}
                                        placeholder="Company name" required
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text" name="location" value={form.location} onChange={handleFormChange}
                                            placeholder="e.g. Panjim, Goa" required
                                            className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                                    <select
                                        name="type" value={form.type} onChange={handleFormChange}
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="Full Time">Full Time</option>
                                        <option value="Part Time">Part Time</option>
                                        <option value="Freelance">Freelance</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <input
                                        type="text" name="category" value={form.category} onChange={handleFormChange}
                                        placeholder="e.g. Technology, Education"
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Application URL</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="url" name="url" value={form.url} onChange={handleFormChange}
                                            placeholder="https://company.com/apply"
                                            className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="email" name="contact_email" value={form.contact_email} onChange={handleFormChange}
                                            placeholder="jobs@company.com"
                                            className="w-full pl-11 pr-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                        placeholder="Describe the role, requirements, and benefits..."
                                        style={{ minHeight: '260px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSubmitting}
                                className="w-full bg-sky-500 text-white py-4 rounded-2xl text-base font-semibold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-lg shadow-sky-500/20"
                            >
                                {isSubmitting ? 'Submitting...' : 'Post Job Opening'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default JobEditor;
