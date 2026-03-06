import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeftIcon, CheckCircleIcon, XCircleIcon, BriefcaseIcon,
    MapPinIcon, LinkIcon, EnvelopeIcon, ClockIcon
} from '@heroicons/react/24/outline';
import QuillEditor from '../../components/QuillEditor';
import api from '../../api/axios';

const STATUS_STYLES = {
    pending:  { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   label: 'Pending Review' },
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Approved' },
    rejected: { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     label: 'Rejected' },
};

const AdminJobEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState({
        title: '', company: '', location: '', type: 'Full Time',
        category: '', url: '', contact_email: '', description: '', status: 'pending',
    });

    useEffect(() => {
        if (!isNew) {
            api.get(`/admin/jobs?id=${id}`)
                .then(res => {
                    const j = res.data;
                    setForm({
                        id: j.id,
                        title: j.title || '',
                        company: j.company || '',
                        location: j.location || '',
                        type: j.type || 'Full Time',
                        category: j.category || '',
                        url: j.url || '',
                        contact_email: j.contact_email || '',
                        description: j.description || '',
                        status: j.status || 'pending',
                        submitter: j.first_name ? `${j.first_name} ${j.last_name} (${j.member_email})` : null,
                        created_at: j.created_at,
                    });
                })
                .catch(() => navigate('/admin/jobs'))
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
                await api.post('/jobs', payload);
                showToast('Job created!');
                setTimeout(() => navigate('/admin/jobs'), 1200);
            } else {
                await api.put('/admin/jobs', payload);
                setForm(f => ({ ...f, status: payload.status }));
                showToast(overrideStatus === 'approved' ? '✓ Job approved and live!' : overrideStatus === 'rejected' ? 'Job rejected.' : 'Job updated!');
            }
        } catch (e) {
            alert('Error: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const statusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.pending;

    if (loading) {
        return (
            <div className="p-12 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Loading job...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {toast && (
                <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
                    {toast}
                </div>
            )}

            {/* Back */}
            <button
                onClick={() => navigate('/admin/jobs')}
                className="flex items-center text-gray-500 hover:text-sky-600 transition-colors mb-8 group text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Job Postings
            </button>

            {/* Header card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-50 bg-sky-50/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shrink-0">
                            <BriefcaseIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{isNew ? 'New Job Posting' : (form.title || 'Edit Job')}</h1>
                            {form.submitter && <p className="text-xs text-gray-400 mt-0.5">Submitted by {form.submitter}</p>}
                            {form.created_at && <p className="text-xs text-gray-400">Posted {new Date(form.created_at).toLocaleDateString()}</p>}
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        <ClockIcon className="w-3.5 h-3.5" />
                        {statusStyle.label}
                    </div>
                </div>

                {/* Action buttons for review — only shown when editing existing */}
                {!isNew && (
                    <div className="px-6 py-4 flex flex-wrap gap-3 bg-gray-50/50 border-b border-gray-100">
                        <button
                            onClick={() => handleSave('approved')}
                            disabled={saving || form.status === 'approved'}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Approve & Publish
                        </button>
                        <button
                            onClick={() => handleSave('rejected')}
                            disabled={saving || form.status === 'rejected'}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            <XCircleIcon className="w-4 h-4" />
                            Reject
                        </button>
                        <button
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white text-sm font-semibold rounded-xl hover:bg-sky-600 disabled:opacity-40 transition-colors shadow-sm ml-auto"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title <span className="text-red-400">*</span></label>
                        <input name="title" value={form.title} onChange={handleChange} required
                            placeholder="e.g. Senior Frontend Engineer"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company <span className="text-red-400">*</span></label>
                            <input name="company" value={form.company} onChange={handleChange} required
                                placeholder="Company name"
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input name="location" value={form.location} onChange={handleChange} required
                                    placeholder="e.g. Panjim, Goa"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                            <select name="type" value={form.type} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all appearance-none">
                                <option>Full Time</option><option>Part Time</option><option>Freelance</option><option>Internship</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <input name="category" value={form.category} onChange={handleChange}
                                placeholder="e.g. Technology, Education"
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Application URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="url" name="url" value={form.url} onChange={handleChange}
                                    placeholder="https://company.com/apply"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                            <div className="relative">
                                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange}
                                    placeholder="jobs@company.com"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* Status (for creating new) */}
                    {isNew && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select name="status" value={form.status} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 transition-all appearance-none">
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    )}

                    {/* Quill editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <QuillEditor
                                value={form.description}
                                onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                placeholder="Describe the role, responsibilities, and requirements..."
                                style={{ minHeight: '300px' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer save button */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => handleSave()}
                        disabled={saving}
                        className="px-8 py-3 bg-sky-500 text-white text-sm font-semibold rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {saving ? 'Saving...' : isNew ? 'Create Job' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminJobEditor;
