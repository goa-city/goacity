import React, { useState } from 'react';
import { useMentorship } from '../hooks/useMentorship';
import MentorCard from './MentorCard';
import Input from '../../../shared/components/ui/Input';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/solid';

interface MentorListItem {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo?: string;
    business_name?: string;
    bio?: string;
}

const MentorsListView: React.FC = () => {
    const [search, setSearch] = useState('');
    const [area, setArea] = useState('');
    
    const { mentors, isLoading } = useMentorship({ search, area });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Kingdom Mentors
                        <UserGroupIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium leading-relaxed">
                        Find and connect with leaders who are dedicated to mentoring the next generation of kingdom-minded professionals.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-10">
                <div className="relative flex-[2]">
                    <Input 
                        placeholder="Search by name, company, or role..." 
                        value={search}
                        onChange={handleSearch}
                        className="pl-12"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-[38px] text-zinc-400" />
                </div>
                <div className="flex-1">
                    <Input 
                        placeholder="Area (e.g. Leadership, Tech)" 
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                    />
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="py-20 text-center animate-pulse text-zinc-400 font-bold uppercase tracking-widest">
                    Finding your perfect match...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mentors.map((mentor: MentorListItem) => (
                        <MentorCard 
                            key={mentor.id} 
                            mentor={mentor} 
                            onRequest={(m: MentorListItem) => console.log('Requesting mentor:', m.id)} 
                        />
                    ))}
                    
                    {mentors.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                            <UserGroupIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No mentors found</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                Try adjusting your search filters or check back later.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default MentorsListView;
