import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
    UsersIcon, 
    CalendarDaysIcon, 
    DocumentChartBarIcon,
    RectangleGroupIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    const [dashboardStats, setDashboardStats] = useState({
        members: 0,
        businesses: 0,
        meetings: 0,
        forms: 0,
        streams: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setDashboardStats(data);
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            }
        };
        fetchStats();
    }, []);

    const statsConfig = [
        { 
            name: 'Total Directory', 
            value: dashboardStats.members || 0, 
            label: 'Registered Members',
            icon: UsersIcon,
            color: 'bg-sky-500'
        },
        { 
            name: 'Active Streams', 
            value: dashboardStats.streams || 0, 
            label: 'Interest Groups',
            icon: RectangleGroupIcon,
            color: 'bg-indigo-500'
        },
        { 
            name: 'Meetings', 
            value: dashboardStats.meetings || 0, 
            label: 'Hosted Events',
            icon: CalendarDaysIcon,
            color: 'bg-emerald-500'
        },
        { 
            name: 'System Forms', 
            value: dashboardStats.forms || 0, 
            label: 'Onboarding Modules',
            icon: DocumentChartBarIcon,
            color: 'bg-amber-500'
        },
    ];

    return (
        <div className="admin-container">
            {/* Header Area */}
            <div className="flex items-center gap-4 mb-10">
                <div className="admin-header-icon bg-slate-900">
                    <UsersIcon className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
                    <p className="text-sm text-gray-500">Real-time snapshots of the Goa City database</p>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statsConfig.map((stat) => (
                    <div key={stat.name} className="admin-card group hover:scale-[1.02] transition-all duration-300">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">{stat.name}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-400">{stat.label}</span>
                                <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-sky-50 transition-colors">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions or Secondary Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 admin-card p-10 bg-indigo-900 text-white overflow-hidden relative">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Welcome back, Admin.</h2>
                        <p className="text-indigo-200 max-w-lg mb-8 text-lg">
                            Manage your directory, streams, and system modules from this centralized cockpit. Everything is synced in real-time.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl">
                                System Logs
                            </button>
                            <button className="bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                                Support Docs
                            </button>
                        </div>
                    </div>
                    {/* Abstract background element */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                </div>

                <div className="admin-card p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-gray-100 bg-gray-50/30">
                     <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                        <Squares2X2Icon className="w-8 h-8 text-gray-300" />
                     </div>
                     <h3 className="font-bold text-gray-900 mb-1">More Widgets Coming</h3>
                     <p className="text-xs text-gray-400">Custom analytics and reporting tools are currently under development.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;


