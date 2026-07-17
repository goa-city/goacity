import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, PlusIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { Card } from '../shared/components/ui/Card';
import Button from '../shared/components/ui/Button';

interface JobPosting {
    id: number;
    title: string;
    company: string;
    location: string;
    status: string;
    created_at: string;
    expires_at: string | null;
    _count: {
        applications: number;
    };
}

const MyPostings: React.FC = () => {
    const navigate = useNavigate();
    const [postings, setPostings] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/member/my-postings')
            .then(res => setPostings(res.data))
            .catch(err => console.error('Failed to load my postings:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="mb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46]">My Job Postings</h1>
                        <p className="text-gray-500 mt-2 text-sm">Manage job openings you have posted and track applications.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate('/jobs/post')}
                            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2 w-auto"
                        >
                            <PlusIcon className="w-4 h-4 stroke-[3px]" />
                            Post a Job
                        </Button>
                    </div>
                </div>

                {/* Postings List */}
                {loading ? (
                    <div className="text-center py-20 font-bold uppercase tracking-widest text-gray-400 text-sm animate-pulse">
                        Loading your postings...
                    </div>
                ) : postings.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Postings Found</h3>
                        <p className="text-gray-500 text-sm mb-6">You haven't posted any job opportunities yet.</p>
                        <Button onClick={() => navigate('/jobs/post')} className="bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-sm px-6 py-2.5">
                            Post Opportunity
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {postings.map(job => (
                            <Card key={job.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                                job.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                                                job.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                                                'bg-amber-50 text-amber-700'
                                            }`}>
                                                {job.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <span>{job.company}</span>
                                            <span>·</span>
                                            <span>{job.location}</span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <ClockIcon className="w-4 h-4" />
                                                Posted {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                                        <div className="bg-sky-50 dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 rounded-2xl px-5 py-2.5 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">Applications</p>
                                            <p className="text-2xl font-black text-zinc-900 dark:text-white">{job._count.applications}</p>
                                        </div>

                                        <Button
                                            onClick={() => navigate(`/jobs/my-postings/${job.id}/applications`)}
                                            className="px-6 py-2.5 bg-[#2D2D46] hover:bg-gray-800 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2 w-auto"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                            View Applications
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default MyPostings;
