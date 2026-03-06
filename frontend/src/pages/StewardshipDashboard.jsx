import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { 
    CurrencyDollarIcon, 
    ClockIcon, 
    SparklesIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import StewardshipLogModal from '../components/StewardshipLogModal';

export default function StewardshipDashboard() {
    const [searchParams] = useSearchParams();
    
    const [summary, setSummary] = useState({
        total_financial_given: 0,
        total_hours_gifted: 0,
        impact_count: 0
    });
    const [impacts, setImpacts] = useState([]);
    const [memberLogs, setMemberLogs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalGiftType, setModalGiftType] = useState('Financial');

    const fetchStewardshipData = async () => {
        try {
            const { data } = await api.get('/members/stewardship_summary');
            setSummary(data);
            setImpacts(data.impact_gallery || []);
        } catch (error) {
            console.error("Failed to fetch stewardship data", error);
        }
        
        try {
            const { data } = await api.get('/members/stewardship_logs');
            setMemberLogs(data || []);
        } catch (error) {
            console.error("Failed to fetch stewardship logs", error);
        }
    };

    const fetchOrgsAndMembers = async () => {};

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchStewardshipData();
        fetchOrgsAndMembers();
        
        if (searchParams.get('log') === 'true') {
            setModalGiftType('Skill');
            setIsModalOpen(true);
        }
    }, [searchParams]);

    return (
        <DashboardLayout>
            <div className="mb-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Stewardship Dashboard</h1>
                    <p className="text-gray-500 mt-2 text-sm">Track your kingdom impact through finances and skills.</p>
                </div>
                <button 
                    onClick={() => { setModalGiftType('Financial'); setIsModalOpen(true); }}
                    className="bg-sky-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-sky-700 transition-colors inline-flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add a Contribution
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
                        <CurrencyDollarIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Financial Given</p>
                        <p className="text-3xl font-bold text-gray-900">₹{summary.total_financial_given.toLocaleString()}</p>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
                        <ClockIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Skill Hours Gifted</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.total_hours_gifted}h</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-amber-50 rounded-xl text-amber-500">
                        <SparklesIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Impact Stories</p>
                        <p className="text-3xl font-bold text-gray-900">{summary.impact_count}</p>
                    </div>
                </div>
            </div>

            {/* Impact Gallery */}
            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Impact Gallery</h2>
            {impacts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-500 h-64 flex flex-col items-center justify-center">
                    <SparklesIcon className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="font-medium text-gray-900">No impact stories yet.</p>
                    <p className="text-sm">Log a gift to start building your gallery of kingdom impact.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {impacts.map((impact, i) => (
                        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                            {impact.image_url && (
                                <div className="h-48 overflow-hidden bg-gray-100">
                                    <img src={impact.image_url} alt="Impact" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{impact.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{impact.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Member Contributions Log */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Contributions</h2>
                {memberLogs.length === 0 ? (
                     <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
                         No contributions logged yet.
                     </div>
                ) : (
                     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                         <table className="w-full text-sm text-left">
                             <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                 <tr>
                                     <th className="px-6 py-4">Date</th>
                                     <th className="px-6 py-4">Type</th>
                                     <th className="px-6 py-4">Details</th>
                                     <th className="px-6 py-4">Recipient</th>
                                     <th className="px-6 py-4 text-right">Status</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-100">
                                 {memberLogs.map(log => (
                                     <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                         <td className="px-6 py-4">{log.date}</td>
                                         <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-widest ${log.type === 'Financial' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
                                                {log.type}
                                            </span>
                                         </td>
                                         <td className="px-6 py-4 font-semibold text-gray-900">
                                            {log.type === 'Financial' ? `₹${log.amount}` : `${log.hours}h (${log.skill_category})`}
                                         </td>
                                         <td className="px-6 py-4 text-gray-600">{log.recipient_name}</td>
                                         <td className="px-6 py-4 text-right">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${log.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                {log.status}
                                            </span>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                )}
            </div>

            {/* Shared Modal Component */}
            <StewardshipLogModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                defaultGiftType={modalGiftType}
                onSuccess={fetchStewardshipData} 
            />
        </div>
        </DashboardLayout>
    );
}
