import React, { useState } from 'react';
import { useNews } from '../hooks/useNews';
import PostCard from './PostCard';
import Button from '../../../shared/components/ui/Button';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { NewspaperIcon, PencilSquareIcon, PhotoIcon } from '@heroicons/react/24/solid';

const NewsFeed: React.FC = () => {
    const { feed, isLoading, likePost, deletePost, createPost, isCreating } = useNews();
    const [newPostContent, setNewPostContent] = useState('');

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) return;
        await createPost({ content: newPostContent });
        setNewPostContent('');
    };

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black tracking-widest uppercase text-center">Tuning into the kingdom...</div>;

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Community News
                        <NewspaperIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium leading-relaxed">
                        Stay connected with what God is doing across Goa. Share stories, updates, and prayer requests.
                    </p>
                </div>

                {/* Create Post Box */}
                <Card className="mb-10 border-zinc-100 dark:border-zinc-800 shadow-lg shadow-indigo-600/5">
                    <CardContent className="p-6">
                        <textarea 
                            placeholder="What's on your heart for Goa today?"
                            className="w-full bg-transparent border-none focus:ring-0 text-lg text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 resize-none min-h-[100px]"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
                            <div className="flex items-center gap-2">
                                <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <PhotoIcon className="w-6 h-6" />
                                </button>
                                <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                    <PencilSquareIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <Button 
                                onClick={handleCreatePost}
                                isLoading={isCreating}
                                disabled={!newPostContent.trim()}
                                className="rounded-xl px-8"
                            >
                                Share Update
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Feed */}
                <div className="space-y-8">
                    {feed.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onLike={likePost}
                            onDelete={deletePost}
                        />
                    ))}
                    
                    {feed.length === 0 && (
                        <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">Quiet morning in Goa...</p>
                            <p className="text-zinc-500 mt-1">Be the first to share a community update!</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default NewsFeed;
