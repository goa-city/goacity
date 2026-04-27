import React, { useState } from 'react';
import { formatDate } from '../../../utils/date';
import { useStewardship } from '../hooks/useStewardship';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { 
    CurrencyDollarIcon, 
    ClockIcon, 
    SparklesIcon,
    PlusIcon
} from '@heroicons/react/24/solid';
import DashboardLayout from '../../../layouts/DashboardLayout';

const StewardshipDashboard: React.FC = () => {
    const { summary, logs, isLoading } = useStewardship();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-xs tracking-widest text-center">Calculating Kingdom Impact...</div>;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div>
                    <h1 className="text-5xl font-black text-zinc-900 dark:text-white tracking-tighter">Stewardship</h1>
                    <p className="text-zinc-400 font-black mt-2 uppercase tracking-[0.1em] text-[10px]">Track your kingdom impact through finances and skills.</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl shadow-xl shadow-indigo-600/20 px-8"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Log Gift
                </Button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <Card className="flex items-center gap-6 p-8 hover:shadow-2xl transition-all border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                    <div className="p-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 shadow-sm">
                        <CurrencyDollarIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Financial</p>
                        <p className="text-4xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">₹{summary.totalFinancial.toLocaleString()}</p>
                    </div>
                </Card>
                
                <Card className="flex items-center gap-6 p-8 hover:shadow-2xl transition-all border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                    <div className="p-5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 shadow-sm">
                        <ClockIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Skill Hours</p>
                        <p className="text-4xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{summary.totalHours}h</p>
                    </div>
                </Card>

                <Card className="flex items-center gap-6 p-8 hover:shadow-2xl transition-all border-none bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
                    <div className="p-5 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-500 shadow-sm">
                        <SparklesIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Verified</p>
                        <p className="text-4xl font-black text-zinc-900 dark:text-white mt-1 tracking-tight">{summary.verifiedCount}</p>
                    </div>
                </Card>
            </div>

            {/* Logs Table */}
            <Card className="overflow-hidden border-none shadow-2xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900/30 rounded-xl">
                <CardHeader className="p-10 border-b border-zinc-50 dark:border-zinc-800">
                    <CardTitle className="text-2xl font-black tracking-tight">Contribution History</CardTitle>
                    <CardDescription className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest mt-2">A chronological record of your gifts to the kingdom.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">
                                <tr>
                                    <th className="px-10 py-6">Date</th>
                                    <th className="px-10 py-6">Type</th>
                                    <th className="px-10 py-6">Details</th>
                                    <th className="px-10 py-6 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                {logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all group">
                                        <td className="px-10 py-6 text-zinc-400 font-bold uppercase text-[10px] tracking-widest">{formatDate(log.date)}</td>
                                        <td className="px-10 py-6">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${log.type === 'Financial' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'}`}>
                                                {log.type}
                                            </span>
                                        </td>
                                        <td className="px-10 py-6 font-black text-lg text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                                            {log.type === 'Financial' ? `₹${Number(log.amount).toLocaleString()}` : `${log.hours}h (${log.skill_category})`}
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${log.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-20 text-center text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px] italic">
                                            No contributions logged yet. Start by adding your first gift!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default StewardshipDashboard;
