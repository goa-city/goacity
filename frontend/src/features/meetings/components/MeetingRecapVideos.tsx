import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toggleVideoReaction, logVideoAnalytics } from '../api/meetings.api';
import { HeartIcon } from '@heroicons/react/24/outline';
import {
    HeartIcon as HeartIconSolid,
    PlayIcon,
    XMarkIcon
} from '@heroicons/react/24/solid';

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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = trimmed.match(regExp);
    return (match && match[2].length === 11) ? match[2] : trimmed;
};

/**
 * Fullscreen Video Lightbox Modal with Mobile & Landscape Optimization
 * - Portaled to document.body at z-[9999] so mobile BottomNav cannot cover it
 * - Floating auto-hiding top & bottom controls for maximum landscape viewing area
 * - Cross-device Fullscreen & Zoom/Fill support for iPhone & Android
 */
interface FullscreenVideoModalProps {
    video: RecapVideo;
    meetingId: number | string;
    onClose: () => void;
}

/**
 * Clean Theater Video Lightbox Modal
 * - Matches the clean desktop layout across all devices
 * - 20px top padding for title and Close button
 * - Exact 16:9 aspect-ratio video frame with rounded corners, centered
 * - Native YouTube controls without conflicting overlays
 */
const FullscreenVideoModal: React.FC<FullscreenVideoModalProps> = ({
    video,
    meetingId,
    onClose
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const timerRef = useRef<any>(null);
    const [isReady, setIsReady] = useState(false);

    const videoClipId = video.id || video.youtube_id;
    const ytId = extractYouTubeId(video.youtube_url || video.youtube_id);
    const containerId = useRef(`yt-lightbox-player-${Math.random().toString(36).slice(2, 8)}`).current;

    // Lock body scrolling when modal is open
    useEffect(() => {
        const origOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = origOverflow;
        };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Initialize YouTube Player with native controls, mobile autoplay & analytics tracking
    useEffect(() => {
        if (!ytId) return;

        let player: any = null;
        let isCancelled = false;

        const isMobileDevice = typeof window !== 'undefined' && (
            /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints > 1 && window.innerWidth < 1024)
        );

        const initPlayer = () => {
            if (isCancelled) return;
            const elem = document.getElementById(containerId);
            if (!elem) return;

            if ((window as any).YT && (window as any).YT.Player) {
                try {
                    player = new (window as any).YT.Player(containerId, {
                        videoId: ytId,
                        width: '100%',
                        height: '100%',
                        playerVars: {
                            autoplay: 1,
                            mute: isMobileDevice ? 1 : 0,
                            playsinline: 1,
                            rel: 0,
                            modestbranding: 1,
                            origin: window.location.origin,
                        },
                        events: {
                            onReady: (event: any) => {
                                if (isCancelled) return;
                                setIsReady(true);

                                const iframe = document.getElementById(containerId) as HTMLIFrameElement;
                                if (iframe) {
                                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                                    iframe.setAttribute('allowfullscreen', 'true');
                                }

                                try {
                                    if (isMobileDevice) {
                                        event.target.mute();
                                    }
                                    event.target.playVideo();
                                } catch (e) { }

                                // Fallback: ensure playback starts even if browser restricted unmuted autoplay
                                setTimeout(() => {
                                    if (isCancelled) return;
                                    try {
                                        const state = event.target.getPlayerState();
                                        if (state !== 1 && state !== 3) {
                                            event.target.mute();
                                            event.target.playVideo();
                                        }
                                    } catch (e) { }
                                }, 350);
                            },
                            onStateChange: (event: any) => {
                                const YTState = (window as any).YT.PlayerState;
                                if (event.data === YTState.PLAYING) {
                                    logVideoAnalytics(meetingId, videoClipId, { action: 'play', duration_seconds: 0 });
                                    if (!timerRef.current) {
                                        timerRef.current = setInterval(() => {
                                            logVideoAnalytics(meetingId, videoClipId, { action: 'heartbeat', duration_seconds: 10 });
                                        }, 10000);
                                    }
                                } else {
                                    if (timerRef.current) {
                                        clearInterval(timerRef.current);
                                        timerRef.current = null;
                                    }
                                    if (event.data === YTState.ENDED) {
                                        logVideoAnalytics(meetingId, videoClipId, { action: 'ended', duration_seconds: 5 });
                                    }
                                }
                            }
                        }
                    });
                    playerRef.current = player;
                } catch (e) {
                    console.error('YouTube player init error:', e);
                }
            }
        };

        if (!(window as any).YT || !(window as any).YT.Player) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            const prevCallback = (window as any).onYouTubeIframeAPIReady;
            (window as any).onYouTubeIframeAPIReady = () => {
                if (typeof prevCallback === 'function') prevCallback();
                initPlayer();
            };
        } else {
            initPlayer();
        }

        return () => {
            isCancelled = true;
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            if (player && typeof player.destroy === 'function') {
                try { player.destroy(); } catch (e) { }
            }
            playerRef.current = null;
        };
    }, [ytId, meetingId, videoClipId, containerId]);

    return createPortal(
        <div
            ref={modalRef}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden select-none"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Dedicated Top Bar: Safe-area + 20px top padding for generous spacing */}
            <div
                style={{ paddingTop: 'max(20px, calc(env(safe-area-inset-top, 0px) + 20px))' }}
                className="w-full shrink-0 px-4 sm:px-8 pb-4 flex items-center justify-between z-30"
            >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    <h3 className="text-xs sm:text-base font-bold text-white tracking-wide truncate drop-shadow max-w-[220px] sm:max-w-md md:max-w-xl">
                        {video.title || 'Meeting Recording'}
                    </h3>
                </div>

                {/* Prominent, accessible Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white transition-all backdrop-blur-md border border-white/25 shadow-2xl cursor-pointer shrink-0"
                    aria-label="Close video"
                    title="Close video (Esc)"
                >
                    <span className="text-[11px] sm:text-sm font-black tracking-wider uppercase text-zinc-100">
                        Close
                    </span>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 flex items-center justify-center">
                        <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
                    </div>
                </button>
            </div>

            {/* Video Player Section: Fixed 16:9 Aspect Ratio Container matching Desktop */}
            <div
                className="flex-1 w-full min-h-0 flex items-center justify-center p-3 sm:p-6 md:p-8 my-auto relative"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        onClose();
                    }
                }}
            >
                <div className="relative w-full max-w-5xl aspect-video max-h-[calc(100dvh-120px)] mx-auto bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
                    <div
                        id={containerId}
                        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                    />

                    {/* Loading Indicator */}
                    {!isReady && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs z-10 pointer-events-none">
                            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-3" />
                            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">
                                Loading Recording...
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

/**
 * Single Video Card on the Meeting page
 */
const VideoCard: React.FC<{
    video: RecapVideo;
    isAuthenticated: boolean;
    reactions: { likes: number; loves: number; my_reaction?: string | null };
    onReact: (videoId: string, type: 'like' | 'love') => void;
    onOpen: (video: RecapVideo) => void;
    isReacting: boolean;
}> = ({ video, isAuthenticated, reactions, onReact, onOpen, isReacting }) => {
    const videoClipId = video.id || video.youtube_id;
    const ytId = extractYouTubeId(video.youtube_url || video.youtube_id);
    const currentReactions = reactions || { likes: 0, loves: 0, my_reaction: null };

    return (
        <div className="space-y-3">
            {/* Video title above the preview */}
            {video.title && (
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 px-1">
                    {video.title}
                </h4>
            )}

            {/* 16:9 Video Preview Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 aspect-video">
                {isAuthenticated ? (
                    <button
                        type="button"
                        onClick={() => onOpen(video)}
                        className="absolute inset-0 z-10 w-full h-full cursor-pointer group select-none text-left focus:outline-none"
                        aria-label={`Watch ${video.title || 'video'} in full screen`}
                    >
                        <img
                            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                            }}
                            alt={video.title || 'Video preview'}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/20 group-hover:from-black/70 group-hover:via-black/25 transition-all duration-300 flex items-center justify-center">
                            <div className="w-16 h-11 sm:w-20 sm:h-14 rounded-2xl bg-red-600/95 group-hover:bg-red-600 text-white flex items-center justify-center shadow-2xl shadow-red-950/60 group-hover:scale-110 transition-all duration-300">
                                <PlayIcon className="w-7 h-7 sm:w-8 sm:h-8 ml-0.5 text-white drop-shadow" />
                            </div>
                        </div>
                    </button>
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

            {/* Description + Reactions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                {video.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed flex-1 min-w-0">
                        {video.description}
                    </p>
                )}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => onReact(videoClipId, 'love')}
                        disabled={isReacting}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${currentReactions.my_reaction === 'love'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                        title="Love this clip"
                    >
                        {currentReactions.my_reaction === 'love' ? (
                            <HeartIconSolid className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        ) : (
                            <HeartIcon className="w-3.5 h-3.5" />
                        )}
                        <span>{currentReactions.loves}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const MeetingRecapVideos: React.FC<MeetingRecapVideosProps> = ({
    meetingId,
    videos,
    initialReactions = {},
    isAuthenticated
}) => {
    const [reactions, setReactions] = useState(initialReactions);
    const [isReacting, setIsReacting] = useState(false);
    const [activeVideo, setActiveVideo] = useState<RecapVideo | null>(null);

    // Preload YouTube API script in the background
    useEffect(() => {
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }
    }, []);

    useEffect(() => {
        setReactions(initialReactions);
    }, [initialReactions]);

    const handleReaction = async (videoId: string, reactionType: 'like' | 'love') => {
        if (!isAuthenticated) {
            alert('Please sign in to react to video clips.');
            return;
        }
        if (isReacting || !videoId) return;

        setIsReacting(true);
        const current = reactions[videoId] || { likes: 0, loves: 0, my_reaction: null };
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

        setReactions(prev => ({
            ...prev,
            [videoId]: {
                likes: newLikes,
                loves: newLoves,
                my_reaction: isRemoving ? null : reactionType
            }
        }));

        try {
            const res = await toggleVideoReaction(meetingId, videoId, reactionType);
            if (res && res.reactions) {
                setReactions(prev => ({
                    ...prev,
                    [videoId]: res.reactions
                }));
            }
        } catch (e) {
            console.error('Failed to toggle reaction:', e);
            setReactions(reactions);
        } finally {
            setIsReacting(false);
        }
    };

    if (!videos || videos.length === 0) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">

                <h3 className="tracking-tight text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                    Meeting Videos
                </h3>
            </div>

            {/* Videos grid: stacked on mobile, side-by-side on desktop */}
            <div className={`grid grid-cols-1 ${videos.length > 1 ? 'md:grid-cols-2' : ''} gap-6 lg:gap-8 items-start`}>
                {videos.map((vid) => {
                    const videoClipId = vid.id || vid.youtube_id;
                    return (
                        <VideoCard
                            key={videoClipId}
                            video={vid}
                            isAuthenticated={isAuthenticated}
                            reactions={reactions[videoClipId] || { likes: 0, loves: 0, my_reaction: null }}
                            onReact={handleReaction}
                            onOpen={(v) => setActiveVideo(v)}
                            isReacting={isReacting}
                        />
                    );
                })}
            </div>

            {/* Fullscreen Theater Modal (Portaled directly to document.body at z-[9999]) */}
            {activeVideo && (
                <FullscreenVideoModal
                    video={activeVideo}
                    meetingId={meetingId}
                    onClose={() => setActiveVideo(null)}
                />
            )}
        </div>
    );
};

export default MeetingRecapVideos;
