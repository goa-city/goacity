import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminMembers } from '../hooks/useAdminMembers';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { formatDate } from '../../../utils/date';
import { 
    UsersIcon, 
    PlusIcon, 
    MagnifyingGlassIcon,
    UserCircleIcon,
    PencilSquareIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';

const MembersListView: React.FC = () => {
    const navigate = useNavigate();
    const { members, isLoading } = useAdminMembers();
    const [search, setSearch] = useState('');

    const filtered = members.filter(u => {
        const full = `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''} ${u.phone || ''}`.toLowerCase();
        return full.includes(search.toLowerCase());
    });

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-center tracking-widest">Accessing member directory...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Member Directory
                        <UsersIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                        Manage and verify {members.length} city members.
                    </p>
                </div>
                <Button onClick={() => navigate('/admin/members/create')} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Create Member
                </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-8 max-w-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        className="admin-input pl-12 h-12 shadow-sm"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Members Table Card */}
            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Member</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Streams</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden lg:table-cell">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {filtered.map((user) => (
                                <tr 
                                    key={user.id} 
                                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                                    onClick={() => navigate(`/admin/members/${user.id}`)}
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                                <UserCircleIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="text-xs font-medium text-zinc-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border ${
                                            user.role === 'admin' 
                                            ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' 
                                            : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                                            {user.streams?.map((s) => (
                                                <span key={s.id} className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 hidden lg:table-cell">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                            {formatDate(user.created_at)}
                                        </p>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                                            <ChevronRightIcon className="w-6 h-6" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No members found</p>
                        <p className="text-zinc-500 mt-1">Try adjusting your search filters.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MembersListView;
