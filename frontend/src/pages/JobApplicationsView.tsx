import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, PhoneIcon, ChatBubbleBottomCenterTextIcon, DocumentArrowDownIcon, CalendarIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { Card } from '../shared/components/ui/Card';
import Button from '../shared/components/ui/Button';

interface Application {
    id: number;
    full_name: string;
    email: string;
    phone: string | null;
    message: string | null;
    cv_url: string;
    status: string;
    notes: string | null;
    created_at: string;
}

const JobApplicationsView: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(true);

    const [editingAppId, setEditingAppId] = useState<number | null>(null);
    const [statusForm, setStatusForm] = useState({ status: '', notes: '' });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        // Fetch Job Details first to show in header
        api.get(`/member/jobs/${jobId}`)
            .then(res => {
                setJobTitle(res.data.title);
                setCompany(res.data.company);
            })
            .catch(err => console.error('Failed to load job details:', err));

        // Fetch Applications
        api.get(`/member/my-postings/${jobId}/applications`)
            .then(res => setApplications(res.data))
            .catch(err => console.error('Failed to load applications:', err))
            .finally(() => setLoading(false));
    }, [jobId]);

    const handleEditStatus = (app: Application) => {
        setEditingAppId(app.id);
        setStatusForm({
            status: app.status || 'submitted',
            notes: app.notes || ''
        });
    };

    const handleSaveStatus = async (appId: number) => {
        setUpdating(true);
        try {
            await api.patch(`/member/my-postings/applications/${appId}/status`, statusForm);
            setApplications(prev => prev.map(app => app.id === appId ? {
                ...app,
                status: statusForm.status,
                notes: statusForm.notes
            } : app));
            setEditingAppId(null);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update application status.');
        } finally {
            setUpdating(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-12">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/jobs/my-postings')}
                    className="flex items-center text-zinc-400 hover:text-[#2D2D46] transition-all mb-6 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2 stroke-[3px]" />
                    Back to My Postings
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-[#2D2D46]">Applications</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        Showing applications for <span className="font-bold text-sky-600">{jobTitle}</span> at <span className="font-bold">{company}</span>
                    </p>
                </div>

                {/* Applications list */}
                {loading ? (
                    <div className="text-center py-20 font-bold uppercase tracking-widest text-gray-400 text-sm animate-pulse">
                        Loading applications...
                    </div>
                ) : applications.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <EnvelopeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No Applications Yet</h3>
                        <p className="text-gray-500 text-sm">When candidates apply to this job, their details and CVs will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {applications.map(app => (
                            <Card key={app.id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left: Applicant Details */}
                                    <div className="lg:col-span-8 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-lg font-bold text-gray-900">{app.full_name}</h3>
                                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                                app.status === 'offered' ? 'bg-emerald-50 text-emerald-700' :
                                                app.status === 'rejected' ? 'bg-rose-50 text-rose-700' :
                                                app.status === 'contacted' ? 'bg-indigo-50 text-indigo-700' :
                                                app.status === 'reviewed' ? 'bg-sky-50 text-sky-700' :
                                                'bg-zinc-100 text-zinc-700'
                                            }`}>
                                                {app.status}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <CalendarIcon className="w-4 h-4" />
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <a href={`mailto:${app.email}`} className="flex items-center gap-1.5 hover:text-sky-600">
                                                <EnvelopeIcon className="w-4 h-4" />
                                                {app.email}
                                            </a>
                                            {app.phone && (
                                                <a href={`tel:${app.phone}`} className="flex items-center gap-1.5 hover:text-sky-600">
                                                    <PhoneIcon className="w-4 h-4" />
                                                    {app.phone}
                                                </a>
                                            )}
                                        </div>

                                        {app.message && (
                                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm text-gray-600 flex gap-2">
                                                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Cover Message</p>
                                                    <p>{app.message}</p>
                                                </div>
                                            </div>
                                        )}

                                        {app.notes && (
                                            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-sm text-gray-700">
                                                <p className="font-bold text-xs text-amber-600 uppercase tracking-wider mb-1">Internal Notes</p>
                                                <p className="italic">{app.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Actions & CV */}
                                    <div className="lg:col-span-4 flex flex-col justify-between items-stretch lg:items-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                                        <a
                                            href={`https://goa.city${app.cv_url}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-colors text-sm font-bold shadow-md inline-flex items-center justify-center gap-2"
                                        >
                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                            Download CV
                                        </a>

                                        {editingAppId === app.id ? (
                                            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Update Status</label>
                                                    <select
                                                        value={statusForm.status}
                                                        onChange={e => setStatusForm({ ...statusForm, status: e.target.value })}
                                                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                                                    >
                                                        <option value="submitted">Submitted</option>
                                                        <option value="reviewed">Under Review</option>
                                                        <option value="contacted">Contacted</option>
                                                        <option value="offered">Offered</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">Internal Notes (Optional)</label>
                                                    <textarea
                                                        rows={2}
                                                        value={statusForm.notes}
                                                        onChange={e => setStatusForm({ ...statusForm, notes: e.target.value })}
                                                        placeholder="Notes about candidate..."
                                                        className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 outline-none resize-none bg-white"
                                                    />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setEditingAppId(null)}
                                                        className="px-4 py-1.5 border border-gray-200 text-gray-600 font-bold rounded-lg text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveStatus(app.id)}
                                                        disabled={updating}
                                                        className="px-4 py-1.5 bg-sky-600 text-white font-bold rounded-lg text-xs hover:bg-sky-700"
                                                    >
                                                        {updating ? 'Saving...' : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditStatus(app)}
                                                className="px-6 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors text-sm text-center w-full lg:w-auto"
                                            >
                                                Edit Status/Notes
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobApplicationsView;
