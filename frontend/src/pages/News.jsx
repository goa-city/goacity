import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PhotoIcon, VideoCameraIcon, LinkIcon, XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, PhotoIcon as PhotoIconSolid, VideoCameraIcon as VideoCameraIconSolid, LinkIcon as LinkIconSolid } from '@heroicons/react/24/solid';

const News = () => {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create Post State
    const [content, setContent] = useState('');
    const [mediaType, setMediaType] = useState('none'); // 'none', 'image', 'video', 'link'
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        // Wait for auth to check
        if (authLoading) return;

        // If not logged in, stop loading (let router handle redirect)
        if (!user) {
            setLoading(false);
            return;
        }

        fetchPosts();
    }, [user, authLoading]);

    const fetchPosts = async () => {
        try {
            const res = await api.get(`/posts?user_id=${user?.id || 0}`);
            setPosts(res.data);
        } catch (error) {
            console.error("Failed to load posts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'video') {
            // Validate duration
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                const duration = video.duration;
                if (duration > 61) { // Allow 1s buffer for floating point issues
                    alert("Video must be 60 seconds or less.");
                    if (fileInputRef.current) fileInputRef.current.value = '';
                } else {
                    setSelectedFile(file);
                    setMediaType(type);
                    setPreviewUrl(URL.createObjectURL(file));
                }
            };
            
            video.onerror = () => {
                 alert("Could not load video metadata.");
            };

            video.src = URL.createObjectURL(file);
        } else {
            setSelectedFile(file);
            setMediaType(type);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearMedia = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setMediaType('none');
        setLinkUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleLike = async (post) => {
        if (!user) return;
        
        // Optimistic update
        const isLiked = post.liked_by_me > 0;
        const newStatus = !isLiked;
        const newCount = parseInt(post.like_count) + (newStatus ? 1 : -1);
        
        setPosts(prev => prev.map(p => 
            p.id === post.id 
                ? { ...p, liked_by_me: newStatus ? 1 : 0, like_count: newCount } 
                : p
        ));

        try {
            const formData = new FormData();
            formData.append('action', 'toggle_like');
            formData.append('post_id', post.id);
            formData.append('user_id', user.id);
            
            await api.post('/posts', formData);
        } catch (error) {
            console.error("Like failed", error);
            // Revert
             setPosts(prev => prev.map(p => 
                p.id === post.id ? post : p
            ));
        }
    };

    const handlePostSubmit = async () => {
        if (!content.trim() && !selectedFile && !linkUrl) return;

        setIsPosting(true);
        const formData = new FormData();
        formData.append('user_id', user.id);
        formData.append('content', content);
        formData.append('media_type', mediaType);
        
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        if (mediaType === 'link') {
            formData.append('link_title', linkUrl); // Basic for now, later fetch metadata
        }

        try {
            await api.post('/posts', formData);
            
            // Reset and Refresh
            setContent('');
            clearMedia();
            fetchPosts();
        } catch (error) {
            console.error("Post failed", error);
            alert("Failed to post. Please try again.");
        } finally {
            setIsPosting(false);
        }
    };

    // Helper for Time Ago
    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        // Adjust for timezone offset if needed, or rely on server UTC and local conversion
        // Assuming server sends UTC or correct ISO.
        // Simple fallback
        if (isNaN(seconds)) return dateStr;

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m";
        return Math.floor(seconds) + "s";
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto py-8 px-4">
                
                {/* Create Post Widget */}
                <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
                    <div className="flex gap-4 mb-4">
                        <img 
                            src={user?.profile_photo || `https://ui-avatars.com/api/?name=${user?.first_name || 'U'}+${user?.last_name || 'N'}`} 
                            alt="User" 
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                        />
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={`What's on your mind, ${user?.first_name || 'Member'}?`}
                                className="w-full bg-gray-50 rounded-2xl p-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all resize-none border border-gray-100"
                                rows="3"
                            />
                        </div>
                    </div>

                    {/* Media Preview */}
                    {previewUrl && (
                        <div className="relative mb-4 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                            <button onClick={clearMedia} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                            {mediaType === 'image' && <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-96 object-contain" />}
                            {mediaType === 'video' && <video src={previewUrl} controls className="w-full h-auto max-h-96" />}
                        </div>
                    )}
                    
                    {mediaType === 'link' && (
                         <div className="relative mb-4 flex items-center bg-blue-50 p-3 rounded-xl border border-blue-100 text-blue-800">
                            <div className="bg-blue-200 p-2 rounded-lg mr-3">
                                <LinkIcon className="w-5 h-5 text-blue-700" />
                            </div>
                            <input 
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Paste link here..."
                                className="flex-1 bg-transparent border-none text-sm font-medium focus:ring-0 placeholder-blue-300 text-blue-900"
                            />
                            <button onClick={clearMedia} className="p-1 hover:bg-blue-200 rounded-full transition-colors"><XMarkIcon className="w-5 h-5 text-blue-500" /></button>
                         </div>
                    )}

                    {/* Actions and Submit */}
                    <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-2">
                        <div className="flex gap-2">
                             <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileSelect(e, mediaType)} />
                             
                             <button 
                                onClick={() => { setMediaType('image'); fileInputRef.current.accept="image/*"; fileInputRef.current.click(); }} 
                                className="group p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
                                title="Upload Photo"
                             >
                                <PhotoIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                             </button>
                             
                             <button 
                                onClick={() => { setMediaType('video'); fileInputRef.current.accept="video/*"; fileInputRef.current.click(); }}
                                className="group p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
                                title="Upload Video"
                             >
                                <VideoCameraIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                             </button>
                             
                             <button 
                                onClick={() => { setMediaType('link'); setSelectedFile(null); setPreviewUrl(null); }}
                                className="group p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-95"
                                title="Add Link"
                             >
                                <LinkIcon className="w-6 h-6 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                             </button>
                        </div>
                        
                        <button 
                            onClick={handlePostSubmit}
                            disabled={isPosting || (!content && !selectedFile && !linkUrl)}
                            className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {isPosting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading feed...</div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="p-4 flex items-center gap-3">
                                    <img 
                                        src={post.profile_photo || "https://ui-avatars.com/api/?name=" + post.full_name} 
                                        alt={post.full_name} 
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{post.full_name}</h3>
                                        <p className="text-xs text-gray-500">{timeAgo(post.created_at)} ago</p>
                                    </div>
                                </div>

                                {/* Content */}
                                {post.content && (
                                    <div className="px-4 pb-3">
                                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p>
                                    </div>
                                )}

                                {/* Media */}
                                {post.media_type === 'image' && post.media_url && (
                                    <img 
                                        src={post.media_url.startsWith('http') ? post.media_url : `${api.defaults.baseURL.replace('/api', '')}/${post.media_url}`} 
                                        alt="Post content" 
                                        className="w-full h-auto object-cover max-h-[500px]"
                                    />
                                )}
                                {post.media_type === 'video' && post.media_url && (
                                    <video 
                                        src={post.media_url.startsWith('http') ? post.media_url : `${api.defaults.baseURL.replace('/api', '')}/${post.media_url}`} 
                                        controls 
                                        className="w-full h-auto max-h-[500px] bg-black"
                                    />
                                )}
                                {post.media_type === 'link' && post.link_title && (
                                    <div className="mx-4 mb-4 border rounded-lg overflow-hidden bg-gray-50">
                                        <div className="p-3">
                                            <a href={post.link_title} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm break-all font-medium">
                                                {post.link_title}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Footer Actions */}
                                <div className="px-4 py-2 border-t flex items-center">
                                    <div className="relative group">
                                        <button 
                                            onClick={() => handleLike(post)}
                                            className="flex items-center gap-1.5 focus:outline-none"
                                        >
                                            {post.liked_by_me > 0 ? (
                                                <HeartIconSolid className="w-6 h-6 text-red-600" />
                                            ) : (
                                                <HeartIcon className="w-6 h-6 text-gray-500 hover:text-red-600 transition-colors" />
                                            )}
                                            {post.like_count > 0 && (
                                                <span className={`text-sm font-medium ${post.liked_by_me > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {post.like_count}
                                                </span>
                                            )}
                                        </button>
                                        
                                        {/* Likers Tooltip */}
                                        {post.likers_preview && (
                                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1 px-2 z-10 shadow-lg">
                                                Liked by {post.likers_preview}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
};

export default News;
