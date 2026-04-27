import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilSquareIcon, DocumentDuplicateIcon, PlusIcon, 
    DocumentTextIcon, MagnifyingGlassIcon, XMarkIcon,
    ArchiveBoxIcon, TrashIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import { Dialog } from '@headlessui/react';

const AdminForms: React.FC = () => {
    const [forms, setForms] = useState<any[]>([]);
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
            showToast("Failed to archive form.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this form? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/forms?id=${id}`);
            showToast("Form deleted!");
            fetchForms();
        } catch (error) {
            showToast("Failed to delete form.");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to save form.");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = forms.filter(f => 
        f.title?.toLowerCase().includes(search.toLowerCase()) ||
        f.code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Form Management
                        <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        {forms.length} total forms
                    </p>
                </div>
                <Button onClick={openCreateModal} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Create New Form
                </Button>
            </div>

            {/* Search */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search forms..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading forms...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No forms found</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Form Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Code</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Description</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(form => (
                                    <tr key={form.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/forms/${form.id}`)}>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1 items-start">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">{form.title}</p>
                                                {!form.is_active && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/50">
                                                        Archived
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <code className="text-[10px] font-black tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                                                {form.code}
                                            </code>
                                        </td>
                                        <td className="px-8 py-5 hidden lg:table-cell">
                                            <p className="text-xs font-medium text-zinc-400 truncate max-w-sm">{form.description || <span className="italic text-zinc-300">No description</span>}</p>
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openCopyModal(form)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-sky-600 transition-all hover:bg-sky-50 dark:hover:bg-sky-950/30"
                                                    title="Duplicate Form"
                                                >
                                                    <DocumentDuplicateIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(form)}
                                                    className={`p-2 rounded-xl text-zinc-300 transition-all ${form.is_active ? 'group-hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30' : 'group-hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'}`}
                                                    title={form.is_active ? "Archive Form" : "Activate Form"}
                                                >
                                                    <ArchiveBoxIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/forms/${form.id}`)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                    title="Edit Fields"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(form.id)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    title="Delete Form"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Create/Copy Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                            <Dialog.Title className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-500" />
                                {modalMode === 'create' ? 'Create New Form' : 'Duplicate Form'}
                            </Dialog.Title>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Form Title <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" placeholder="e.g. Member Onboarding"
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Unique Code <span className="text-[10px] text-zinc-400 ml-1">(URL safe)</span></label>
                                <input 
                                    type="text" required pattern="[a-zA-Z0-9-_]+" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-mono text-sm" placeholder="member_onboarding"
                                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium min-h-[100px] resize-none" placeholder="What is this form for?"
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full justify-center py-4 text-sm mt-4">
                                {submitting ? 'Creating...' : (modalMode === 'create' ? 'Create Form' : 'Duplicate Form')}
                            </Button>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminForms;
