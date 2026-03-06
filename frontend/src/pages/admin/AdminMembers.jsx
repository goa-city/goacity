import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilIcon, PlusIcon, UsersIcon, 
    MagnifyingGlassIcon, UserCircleIcon 
} from '@heroicons/react/24/outline';

const AdminMembers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersRes = await api.get('/admin/users');
            setUsers(usersRes.data);
        } catch (error) {
            console.error("Failed to fetch members:", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = users.filter(u => {
        const full = `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-sky-500">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Member Directory</h1>
                        <p className="text-sm text-gray-500">{users.length} registered members</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/members/create')}
                    className="admin-button-primary"
                >
                    <PlusIcon className="h-4 w-4" /> Create Member
                </button>
            </div>

            {/* Search */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative ml-auto">
                    <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, email or phone..."
                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 w-80"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading directory...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No members found.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Member</th>
                                <th className="admin-table-head">Role</th>
                                <th className="admin-table-head hidden md:table-cell">Streams</th>
                                <th className="admin-table-head hidden lg:table-cell">Joined</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((user) => (
                                <tr key={user.id} className="admin-table-row" onClick={() => navigate(`/admin/members/${user.id}`)}>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200">
                                                <UserCircleIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{(user.first_name || user.last_name) ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unnamed Member'}</p>
                                                <p className="text-xs text-gray-400">{user.email || user.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border ${
                                            user.role === 'admin' 
                                            ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell whitespace-normal max-w-xs">
                                        <div className="flex flex-wrap gap-1">
                                            {user.stream_names && user.stream_names.length > 0 ? (
                                                user.stream_names.map((name, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
                                                        {name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">No Streams</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell text-gray-400 text-xs">
                                        {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-end">
                                            <button 
                                                onClick={() => navigate(`/admin/members/${user.id}`)}
                                                className="admin-action-btn-edit" title="Edit Member"
                                            >
                                                <PencilIcon className="w-4 h-4" />
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

export default AdminMembers;
