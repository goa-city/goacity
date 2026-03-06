import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ArrowDownTrayIcon, HandThumbUpIcon, HandThumbDownIcon, NoSymbolIcon } from '@heroicons/react/24/outline';

const AdminMentorship = () => {
    const { adminUser } = useAdminAuth();
    const [relations, setRelations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRelations();
    }, []);

    const fetchRelations = async () => {
        try {
            const res = await api.get('/admin/mentorship');
            setRelations(res.data.data || []);
        } catch (err) {
            console.error("Failed to load admin mentorships", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/mentorship/${id}/status`, { status });
            // refresh data
            fetchRelations();
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    const exportReport = async () => {
        try {
            const res = await api.get('/admin/mentorship/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'mentorship_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            alert('Export failed');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Mentorship Administration</h1>
                    <p className="text-gray-500 mt-2">Manage covenant-based relations and export reports for ecosystem impact.</p>
                </div>
                <button 
                    onClick={exportReport}
                    className="flex items-center gap-2 bg-[#2D2D46] hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
                >
                    <ArrowDownTrayIcon className="w-5 h-5" />
                    Export Impact Report
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-sm border-b border-gray-100">
                                    <th className="p-4 font-medium uppercase tracking-wider">Covenant Pair</th>
                                    <th className="p-4 font-medium uppercase tracking-wider">Focus / Type</th>
                                    <th className="p-4 font-medium uppercase tracking-wider">Health / Progress</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-center">Status</th>
                                    <th className="p-4 font-medium uppercase tracking-wider text-right">Intervention</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {relations.map((relation) => (
                                    <tr key={relation.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-900 border border-gray-100 bg-white px-3 py-1.5 rounded-lg w-max shadow-sm">
                                                    Mentor: {relation.mentor?.first_name} {relation.mentor?.last_name}
                                                </span>
                                                <span className="text-sm text-gray-500 border border-gray-100 bg-white px-3 py-1.5 rounded-lg w-max shadow-sm mt-1">
                                                    Mentee: {relation.mentee?.first_name} {relation.mentee?.last_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top pt-6">
                                            <p className="text-gray-900 font-medium">{relation.focus_area || 'General'}</p>
                                            <p className="text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded w-max mt-2 font-bold">{relation.type}</p>
                                        </td>
                                        <td className="p-4 align-top pt-6">
                                            <div className="w-32">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="font-bold text-gray-900">{relation.completion_percentage}%</span>
                                                    <span className="text-gray-400">Goals Met</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                    <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${relation.completion_percentage}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top pt-6 text-center">
                                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                relation.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                relation.status === 'Requested' ? 'bg-yellow-100 text-yellow-700' :
                                                relation.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {relation.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top pt-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {relation.status === 'Requested' && (
                                                    <button onClick={() => updateStatus(relation.id, 'Active')} title="Approve Pairing" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200">
                                                        <HandThumbUpIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {relation.status === 'Active' && (
                                                    <>
                                                        <button onClick={() => updateStatus(relation.id, 'Completed')} title="Mark Completed" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                                                            <HandThumbUpIcon className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => updateStatus(relation.id, 'Declined')} title="End / Reassign" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                                                            <NoSymbolIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {relations.length === 0 && (
                                    <tr><td colSpan="5" className="p-8 text-center text-gray-500 bg-gray-50/50">No mentorship relations requested.</td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
export default AdminMentorship;
