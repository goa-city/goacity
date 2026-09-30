import React, { useState, useEffect } from 'react';
import { fetchVideoAnalytics } from '../api/meetings.api';
import { XMarkIcon, PlayIcon, UserGroupIcon, ClockIcon, HandThumbUpIcon, HeartIcon } from '@heroicons/react/24/solid';

interface MeetingVideoAnalyticsModalProps {
    meetingId: number | string;
    onClose: () => void;
}

const formatSeconds = (totalSeconds: number): string => {
    if (!totalSeconds || totalSeconds <= 0) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
};

const MeetingVideoAnalyticsModal: React.FC<MeetingVideoAnalyticsModalProps> = ({ meetingId, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [selectedClipIndex, setSelectedClipIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;
        fetchVideoAnalytics(meetingId)
            .then((res) => {
                if (isMounted) {
                    setData(res);
                    setLoading(false);
                }
            })
            .catch((err) => {
                console.error('Failed to load video analytics:', err);
                if (isMounted) setLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [meetingId]);

    const analyticsList = data?.analytics || [];
    const activeClip = analyticsList[selectedClipIndex] || analyticsList[0];

    const overallPlays = analyticsList.reduce((sum: number, c: any) => sum + (c.total_plays || 0), 0);
    const overallSeconds = analyticsList.reduce((sum: number, c: any) => sum + (c.total_duration_seconds || 0), 0);
    // Count unique members across all clips
    const allMemberIds = new Set<number>();
    analyticsList.forEach((c: any) => {
        (c.viewers || []).forEach((v: any) => allMemberIds.add(v.member_id));
    });

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1.5 border border-indigo-100 dark:border-indigo-900/40">
                            Super Admin Analytics
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                            Video Recordings Watch Report
                        </h3>
                        <p className="text-xs text-zinc-400 font-medium">
                            {data?.meeting?.title || 'Meeting Video Analytics'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="py-24 text-center">
                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading Watch Analytics...</p>
                        </div>
                    ) : analyticsList.length === 0 ? (
                        <div className="py-20 text-center text-zinc-400 font-medium">
                            No recap video clips found for this meeting yet.
                        </div>
                    ) : (
                        <>
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <PlayIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Plays</p>
                                        <h4 className="text-2xl font-black text-zinc-900 dark:text-white">{overallPlays}</h4>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <UserGroupIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unique Viewers</p>
                                        <h4 className="text-2xl font-black text-zinc-900 dark:text-white">{allMemberIds.size}</h4>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                        <ClockIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Watch Time</p>
                                        <h4 className="text-2xl font-black text-zinc-900 dark:text-white">{formatSeconds(overallSeconds)}</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Clips Selector Tabs */}
                            {analyticsList.length > 1 && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                    {analyticsList.map((clip: any, idx: number) => (
                                        <button
                                            key={clip.clip_id || idx}
                                            onClick={() => setSelectedClipIndex(idx)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                                                idx === selectedClipIndex
                                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                            }`}
                                        >
                                            Clip {idx + 1}: {clip.title || `Part ${idx + 1}`}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Active Clip Breakdown */}
                            {activeClip && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-zinc-100/60 dark:bg-zinc-800/40 p-4 rounded-2xl">
                                        <div>
                                            <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                                {activeClip.title || 'Selected Clip'}
                                            </h4>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                {activeClip.total_plays} plays • {activeClip.unique_viewers} unique members • {formatSeconds(activeClip.total_duration_seconds)} watched
                                            </p>
                                        </div>
                                    </div>

                                    {/* Viewers Table */}
                                    <div className="overflow-x-auto rounded-2xl border border-zinc-200/70 dark:border-zinc-800">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] uppercase font-black tracking-widest text-zinc-400 border-b border-zinc-200/70 dark:border-zinc-800">
                                                <tr>
                                                    <th className="p-3.5">Member</th>
                                                    <th className="p-3.5">Contact</th>
                                                    <th className="p-3.5">Plays</th>
                                                    <th className="p-3.5">Watch Duration</th>
                                                    <th className="p-3.5">Reactions</th>
                                                    <th className="p-3.5">Last Watched</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-800">
                                                {(!activeClip.viewers || activeClip.viewers.length === 0) ? (
                                                    <tr>
                                                        <td colSpan={6} className="p-6 text-center text-zinc-400 font-medium">
                                                            No members have watched this clip yet.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    activeClip.viewers.map((viewer: any, vIdx: number) => (
                                                        <tr key={viewer.member_id || vIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                                                            <td className="p-3.5 flex items-center gap-2.5">
                                                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden shrink-0">
                                                                    {viewer.profile_photo_url ? (
                                                                        <img src={viewer.profile_photo_url} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center font-black text-zinc-400 text-xs">
                                                                            {viewer.name?.[0]}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="font-bold text-zinc-900 dark:text-white">
                                                                    {viewer.name}
                                                                </span>
                                                            </td>
                                                            <td className="p-3.5 text-zinc-500 dark:text-zinc-400">
                                                                {viewer.email || viewer.phone || '-'}
                                                            </td>
                                                            <td className="p-3.5 font-bold text-zinc-800 dark:text-zinc-200">
                                                                {viewer.play_count || 1}
                                                            </td>
                                                            <td className="p-3.5 font-black text-indigo-600 dark:text-indigo-400">
                                                                {formatSeconds(viewer.duration_seconds)}
                                                            </td>
                                                            <td className="p-3.5">
                                                                <div className="flex items-center gap-1.5">
                                                                    {viewer.reactions?.includes('like') && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
                                                                            <HandThumbUpIcon className="w-3 h-3" /> Like
                                                                        </span>
                                                                    )}
                                                                    {viewer.reactions?.includes('love') && (
                                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                                                                            <HeartIcon className="w-3 h-3" /> Love
                                                                        </span>
                                                                    )}
                                                                    {(!viewer.reactions || viewer.reactions.length === 0) && (
                                                                        <span className="text-zinc-300 dark:text-zinc-600">-</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="p-3.5 text-zinc-400 text-[11px]">
                                                                {viewer.last_watched_at ? new Date(viewer.last_watched_at).toLocaleString() : '-'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MeetingVideoAnalyticsModal;
