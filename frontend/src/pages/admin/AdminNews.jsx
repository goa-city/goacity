import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
    TrashIcon, MagnifyingGlassIcon, NewspaperIcon
} from '@heroicons/react/24/outline';

const AdminNews = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => { fetchPosts(); }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/posts');
            setPosts(res.data);
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this news post permanently?')) return;
        try {
            await api.delete(`/admin/posts?id=${id}`);
            showToast('News post deleted successfully.');
            fetchPosts();
        } catch (e) { 
            console.error(e);
            alert(e.response?.data?.message || 'Failed to delete'); 
        }
    };

    const filtered = posts.filter(p =>
        p.content?.toLowerCase().includes(search.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.link_title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-sky-500">
                        <NewspaperIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">News Management</h1>
                        <p className="text-sm text-gray-500">
                            {posts.length} total posts in city feed
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="flex items-center mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search posts by content or member..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-80"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading news posts...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No news posts found.</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Post Content</th>
                                <th className="admin-table-head hidden md:table-cell">Author</th>
                                <th className="admin-table-head hidden lg:table-cell">Date</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(post => (
                                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="max-w-md">
                                            {post.link_title && (
                                                <p className="font-bold text-indigo-600 text-xs mb-1 truncate">{post.link_title}</p>
                                            )}
                                            <p className="text-gray-900 line-clamp-2 text-sm leading-relaxed">
                                                {post.content || <span className="italic text-gray-300">Media only post</span>}
                                            </p>
                                            {post.media_url && (
                                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-2 inline-block">
                                                    Contains {post.media_type}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-700">{post.full_name || 'Anonymous'}</span>
                                            <span className="text-[10px] text-gray-400">{post.member_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-gray-500 text-xs">
                                        {new Date(post.created_at).toLocaleDateString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="admin-action-btn-delete" title="Delete Post"
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
        </div>
    );
};

export default AdminNews;
