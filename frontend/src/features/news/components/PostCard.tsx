import React from 'react';
import { formatDate } from '../../../utils/date';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../auth/context/AuthContext';

interface PostCardProps {
    post: {
        id: number;
        user_id: number;
        content: string;
        created_at: string;
        media_url?: string;
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
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onDelete }) => {
    const { user } = useAuth();
    const isAuthor = user?.id === post.user_id;
    const isLiked = post.likes?.some(l => l.user_id === user?.id);

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
                    {isAuthor && (
                        <button onClick={() => onDelete(post.id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Content */}
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed whitespace-pre-wrap mb-4">
                    {post.content}
                </p>

                {post.media_url && (
                    <div className="rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 mb-4">
                        <img src={post.media_url} alt="" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
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
                    <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                        <span>Reply</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-indigo-600 transition-colors ml-auto">
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};

export default PostCard;
