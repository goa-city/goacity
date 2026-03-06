import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PlusIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, 
    ArchiveBoxXMarkIcon, CalendarDaysIcon, MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AdminMeetings = () => {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
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
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to PERMANENTLY delete this meeting? This cannot be undone.")) return;
        try {
            await api.delete(`/admin/meetings?id=${id}`);
            showToast('Meeting deleted permanently.');
            fetchMeetings();
        } catch (error) {
            console.error("Failed to delete meeting", error);
            alert("Failed to delete meeting");
        }
    };

    const filtered = meetings.filter(m => 
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.location_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-container">
            {toast && <div className="admin-toast">{toast}</div>}

            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-indigo-500">
                        <CalendarDaysIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
                        <p className="text-sm text-gray-500">
                            {meetings.length} {filter} meetings
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/meetings/create')}
                    className="admin-button-primary"
                >
                    <PlusIcon className="w-4 h-4" /> New Meeting
                </button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                {['active', 'archived'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`admin-filter-tab ${filter === s ? 'admin-filter-tab-active' : 'admin-filter-tab-inactive'}`}
                    >
                        {s}
                    </button>
                ))}
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search meetings..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-64"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading meetings...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No meetings found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Meeting Details</th>
                                <th className="admin-table-head hidden md:table-cell">Stream</th>
                                <th className="admin-table-head hidden lg:table-cell">Date & Time</th>
                                <th className="admin-table-head">Status</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(meeting => (
                                <tr key={meeting.id} className="admin-table-row" onClick={() => navigate(`/admin/meetings/${meeting.id}`)}>
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-900">{meeting.title}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-xs">{meeting.location_name}</p>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        {meeting.stream_name ? (
                                            <span className={`text-[11px] font-bold px-2 py-1 rounded-full`} style={{ backgroundColor: `${meeting.stream_color}20`, color: meeting.stream_color }}>
                                                {meeting.stream_name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No stream</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell">
                                        <p className="text-xs text-gray-700">{meeting.meeting_date}</p>
                                        <p className="text-[10px] text-gray-500">{meeting.start_time?.substring(0,5)} - {meeting.end_time?.substring(0,5)}</p>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${meeting.archived == 1 ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                            {meeting.archived == 1 ? 'Archived' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/admin/meetings/${meeting.id}`)}
                                                title="Edit"
                                                className="admin-action-btn-edit"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleArchive(meeting.id, meeting.archived == 1)}
                                                title={meeting.archived == 1 ? "Restore" : "Archive"}
                                                className="admin-action-btn-archive"
                                            >
                                                {meeting.archived == 1 ? <ArchiveBoxXMarkIcon className="w-4 h-4" /> : <ArchiveBoxIcon className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(meeting.id)}
                                                title="Delete"
                                                className="admin-action-btn-delete"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminMeetings;
