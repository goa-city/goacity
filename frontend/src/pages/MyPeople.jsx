import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { UserGroupIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const MyPeople = () => {
    const [peers, setPeers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchPeers = async () => {
            try {
                const streamId = searchParams.get('stream');
                const url = streamId ? `/my-people?stream=${streamId}` : '/my-people';
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

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-[#2D2D46]">My People</h1>
                <p className="text-gray-500 mt-2">Discover members within your streams and view their services.</p>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : peers.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {peers.map(peer => (
                        <Link 
                            key={peer.id} 
                            to={`/profile/${peer.id}`}
                            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center group"
                        >
                            <div className="relative mb-4">
                                {peer.profile_photo ? (
                                    <img src={peer.profile_photo} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-2xl font-bold shadow-sm group-hover:scale-105 transition-transform">
                                        {peer.first_name?.[0]}{peer.last_name?.[0]}
                                    </div>
                                )}
                                {peer.services && peer.services.length > 0 && (
                                    <div className="absolute -bottom-2 -right-2 bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Offers Services">
                                        <StarIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                            
                            <h3 className="text-gray-900 font-bold mb-1 truncate w-full">{peer.first_name} {peer.last_name}</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold bg-gray-50 px-2 py-1 rounded w-max">
                                {peer.role || 'Member'}
                            </p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                    <UserGroupIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-xl font-bold text-gray-500 mb-2">You don't share streams with anyone yet.</h2>
                    <p className="text-gray-400">Join streams to connect with peers.</p>
                </div>
            )}
        </DashboardLayout>
    );
};
export default MyPeople;
