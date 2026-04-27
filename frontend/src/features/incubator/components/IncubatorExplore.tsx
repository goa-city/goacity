import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncubator } from '../hooks/useIncubator';
import IdeaCard from './IdeaCard';
import Button from '../../../shared/components/ui/Button';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { RocketLaunchIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const IncubatorExplore: React.FC = () => {
    const navigate = useNavigate();
    const { ideas, isLoading } = useIncubator();

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-bold tracking-widest uppercase">Scanning for ventures...</div>;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Kingdom Incubator
                        <RocketLaunchIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium leading-relaxed">
                        Discover and support ventures designed to transform Goa. Connect with founders, provide feedback, or offer your skills.
                    </p>
                </div>
                <Button 
                    onClick={() => navigate('/incubator/submit')}
                    className="rounded-xl shadow-lg shadow-indigo-600/10 shrink-0"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Submit Venture
                </Button>
            </div>

            {/* Filter/Search Bar */}
            <div className="flex items-center gap-4 mb-8">
                <div className="relative flex-1 max-w-md">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="Search ventures, problems, or founders..." 
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Ideas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {ideas.map(idea => (
                    <div 
                        key={idea.id} 
                        onClick={() => navigate(`/incubator/idea/${idea.id}`)}
                        className="cursor-pointer"
                    >
                        <IdeaCard idea={idea} />
                    </div>
                ))}
                
                {ideas.length === 0 && !isLoading && (
                    <div className="col-span-full py-20 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                        <RocketLaunchIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No active ventures found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            The incubator is ready for the next big idea. Be the first to submit a kingdom-minded project!
                        </p>
                        <Button 
                            variant="secondary" 
                            className="mt-6 rounded-xl"
                            onClick={() => navigate('/incubator/submit')}
                        >
                            Submit Your Idea
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default IncubatorExplore;
