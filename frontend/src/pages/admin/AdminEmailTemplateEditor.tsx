import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import {
    EnvelopeOpenIcon, AtSymbolIcon, TagIcon 
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftOutline } from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import QuillEditor from '../../components/QuillEditor';

const AdminEmailTemplateEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = id && id !== 'create';

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        message: ''
    });
    const [toast, setToast] = useState('');

    const commonPlaceholders = [
        { label: 'First Name', value: '{first_name}' },
        { label: 'Last Name', value: '{last_name}' },
        { label: 'OTP Code (Login Only)', value: '{otp_code}' },
        { label: 'Meeting Title', value: '{meeting_title}' },
        { label: 'Meeting Date', value: '{meeting_date}' },
        { label: 'Meeting Time', value: '{meeting_time}' },
        { label: 'Location Name', value: '{location_name}' },
        { label: 'Map Link', value: '{map_link}' },
        { label: 'Zoom Link', value: '{zoom_link}' },
        { label: 'Meeting Recap', value: '{recap_content}' },
        { label: 'Meeting RSVP Link', value: '{rsvp_link}' },
        { label: 'Current Date', value: '{current_date}' }
    ];

    useEffect(() => {
        if (isEdit) {
            fetchTemplate();
        }
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const res = await api.get(`/admin/email-templates/${id}`);
            setFormData(res.data);
        } catch (error) {
            console.error("Failed to fetch template:", error);
            navigate('/admin/email-templates');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/admin/email-templates/${id}`, formData);
            } else {
                await api.post('/admin/email-templates', formData);
            }
            navigate('/admin/email-templates');
        } catch (error) {
            console.error("Failed to save template:", error);
            showToast("Error saving template. Ensure Title is unique.");
        } finally {
            setSaving(false);
        }
    };

    const handleCopyPlaceholder = (val) => {
        navigator.clipboard.writeText(val);
        showToast(`Copied ${val} to clipboard!`);
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading editor...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}
            {/* Header */}
            <div className="flex flex-col mb-8">
                <button
                    onClick={() => navigate('/admin/email-templates')}
                    className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors mb-8 group"
                >
                    <ArrowLeftOutline className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                    <span className="text-xl font-medium">Back to Templates</span>
                </button>
                <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        {isEdit ? 'Edit Template' : 'Create Template'}
                        <EnvelopeOpenIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                </div>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium ml-12 mb-10">Design your automated system email</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                    Template Title (Used as internal ID)
                                </label>
                                <div className="relative">
                                    <TagIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. OTP Login, Welcome Member..."
                                        className="w-full pl-10 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-zinc-400 font-black tracking-widest uppercase">Use 'OTP Login' for the login system template.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                    Email Subject Line
                                </label>
                                <div className="relative">
                                    <AtSymbolIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        required
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Enter the subject line..."
                                        className="w-full pl-10 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                    Email Content
                                </label>
                                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-950">
                                     <QuillEditor 
                                        value={formData.message} 
                                        onChange={(val) => setFormData({ ...formData, message: val })}
                                        className="h-96"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full justify-center py-4 text-sm shadow-xl shadow-indigo-600/20"
                                >
                                    {saving ? 'Saving Changes...' : 'Save Template'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar / Placeholders */}
                <div className="space-y-6">
                    <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden p-6">
                        <h2 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest flex items-center mb-4">Common Elements</h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-6">Click to copy placeholder to clipboard and paste it in your editor.</p>
                        
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            {commonPlaceholders.map(ph => (
                                <button
                                    key={ph.value}
                                    onClick={() => handleCopyPlaceholder(ph.value)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-100 dark:border-zinc-800 rounded-xl transition-all group"
                                >
                                    <span className="text-xs text-zinc-700 dark:text-zinc-300 font-black uppercase tracking-widest">{ph.label}</span>
                                    <span className="text-[10px] font-mono text-indigo-500 group-hover:scale-110 transition-transform font-bold bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">{ph.value}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl p-6">
                        <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-2">Editor Tip</h3>
                        <p className="text-sm text-amber-700 dark:text-amber-500 font-medium leading-relaxed">
                            Use placeholders exactly as shown (with single curly brackets). The system will automatically replace them with real data when the email is sent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmailTemplateEditor;
