import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
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
        api.get('/admin/pages')
            .then(res => {
                const p = res.data.find(page => page.id === Number(id));
                if (p) {
                    setForm({ title: p.title, slug: p.slug, content: p.content || '' });
                } else {
                    navigate('/admin/pages');
                }
            })
            .catch(() => navigate('/admin/pages'))
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
        <div className="p-6 max-w-5xl mx-auto pb-32">
            {toast && <div className="admin-toast">{toast}</div>}

            <button
                onClick={() => navigate('/admin/pages')}
                className="flex items-center text-gray-500 hover:text-emerald-600 transition-colors mb-8 group text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Custom Pages
            </button>

            <div className="admin-card mb-8">
                <div className="p-6 bg-emerald-50/30">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="admin-header-icon bg-emerald-500">
                                <DocumentTextIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Page Editor</h1>
                                <p className="text-xs text-gray-400 mt-0.5">Editing: /pages/{form.slug}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <a 
                                href={`/pages/${form.slug}`} target="_blank" rel="noreferrer"
                                className="admin-button-secondary border-emerald-200 hover:border-emerald-400 text-emerald-700 px-4 flex items-center gap-2"
                            >
                                <GlobeAltIcon className="w-4 h-4" /> View Live
                            </a>
                            <button 
                                onClick={handleSave} disabled={saving}
                                className="admin-button-primary bg-emerald-600 hover:bg-emerald-700 px-8"
                            >
                                {saving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="admin-label">Page Title</label>
                            <input 
                                type="text" className="admin-input"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="admin-label">Slug / URL</label>
                            <input 
                                type="text" className="admin-input font-mono"
                                value={form.slug}
                                onChange={e => setForm({...form, slug: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-card overflow-visible">
                <div className="p-6">
                    <label className="admin-label">Content</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                        <QuillEditor
                            value={form.content}
                            onChange={(val) => setForm(f => ({ ...f, content: val }))}
                            placeholder="Enter the page content here..."
                            style={{ minHeight: '600px' }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 pl-72 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-40">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="admin-button-primary bg-emerald-600 hover:bg-emerald-700 px-16 py-3 text-base shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminPageEditor;
