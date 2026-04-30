import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { UserGroupIcon, StarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Peer {
    id: number;
    first_name: string;
    last_name: string;
    profile_photo?: string;
    role?: string;
    services?: any[];
    slug?: string;
}

const MyPeople: React.FC = () => {
    const [peers, setPeers] = useState<Peer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const fetchPeers = async () => {
            setLoading(true);
            try {
                const streamId = searchParams.get('stream');
                const search = searchParams.get('search');
                
                let url = '/member/my-people';
                const params = new URLSearchParams();
                if (streamId) params.append('stream', streamId);
                if (search) params.append('search', search);
                
                const queryString = params.toString();
                if (queryString) url += `?${queryString}`;

                const res = await api.get(url);
                setPeers(res.data.data || []);
            } catch (err) {
                console.error("Failed to load my people", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPeers();
    }, [searchParams]);

    // Handle search with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            const newParams = new URLSearchParams(searchParams);
            if (searchTerm) {
                newParams.set('search', searchTerm);
            } else {
                newParams.delete('search');
            }
            setSearchParams(newParams);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-4">
                        Community
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">My People</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Discover members within your streams and view their services.</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-zinc-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Connections...</p>
                </div>
            ) : peers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {peers.map(peer => (
                        <Link 
                            key={peer.id} 
                            to={`/profile/${peer.slug || peer.id}`}
                            className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative mb-6">
                                <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                {peer.profile_photo ? (
                                    <img src={peer.profile_photo} alt="Profile" className="relative w-24 h-24 rounded-full object-cover shadow-xl border-4 border-white dark:border-zinc-800 group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="relative w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center text-2xl font-black shadow-xl border-4 border-white dark:border-zinc-800 group-hover:scale-105 transition-transform duration-500">
                                        {peer.first_name?.[0]}{peer.last_name?.[0]}
                                    </div>
                                )}
                                {peer.services && peer.services.length > 0 && (
                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-lg" title="Offers Services">
                                        <StarIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-zinc-900 dark:text-white font-black text-sm mb-2 truncate w-full uppercase tracking-widest">{peer.first_name} {peer.last_name}</h3>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] font-black bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-full group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300">
                                {peer.role || 'Member'}
                            </p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <UserGroupIcon className="w-20 h-20 mx-auto text-zinc-200 dark:text-zinc-800 mb-6" />
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-widest italic">
                        {searchTerm ? 'No matches found' : 'Quiet Neighborhood'}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        {searchTerm ? 'Try adjusting your search criteria.' : 'Join streams to connect with peers in your field.'}
                    </p>
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyPeople;
