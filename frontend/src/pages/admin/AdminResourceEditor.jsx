import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeftIcon, CheckCircleIcon, XCircleIcon, BookOpenIcon,
    LinkIcon, ClockIcon, PaperClipIcon
} from '@heroicons/react/24/outline';
import QuillEditor from '../../components/QuillEditor';
import api from '../../api/axios';

const STATUS_STYLES = {
    pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pending Review' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
    rejected: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Rejected' },
};

const CATEGORIES = ['Community', 'Awards', 'Event', 'Design', 'Interviews'];

const AdminResourceEditor = () => {
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
                await api.post('/resources', payload);
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
        } catch (e) {
            alert('Error: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const statusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.pending;

    if (loading) return <div className="p-12 text-center text-gray-400">Loading resource...</div>;

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Back */}
            <button
                onClick={() => navigate('/admin/resources')}
                className="flex items-center text-gray-500 hover:text-sky-600 transition-colors mb-8 group text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Resources
            </button>

            {/* Header card */}
            <div className="admin-card mb-8">
                <div className="p-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-50 bg-indigo-50/30">
                    <div className="flex items-center gap-3">
                        <div className="admin-header-icon bg-indigo-500">
                            <BookOpenIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[400px]">
                                {isNew ? 'New Resource' : (form.title || 'Edit Resource')}
                            </h1>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                                {form.submitter && <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Submitted by {form.submitter}</p>}
                                {form.created_at && <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Added {new Date(form.created_at).toLocaleDateString()}</p>}
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
                    <div className="px-6 py-4 flex flex-wrap gap-3 bg-gray-50/50 border-b border-gray-100 items-center">
                        <button
                            onClick={() => handleSave('approved')}
                            disabled={saving || form.status === 'approved'}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm uppercase tracking-wider"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve
                        </button>
                        <button
                            onClick={() => handleSave('rejected')}
                            disabled={saving || form.status === 'rejected'}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm uppercase tracking-wider"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                        </button>
                        <div className="ml-auto flex items-center gap-3">
                             <button
                                onClick={() => handleSave()}
                                disabled={saving}
                                className="admin-button-primary px-8"
                            >
                                {saving ? 'Saving...' : 'Save Info'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Attached file info */}
                {form.file_path && (
                    <div className="px-6 py-3 flex items-center gap-2 text-sm text-gray-500 border-b border-gray-50 bg-sky-50/20">
                        <PaperClipIcon className="w-4 h-4 text-sky-400" />
                        <span className="font-medium text-gray-400">Attachment: </span>
                        <a href={`/${form.file_path}`} target="_blank" rel="noreferrer"
                            className="text-sky-600 font-bold hover:underline truncate max-w-xs">
                            {form.file_path.split('/').pop()}
                        </a>
                    </div>
                )}
            </div>

            {/* Form grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Content Section */}
                    <div className="admin-card">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-sm font-bold text-gray-900">Resource Content</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="admin-label">Resource Title <span className="text-red-400">*</span></label>
                                <input 
                                    name="title" value={form.title} onChange={handleChange} required
                                    placeholder="e.g. The Future of Sustainable Architecture in Goa"
                                    className="admin-input" 
                                />
                            </div>

                            <div>
                                <label className="admin-label">Description & Insights</label>
                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                        placeholder="Describe this resource and why it's valuable..."
                                        style={{ minHeight: '320px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Metadata */}
                <div className="space-y-8">
                    <div className="admin-card">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                            <h3 className="text-sm font-bold text-gray-900">Categorization</h3>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="admin-label">Category <span className="text-red-400">*</span></label>
                                <select name="category" value={form.category} onChange={handleChange} className="admin-input">
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="admin-label">Author / Source <span className="text-red-400">*</span></label>
                                <input 
                                    name="author" value={form.author} onChange={handleChange} required
                                    placeholder="Author name" className="admin-input" 
                                />
                            </div>

                            <div>
                                <label className="admin-label">External Link</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="url" name="url" value={form.url} onChange={handleChange}
                                        placeholder="https://example.com/article"
                                        className="admin-input pl-10" 
                                    />
                                </div>
                            </div>

                            {isNew && (
                                <div>
                                    <label className="admin-label">Initial Status</label>
                                    <select name="status" value={form.status} onChange={handleChange} className="admin-input">
                                        <option value="pending">Pending Review</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            )}

                             {isNew && (
                                <button
                                    onClick={() => handleSave()}
                                    disabled={saving}
                                    className="admin-button-primary w-full justify-center py-2.5 mt-2"
                                >
                                    {saving ? 'Creating...' : 'Create Resource'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminResourceEditor;
