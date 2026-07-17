import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate } from '../../utils/date';
import { 
    PencilSquareIcon, PlusIcon, FolderIcon, 
    TrashIcon, ArrowLeftIcon 
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

interface ResourceCategory {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

const AdminResourceCategories: React.FC = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ResourceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<ResourceCategory | null>(null);
    const [nameInput, setNameInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/admin/resources/categories');
            setCategories(res.data);
        } catch (error) {
            console.error("Failed to fetch resource categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDelete = async (id: number): Promise<void> => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/admin/resources/categories/${id}`);
            setCategories(categories.filter(c => c.id !== id));
            showToast('Category deleted successfully.');
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to delete category";
            alert(msg);
        }
    };

    const handleOpenCreate = () => {
        setEditCategory(null);
        setNameInput('');
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleOpenEdit = (category: ResourceCategory) => {
        setEditCategory(category);
        setNameInput(category.name);
        setErrorMsg('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!nameInput.trim()) {
            setErrorMsg('Category name is required.');
            return;
        }

        try {
            if (editCategory) {
                // Update
                const res = await api.put(`/admin/resources/categories/${editCategory.id}`, { name: nameInput });
                setCategories(categories.map(c => c.id === editCategory.id ? res.data.category : c));
                showToast('Category updated successfully.');
            } else {
                // Create
                const res = await api.post('/admin/resources/categories', { name: nameInput });
                setCategories([...categories, res.data.category]);
                showToast('Category created successfully.');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "An error occurred.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && (
                <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <button
                        onClick={() => navigate('/admin/resources')}
                        className="flex items-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mb-4 group text-[10px] font-black uppercase tracking-[0.2em]"
                    >
                        <ArrowLeftIcon className="w-3 h-3 mr-2 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Resources
                    </button>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Resource Categories
                        <FolderIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Configure categories used to classify materials on the platform
                    </p>
                </div>
                <Button onClick={handleOpenCreate} className="px-8 shadow-xl shadow-indigo-600/20 bg-indigo-600 hover:bg-indigo-700 border-none">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Category
                </Button>
            </div>

            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">
                            Loading categories...
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No categories found</p>
                            <p className="text-zinc-500 mt-1 font-medium">Create one to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Category Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Created At</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group cursor-pointer" onClick={() => handleOpenEdit(category)}>
                                        <td className="px-8 py-5 font-black text-sm text-zinc-900 dark:text-white">
                                            {category.name}
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell text-zinc-400 text-xs font-black tracking-widest uppercase">
                                            {formatDate(category.created_at)}
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 isolate">
                                                <button 
                                                    onClick={() => handleOpenEdit(category)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                    title="Edit Category"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
                                                    title="Delete Category"
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

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 max-w-md w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <h3 className="text-xl font-black text-zinc-900 dark:text-white leading-tight uppercase tracking-tight italic mb-6">
                                {editCategory ? 'Edit Category' : 'Create Category'}
                            </h3>
                            
                            {errorMsg && (
                                <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100 dark:border-red-900/50 mb-6">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Category Name</label>
                                <input
                                    type="text"
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    placeholder="e.g. Strategy"
                                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold transition-all"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 border border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    className="px-6 bg-indigo-600 hover:bg-indigo-700 border-none shadow-lg shadow-indigo-600/20"
                                >
                                    Save Category
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminResourceCategories;
