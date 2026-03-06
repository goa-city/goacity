import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import QuillEditor from '../components/QuillEditor';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ResourceEditor = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        category: '',
        author: '',
        url: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const formCategories = ["Community", "Awards", "Event", "Design", "Interviews"];

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = ['application/pdf','application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
        if (!allowed.includes(file.type)) { alert('Only PDF, Word, and PowerPoint files are allowed.'); return; }
        if (file.size > 20 * 1024 * 1024) { alert('File too large. Maximum size is 20MB.'); return; }
        setSelectedFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.category || !form.author) {
            alert('Title, Category, and Author are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append('submitted_by', user?.id || '');
            if (selectedFile) formData.append('file', selectedFile);
            await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSubmitSuccess(true);
            setTimeout(() => navigate('/resources'), 2000);
        } catch (err) {
            alert('Error submitting resource: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate('/resources')}
                    className="flex items-center text-gray-500 hover:text-black transition-colors mb-8 group"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Resources
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h1 className="text-3xl font-light text-gray-900">Add a New Resource</h1>
                        <p className="text-gray-500 mt-2">Share valuable knowledge with the Goa Network community.</p>
                    </div>

                    {submitSuccess ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Resource Submitted!</h3>
                            <p className="text-gray-500">Your contribution is being reviewed and will be live soon.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" name="title" value={form.title} onChange={handleFormChange}
                                        placeholder="e.g. The Future of Sustainable Architecture in Goa"
                                        required
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#E0A876] focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-400">*</span></label>
                                    <select
                                        name="category" value={form.category} onChange={handleFormChange} required
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#E0A876] focus:border-transparent transition-all appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {formCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Author <span className="text-red-400">*</span></label>
                                    <input
                                        type="text" name="author" value={form.author} onChange={handleFormChange}
                                        placeholder="Author name" required
                                        className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#E0A876] focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">External URL</label>
                                <input
                                    type="url" name="url" value={form.url} onChange={handleFormChange}
                                    placeholder="https://example.com/full-article"
                                    className="w-full px-5 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#E0A876] focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (PDF, Word, PPT — max 20MB)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-6 py-10 border-2 border-dashed border-gray-200 rounded-3xl text-center cursor-pointer hover:border-[#E0A876] hover:bg-[#E0A876]/5 transition-all group"
                                >
                                    <PaperClipIcon className="w-8 h-8 text-gray-400 mx-auto mb-3 group-hover:text-[#E0A876] transition-colors" />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{selectedFile.name}</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); fileInputRef.current.value = ''; }} className="text-xs text-red-500 mt-2 hover:underline">
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="block text-sm font-medium text-gray-900">Click to upload</span>
                                            <span className="block text-xs text-gray-400 mt-1">PDF, Word, or PowerPoint</span>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                        placeholder="Tell us more about this resource..."
                                        style={{ minHeight: '220px' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSubmitting}
                                className="w-full bg-black text-white py-4 rounded-2xl text-base font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99] shadow-lg shadow-black/10"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Resource'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ResourceEditor;
