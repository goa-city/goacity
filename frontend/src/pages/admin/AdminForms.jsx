import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilSquareIcon, DocumentDuplicateIcon, PlusIcon, 
    DocumentTextIcon, MagnifyingGlassIcon, XMarkIcon,
    ArchiveBoxIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

const AdminForms = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'copy'
    const [formData, setFormData] = useState({ title: '', code: '', description: '', source_id: null });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const res = await api.get('/admin/forms');
            setForms(res.data);
        } catch (error) {
            console.error("Failed to fetch forms", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const openCreateModal = () => {
        setModalMode('create');
        setFormData({ title: '', code: '', description: '', source_id: null });
        setIsModalOpen(true);
    };

    const openCopyModal = (form) => {
        setModalMode('copy');
        setFormData({ 
            title: `${form.title} (Copy)`, 
            code: `${form.code}_copy`, 
            description: form.description, 
            source_id: form.id 
        });
        setIsModalOpen(true);
    };

    const handleArchive = async (form) => {
        const action = form.is_active ? 'archive' : 'activate';
        if (!window.confirm(`Are you sure you want to ${action} this form?`)) return;
        try {
            await api.post('/admin/forms/archive', { id: form.id, is_active: !form.is_active });
            showToast(`Form ${form.is_active ? 'archived' : 'activated'}!`);
            fetchForms();
        } catch (error) {
            alert("Failed to archive form.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this form? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/forms?id=${id}`);
            showToast("Form deleted!");
            fetchForms();
        } catch (error) {
            alert("Failed to delete form.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/admin/forms', formData);
            if (res.data.id) {
                showToast(modalMode === 'create' ? 'Form created!' : 'Form duplicated!');
                await fetchForms();
                setIsModalOpen(false);
                if (window.confirm("Form ready! Do you want to edit the fields now?")) {
                    navigate(`/admin/forms/${res.data.id}`);
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save form.");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = forms.filter(f => 
        f.title?.toLowerCase().includes(search.toLowerCase()) ||
        f.code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-sky-500">
                        <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Form Management</h1>
                        <p className="text-sm text-gray-500">{forms.length} total forms</p>
                    </div>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="admin-button-primary"
                >
                    <PlusIcon className="w-4 h-4" /> Create New Form
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search forms..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading forms...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No forms found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Form Title</th>
                                <th className="admin-table-head hidden md:table-cell">Code</th>
                                <th className="admin-table-head hidden lg:table-cell">Description</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(form => (
                                <tr key={form.id} className="admin-table-row" onClick={() => navigate(`/admin/forms/${form.id}`)}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-gray-900">{form.title}</p>
                                            {!form.is_active && (
                                                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-amber-100">
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <code className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                                            {form.code}
                                        </code>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell">
                                        <p className="text-xs text-gray-500 truncate max-w-sm">{form.description || <span className="italic text-gray-300">No description</span>}</p>
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openCopyModal(form)}
                                                className="p-1.5 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-lg transition-colors"
                                                title="Duplicate Form"
                                            >
                                                <DocumentDuplicateIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(form)}
                                                className={`p-1.5 rounded-lg transition-colors ${form.is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                title={form.is_active ? "Archive Form" : "Activate Form"}
                                            >
                                                <ArchiveBoxIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/admin/forms/${form.id}`)}
                                                className="admin-action-btn-edit"
                                                title="Edit Fields"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(form.id)}
                                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete Form"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create/Copy Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-sky-500" />
                                {modalMode === 'create' ? 'Create New Form' : 'Duplicate Form'}
                            </Dialog.Title>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="admin-label">Form Title <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" required className="admin-input" placeholder="e.g. Member Onboarding"
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="admin-label">Unique Code <span className="text-[10px] text-gray-400 font-normal ml-1">(URL safe)</span></label>
                                <input 
                                    type="text" required pattern="[a-zA-Z0-9-_]+" className="admin-input font-mono" placeholder="member_onboarding"
                                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="admin-label">Description</label>
                                <textarea 
                                    className="admin-input min-h-[80px]" rows="3" placeholder="What is this form for?"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>

                            <button type="submit" disabled={submitting} className="admin-button-primary w-full justify-center py-3">
                                {submitting ? 'Creating...' : (modalMode === 'create' ? 'Create Form' : 'Duplicate Form')}
                            </button>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminForms;
