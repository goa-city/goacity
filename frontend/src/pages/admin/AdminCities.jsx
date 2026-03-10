import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    PlusIcon, PencilIcon, GlobeAltIcon, 
    MagnifyingGlassIcon, XMarkIcon, 
    LinkIcon, ClockIcon, SwatchIcon
} from '@heroicons/react/24/outline';

const AdminCities = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCity, setEditingCity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        timezone: 'Asia/Kolkata',
        email_from_name: 'Goa.City',
        email_from_addr: 'hello@goa.city'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/cities');
            setCities(res.data);
        } catch (error) {
            console.error("Failed to fetch cities:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (city = null) => {
        if (city) {
            setEditingCity(city);
            setFormData({
                name: city.name || '',
                slug: city.slug || '',
                domain: city.domain || '',
                timezone: city.timezone || 'Asia/Kolkata',
                email_from_name: city.email_from_name || 'Goa.City',
                email_from_addr: city.email_from_addr || 'hello@goa.city'
            });
        } else {
            setEditingCity(null);
            setFormData({
                name: '',
                slug: '',
                domain: '',
                timezone: 'Asia/Kolkata',
                email_from_name: 'Goa.City',
                email_from_addr: 'hello@goa.city'
            });
        }
        setError(null);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (editingCity) {
                await api.put('/admin/cities', {
                    id: editingCity.id,
                    ...formData
                });
            } else {
                await api.post('/admin/cities', formData);
            }
            setShowModal(false);
            fetchCities();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to save city");
        } finally {
            setSaving(false);
        }
    };

    const filtered = cities.filter(c => {
        const full = `${c.name || ''} ${c.slug || ''} ${c.domain || ''}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-sky-500">
                        <GlobeAltIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Cities Management</h1>
                        <p className="text-sm text-gray-500">Manage city nodes, domains and configurations</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="admin-button-primary bg-sky-600 hover:bg-sky-700"
                >
                    <PlusIcon className="h-4 w-4" /> Add New City
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search cities..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-80 shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading cities...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No cities found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 uppercase text-[10px] tracking-wider text-gray-500 font-bold border-b border-gray-100">
                                <th className="px-6 py-4">City Name</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4">Domain</th>
                                <th className="px-6 py-4 hidden md:table-cell">Timezone</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((city) => (
                                <tr 
                                    key={city.id} 
                                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                    onClick={() => handleOpenModal(city)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500 shrink-0 border border-sky-100 font-black italic shadow-sm">
                                                {city.name?.charAt(0).toUpperCase() || 'C'}
                                            </div>
                                            <span className="font-bold text-gray-900 tracking-tight">{city.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">{city.slug}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-medium italic">
                                        {city.domain || 'Not assigned'}
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell text-gray-500 text-xs font-mono">
                                        {city.timezone}
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleOpenModal(city)}
                                            className="p-2 hover:bg-sky-50 rounded-lg text-gray-400 hover:text-sky-600 transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <GlobeAltIcon className="w-5 h-5 text-sky-500" />
                                {editingCity ? 'Edit City Configuration' : 'Establish New City'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">City Name</label>
                                    <input 
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold placeholder:font-normal"
                                        placeholder="e.g. Pune"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">URL Slug</label>
                                    <input 
                                        type="text" required
                                        value={formData.slug}
                                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold placeholder:font-normal"
                                        placeholder="e.g. pune"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Assigned Domain</label>
                                <div className="relative">
                                    <LinkIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input 
                                        type="text"
                                        value={formData.domain}
                                        onChange={e => setFormData({...formData, domain: e.target.value})}
                                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold placeholder:font-normal"
                                        placeholder="e.g. dashboard.city"
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400 px-1 font-medium">Domain requests for this city will be routed here automatically.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Default Timezone</label>
                                    <div className="relative">
                                        <ClockIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input 
                                            type="text" required
                                            value={formData.timezone}
                                            onChange={e => setFormData({...formData, timezone: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold placeholder:font-normal"
                                            placeholder="Asia/Kolkata"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">Branding Color</label>
                                    <div className="relative">
                                        <SwatchIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                        <input 
                                            type="text"
                                            value={formData.active_color || '#0ea5e9'}
                                            onChange={e => setFormData({...formData, active_color: e.target.value})}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-slate-950 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-sky-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.98]"
                            >
                                {saving ? 'Establishing City...' : editingCity ? 'Update City Configuration' : 'Establish This City'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCities;
