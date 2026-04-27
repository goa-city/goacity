import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    PlusIcon, PencilSquareIcon as PencilIcon, GlobeAltIcon, 
    MagnifyingGlassIcon, XMarkIcon, 
    LinkIcon, ClockIcon, SwatchIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const AdminCities: React.FC = () => {
    const [cities, setCities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCity, setEditingCity] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        timezone: 'Asia/Kolkata',
        email_from_name: 'Goa.City',
        email_from_addr: 'hello@goa.city'
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<any>(null);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        <div className="max-w-7xl mx-auto py-10 px-6">
            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Cities Management
                        <GlobeAltIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Manage city nodes, domains and configurations
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add New City
                </Button>
            </div>

            {/* Search */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search cities..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading cities...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No cities found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">City Name</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Slug</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Domain</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Timezone</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map((city) => (
                                    <tr 
                                        key={city.id} 
                                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                                        onClick={() => handleOpenModal(city)}
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-black uppercase text-sm">
                                                    {city.name?.charAt(0).toUpperCase() || 'C'}
                                                </div>
                                                <span className="font-black text-zinc-900 dark:text-white text-sm">{city.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest">{city.slug}</span>
                                        </td>
                                        <td className="px-8 py-5 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                            {city.domain || 'Not assigned'}
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                                            {city.timezone}
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleOpenModal(city)}
                                                className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                                <GlobeAltIcon className="w-6 h-6 text-indigo-500" />
                                {editingCity ? 'Edit City Configuration' : 'Establish New City'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 rounded-xl text-sm font-black flex items-center gap-2">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">City Name</label>
                                    <input 
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium"
                                        placeholder="e.g. Pune"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">URL Slug</label>
                                    <input 
                                        type="text" required
                                        value={formData.slug}
                                        onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium"
                                        placeholder="e.g. pune"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Assigned Domain</label>
                                <div className="relative">
                                    <LinkIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="text"
                                        value={formData.domain}
                                        onChange={e => setFormData({...formData, domain: e.target.value})}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 pl-12 font-medium"
                                        placeholder="e.g. dashboard.city"
                                    />
                                </div>
                                <p className="mt-2 text-[10px] text-zinc-400 font-black tracking-widest uppercase">Domain requests for this city will be routed here automatically.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Default Timezone</label>
                                    <div className="relative">
                                        <ClockIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input 
                                            type="text" required
                                            value={formData.timezone}
                                            onChange={e => setFormData({...formData, timezone: e.target.value})}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 pl-12 font-medium"
                                            placeholder="Asia/Kolkata"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Branding Color</label>
                                    <div className="relative">
                                        <SwatchIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input 
                                            type="text"
                                            value={formData.active_color || '#0ea5e9'}
                                            onChange={e => setFormData({...formData, active_color: e.target.value})}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 pl-12 font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="w-full justify-center py-4 text-sm mt-4"
                            >
                                {saving ? 'Establishing City...' : editingCity ? 'Update City Configuration' : 'Establish This City'}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCities;
