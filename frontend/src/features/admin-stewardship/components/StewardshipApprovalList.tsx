import React from 'react';
import { useAdminStewardship } from '../hooks/useAdminStewardship';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    CurrencyRupeeIcon, 
    ClockIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/solid';

const StewardshipApprovalList: React.FC = () => {
    const { pendingLogs, isLoading, verify, reject } = useAdminStewardship();

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-center tracking-widest">Auditing kingdom impact logs...</div>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                    Stewardship Audit
                    <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">
                    Review and verify {pendingLogs.length} pending stewardship reports.
                </p>
            </div>

            <div className="space-y-6">
                {pendingLogs.map((log) => (
                    <Card key={log.id} className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-6">
                                    {/* Member Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-black">
                                            {log.user.first_name[0]}{log.user.last_name[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-900 dark:text-white">{log.user.first_name} {log.user.last_name}</p>
                                            <p className="text-xs font-medium text-zinc-400">{log.user.email}</p>
                                        </div>
                                    </div>

                                    {/* Log Data */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex items-start gap-3">
                                            {log.type === 'Financial' ? (
                                                <CurrencyRupeeIcon className="w-6 h-6 text-emerald-600 mt-1" />
                                            ) : (
                                                <ClockIcon className="w-6 h-6 text-indigo-600 mt-1" />
                                            )}
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                                                    {log.type} Contribution
                                                </p>
                                                <p className="text-2xl font-black text-zinc-900 dark:text-white">
                                                    {log.type === 'Financial' ? `₹${log.amount}` : `${log.hours} Hours`}
                                                </p>
                                                {log.skill_category && (
                                                    <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                                                        {log.skill_category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <ChatBubbleBottomCenterTextIcon className="w-6 h-6 text-zinc-300 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Impact Note</p>
                                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                                                    "{log.impact_note || 'No note provided'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex md:flex-col justify-end gap-3 min-w-[160px]">
                                    <Button 
                                        onClick={() => verify(log.id)}
                                        className="rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                                    >
                                        Verify Log
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        onClick={() => {
                                            const reason = prompt('Reason for rejection:');
                                            if (reason) reject({ id: log.id, reason });
                                        }}
                                        className="rounded-xl h-12 border-zinc-200 text-zinc-500 hover:text-red-600 hover:border-red-100"
                                    >
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {pendingLogs.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl">
                        <CheckCircleIcon className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">All logs verified</p>
                        <p className="text-zinc-500 mt-1">Check back later for new submissions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StewardshipApprovalList;
