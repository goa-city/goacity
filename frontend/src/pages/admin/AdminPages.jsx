import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilSquareIcon, PlusIcon, 
    DocumentTextIcon, MagnifyingGlassIcon, XMarkIcon,
    TrashIcon, LinkIcon
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

const AdminPages = () => {
    const [pages, setPages] = useState([]);
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

    const handleSubmit = async (e) => {
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
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save page.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this page? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/pages/${id}`);
            showToast("Page deleted!");
            fetchPages();
        } catch (error) {
            alert("Failed to delete page.");
        }
    };

    const filtered = pages.filter(p => 
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-emerald-500">
                        <DocumentTextIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Custom Pages</h1>
                        <p className="text-sm text-gray-500">{pages.length} total pages</p>
                    </div>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="admin-button-primary bg-emerald-600 hover:bg-emerald-700"
                >
                    <PlusIcon className="w-4 h-4" /> Create New Page
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search pages..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading pages...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No pages found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Page Title</th>
                                <th className="admin-table-head">Slug / URL</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(page => (
                                <tr key={page.id} className="admin-table-row" onClick={() => navigate(`/admin/pages/${page.id}`)}>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900">{page.title}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <LinkIcon className="w-3.5 h-3.5" />
                                            <code className="text-[11px] bg-gray-50 px-1.5 py-0.5 rounded font-mono">
                                                /pages/{page.slug}
                                            </code>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/pages/${page.id}`)}
                                                className="admin-action-btn-edit"
                                                title="Edit Content"
                                            >
                                                <PencilSquareIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete Page"
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

            {/* Create Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-emerald-500" />
                                Create New Page
                            </Dialog.Title>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="admin-label">Page Title <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" required className="admin-input" placeholder="e.g. Terms & Conditions"
                                    value={formData.title} onChange={e => {
                                        const title = e.target.value;
                                        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                        setFormData({...formData, title, slug});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="admin-label">Slug <span className="text-[10px] text-gray-400 font-normal ml-1">(URL suffix)</span></label>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">/pages/</span>
                                    <input 
                                        type="text" required pattern="[a-z0-9-_]+" className="admin-input font-mono flex-1" placeholder="terms"
                                        value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="admin-button-primary bg-emerald-600 hover:bg-emerald-700 w-full justify-center py-3">
                                {submitting ? 'Creating...' : 'Create Page'}
                            </button>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminPages;
