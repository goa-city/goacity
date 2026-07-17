import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/date';
import {
    TrashIcon, MagnifyingGlassIcon, NewspaperIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';

interface NewsPost {
    id: number;
    content?: string | null;
    full_name?: string | null;
    link_title?: string | null;
    media_url?: string | null;
    media_type?: string | null;
    member_email?: string | null;
    created_at: string;
}

const AdminNews: React.FC = () => {
    const [posts, setPosts] = useState<NewsPost[]>([]);
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

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this news post permanently?')) return;
        try {
            await api.delete(`/admin/posts?id=${id}`);
            showToast('News post deleted successfully.');
            fetchPosts();
        } catch (e: any) { 
            console.error(e);
            showToast(e.response?.data?.message || 'Failed to delete'); 
        }
    };

    const filtered = posts.filter(p =>
        p.content?.toLowerCase().includes(search.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.link_title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        News Management
                        <NewspaperIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        {posts.length} total posts in city feed
                    </p>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search posts by content or member..."
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading news posts...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No news posts found</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Post Content</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Author</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(post => (
                                    <tr key={post.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group">
                                        <td className="px-8 py-5">
                                            <div className="max-w-md">
                                                {post.link_title && (
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 truncate">{post.link_title}</p>
                                                )}
                                                <p className="text-sm font-black text-zinc-900 dark:text-white line-clamp-2 leading-relaxed">
                                                    {post.content || <span className="italic text-zinc-400 font-medium">Media only post</span>}
                                                </p>
                                                {post.media_url && (
                                                    <span className="text-[10px] font-black tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md mt-2 inline-block border border-zinc-200 dark:border-zinc-700">
                                                        Contains {post.media_type}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-zinc-900 dark:text-white">{post.full_name || 'Anonymous'}</span>
                                                <span className="text-xs font-medium text-zinc-400">{post.member_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 hidden lg:table-cell">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                                {formatDate(post.created_at)}
                                            </p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                {new Date(post.created_at).toLocaleTimeString(undefined, {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30" title="Delete Post"
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
        </div>
    );
};

export default AdminNews;
