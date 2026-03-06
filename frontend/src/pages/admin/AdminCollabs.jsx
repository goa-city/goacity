import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { HandThumbUpIcon, HandThumbDownIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminCollabs = () => {
    const { adminUser } = useAdminAuth();
    const [collabs, setCollabs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCollabs();
    }, []);

    const fetchCollabs = async () => {
        try {
            const res = await api.get('/admin/collabs');
            setCollabs(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;
        try {
            await api.put(`/admin/collabs/${id}/status`, { status });
            fetchCollabs();
        } catch (error) {
            console.error(error);
            alert('Failed to update.');
        }
    };

    return (
        <div className="h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Collaboration Control</h1>
                    <p className="text-gray-500 mt-2">Oversee formal service & mentorship requests between members.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h2 className="font-bold text-gray-700 flex items-center"><ShieldCheckIcon className="w-5 h-5 mr-2 text-indigo-500" /> Administrative Review Pipeline</h2>
                </div>

                <div className="p-6 overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : collabs.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                    <th className="p-4 rounded-tl-xl rounded-bl-xl">Requesting Member</th>
                                    <th className="p-4">Target Provider</th>
                                    <th className="p-4">Collab Type</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right rounded-tr-xl rounded-br-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {collabs.map(collab => (
                                    <tr key={collab.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 border border-gray-100 rounded-lg px-3 py-1.5 w-max bg-white shadow-sm">
                                                {collab.requester?.first_name} {collab.requester?.last_name}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            <div className="font-bold text-gray-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                                {collab.provider?.first_name} {collab.provider?.last_name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border shadow-sm ${
                                                collab.type === 'Paid' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                                            }`}>
                                                {collab.type}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${
                                                collab.status === 'Approved' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                collab.status === 'Pending_Admin' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                collab.status === 'Declined' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {collab.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {collab.status === 'Pending_Admin' && (
                                                <div className="flex justify-end gap-2 isolate">
                                                    <button 
                                                        onClick={() => updateStatus(collab.id, 'Approved')}
                                                        className="text-emerald-500 hover:text-emerald-700 p-2 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                                        title="Approve Collaboration"
                                                    >
                                                        <HandThumbUpIcon className="w-5 h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatus(collab.id, 'Declined')}
                                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                        title="Decline Collaboration"
                                                    >
                                                        <HandThumbDownIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <ShieldCheckIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No collaboration requests pending your review.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCollabs
