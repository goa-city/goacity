import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircleIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import QuillEditor from '../components/QuillEditor';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../features/auth/context/AuthContext';
import api from '../api/axios';

interface ResourceForm {
    title: string;
    category: string;
    author: string;
    url: string;
    description: string;
}

const ResourceEditor: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<ResourceForm>({
        title: '',
        category: '',
        author: '',
        url: '',
        description: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const formCategories = ["Community", "Awards", "Event", "Design", "Interviews"];

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        if (!allowed.includes(file.type)) {
            alert('Only PDF, Word, and PowerPoint files are allowed.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('File too large. Maximum size is 20MB.');
            return;
        }
        setSelectedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.category || !form.author) {
            alert('Title, Category, and Author are required.');
            return;
        }
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, v));
            formData.append('submitted_by', String(user?.id || ''));
            if (selectedFile) formData.append('file', selectedFile);
            
            await api.post('/resources', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setSubmitSuccess(true);
            setTimeout(() => navigate('/resources'), 2000);
        } catch (err: any) {
            alert('Error submitting resource: ' + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto py-12 px-4">
                <button
                    onClick={() => navigate('/resources')}
                    className="flex items-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mb-10 group text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform stroke-[3px]" />
                    Back to Resources
                </button>

                <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                    
                    <div className="p-10 md:p-12 border-b border-zinc-50 dark:border-zinc-800">
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Share Resource</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">Contribute valuable knowledge to the Goa City network.</p>
                    </div>

                    {submitSuccess ? (
                        <div className="p-20 text-center">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircleIcon className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-widest italic">Contribution Received</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">Your resource is being reviewed and will be live shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-10 md:p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Title <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text" name="title" value={form.title} onChange={handleFormChange}
                                        placeholder="e.g. Kingdom Stewardship in the Digital Age"
                                        required
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Category <span className="text-rose-500">*</span></label>
                                    <select
                                        name="category" value={form.category} onChange={handleFormChange} required
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {formCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Author <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text" name="author" value={form.author} onChange={handleFormChange}
                                        placeholder="Name of the creator" required
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Reference URL</label>
                                <input
                                    type="url" name="url" value={form.url} onChange={handleFormChange}
                                    placeholder="https://..."
                                    className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Digital Attachment</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative w-full px-8 py-14 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:border-indigo-500/50 transition-all overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <PaperClipIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-500" />
                                    {selectedFile ? (
                                        <div className="flex flex-col items-center relative z-10">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate max-w-xs">{selectedFile.name}</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 mt-3 hover:underline">
                                                Detach File
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative z-10">
                                            <span className="block text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Click to Upload</span>
                                            <span className="block text-[10px] font-medium text-zinc-400 mt-2">PDF, Word, or PowerPoint (Max 20MB)</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
                            </div>

                            <div className="relative">
                                <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Detailed Description</label>
                                <div className="border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-inner">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                        placeholder="Contextualize this resource..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit" disabled={isSubmitting}
                                className="group relative w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                            >
                                <span className="relative z-10">
                                    {isSubmitting ? 'Syncing Repository...' : 'Publish Resource'}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ResourceEditor;
