import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilSquareIcon, PlusIcon, 
    DocumentTextIcon, MagnifyingGlassIcon, XMarkIcon,
    TrashIcon, LinkIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import { Dialog } from '@headlessui/react';

const AdminPages: React.FC = () => {
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', slug: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await api.get('/admin/pages');
            setPages(res.data);
        } catch (error) {
            console.error("Failed to fetch pages", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const openCreateModal = () => {
        setFormData({ title: '', slug: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/admin/pages', formData);
            if (res.data.page) {
                showToast('Page created!');
                await fetchPages();
                setIsModalOpen(false);
                if (window.confirm("Page created! Do you want to edit the content now?")) {
                    navigate(`/admin/pages/${res.data.page.id}`);
                }
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || "Failed to save page.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this page? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/pages/${id}`);
            showToast("Page deleted!");
            fetchPages();
        } catch (error) {
            showToast("Failed to delete page.");
        }
    };

    const filtered = pages.filter(p => 
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Custom Pages
                        <DocumentTextIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        {pages.length} total pages
                    </p>
                </div>
                <Button onClick={openCreateModal} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Create New Page
                </Button>
            </div>

            {/* Search */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search pages..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading pages...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No pages found</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Page Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Slug / URL</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(page => (
                                    <tr key={page.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/pages/${page.id}`)}>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{page.title}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <LinkIcon className="w-4 h-4" />
                                                <code className="text-[10px] font-black tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
                                                    /pages/{page.slug}
                                                </code>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/pages/${page.id}`)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                    title="Edit Content"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(page.id)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    title="Delete Page"
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

            {/* Create Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                            <Dialog.Title className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-500" />
                                Create New Page
                            </Dialog.Title>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Page Title <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" placeholder="e.g. Terms & Conditions"
                                    value={formData.title} onChange={e => {
                                        const title = e.target.value;
                                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                        setFormData({...formData, title, slug});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Slug <span className="text-[10px] text-zinc-400 ml-1">(URL suffix)</span></label>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-400 text-sm font-black uppercase tracking-widest">/pages/</span>
                                    <input 
                                        type="text" required pattern="[a-z0-9-_]+" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-mono text-sm flex-1" placeholder="terms"
                                        value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full justify-center py-4 text-sm mt-4">
                                {submitting ? 'Creating...' : 'Create Page'}
                            </Button>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminPages;
