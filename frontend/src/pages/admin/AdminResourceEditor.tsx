import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
    LinkIcon, ClockIcon, PaperClipIcon
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftOutline } from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import QuillEditor from '../../components/QuillEditor';
import api from '../../api/axios';
import { formatDate } from '../../utils/date';

const STATUS_STYLES = {
    pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pending Review' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
    rejected: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Rejected' },
};

const CATEGORIES = ['Community', 'Awards', 'Event', 'Design', 'Interviews'];

const AdminResourceEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({
        title: '', category: '', author: '', url: '', description: '', status: 'pending',
    });

    useEffect(() => {
        if (!isNew) {
            api.get(`/admin/resources?id=${id}`)
                .then(res => {
                    const r = res.data;
                    setForm({
                        id: r.id,
                        title: r.title || '',
                        category: r.category || '',
                        author: r.author || '',
                        url: r.url || '',
                        description: r.description || '',
                        status: r.status || 'pending',
                        submitter: r.first_name ? `${r.first_name} ${r.last_name} (${r.member_email})` : null,
                        created_at: r.created_at,
                        file_path: r.file_path || null,
                    });
                })
                .catch(() => navigate('/admin/resources'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async (overrideStatus) => {
        setSaving(true);
        try {
            const payload = { ...form };
            if (overrideStatus) payload.status = overrideStatus;
            if (isNew) {
                await api.post('/admin/resources', payload);
                showToast('Resource created!');
                setTimeout(() => navigate('/admin/resources'), 1200);
            } else {
                await api.put('/admin/resources', payload);
                setForm(f => ({ ...f, status: payload.status }));
                showToast(
                    overrideStatus === 'approved' ? '✓ Resource approved and live!'
                    : overrideStatus === 'rejected' ? 'Resource rejected.'
                    : 'Resource updated!'
                );
            }
        } catch (e: any) {
            showToast('Error: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const statusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.pending;

    if (loading) return <div className="p-12 text-center text-gray-400">Loading resource...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Back */}
            <button
                onClick={() => navigate('/admin/resources')}
                className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors mb-8 group"
            >
                <ArrowLeftOutline className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                <span className="text-xl font-medium">Back to Resources</span>
            </button>

            {/* Header card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-8">
                <div className="p-6 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                            <BookOpenIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white truncate max-w-[400px]">
                                {isNew ? 'New Resource' : (form.title || 'Edit Resource')}
                            </h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                {form.submitter && <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Submitted by {form.submitter}</p>}
                                {form.created_at && <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Added {formatDate(form.created_at)}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        <ClockIcon className="w-3 h-3" />
                        {statusStyle.label}
                    </div>
                </div>

                {/* Action bar (edit mode only) */}
                {!isNew && (
                    <div className="px-6 py-4 flex flex-wrap gap-3 bg-zinc-50/50 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800 items-center">
                        <button
                            onClick={() => handleSave('approved')}
                            disabled={saving || form.status === 'approved'}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve
                        </button>
                        <button
                            onClick={() => handleSave('rejected')}
                            disabled={saving || form.status === 'rejected'}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                        </button>
                        <div className="ml-auto flex items-center gap-3">
                             <Button
                                onClick={() => handleSave()}
                                disabled={saving}
                                className="px-8 py-2.5 text-sm shadow-xl shadow-indigo-600/20"
                            >
                                {saving ? 'Saving...' : 'Save Info'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Attached file info */}
                {form.file_path && (
                    <div className="px-6 py-3 flex items-center gap-2 text-sm text-zinc-500 border-b border-zinc-50 bg-sky-50/20 dark:bg-sky-950/10 dark:border-zinc-800">
                        <PaperClipIcon className="w-4 h-4 text-sky-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Attachment: </span>
                        <a href={`/${form.file_path}`} target="_blank" rel="noreferrer"
                            className="text-sky-600 font-bold hover:underline truncate max-w-xs text-sm">
                            {form.file_path.split('/').pop()}
                        </a>
                    </div>
                )}
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Content Section */}
                    <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Resource Content</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Resource Title <span className="text-red-500">*</span></label>
                                <input 
                                    name="title" value={form.title} onChange={handleChange} required
                                    placeholder="e.g. The Future of Sustainable Architecture in Goa"
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Description & Insights</label>
                                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                        placeholder="Describe this resource and why it's valuable..."
                                        style={{ minHeight: '320px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Metadata */}
                <div className="space-y-8">
                    <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                        <div className="p-6 border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
                            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest">Categorization</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Category <span className="text-red-500">*</span></label>
                                <select name="category" value={form.category} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 h-14 font-medium appearance-none">
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Author / Source <span className="text-red-500">*</span></label>
                                <input 
                                    name="author" value={form.author} onChange={handleChange} required
                                    placeholder="Author name" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" 
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">External Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                    <input 
                                        type="url" name="url" value={form.url} onChange={handleChange}
                                        placeholder="https://example.com/article"
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium" 
                                    />
                                </div>
                            </div>

                            {isNew && (
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Initial Status</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 h-14 font-medium appearance-none">
                                        <option value="pending">Pending Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            )}

                             {isNew && (
                                <Button
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="w-full justify-center py-4 text-sm mt-4 shadow-xl shadow-indigo-600/20"
                                >
                                    {saving ? 'Creating...' : 'Create Resource'}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminResourceEditor;
