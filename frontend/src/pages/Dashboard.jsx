import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import SidebarRight from '../components/SidebarRight';
import { MagnifyingGlassIcon, SparklesIcon, PlusIcon } from '@heroicons/react/24/outline'; // Search icon
import StewardshipLogModal from '../components/StewardshipLogModal';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isStewardshipModalOpen, setIsStewardshipModalOpen] = useState(false);
    const [modalGiftType, setModalGiftType] = useState('Financial');
    const [collabFeed, setCollabFeed] = useState([]);

    // Fetch Dashboard Data (Streams & Status)
    useEffect(() => {
        // Wait for Auth to initialize
        if (authLoading) return;

        // If no user after auth load, stop loading
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            setError(null);
            try {
                const res = await api.get('/member/dashboard');
                setDashboardData(res.data);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setError(error.response?.data?.message || "Failed to load dashboard data. Please try logging in again.");
            } finally {
                setLoading(false);
            }
        };

        const fetchCollabs = async () => {
            try {
                const res = await api.get('/dashboard/collabs');
                setCollabFeed(res.data.data || []);
            } catch (err) {
                console.error("Failed to load collabs", err);
            }
        };

        fetchDashboardData();
        fetchCollabs();
    }, [user, authLoading]);



    const today = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateString = today.toLocaleDateString('en-GB', dateOptions);

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Hello, {user?.first_name || 'Member'}</h1>
                    <p className="text-gray-400 mt-1 text-sm">Today is {dateString}</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm"
                            placeholder="Search..."
                        />
                    </div>
                    {/* Stewardship Contribution Button */}
                    <button 
                        onClick={() => { setModalGiftType('Financial'); setIsStewardshipModalOpen(true); }}
                        className="hidden md:flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors text-sm font-bold shadow-md whitespace-nowrap"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add a Contribution
                    </button>
                </div>
            </div>

            {/* Stream Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {loading ? (
                    <div className="col-span-1 md:col-span-3 flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="col-span-1 md:col-span-3 bg-red-50 border border-red-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 text-sm text-red-600 underline hover:text-red-800"
                        >
                            Retry
                        </button>
                    </div>
                ) : dashboardData?.streams?.length > 0 ? (
                    dashboardData.streams.map((stream) => (
                        <div 
                            key={stream.id} 
                            onClick={() => {
                                if (stream.has_form && !stream.form_completed && stream.form_details?.id) {
                                    navigate(`/onboarding/form/${stream.form_details.id}`);
                                } else {
                                    navigate(`/my-people?stream=${stream.id}`);
                                }
                            }}
                            className="rounded-2xl p-5 h-32 flex flex-col justify-between shadow-sm cursor-pointer transition-transform hover:scale-[1.02] relative overflow-hidden"
                            style={{ backgroundColor: stream.color }}
                        >
                            <div className="z-10">
                                <h3 className="text-xl font-bold text-white">{stream.name}</h3>
                                <p className="text-white/80 text-sm mt-1">{stream.member_count || 0} Members</p>
                            </div>
                            <div className="z-10 text-xs font-semibold">
                                {stream.has_form ? (
                                    stream.form_completed ? (
                                        <span className="bg-white/20 text-white px-2 py-1 rounded-full whitespace-nowrap">Onboarding Completed</span>
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/onboarding/form/${stream.form_details?.id}`);
                                            }}
                                            className="bg-white text-gray-900 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors"
                                        >
                                            Complete Onboarding
                                        </button>
                                    )
                                ) : (
                                    <span className="bg-white/20 text-white px-2 py-1 rounded-full whitespace-nowrap">Active Stream</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 md:col-span-3 bg-white border border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                        <p className="text-gray-500 font-medium">No streams joined yet</p>
                        <p className="text-gray-400 text-sm mt-1">Join a stream to see it here</p>
                    </div>
                )}
            </div>

            {/* Bottom Section Grid: Action Items vs Ads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Action Required or Kingdom Impact */}
                <div>
                    {dashboardData?.pending_actions?.length > 0 ? (
                        <>
                             <h2 className="text-lg font-bold text-[#2D2D46] mb-4">Action Required</h2>
                             <div className="space-y-4">
                                {dashboardData.pending_actions.map((action, idx) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            if (action.type === 'stream_onboarding' && action.form_id) {
                                                navigate(`/onboarding/form/${action.form_id}`);
                                            }
                                        }}
                                        className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div 
                                                className="w-1.5 h-12 rounded-full"
                                                style={{ backgroundColor: action.stream_color || '#F97316' }}
                                            ></div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{action.message}</h3>
                                                <p className="text-gray-400 text-sm mt-1">Click to complete</p>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                           {/* Mocking a radio button/check circle */}
                                       </div>
                                    </div>
                                ))}
                             </div>
                        </>
                    ) : (
                        <>
                             <h2 className="text-lg font-bold text-[#2D2D46] mb-4">Kingdom Impact</h2>
                             {user?.willing_to_mentor ? (
                                 <div 
                                     onClick={() => { setModalGiftType('Skill'); setIsStewardshipModalOpen(true); }}
                                     className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4 cursor-pointer hover:bg-indigo-100 transition-colors"
                                 >
                                     <div className="p-3 bg-indigo-500 text-white rounded-xl">
                                         <SparklesIcon className="w-6 h-6" />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-indigo-900">You have 0 hours logged this week.</h3>
                                         <p className="text-indigo-700 text-sm mt-1">Log your mentorship hours here.</p>
                                     </div>
                                 </div>
                             ) : (
                                 <div 
                                     onClick={() => navigate('/stewardship')}
                                     className="bg-sky-50 border border-sky-100 rounded-2xl p-6 flex items-start gap-4 cursor-pointer hover:bg-sky-100 transition-colors"
                                 >
                                     <div className="p-3 bg-sky-500 text-white rounded-xl">
                                         <SparklesIcon className="w-6 h-6" />
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-sky-900">Track Your Giving & Skills</h3>
                                         <p className="text-sky-700 text-sm mt-1">Visit your Stewardship Dashboard.</p>
                                     </div>
                                 </div>
                             )}
                        </>
                    )}

                    {/* Community Collaboration Feed */}
                    <div className="mt-8">
                         <h2 className="text-lg font-bold text-[#2D2D46] mb-4">Community Collaborations</h2>
                         <div className="space-y-4">
                             {collabFeed.length > 0 ? (
                                 collabFeed.map(collab => (
                                     <div key={collab.id} className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex items-center gap-4">
                                         <div className="w-10 h-10 bg-sky-200 text-sky-700 font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                             {collab.requester.first_name?.[0]}{collab.provider.first_name?.[0]}
                                         </div>
                                         <p className="text-sm font-medium text-sky-900 leading-relaxed">
                                             <span className="font-bold">{collab.requester.first_name} {collab.requester.last_name}</span> is collaborating with <span className="font-bold">{collab.provider.first_name} {collab.provider.last_name}</span> on a <span className="uppercase tracking-widest text-[10px] bg-sky-200 px-2 py-0.5 rounded ml-1">{collab.type} project</span>.
                                         </p>
                                     </div>
                                 ))
                             ) : (
                                 <div className="bg-gray-50 border border-dashed border-gray-200 p-6 rounded-2xl text-center text-gray-500 text-sm">
                                     No recent collaborations to show.
                                 </div>
                             )}
                         </div>
                    </div>
                </div>

                {/* Right: Ads Space */}
                <div>
                    {/* Meeting Calendar (SidebarRight) - Mobile Only */}
                    <div className="xl:hidden mb-10">
                        <SidebarRight />
                    </div>

                    {/* Ads Space — moved to bottom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-teal-100/50 rounded-2xl h-40 flex items-center justify-center">
                            <span className="text-teal-900 font-medium">Space for Ads</span>
                        </div>
                        <div className="bg-teal-100/50 rounded-2xl h-40 flex items-center justify-center">
                            <span className="text-teal-900 font-medium">Space for Ads</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Shared Modal Component */}
            <StewardshipLogModal 
                isOpen={isStewardshipModalOpen} 
                onClose={() => setIsStewardshipModalOpen(false)} 
                defaultGiftType={modalGiftType}
            />
        </DashboardLayout>
    );
};
export default Dashboard;