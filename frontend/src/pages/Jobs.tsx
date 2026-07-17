import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, MagnifyingGlassIcon, PlusIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    type: string;
    work_arrangement?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    salary_currency?: string | null;
}

// Generate initials from company name
const getInitials = (name = '') => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
};

const typeColorMap: Record<string, string> = {
    'Full Time':  'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'Freelance':  'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Internship': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Part Time':  'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

// Deterministic logo color from company name
const logoColorPalette = [
    'from-sky-500 to-indigo-600', 
    'from-emerald-500 to-teal-600', 
    'from-amber-500 to-orange-600', 
    'from-rose-500 to-pink-600',
    'from-violet-500 to-purple-600', 
    'from-indigo-500 to-blue-600', 
    'from-teal-500 to-cyan-600', 
    'from-orange-500 to-red-600',
];

const getLogoGradient = (company = '') => {
    let hash = 0;
    for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
    return logoColorPalette[Math.abs(hash) % logoColorPalette.length];
};

const typeMap: Record<string, string> = { 'Full Time': 'fulltime', 'Freelance': 'freelance', 'Internship': 'internship', 'Part Time': 'parttime' };

const Jobs: React.FC = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [keywords, setKeywords] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [arrangementFilter, setArrangementFilter] = useState('');
    const [minSalaryFilter, setMinSalaryFilter] = useState('');
    const [typeFilters, setTypeFilters] = useState<Record<string, boolean>>({
        freelance: true, fulltime: true, internship: true, parttime: true,
    });

    useEffect(() => {
        api.get('/member/jobs')
            .then(res => setJobs(res.data))
            .catch(err => console.error('Failed to load jobs:', err))
            .finally(() => setLoading(false));
    }, []);

    const toggleType = (type: string) => setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));

    const filteredJobs = jobs.filter(job => {
        const typeKey = typeMap[job.type];
        if (typeKey && !typeFilters[typeKey]) return false;
        if (keywords && !job.title?.toLowerCase().includes(keywords.toLowerCase()) && !job.company?.toLowerCase().includes(keywords.toLowerCase())) return false;
        if (locationSearch && !job.location?.toLowerCase().includes(locationSearch.toLowerCase())) return false;
        if (categoryFilter && job.type !== categoryFilter) return false;
        if (arrangementFilter && job.work_arrangement !== arrangementFilter) return false;
        if (minSalaryFilter && (job.salary_min === null || job.salary_min === undefined || job.salary_min < Number(minSalaryFilter))) return false;
        return true;
    });

    return (
        <DashboardLayout>
            <div className="mb-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">Jobs</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Discover opportunities within our community.</p>
                    </div>
                    <button
                        onClick={() => navigate('/jobs/post')}
                        className="group relative bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4 stroke-[3px]" />
                        Post Opportunity
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-white dark:bg-zinc-900/30 shadow-2xl shadow-zinc-200/50 dark:shadow-none rounded-[2.5rem] p-8 mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                        <div className="lg:col-span-3">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Keywords</label>
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={e => setKeywords(e.target.value)}
                                    placeholder="Position or Company"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Location</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="text"
                                    value={locationSearch}
                                    onChange={e => setLocationSearch(e.target.value)}
                                    placeholder="City or Remote"
                                    className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="lg:col-span-3">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Work Arrangement</label>
                            <select
                                value={arrangementFilter}
                                onChange={e => setArrangementFilter(e.target.value)}
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
                            >
                                <option value="">All Arrangements</option>
                                <option value="Onsite">Onsite</option>
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                        <div className="lg:col-span-3">
                            <label className="block text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 ml-2">Min Salary</label>
                            <input
                                type="number"
                                value={minSalaryFilter}
                                onChange={e => setMinSalaryFilter(e.target.value)}
                                placeholder="Minimum salary"
                                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-0 rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex flex-wrap gap-6 items-center justify-between">
                        <div className="flex flex-wrap gap-6">
                            {[
                                { key: 'freelance',  label: 'FREELANCE' },
                                { key: 'fulltime',   label: 'FULL TIME' },
                                { key: 'internship', label: 'INTERNSHIP' },
                                { key: 'parttime',   label: 'PART TIME' },
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer select-none group">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={typeFilters[key]}
                                            onChange={() => toggleType(key)}
                                            className="peer appearance-none w-5 h-5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 checked:bg-indigo-500 checked:border-indigo-500 transition-all"
                                        />
                                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <span className={`text-[10px] font-black tracking-widest transition-colors ${typeFilters[key] ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>{label}</span>
                                </label>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/jobs/my-postings')}
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5"
                        >
                            <BriefcaseIcon className="w-4 h-4 text-sky-500" />
                            Manage My Postings
                        </button>
                    </div>
                </div>

                {/* Job Listings */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-6 flex items-center gap-6 animate-pulse">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/3" />
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="group relative bg-white dark:bg-zinc-900/30 border-none rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 hover:shadow-2xl hover:shadow-indigo-600/20 hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getLogoGradient(job.company)} text-white flex items-center justify-center text-lg font-black shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                        {getInitials(job.company)}
                                    </div>

                                    <div className="flex-1 min-w-0 text-center md:text-left">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                            <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">{job.title}</h3>
                                            <div className="flex flex-wrap gap-2 self-center md:self-auto">
                                                <span className={`inline-block text-[9px] font-black px-3 py-1 rounded-full border ${typeColorMap[job.type] || 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                                                    {job.type?.toUpperCase()}
                                                </span>
                                                {job.work_arrangement && (
                                                    <span className="inline-block text-[9px] font-black px-3 py-1 rounded-full border bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700">
                                                        {job.work_arrangement.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                                {job.company}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <MapPinIcon className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                            {job.salary_min && (
                                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                                    <span>·</span>
                                                    {job.salary_currency || 'INR'} {job.salary_min.toLocaleString()}
                                                    {job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/jobs/${job.id}`)}
                                        className="w-full md:w-auto px-8 py-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all duration-300"
                                    >
                                        Details
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-widest italic">No Openings Found</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 font-medium">Try adjusting your filters or check back later.</p>
                            </div>
                        )}
                    </div>
                )}

                {filteredJobs.length > 0 && (
                    <div className="py-16 text-center">
                        <button className="px-10 py-4 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 hover:border-transparent transition-all duration-300">
                            Load More Listings
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Jobs;
