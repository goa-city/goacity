import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    PlusIcon, PencilIcon, TrashIcon, XMarkIcon, 
    SwatchIcon, MagnifyingGlassIcon, InboxStackIcon
} from '@heroicons/react/24/solid';
import { Dialog } from '@headlessui/react';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const AdminStreams: React.FC = () => {
    const [streams, setStreams] = useState<any[]>([]);
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStream, setEditingStream] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#0ea5e9',
        form_id: ''
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [streamsRes, formsRes] = await Promise.all([
                api.get('/admin/streams'),
                api.get('/admin/forms')
            ]);
            setStreams(streamsRes.data);
            setForms(formsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleOpenModal = (stream = null) => {
        setEditingStream(stream);
        if (stream) {
            setFormData({
                name: stream.name,
                description: stream.description || '',
                color: stream.color,
                form_id: stream.form_id || ''
            });
        } else {
            setFormData({
                name: '',
                description: '',
                color: '#0ea5e9',
                form_id: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingStream) {
                await api.put('/admin/streams', { ...formData, id: editingStream.id, form_id: formData.form_id || null });
                showToast('Stream updated successfully!');
            } else {
                await api.post('/admin/streams', { ...formData, form_id: formData.form_id || null });
                showToast('New stream created!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            showToast("Failed to save stream.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? Members will be removed from this stream.")) return;
        try {
            await api.delete(`/admin/streams?id=${id}`);
            showToast('Stream deleted.');
            fetchData();
        } catch (error) {
            showToast("Failed to delete stream.");
        }
    };

    const filtered = streams.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Streams
                        <InboxStackIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Manage {streams.length} total streams.
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Stream
                </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                        placeholder="Search streams..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading streams...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No streams found</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Stream Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Color</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Linked Form</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Members</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(stream => (
                                    <tr key={stream.id} className="transition-colors cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-800/30" onClick={() => handleOpenModal(stream)}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm overflow-hidden relative" style={{ borderColor: stream.color ? `${stream.color}40` : undefined, backgroundColor: stream.color ? `${stream.color}15` : undefined }}>
                                                    <div className="w-4 h-4 rounded-full shadow-md" style={{ backgroundColor: stream.color }}></div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-zinc-900 dark:text-white">{stream.name}</p>
                                                    <p className="text-xs font-medium text-zinc-400 truncate max-w-xs">{stream.description || 'No description'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-sm" style={{ backgroundColor: stream.color }}></div>
                                                <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-500 uppercase font-black tracking-widest border border-zinc-200 dark:border-zinc-700">{stream.color}</code>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden lg:table-cell">
                                            {stream.form_title ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50">
                                                    {stream.form_title}
                                                </span>
                                            ) : <span className="text-[10px] text-zinc-400 italic font-black uppercase tracking-widest">No form</span>}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{stream.member_count}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleOpenModal(stream)} title="Edit" className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleDelete(stream.id)} title="Delete" className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30">
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

            {/* Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                            <Dialog.Title className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <SwatchIcon className="w-6 h-6 text-indigo-500" />
                                {editingStream ? 'Edit Stream' : 'Add New Stream'}
                            </Dialog.Title>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Stream Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" required className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" placeholder="e.g. Technology & Media"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Color</label>
                                    <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl p-2">
                                        <input 
                                            type="color" className="h-10 w-16 p-1 bg-white border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer" 
                                            value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                                        />
                                        <span className="text-xs text-zinc-500 font-black tracking-widest uppercase">{formData.color}</span>
                                    </div>
                                </div>
                                <div className="flex items-end pb-2">
                                    <div className="w-full h-10 rounded-xl shadow-inner border border-zinc-200 dark:border-zinc-800" style={{ backgroundColor: formData.color }}></div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Linked Onboarding Form</label>
                                <select 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium appearance-none bg-no-repeat bg-[right_1rem_center]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                                    value={formData.form_id} onChange={e => setFormData({...formData, form_id: e.target.value})}
                                >
                                    <option value="">-- No Form Linked --</option>
                                    {forms.map(form => (
                                        <option key={form.id} value={form.id}>{form.title} ({form.code})</option>
                                    ))}
                                </select>
                                <p className="mt-2 text-[10px] text-zinc-400 font-black tracking-widest uppercase">Members joining this stream will be prompted to complete this form.</p>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                                <textarea 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium min-h-[80px]" rows="3" placeholder="Briefly describe what this stream is about..."
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>

                            <Button type="submit" className="w-full justify-center py-4 mt-4 text-sm shadow-xl shadow-indigo-600/20">
                                {editingStream ? 'Save Changes' : 'Create Stream'}
                            </Button>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminStreams;
