import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    PlusIcon, PencilIcon, TrashIcon, XMarkIcon, 
    SwatchIcon, MagnifyingGlassIcon, InboxStackIcon
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

const AdminStreams = () => {
    const [streams, setStreams] = useState([]);
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStream, setEditingStream] = useState(null);
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
            alert("Failed to save stream.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? Members will be removed from this stream.")) return;
        try {
            await api.delete(`/admin/streams?id=${id}`);
            showToast('Stream deleted.');
            fetchData();
        } catch (error) {
            alert("Failed to delete stream.");
        }
    };

    const filtered = streams.filter(s => 
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-sky-500">
                        <InboxStackIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Streams</h1>
                        <p className="text-sm text-gray-500">{streams.length} total streams</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="admin-button-primary"
                >
                    <PlusIcon className="w-4 h-4" /> Add Stream
                </button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search streams..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading streams...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No streams found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Stream Name</th>
                                <th className="admin-table-head hidden md:table-cell">Color</th>
                                <th className="admin-table-head hidden lg:table-cell">Linked Form</th>
                                <th className="admin-table-head">Members</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(stream => (
                                <tr key={stream.id} className="admin-table-row" onClick={() => handleOpenModal(stream)}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stream.color }}></div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{stream.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-xs">{stream.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <code className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase">{stream.color}</code>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-gray-500">
                                        {stream.form_title ? (
                                            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                                {stream.form_title}
                                            </span>
                                        ) : <span className="text-xs text-gray-300 italic">No form</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-medium text-gray-700">{stream.member_count}</span>
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleOpenModal(stream)} title="Edit" className="admin-action-btn-edit">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(stream.id)} title="Delete" className="admin-action-btn-delete">
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

            {/* Modal */}
            <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <SwatchIcon className="w-5 h-5 text-sky-500" />
                                {editingStream ? 'Edit Stream' : 'Add New Stream'}
                            </Dialog.Title>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-5">
                            <div>
                                <label className="admin-label">Stream Name <span className="text-red-400">*</span></label>
                                <input 
                                    type="text" required className="admin-input" placeholder="e.g. Technology & Media"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="admin-label">Color</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="color" className="h-10 w-16 p-1 bg-white border border-gray-200 rounded-xl cursor-pointer" 
                                            value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                                        />
                                        <span className="text-xs text-gray-400 font-mono uppercase">{formData.color}</span>
                                    </div>
                                </div>
                                <div className="flex items-end pb-1">
                                    <div className="w-full h-8 rounded-lg shadow-inner" style={{ backgroundColor: formData.color }}></div>
                                </div>
                            </div>

                            <div>
                                <label className="admin-label">Linked Onboarding Form</label>
                                <select 
                                    className="admin-input appearance-none bg-no-repeat bg-[right_1rem_center]"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='gray'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1rem' }}
                                    value={formData.form_id} onChange={e => setFormData({...formData, form_id: e.target.value})}
                                >
                                    <option value="">-- No Form Linked --</option>
                                    {forms.map(form => (
                                        <option key={form.id} value={form.id}>{form.title} ({form.code})</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-1.5 italic">Members joining this stream will be prompted to complete this form.</p>
                            </div>

                            <div>
                                <label className="admin-label">Description</label>
                                <textarea 
                                    className="admin-input min-h-[80px]" rows="3" placeholder="Briefly describe what this stream is about..."
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>

                            <button type="submit" className="admin-button-primary w-full justify-center py-3">
                                {editingStream ? 'Save Changes' : 'Create Stream'}
                            </button>
                        </form>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default AdminStreams;
