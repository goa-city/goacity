import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate } from '../../utils/date';
import { 
    PlusIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, 
    ArchiveBoxXMarkIcon, CalendarDaysIcon, MagnifyingGlassIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const getLocalYYYYMMDD = (dateInput: any) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
};

const AdminMeetings: React.FC = () => {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active'); // active, archived
    const [search, setSearch] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchMeetings();
    }, [filter]);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/meetings?archived=${filter === 'archived' ? 1 : 0}`);
            setMeetings(res.data);
        } catch (error) {
            console.error("Failed to fetch meetings", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleArchive = async (id, currentStatus) => {
        const action = currentStatus ? 'unarchive' : 'archive';
        if (!window.confirm(`Are you sure you want to ${action} this meeting?`)) return;
        try {
            await api.post('/admin/meetings/archive', { 
                id, 
                archived: currentStatus ? 0 : 1 
            });
            showToast(`Meeting ${action}d successfully!`);
            fetchMeetings();
        } catch (error) {
            console.error(`Failed to ${action} meeting`, error);
            showToast("Failed to update status");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this meeting? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/meetings?id=${id}`);
            showToast('Meeting deleted permanently.');
            fetchMeetings();
        } catch (error) {
            console.error("Failed to delete meeting", error);
            showToast("Failed to delete meeting");
        }
    };

    const handleWhatsAppAlert = async (id, title) => {
        if (!window.confirm(`Send WhatsApp alerts for "${title}" to all enrolled members?`)) return;
        try {
            await api.post('/admin/whatsapp/meeting-alert', { meetingId: id });
            showToast('Alerts queued successfully!');
        } catch (error) {
            console.error("Failed to send alerts", error);
            showToast("Failed to queue alerts. Is WhatsApp connected?");
        }
    };

    const filtered = meetings.filter(m => 
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.location_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Meetings
                        <CalendarDaysIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        {meetings.length} {filter} meetings
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/meetings/create')} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> New Meeting
                </Button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-8 items-center justify-between">
                <div className="flex gap-2">
                    {['active', 'archived'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${
                                filter === s 
                                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50' 
                                : 'bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative max-w-md w-full ml-auto">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-12 shadow-sm font-medium"
                        placeholder="Search meetings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading meetings...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No meetings found</p>
                            <p className="text-zinc-500 mt-1">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Meeting Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Stream</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Date & Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {filtered.map(meeting => (
                                    <tr key={meeting.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group" onClick={() => navigate(`/admin/meetings/${meeting.id}`)}>
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{meeting.title}</p>
                                            <p className="text-xs font-medium text-zinc-400 truncate max-w-xs">{meeting.location_name}</p>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell">
                                            {meeting.stream_name ? (
                                                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border" style={{ backgroundColor: `${meeting.stream_color}20`, color: meeting.stream_color, borderColor: `${meeting.stream_color}40` }}>
                                                    {meeting.stream_name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-zinc-400 italic font-black uppercase tracking-widest">No stream</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 hidden lg:table-cell">
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{meeting.meeting_date_display}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{meeting.start_time_display} - {meeting.end_time_display}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            {(() => {
                                                if (meeting.archived == 1) {
                                                    return (
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700">
                                                            Archived
                                                        </span>
                                                    );
                                                }
                                                const isPast = meeting.meeting_date ? getLocalYYYYMMDD(meeting.meeting_date) < getLocalYYYYMMDD(new Date()) : false;
                                                if (isPast) {
                                                    return (
                                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50">
                                                            Ended
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50">
                                                        Active
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleWhatsAppAlert(meeting.id, meeting.title)}
                                                    title="Send WhatsApp Alert"
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-emerald-600 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/meetings/${meeting.id}`)}
                                                    title="Edit"
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleArchive(meeting.id, meeting.archived == 1)}
                                                    title={meeting.archived == 1 ? "Restore" : "Archive"}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-amber-600 transition-all hover:bg-amber-50 dark:hover:bg-amber-950/30"
                                                >
                                                    {meeting.archived == 1 ? <ArchiveBoxXMarkIcon className="w-5 h-5" /> : <ArchiveBoxIcon className="w-5 h-5" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(meeting.id)}
                                                    title="Delete"
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
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

export default AdminMeetings;
