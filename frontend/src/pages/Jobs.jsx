import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';

// Generate initials from company name
const getInitials = (name = '') => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return name.substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
};

const typeColorMap = {
    'Full Time':  'bg-sky-100 text-sky-700',
    'Freelance':  'bg-emerald-100 text-emerald-700',
    'Internship': 'bg-amber-100 text-amber-700',
    'Part Time':  'bg-rose-100 text-rose-700',
};

// Deterministic logo color from company name
const logoColorPalette = [
    'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500',
    'bg-violet-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
];
const getLogoColor = (company = '') => {
    let hash = 0;
    for (let i = 0; i < company.length; i++) hash = company.charCodeAt(i) + ((hash << 5) - hash);
    return logoColorPalette[Math.abs(hash) % logoColorPalette.length];
};

const typeMap = { 'Full Time': 'fulltime', 'Freelance': 'freelance', 'Internship': 'internship', 'Part Time': 'parttime' };

const Jobs = () => {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [keywords, setKeywords] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilters, setTypeFilters] = useState({
        freelance: true, fulltime: true, internship: true, parttime: true,
    });

    useEffect(() => {
        api.get('/jobs')
            .then(res => setJobs(res.data))
            .catch(err => console.error('Failed to load jobs:', err))
            .finally(() => setLoading(false));
    }, []);

    const toggleType = (type) => setTypeFilters(prev => ({ ...prev, [type]: !prev[type] }));

    const filteredJobs = jobs.filter(job => {
        const typeKey = typeMap[job.type];
        if (!typeFilters[typeKey]) return false;
        if (keywords && !job.title?.toLowerCase().includes(keywords.toLowerCase()) && !job.company?.toLowerCase().includes(keywords.toLowerCase())) return false;
        if (locationSearch && !job.location?.toLowerCase().includes(locationSearch.toLowerCase())) return false;
        if (categoryFilter && job.type !== categoryFilter) return false;
        return true;
    });

    return (
        <DashboardLayout>
            <div className="mb-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#2D2D46]">Jobs</h1>
                        <p className="text-gray-500 mt-2">Discover opportunities within our community.</p>
                    </div>
                    <button
                        onClick={() => navigate('/jobs/post')}
                        className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-sky-700 transition-colors inline-flex items-center"
                    >
                        + Post a job
                    </button>
                </div>

                {/* Search Bar */}
                <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 mb-8 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            value={keywords}
                            onChange={e => setKeywords(e.target.value)}
                            placeholder="Keywords"
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                        <input
                            type="text"
                            value={locationSearch}
                            onChange={e => setLocationSearch(e.target.value)}
                            placeholder="Location"
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                        >
                            <option value="">Choose a category...</option>
                            <option value="Full Time">Full Time</option>
                            <option value="Part Time">Part Time</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Internship">Internship</option>
                        </select>
                        <div className="flex items-end">
                            <button
                                className="w-auto px-6 py-3 bg-[#2D2D46] text-white rounded-xl transition-colors text-sm font-bold shadow-md hover:bg-gray-800 flex items-center justify-center gap-2"
                            >
                                <MagnifyingGlassIcon className="w-5 h-5" />
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {/* Type Filter Checkboxes */}
                <div className="flex flex-wrap gap-6 mb-8 px-2">
                    {[
                        { key: 'freelance',  label: 'FREELANCE' },
                        { key: 'fulltime',   label: 'FULL TIME' },
                        { key: 'internship', label: 'INTERNSHIP' },
                        { key: 'parttime',   label: 'PART TIME' },
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={typeFilters[key]}
                                onChange={() => toggleType(key)}
                                className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-400"
                            />
                            <span className="text-xs font-bold text-gray-600 tracking-wider">{label}</span>
                        </label>
                    ))}
                </div>

                {/* Job Listings */}
                {loading ? (
                    <div className="space-y-0">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded-full w-2/3 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded-full w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-0">
                        {filteredJobs.length > 0 ? (
                            filteredJobs.map((job, idx) => (
                                <div
                                    key={job.id}
                                    className={`flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors ${idx < filteredJobs.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    {/* Company Logo — initials with deterministic color */}
                                    <div className={`w-10 h-10 rounded-full ${getLogoColor(job.company)} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                                        {getInitials(job.company)}
                                    </div>

                                    {/* Job Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-gray-900 tracking-wide truncate">{job.title}</h3>
                                        <p className="text-xs text-gray-400">{job.company}</p>
                                    </div>

                                    {/* Location */}
                                    <div className="hidden sm:flex items-center gap-1 text-gray-400 shrink-0">
                                        <MapPinIcon className="w-4 h-4 text-sky-400" />
                                        <span className="text-xs">{job.location}</span>
                                    </div>

                                    {/* Type Badge */}
                                    <span className={`hidden md:inline-block text-[10px] font-bold px-3 py-1 rounded-full shrink-0 ${typeColorMap[job.type] || 'bg-gray-100 text-gray-600'}`}>
                                        {job.type}
                                    </span>

                                    {/* View Button */}
                                    <button
                                        onClick={() => job.url && window.open(job.url, '_blank')}
                                        className="text-xs font-bold text-sky-500 border border-sky-400 rounded-full px-4 py-1.5 hover:bg-sky-500 hover:text-white transition-all shrink-0"
                                    >
                                        VIEW JOB
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                {jobs.length === 0 ? (
                                    <>
                                        <p className="text-xl mb-2">No job postings yet</p>
                                        <p className="text-sm">Be the first to post a job!</p>
                                    </>
                                ) : (
                                    <p className="text-lg">No jobs found matching your search.</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Load More */}
                <div className="py-12 text-center">
                    <button className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm">
                        Load More Listings
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Jobs;
