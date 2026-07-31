import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';

interface AdminMemberCreateForm {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    role: string;
    profile_photo: string;
}

const AdminMemberCreate: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<AdminMemberCreateForm>({
        first_name: '',
        last_name: '',
        role: 'member',
        profile_photo: ''
    });
    const [streams, setStreams] = useState<any[]>([]);
    const [selectedStreamIds, setSelectedStreamIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const { data } = await api.get('/admin/streams');
                setStreams(data);
            } catch (err) {
                console.error("Failed to fetch streams", err);
            }
        };
        fetchStreams();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.email || !formData.phone) {
            setError("Both Email and Phone are required.");
            setLoading(false);
            return;
        }

        if (selectedStreamIds.length === 0) {
            setError("At least one stream must be selected.");
            setLoading(false);
            return;
        }

        try {
            await api.post('/admin/users', {
                ...formData,
                stream_ids: selectedStreamIds
            });
            queryClient.invalidateQueries({ queryKey: ['admin-members'] });
            queryClient.invalidateQueries({ queryKey: ['member-stats'] });
            navigate('/admin/members');
        } catch (err: unknown) {
            console.error("Failed to create member", err);
            setError(err instanceof Error ? err.message : "Failed to create member.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
             <button 
                onClick={() => navigate('/admin/members')} 
                className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors mb-8 group"
            >
                <ArrowLeftIcon className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                <span className="text-xl font-medium">Back to Members</span>
            </button>

            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Member</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">


                    <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name *</label>
                        <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone *</label>
                            <input
                                type="text"
                                name="phone"
                                id="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Streams *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {streams.map((stream) => {
                                const isChecked = selectedStreamIds.includes(stream.id);
                                return (
                                    <label
                                        key={stream.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                            isChecked
                                                ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={isChecked}
                                            onChange={() => {
                                                if (isChecked) {
                                                    setSelectedStreamIds(selectedStreamIds.filter(id => id !== stream.id));
                                                } else {
                                                    setSelectedStreamIds([...selectedStreamIds, stream.id]);
                                                }
                                            }}
                                        />
                                        <span
                                            className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded border"
                                            style={{
                                                backgroundColor: `${stream.color || '#6366f1'}1A`,
                                                color: stream.color || '#6366f1',
                                                borderColor: `${stream.color || '#6366f1'}33`
                                            }}
                                        >
                                            {stream.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>



                    <div className="pt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/members')}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating...' : 'Create Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminMemberCreate;
