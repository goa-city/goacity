import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import { 
    UsersIcon, 
    CalendarDaysIcon, 
    DocumentChartBarIcon,
    RectangleGroupIcon,
    ChartBarSquareIcon
} from '@heroicons/react/24/solid';

const DashboardView: React.FC = () => {
    const { stats, isLoading } = useAdminDashboard();

    const statCards = [
        { label: 'Total Members', value: stats.members, icon: UsersIcon, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
        { label: 'Active Streams', value: stats.streams, icon: RectangleGroupIcon, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
        { label: 'Meetings', value: stats.meetings, icon: CalendarDaysIcon, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        { label: 'Forms', value: stats.forms, icon: DocumentChartBarIcon, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    ];

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-center tracking-widest">Scanning city metrics...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                    System Overview
                    <ChartBarSquareIcon className="w-8 h-8 text-indigo-600" />
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                    Real-time snapshot of the Goa City ecosystem.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat) => (
                    <Card key={stat.label} className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:scale-[1.02] transition-all">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-zinc-900 dark:text-white">{stat.value}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{stat.label}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Welcome Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-zinc-900 dark:bg-zinc-900 border-none overflow-hidden relative p-12">
                    <div className="relative z-10">
                        <h2 className="text-4xl font-black text-white mb-4">Welcome back, Admin.</h2>
                        <p className="text-zinc-400 text-lg max-w-lg mb-8 leading-relaxed">
                            Manage your directory, streams, and kingdom modules from this centralized cockpit. Everything is synced in real-time.
                        </p>
                        <div className="flex gap-4">
                            <button className="bg-white text-zinc-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors">
                                View System Logs
                            </button>
                            <button className="bg-zinc-800 text-zinc-400 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:text-white transition-colors">
                                Support
                            </button>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600 rounded-full opacity-20 blur-[120px]" />
                </Card>

                <Card className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm flex items-center justify-center mb-6">
                        <ChartBarSquareIcon className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">More Insights Coming</h3>
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed">
                        Custom analytics and member engagement reports are under development.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default DashboardView;
