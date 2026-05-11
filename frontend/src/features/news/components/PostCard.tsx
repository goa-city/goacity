import React, { useState } from 'react';
import { formatDate } from '../../../utils/date';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { HeartIcon, TrashIcon, PencilSquareIcon, CheckIcon, XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../auth/context/AuthContext';

interface PostCardProps {
    post: {
        id: number;
        user_id: number;
        content: string;
        created_at: string;
        media_url?: string;
        media_type?: string;
        link_title?: string;
        likes_count?: number;
        user?: {
            first_name: string;
            last_name: string;
            profile_photo?: string;
        };
        likes?: { user_id: number }[];
    };
    onLike: (id: number) => void;
    onDelete: (id: number) => void;
    onUpdate: (id: number, content: string) => Promise<void>;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete, onUpdate }) => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);
    const [isUpdating, setIsUpdating] = useState(false);

    const isAuthor = user?.id === post.user_id;
    const isLiked = post.likes?.some(l => l.user_id === user?.id);
    
    // Check if 24 hours have passed
    const createdAt = new Date(post.created_at);
    const now = new Date();
    const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const isEditable = isAuthor && hoursPassed < 24;

    const handleUpdate = async () => {
        if (!editedContent.trim()) return;
        setIsUpdating(true);
        try {
            await onUpdate(post.id, editedContent);
            setIsEditing(false);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setEditedContent(post.content);
        setIsEditing(false);
    };

    return (
        <Card className="overflow-hidden border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {post.user?.profile_photo ? (
                                <img src={post.user.profile_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-sm font-black text-zinc-400">
                                    {post.user?.first_name?.[0]}
                                </div>
                            )}
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-tight">
                                {post.user?.first_name} {post.user?.last_name}
                            </h4>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                                {formatDate(post.created_at)}
                            </p>
                        </div>
                    </div>
                        <div className="flex items-center gap-1">
                            {isEditable && !isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="p-1.5 rounded-lg text-zinc-300 hover:text-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                                    title="Edit Post"
                                >
                                    <PencilSquareIcon className="w-4 h-4" />
                                </button>
                            )}
                            {isAuthor && (
                                <button 
                                    onClick={() => onDelete(post.id)} 
                                    className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                                    title="Delete Post"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mb-4">
                        <textarea 
                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-zinc-900 dark:text-white focus:ring-1 focus:ring-indigo-100 focus:border-indigo-200 outline-none resize-none min-h-[100px]"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button 
                                onClick={handleCancel}
                                className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                disabled={isUpdating}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={handleUpdate}
                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                disabled={isUpdating || !editedContent.trim()}
                            >
                                <CheckIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed whitespace-pre-wrap mb-4">
                        {post.content}
                    </p>
                )}

                {post.media_url && (
                    <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 mb-4 bg-zinc-50 dark:bg-zinc-900/50">
                        {post.media_type === 'video' ? (
                            <video src={post.media_url} controls className="w-full h-auto max-h-[700px]" />
                        ) : (
                            <img src={post.media_url} alt="" className="w-full h-auto max-h-[700px] object-contain mx-auto" />
                        )}
                    </div>
                )}

                {post.link_title && (
                    <a 
                        href={post.link_title.startsWith('http') ? post.link_title : `https://${post.link_title}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block mb-4 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-indigo-200 transition-colors group"
                    >
                        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                            <LinkIcon className="w-4 h-4" />
                            <span className="truncate group-hover:underline">{post.link_title}</span>
                        </div>
                    </a>
                )}

                {/* Footer / Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-zinc-50 dark:border-zinc-800/50">
                    <button 
                        onClick={() => onLike(post.id)}
                        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
                    >
                        {isLiked ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                        <span>{post.likes_count || 0}</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PostCard;
