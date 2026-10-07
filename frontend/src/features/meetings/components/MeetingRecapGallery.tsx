import React, { useState, useEffect } from 'react';
import { PhotoIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export interface RecapGalleryPhoto {
    id: string;
    image_url: string;
    image_url_display?: string;
    caption?: string;
}

interface MeetingRecapGalleryProps {
    photos: RecapGalleryPhoto[];
    isAuthenticated: boolean;
}

const MeetingRecapGallery: React.FC<MeetingRecapGalleryProps> = ({ photos, isAuthenticated }) => {
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Keyboard navigation in lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'Escape') setLightboxIndex(null);
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : null));
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : null));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, photos.length]);

    if (!photos || photos.length === 0) return null;

    const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;



    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="tracking-tight text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                        Photo Gallery
                    </h3>
                </div>
                {isAuthenticated && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Click any photo to enlarge
                    </span>
                )}
            </div>

            {!isAuthenticated ? (
                /* Members-Only Locked Gallery Preview */
                <div className="relative rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 p-8 text-center bg-zinc-50 dark:bg-zinc-900/60">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 opacity-25 filter blur-sm pointer-events-none mb-4">
                        {photos.slice(0, 8).map((p, idx) => (
                            <div key={p.id || idx} className="aspect-square rounded-2xl bg-zinc-300 dark:bg-zinc-800 overflow-hidden">
                                <img src={p.image_url_display || p.image_url} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-xs text-white">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20">
                            <LockClosedIcon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-base font-black uppercase tracking-tight mb-1">
                            Exclusive Photo Gallery
                        </h4>
                        <p className="text-xs text-zinc-200 max-w-sm mb-4 leading-relaxed">
                            Sign in to browse all {photos.length} event photos in high-resolution and download pictures.
                        </p>
                        <a
                            href={`/?redirect=${encodeURIComponent(window.location.pathname)}`}
                            className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                        >
                            Sign In as Member
                        </a>
                    </div>
                </div>
            ) : (
                /* Authenticated Photo Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {photos.map((photo, idx) => {
                        const src = photo.image_url_display || photo.image_url;
                        return (
                            <div
                                key={photo.id || idx}
                                onClick={() => setLightboxIndex(idx)}
                                className="group relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                            >
                                <img
                                    src={src}
                                    alt={photo.caption || `Event photo ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-[10px] font-bold text-white truncate">
                                        {photo.caption || `Photo ${idx + 1}`}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxIndex !== null && activePhoto && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
                    onClick={() => setLightboxIndex(null)}
                >
                    <div
                        className="relative max-w-5xl max-h-[92vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top bar controls */}
                        <div className="w-full flex items-center justify-between text-white pb-3 px-2">
                            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                {lightboxIndex + 1} / {photos.length}
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setLightboxIndex(null)}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                                    title="Close"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Image Viewer with Navigation */}
                        <div className="relative flex items-center justify-center max-h-[78vh] overflow-hidden rounded-2xl">
                            <img
                                src={activePhoto.image_url_display || activePhoto.image_url}
                                alt={activePhoto.caption || 'Event photo'}
                                className="max-h-[78vh] max-w-full object-contain rounded-2xl shadow-2xl"
                            />

                            {/* Left Arrow */}
                            {photos.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
                                    }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
                                >
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                            )}

                            {/* Right Arrow */}
                            {photos.length > 1 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxIndex((lightboxIndex + 1) % photos.length);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-transform active:scale-95 cursor-pointer"
                                >
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            )}
                        </div>

                        {/* Caption below */}
                        {activePhoto.caption && (
                            <p className="text-sm text-zinc-300 font-medium text-center mt-3 max-w-xl">
                                {activePhoto.caption}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MeetingRecapGallery;
