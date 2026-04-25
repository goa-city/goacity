import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import QuillEditor from '../../components/QuillEditor';
import api from '../../api/axios';

const AdminPageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({ title: '', slug: '', content: '' });

    useEffect(() => {
        api.get(`/admin/pages/${id}`)
            .then(res => {
                const p = res.data;
                setForm({ title: p.title || '', slug: p.slug || '', content: p.content || '' });
            })
            .catch(err => {
                console.error("Fetch page error:", err);
                navigate('/admin/pages');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/pages/${id}`, form);
            showToast('Page updated successfully!');
        } catch (e) {
            alert('Error: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading editor...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            <button
                onClick={() => navigate('/admin/pages')}
                className="flex items-center text-zinc-500 hover:text-sky-600 transition-colors mb-8 group text-sm font-medium"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Custom Pages
            </button>

            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-8">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Page Editor</h1>
                                <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase mt-1">Editing: /pages/{form.slug}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                onClick={handleSave} disabled={saving}
                                className="px-8 shadow-xl shadow-indigo-600/20"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Page Title</label>
                            <input 
                                type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Slug / URL</label>
                            <input 
                                type="text" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-mono text-sm"
                                value={form.slug}
                                onChange={e => setForm({...form, slug: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-visible">
                <div className="p-6">
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Content</label>
                    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                        <QuillEditor
                            value={form.content}
                            onChange={(val) => setForm(f => ({ ...f, content: val }))}
                            placeholder="Enter the page content here..."
                            style={{ minHeight: '600px' }}
                        />
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="px-12 py-2.5 shadow-xl shadow-indigo-600/20"
                        >
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </Button>
                    </div>
                </div>
            </Card>
         </div>
    );
};

export default AdminPageEditor;
