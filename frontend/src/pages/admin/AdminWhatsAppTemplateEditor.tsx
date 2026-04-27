import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
    VariableIcon 
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftOutline } from '@heroicons/react/24/outline';
import { Card, CardContent } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import Input from '../../shared/components/ui/Input';

interface TemplateFormData {
    title: string;
    content: string;
}

const AdminWhatsAppTemplateEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = id && id !== 'create';

    const [loading, setLoading] = useState(!!isEdit);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [formData, setFormData] = useState<TemplateFormData>({
        title: '',
        content: ''
    });

    useEffect(() => {
        if (isEdit) {
            fetchTemplate();
        }
    }, [id]);

    const showToast = (msg: string): void => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchTemplate = async () => {
        try {
            const res = await api.get(`/admin/whatsapp-templates/${id}`);
            setFormData({
                title: res.data.title || '',
                content: res.data.content || ''
            });
        } catch (error) {
            console.error("Failed to fetch template:", error);
            showToast("Failed to load template");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/admin/whatsapp-templates/${id}`, formData);
                showToast("Template updated successfully");
            } else {
                await api.post('/admin/whatsapp-templates', formData);
                showToast("Template created successfully");
            }
            setTimeout(() => navigate('/admin/whatsapp/templates'), 1000);
        } catch (error) {
            console.error("Failed to save template:", error);
            showToast("Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const insertVariable = (variable: string): void => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + ` {${variable}} `
        }));
    };

    if (loading) return <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 animate-pulse">Loading editor...</div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 font-sans relative">
            {toast && (
                <div className="fixed bottom-10 right-10 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-2xl z-[100] font-black uppercase text-[10px] tracking-widest animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/admin/whatsapp/templates')} 
                    className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors group"
                >
                    <ArrowLeftOutline className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                    <span className="text-xl font-medium">Back to Templates</span>
                </button>
                <div className="flex gap-3">
                    <Button onClick={handleSave} isLoading={saving} className="px-8 shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 border-none">
                        <CheckIcon className="w-4 h-4 mr-2" /> {isEdit ? 'Update Template' : 'Save Template'}
                    </Button>
                </div>
            </div>

            <div className="mb-10">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3 italic">
                    {isEdit ? 'Edit Template' : 'Create Template'}
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-600" />
                </h1>
                <p className="text-zinc-500 mt-2 font-medium">Design your reusable WhatsApp message</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-zinc-100 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/50">
                        <CardContent className="p-8 space-y-6">
                            <Input 
                                label="Template Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Event Confirmation"
                                className="bg-zinc-50 dark:bg-zinc-950 font-bold"
                                required
                            />
                            
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Message Content</label>
                                <textarea 
                                    className="w-full h-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 transition-all font-medium leading-relaxed"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Type your message here..."
                                    required
                                />
                                <p className="mt-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Supports WhatsApp formatting: *bold*, _italic_, ~strikethrough~</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <VariableIcon className="w-5 h-5 text-emerald-600" />
                                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400">Insert Variables</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['firstname', 'lastname', 'meeting_title', 'meeting_date', 'meeting_time', 'location'].map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => insertVariable(v)}
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-4 text-[10px] text-emerald-700/60 dark:text-emerald-500/60 font-medium italic">Click a variable to insert it into your message at the cursor position.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <CardContent className="p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 italic">Live Preview</h3>
                            <div className="bg-emerald-100/50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200/50 dark:border-emerald-800/50 relative">
                                <div className="absolute left-[-8px] top-4 w-4 h-4 bg-emerald-100/50 dark:bg-emerald-900/20 rotate-45 border-l border-b border-emerald-200/50 dark:border-emerald-800/50" />
                                <p className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed font-medium">
                                    {formData.content || 'Your message preview will appear here...'}
                                </p>
                                <p className="text-[10px] text-zinc-400 mt-2 text-right">09:41 AM</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminWhatsAppTemplateEditor;
