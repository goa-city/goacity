import React, { useState, useEffect, useRef } from 'react';
import { toggleVideoReaction, logVideoAnalytics } from '../api/meetings.api';
import { HandThumbUpIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid, HeartIcon as HeartIconSolid, PlayIcon } from '@heroicons/react/24/solid';

export interface RecapVideo {
    id: string;
    title: string;
    youtube_url: string;
    youtube_id: string;
    description?: string;
    duration?: string;
}

interface MeetingRecapVideosProps {
    meetingId: number | string;
    videos: RecapVideo[];
    initialReactions?: Record<string, { likes: number; loves: number; my_reaction?: string | null }>;
    isAuthenticated: boolean;
}

export const extractYouTubeId = (url: string): string => {
    if (!url) return '';
    const trimmed = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : trimmed;
};

const MeetingRecapVideos: React.FC<MeetingRecapVideosProps> = ({
    meetingId,
    videos,
    initialReactions = {},
    isAuthenticated
}) => {
    const [activeClipIndex, setActiveClipIndex] = useState(0);
    const [reactions, setReactions] = useState(initialReactions);
    const [isReacting, setIsReacting] = useState(false);
    const activeVideo = videos[activeClipIndex] || videos[0];

    // Watch duration tracking with YouTube IFrame API
    const playerRef = useRef<any>(null);
    const timerRef = useRef<any>(null);
    const activeVideoId = activeVideo ? (activeVideo.id || activeVideo.youtube_id) : '';

    useEffect(() => {
        setReactions(initialReactions);
    }, [initialReactions]);

    useEffect(() => {
        if (!activeVideoId || !isAuthenticated) return;

        // Cleanup previous timers
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        const ytId = extractYouTubeId(activeVideo.youtube_url || activeVideo.youtube_id);
        if (!ytId) return;

        // Load YouTube IFrame API if not already present
        const initPlayer = () => {
            const containerId = `yt-player-${activeVideoId}`;
            const elem = document.getElementById(containerId);
            if (!elem) return;

            if ((window as any).YT && (window as any).YT.Player) {
                try {
                    playerRef.current = new (window as any).YT.Player(containerId, {
                        videoId: ytId,
                        playerVars: {
                            rel: 0,
                            modestbranding: 1
                        },
                        events: {
                            onStateChange: (event: any) => {
                                const YTState = (window as any).YT.PlayerState;
                                if (event.data === YTState.PLAYING) {
                                    logVideoAnalytics(meetingId, activeVideoId, { action: 'play', duration_seconds: 0 });
                                    
                                    // Start 10-second heartbeat
                                    if (!timerRef.current) {
                                        timerRef.current = setInterval(() => {
                                            logVideoAnalytics(meetingId, activeVideoId, { action: 'heartbeat', duration_seconds: 10 });
                                        }, 10000);
                                    }
                                } else {
                                    if (timerRef.current) {
                                        clearInterval(timerRef.current);
                                        timerRef.current = null;
                                    }
                                    if (event.data === YTState.ENDED) {
                                        logVideoAnalytics(meetingId, activeVideoId, { action: 'ended', duration_seconds: 5 });
                                    }
                                }
                            }
                        }
                    });
                } catch (e) {
                    console.error('YouTube player init error:', e);
                }
            }
        };

        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            (window as any).onYouTubeIframeAPIReady = initPlayer;
        } else {
            initPlayer();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (playerRef.current && playerRef.current.destroy) {
                try { playerRef.current.destroy(); } catch (e) {}
                playerRef.current = null;
            }
        };
    }, [activeClipIndex, activeVideoId, isAuthenticated, meetingId]);

    const handleReaction = async (reactionType: 'like' | 'love') => {
        if (!isAuthenticated) {
            alert('Please sign in to react to video clips.');
            return;
        }
        if (isReacting || !activeVideoId) return;

        setIsReacting(true);
        // Optimistic UI update
        const current = reactions[activeVideoId] || { likes: 0, loves: 0, my_reaction: null };
        const isRemoving = current.my_reaction === reactionType;
        const previousReaction = current.my_reaction;

        let newLikes = current.likes;
        let newLoves = current.loves;

        if (isRemoving) {
            if (reactionType === 'like') newLikes = Math.max(0, newLikes - 1);
            if (reactionType === 'love') newLoves = Math.max(0, newLoves - 1);
        } else {
            if (previousReaction === 'like') newLikes = Math.max(0, newLikes - 1);
            if (previousReaction === 'love') newLoves = Math.max(0, newLoves - 1);
            if (reactionType === 'like') newLikes += 1;
            if (reactionType === 'love') newLoves += 1;
        }

        const optimisticUpdated = {
            ...reactions,
            [activeVideoId]: {
                likes: newLikes,
                loves: newLoves,
                my_reaction: isRemoving ? null : reactionType
            }
        };
        setReactions(optimisticUpdated);

        try {
            const res = await toggleVideoReaction(meetingId, activeVideoId, reactionType);
            if (res && res.reactions) {
                setReactions(prev => ({
                    ...prev,
                    [activeVideoId]: res.reactions
                }));
            }
        } catch (e) {
            console.error('Failed to toggle reaction:', e);
            setReactions(reactions); // rollback
        } finally {
            setIsReacting(false);
        }
    };

    if (!videos || videos.length === 0) return null;

    const currentReactions = reactions[activeVideoId] || { likes: 0, loves: 0, my_reaction: null };
    const ytId = extractYouTubeId(activeVideo?.youtube_url || activeVideo?.youtube_id || '');

    return (
        <div className="space-y-6">
            {/* Header Badge */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                        Meeting Recordings & Clips ({videos.length})
                    </h3>
                </div>
                {videos.length > 1 && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Playing Clip {activeClipIndex + 1} of {videos.length}
                    </span>
                )}
            </div>

            {/* Featured 16:9 Video Player */}
            <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-zinc-200/80 dark:border-zinc-800 aspect-video">
                {isAuthenticated ? (
                    <div id={`yt-player-${activeVideoId}`} className="w-full h-full" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-900 text-white relative">
                        <img 
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} 
                            alt="" 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm" 
                        />
                        <div className="relative z-10 max-w-md">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/30">
                                <PlayIcon className="w-7 h-7 ml-0.5" />
                            </div>
                            <h4 className="text-lg font-black uppercase tracking-tight mb-2">Members-Only Recording</h4>
                            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                                Sign in with your registered Goa.City account to watch full meeting recordings and clips.
                            </p>
                            <a
                                href={`/?redirect=${encodeURIComponent(window.location.pathname)}`}
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                Sign In to Watch
                            </a>
                        </div>
                    </div>
                )}
            </div>

            {/* Video Details & Reactions Bar */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                        {activeVideo.title || `Clip #${activeClipIndex + 1}`}
                    </h4>
                    {activeVideo.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            {activeVideo.description}
                        </p>
                    )}
                </div>

                {/* Reaction Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => handleReaction('like')}
                        disabled={isReacting}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            currentReactions.my_reaction === 'like'
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm scale-105'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Like this clip"
                    >
                        {currentReactions.my_reaction === 'like' ? (
                            <HandThumbUpIconSolid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                            <HandThumbUpIcon className="w-4 h-4" />
                        )}
                        <span>Like</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900/60 shadow-xs">
                            {currentReactions.likes}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleReaction('love')}
                        disabled={isReacting}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                            currentReactions.my_reaction === 'love'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shadow-sm scale-105'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                        title="Love this clip"
                    >
                        {currentReactions.my_reaction === 'love' ? (
                            <HeartIconSolid className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        ) : (
                            <HeartIcon className="w-4 h-4" />
                        )}
                        <span>Love</span>
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-900/60 shadow-xs">
                            {currentReactions.loves}
                        </span>
                    </button>
                </div>
            </div>

            {/* Playlist Strip (Multiple clips switcher) */}
            {videos.length > 1 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">Select Clip</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {videos.map((vid, idx) => {
                            const isCurrent = idx === activeClipIndex;
                            const clipYtId = extractYouTubeId(vid.youtube_url || vid.youtube_id);
                            return (
                                <button
                                    key={vid.id || idx}
                                    type="button"
                                    onClick={() => setActiveClipIndex(idx)}
                                    className={`p-3 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer border ${
                                        isCurrent
                                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20'
                                            : 'bg-white dark:bg-zinc-900 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }`}
                                >
                                    <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-zinc-200 dark:border-zinc-800">
                                        <img
                                            src={`https://img.youtube.com/vi/${clipYtId}/hqdefault.jpg`}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        {isCurrent ? (
                                            <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                                            </div>
                                        ) : (
                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                <PlayIcon className="w-4 h-4 text-white opacity-80" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                                Part {idx + 1}
                                            </span>
                                            {isCurrent && (
                                                <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-600 text-white">
                                                    Now Playing
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">
                                            {vid.title || `Clip #${idx + 1}`}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingRecapVideos;
