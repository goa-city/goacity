import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../shared/components/ui/Card';
import { 
    BuildingOffice2Icon, UserGroupIcon, ShieldCheckIcon, 
    ArrowRightIcon, PlusIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    citiesCount: number;
    adminsCount: number;
    membersCount: number;
    recentCities: Array<{
        id: number;
        name: string;
        slug: string;
        domain: string;
    }>;
}

const SuperAdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/superadmin/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch superadmin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Loading stats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 py-6">
            {/* Header */}
            <div className="flex flex-wrap gap-6 justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg font-medium">Overview of the Goa.City network</p>
                </div>
                <button 
                    onClick={() => navigate('/superadmin/cities')}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 active:scale-[0.98]"
                >
                    <PlusIcon className="w-5 h-5" />
                    Manage Cities
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cities */}
                <Card className="bg-[#0d0d14] border-white/5 shadow-xl hover:border-violet-500/30 transition-all group p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-500 mb-1">Total Cities</p>
                            <h3 className="text-3xl font-black text-white">{stats?.citiesCount || 0}</h3>
                        </div>
                        <div className="p-3 bg-violet-500/10 rounded-xl group-hover:bg-violet-500/20 transition-all">
                            <BuildingOffice2Icon className="w-6 h-6 text-violet-400" />
                        </div>
                    </div>
                </Card>

                {/* System Admins */}
                <Card className="bg-[#0d0d14] border-white/5 shadow-xl hover:border-indigo-500/30 transition-all group p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Administrators</p>
                            <h3 className="text-3xl font-black text-white">{stats?.adminsCount || 0}</h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-all">
                            <ShieldCheckIcon className="w-6 h-6 text-indigo-400" />
                        </div>
                    </div>
                </Card>

                {/* Total Members */}
                <Card className="bg-[#0d0d14] border-white/5 shadow-xl hover:border-emerald-500/30 transition-all group p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Network Members</p>
                            <h3 className="text-3xl font-black text-white">{stats?.membersCount || 0}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-all">
                            <UserGroupIcon className="w-6 h-6 text-emerald-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Bottom Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Cities */}
                <Card className="bg-[#0d0d14] border-white/5 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider">Recently Added Cities</h2>
                        <button 
                            onClick={() => navigate('/superadmin/cities')}
                            className="text-xs font-bold text-violet-400 hover:text-white flex items-center gap-1 transition-all"
                        >
                            View All <ArrowRightIcon className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {stats?.recentCities && stats.recentCities.length > 0 ? (
                            stats.recentCities.map((city) => (
                                <div key={city.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
                                    <div className="min-w-0">
                                        <p className="font-bold text-white truncate">{city.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{city.domain || 'No custom domain'}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-bold text-violet-400">
                                        /{city.slug}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm py-4">No cities configured yet.</p>
                        )}
                    </div>
                </Card>

                {/* System Activity & Quick Actions */}
                <Card className="bg-[#0d0d14] border-white/5 p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider mb-2">Platform Details</h2>
                        <p className="text-sm text-slate-400">System is fully operational. All processes running normally.</p>
                    </div>

                    <div className="border-t border-white/5 pt-6 space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Quick Operations</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => navigate('/superadmin/cities')}
                                className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-left transition-all hover:border-violet-500/20"
                            >
                                <BuildingOffice2Icon className="w-5 h-5 text-violet-400 mb-2" />
                                <p className="font-bold text-sm text-white">Create New City</p>
                                <p className="text-[10px] text-slate-500">Spin up a new city portal</p>
                            </button>
                            <button 
                                onClick={() => navigate('/admin/admins')}
                                className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 text-left transition-all hover:border-indigo-500/20"
                            >
                                <ShieldCheckIcon className="w-5 h-5 text-indigo-400 mb-2" />
                                <p className="font-bold text-sm text-white">Manage Admins</p>
                                <p className="text-[10px] text-slate-500">Add or edit local admins</p>
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
