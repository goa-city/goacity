import React, { useState, useRef } from 'react';
import { useNews } from '../hooks/useNews';
import PostCard from './PostCard';
import Button from '../../../shared/components/ui/Button';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { NewspaperIcon, PhotoIcon, VideoCameraIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/solid';

const NewsFeed: React.FC = () => {
    const { feed, isLoading, likePost, deletePost, createPost, isCreating, updatePost } = useNews();
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !mediaFile) return;

        await createPost({
            content: newPostContent,
            media: mediaFile,
            media_type: mediaFile?.type.startsWith('video/') ? 'video' : 'image',
            link_title: linkUrl // Simple implementation for now
        });

        setNewPostContent('');
        setMediaFile(null);
        setMediaPreview(null);
        setLinkUrl('');
        setShowLinkInput(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
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
                            placeholder="What's on your heart today?"
                            className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 resize-none min-h-[100px]"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                        />

                        {mediaPreview && (
                            <div className="relative mb-4 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                                {mediaFile?.type.startsWith('video/') ? (
                                    <video src={mediaPreview} className="w-full h-auto max-h-[300px] object-cover" controls />
                                ) : (
                                    <img src={mediaPreview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
                                )}
                                <button
                                    onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {showLinkInput && (
                            <div className="mb-4 flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <LinkIcon className="w-4 h-4 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Paste a link here..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm text-zinc-900 dark:text-white"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                                <button onClick={() => setShowLinkInput(false)} className="text-zinc-400">
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
                            <div className="flex items-center gap-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    title="Add Photo"
                                >
                                    <PhotoIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                    title="Add Video"
                                >
                                    <VideoCameraIcon className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={() => setShowLinkInput(!showLinkInput)}
                                    className={`p-2 rounded-lg transition-colors ${showLinkInput ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                                    title="Add Link"
                                >
                                    <LinkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <Button
                                onClick={handleCreatePost}
                                isLoading={isCreating}
                                disabled={!newPostContent.trim() && !mediaFile}
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
                            onUpdate={(id, content) => updatePost({ id, content })}
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
