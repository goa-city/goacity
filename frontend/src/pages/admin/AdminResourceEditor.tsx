import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    BookOpenIcon, CheckCircleIcon, XCircleIcon, 
    ClockIcon, PaperClipIcon, ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import QuillEditor from '../../components/QuillEditor';
import api from '../../api/axios';
import { formatDate } from '../../utils/date';

type ResourceStatus = 'pending' | 'approved' | 'rejected';

const STATUS_STYLES: Record<ResourceStatus, { bg: string; text: string; border: string; label: string }> = {
    pending:  { bg: 'bg-amber-50 dark:bg-amber-950/20',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-200 dark:border-amber-900/50',   label: 'Pending Review' },
    approved: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/50', label: 'Approved' },
    rejected: { bg: 'bg-red-50 dark:bg-red-950/20',     text: 'text-red-700 dark:text-red-400',     border: 'border-red-200 dark:border-red-900/50',     label: 'Rejected' },
};

interface ResourceForm {
    id?: number;
    title: string;
    category: string;
    author: string;
    url: string;
    description: string;
    status: ResourceStatus;
    submitter?: string | null;
    created_at?: string;
    file_path?: string | null;
    image_url?: string | null;
}

const AdminResourceEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [categories, setCategories] = useState<string[]>([]);
    const [form, setForm] = useState<ResourceForm>({
        title: '', category: '', author: '', url: '', description: '', status: 'approved', // Admin posts approved by default
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    useEffect(() => {
        // Fetch categories
        api.get('/admin/resources/categories')
            .then(res => {
                setCategories(res.data.map((c: any) => c.name));
            })
            .catch(err => console.error('Failed to load categories:', err));

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
                        image_url: r.image_url || null,
                    });
                })
                .catch(() => navigate('/admin/resources'))
                .finally(() => setLoading(false));
        }
    }, [id]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCategoryToggle = (catName: string) => {
        const currentSelected = form.category ? form.category.split(',').map(s => s.trim()).filter(Boolean) : [];
        let newSelected: string[];
        if (currentSelected.includes(catName)) {
            newSelected = currentSelected.filter(c => c !== catName);
        } else {
            newSelected = [...currentSelected, catName];
        }
        setForm(f => ({ ...f, category: newSelected.join(', ') }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        if (!allowed.includes(file.type)) {
            alert('Only PDF, Word, and PowerPoint files are allowed.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('File too large. Maximum size is 20MB.');
            return;
        }
        setSelectedFile(file);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Only image files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Maximum size is 5MB.');
            return;
        }
        setSelectedImage(file);
    };

    const handleSave = async (overrideStatus?: ResourceStatus) => {
        if (!form.title || !form.category || !form.author) {
            alert('Title, Category, and Author are required.');
            return;
        }
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('category', form.category);
            formData.append('author', form.author);
            formData.append('url', form.url);
            formData.append('description', form.description);
            formData.append('status', overrideStatus || form.status);
            
            if (form.id) formData.append('id', String(form.id));
            if (selectedFile) formData.append('file', selectedFile);
            if (selectedImage) formData.append('image', selectedImage);

            if (isNew) {
                await api.post('/admin/resources', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Resource created!');
                setTimeout(() => navigate('/admin/resources'), 1200);
            } else {
                await api.put('/admin/resources', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setForm(f => ({ ...f, status: overrideStatus || f.status }));
                showToast(
                    overrideStatus === 'approved' ? '✓ Resource approved and live!'
                    : overrideStatus === 'rejected' ? 'Resource rejected.'
                    : 'Resource updated!'
                );
                // Reload data to get updated file/image paths if uploaded
                api.get(`/admin/resources?id=${id}`).then(res => {
                    setForm(f => ({
                        ...f,
                        file_path: res.data.file_path || f.file_path,
                        image_url: res.data.image_url || f.image_url,
                    }));
                    setSelectedFile(null);
                    setSelectedImage(null);
                });
            }
        } catch (e: unknown) {
            showToast('Error: ' + (e instanceof Error ? e.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const statusStyle = STATUS_STYLES[form.status] || STATUS_STYLES.pending;

    if (loading) return <div className="p-12 text-center text-gray-400">Loading resource...</div>;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Back */}
            <button
                onClick={() => navigate('/admin/resources')}
                className="flex items-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all mb-10 group text-[10px] font-black uppercase tracking-[0.2em]"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform stroke-[3px]" />
                Back to Resources
            </button>

            {/* Card Container */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>
                
                {/* Header info */}
                <div className="p-10 md:p-12 border-b border-zinc-50 dark:border-zinc-800 flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic flex items-center gap-3">
                            {isNew ? 'Share Resource' : 'Edit Resource'}
                            <BookOpenIcon className="w-8 h-8 text-indigo-600 shrink-0" />
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium italic">
                            {isNew ? 'Contribute valuable knowledge to the Goa City network.' : `Reviewing resource ID #${form.id}`}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                            {form.submitter && <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Submitted by {form.submitter}</p>}
                            {form.created_at && <p className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Added {formatDate(form.created_at)}</p>}
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest shrink-0 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        <ClockIcon className="w-3.5 h-3.5" />
                        {statusStyle.label}
                    </div>
                </div>

                {/* Form fields */}
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="p-10 md:p-12 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Title <span className="text-rose-500">*</span></label>
                            <input
                                type="text" name="title" value={form.title} onChange={handleChange}
                                placeholder="e.g. Kingdom Stewardship in the Digital Age"
                                required
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Categories <span className="text-rose-500">*</span></label>
                            <div className="flex flex-wrap gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                                {categories.map(cat => {
                                    const isSelected = form.category.split(',').map(s => s.trim()).includes(cat);
                                    return (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => handleCategoryToggle(cat)}
                                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                                                isSelected 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 scale-[1.02]' 
                                                    : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    );
                                })}
                            </div>
                            <input type="hidden" name="category" value={form.category} required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Author <span className="text-rose-500">*</span></label>
                            <input
                                type="text" name="author" value={form.author} onChange={handleChange}
                                placeholder="Name of the creator" required
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Reference URL</label>
                        <input
                            type="url" name="url" value={form.url} onChange={handleChange}
                            placeholder="https://..."
                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Cover Image</label>
                        
                        {/* Currently attached cover image */}
                        {form.image_url && (
                            <div className="mb-4 px-6 py-3.5 flex items-center gap-2 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-sm text-zinc-600 dark:text-zinc-400">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Image:</span>
                                <a href={form.image_url} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate max-w-xs text-sm">
                                    {form.image_url.split('/').pop()}
                                </a>
                            </div>
                        )}

                        <div
                            onClick={() => imageInputRef.current?.click()}
                            className="group relative w-full px-8 py-14 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:border-indigo-500/50 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            {selectedImage ? (
                                <div className="flex flex-col items-center relative z-10">
                                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-40 h-28 object-cover rounded-xl mb-4 border border-zinc-100 dark:border-zinc-800 shadow-md" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate max-w-xs">{selectedImage.name}</span>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); if(imageInputRef.current) imageInputRef.current.value = ''; }} className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 mt-3 hover:underline">
                                        Remove Image
                                    </button>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <PaperClipIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-500" />
                                    <span className="block text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Click to Upload Cover Image</span>
                                    <span className="block text-[10px] font-medium text-zinc-400 mt-2">PNG, JPG, JPEG, or WEBP (Max 5MB)</span>
                                </div>
                            )}
                        </div>
                        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Digital Attachment</label>
                        
                        {/* Currently attached file */}
                        {form.file_path && (
                            <div className="mb-4 px-6 py-3.5 flex items-center gap-2 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 text-sm text-zinc-600 dark:text-zinc-400">
                                <PaperClipIcon className="w-4 h-4 text-indigo-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current File:</span>
                                <a href={`/${form.file_path}`} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline truncate max-w-xs text-sm">
                                    {form.file_path.split('/').pop()}
                                </a>
                            </div>
                        )}

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative w-full px-8 py-14 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 hover:border-indigo-500/50 transition-all overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <PaperClipIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-4 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-500" />
                            {selectedFile ? (
                                <div className="flex flex-col items-center relative z-10">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white truncate max-w-xs">{selectedFile.name}</span>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 mt-3 hover:underline">
                                        Detach File
                                    </button>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    <span className="block text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Click to Upload New Attachment</span>
                                    <span className="block text-[10px] font-medium text-zinc-400 mt-2">PDF, Word, or PowerPoint (Max 20MB)</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={handleFileChange} className="hidden" />
                    </div>

                    <div className="relative">
                        <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Detailed Description</label>
                        <div className="border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-inner">
                            <QuillEditor
                                value={form.description}
                                onChange={(val) => setForm(f => ({ ...f, description: val }))}
                                placeholder="Contextualize this resource..."
                            />
                        </div>
                    </div>

                    {/* Status selection if editing or creating */}
                    <div>
                        <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Resource Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none">
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        {!isNew && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handleSave('approved')}
                                    disabled={saving || form.status === 'approved'}
                                    className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Approve & Live
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSave('rejected')}
                                    disabled={saving || form.status === 'rejected'}
                                    className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Reject
                                </button>
                            </>
                        )}
                        <Button
                            type="submit"
                            disabled={saving}
                            className={`py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-none ${!isNew ? 'flex-1' : 'w-full justify-center bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100'}`}
                        >
                            {saving ? 'Syncing Repository...' : isNew ? 'Publish Resource' : 'Save Info'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminResourceEditor;
