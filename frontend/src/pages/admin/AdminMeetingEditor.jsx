import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useForm } from 'react-hook-form';
import { 
    CalendarDaysIcon, ArrowLeftIcon, MapPinIcon, 
    CurrencyRupeeIcon, BeakerIcon, SwatchIcon, ClockIcon
} from '@heroicons/react/24/outline';

const AdminMeetingEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [forms, setForms] = useState([]); // For Feedback form select
    const [streams, setStreams] = useState([]); // For Stream select
    const [qrPreview, setQrPreview] = useState(null); // QR Code Preview
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [responses, setResponses] = useState([]);
    const [meetingActions, setMeetingActions] = useState([]);

    useEffect(() => {
        const fetchResources = async () => {
             try {
                const [formsRes, streamsRes] = await Promise.all([
                    api.get('/admin/forms'),
                    api.get('/admin/streams')
                ]);
                setForms(formsRes.data);
                setStreams(streamsRes.data);
             } catch(e) { console.error(e); }
        };
        fetchResources();

        if (isEdit) {
            setLoading(true);
            api.get(`/admin/meetings?id=${id}`)
                .then(res => {
                    const data = res.data;
                    reset({
                        ...data,
                        is_paid: data.is_paid == 1,
                        archived: data.archived == 1,
                        feedback_form_id: data.feedback_form_id || '',
                        stream_id: data.stream_id || '',
                    });
                    if (data.payment_qr_image_url) setQrPreview(data.payment_qr_image_url);
                })
                .finally(() => setLoading(false));

            api.get(`/admin/meetings/${id}/responses`)
                .then(res => setResponses(res.data.data || []))
                .catch(err => console.error("Failed to fetch form responses", err));
                
            api.get(`/admin/meetings/${id}/actions`)
                .then(res => setMeetingActions(res.data.data || []))
                .catch(err => console.error("Failed to fetch meeting actions", err));
        }
    }, [id, reset]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const onSubmit = async (data) => {
        setSaving(true);
        try {
            const formData = new FormData();
            if (isEdit) formData.append('id', id);
            
            Object.keys(data).forEach(key => {
                if (key === 'id' || key === 'payment_qr_image_url' || key === 'resources') return; // skip id (sent manually), and skip readonly fields
                if (key === 'payment_qr_image') {
                    if (data[key] && data[key].length > 0) formData.append(key, data[key][0]);
                } else if (key === 'is_paid' || key === 'archived') {
                    formData.append(key, data[key] ? 1 : 0);
                } else {
                    formData.append(key, data[key] === null || data[key] === undefined ? '' : data[key]);
                }
            });

            const res = await api.post('/admin/meetings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            showToast(isEdit ? "Meeting updated successfully!" : "Meeting created successfully!");
            if (!isEdit && res.data.id) {
                setTimeout(() => navigate(`/admin/meetings/${res.data.id}`, { replace: true }), 1000);
            }
        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save meeting.");
        } finally {
            setSaving(false);
        }
    };

    const isPaid = watch('is_paid');
    const isArchived = watch('archived');

    if (loading) return <div className="p-12 text-center text-gray-400">Loading meeting details...</div>;

    return (
        <div className="admin-container max-w-4xl">
            {toast && <div className="admin-toast">{toast}</div>}

            <button
                onClick={() => navigate('/admin/meetings')}
                className="flex items-center text-gray-500 hover:text-sky-600 transition-colors mb-8 group text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Meetings
            </button>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header Card */}
                <div className="admin-card">
                    <div className="p-6 flex flex-wrap items-start justify-between gap-4 border-b border-gray-50 bg-indigo-50/30">
                        <div className="flex items-center gap-3">
                            <div className="admin-header-icon bg-indigo-500">
                                <CalendarDaysIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Meeting' : 'New Meeting'}</h1>
                                <p className="text-xs text-gray-400 mt-0.5">{isEdit ? `ID: ${id}` : 'Create a new event'}</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${isArchived ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {isArchived ? 'Archived' : 'Active'}
                        </div>
                    </div>
                </div>

                {/* Main Form Content */}
                <div className="admin-card p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="admin-label">Meeting Title <span className="text-red-400">*</span></label>
                            <input {...register('title', { required: true })} className="admin-input" placeholder="e.g. Monthly Community Meetup" />
                            {errors.title && <p className="mt-1 text-xs text-red-500">Title is required</p>}
                        </div>

                        <div>
                            <label className="admin-label">Date <span className="text-red-400">*</span></label>
                            <input {...register('meeting_date', { required: true })} type="date" className="admin-input" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="admin-label">Start Time</label>
                                <input {...register('start_time', { required: true })} type="time" className="admin-input" />
                            </div>
                            <div>
                                <label className="admin-label">End Time</label>
                                <input {...register('end_time', { required: true })} type="time" className="admin-input" />
                            </div>
                        </div>

                        <div>
                            <label className="admin-label">Location Name</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input {...register('location_name')} className="admin-input pl-10" placeholder="e.g. Goa Innovation Lab" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="admin-label">Map Link</label>
                            <input {...register('map_link')} className="admin-input" placeholder="Google Maps URL" />
                        </div>

                        <div>
                            <label className="admin-label">Stream</label>
                            <div className="relative">
                                <SwatchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select {...register('stream_id')} className="admin-input pl-10 appearance-none">
                                    <option value="">-- No Stream Linked --</option>
                                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="admin-label">Feedback Form</label>
                            <div className="relative">
                                <BeakerIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                <select {...register('feedback_form_id')} className="admin-input pl-10 appearance-none">
                                    <option value="">-- No Feedback Form --</option>
                                    {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Paid Section */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                                <CurrencyRupeeIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Paid Meeting</p>
                                <p className="text-xs text-gray-500">Require payment for attendance</p>
                            </div>
                        </div>
                        <input {...register('is_paid')} type="checkbox" className="w-5 h-5 rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                    </div>

                    {isPaid && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-sky-50/30 rounded-2xl border border-sky-100">
                            <div>
                                <label className="admin-label">Payment Amount (INR)</label>
                                <input {...register('payment_amount')} type="number" step="0.01" className="admin-input" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="admin-label">Payment QR Code</label>
                                <input {...register('payment_qr_image')} type="file" accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
                                {qrPreview && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={qrPreview} alt="QR Preview" className="h-10 w-10 object-contain rounded border bg-white" />
                                        <span className="text-[10px] text-gray-400">Current image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Archive Toggle */}
                    <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Archive Meeting</p>
                            <p className="text-xs text-gray-500">Hide this meeting from the public site</p>
                        </div>
                        <input {...register('archived')} type="checkbox" className="w-5 h-5 rounded border-red-300 text-red-500 focus:ring-red-500" />
                    </div>
                </div>

                {/* Member Submissions & Actions */}
                {isEdit && (
                    <div className="space-y-6">
                        {/* Member RSVP/Check-in/Payment Data */}
                        <div className="admin-card">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">Member Actions</h2>
                            </div>
                            {meetingActions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No members have RSVP'd or checked in yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4">Member Name</th>
                                                <th className="px-6 py-4">RSVP Status</th>
                                                <th className="px-6 py-4">Check-in Status</th>
                                                <th className="px-6 py-4">Payment Status</th>
                                                <th className="px-6 py-4">Payment Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {meetingActions.map((action, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        {action.first_name} {action.last_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {action.rsvp_status === 'going' ? <span className="text-green-600 font-medium">Going</span> : 
                                                         action.rsvp_status === 'not_sure' ? <span className="text-yellow-600 font-medium">Maybe</span> : 
                                                         action.rsvp_status === 'cant_go' ? <span className="text-red-600 font-medium">Can't Go</span> : 
                                                         <span className="text-gray-400">None</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {action.checked_in == 1 ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                Checked In
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">Not Checked In</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {action.payment_status === 'paid_online' ? <span className="text-indigo-600 font-medium">Paid Online</span> :
                                                         action.payment_status === 'paid_cash' ? <span className="text-emerald-600 font-medium">Paid Cash</span> :
                                                         <span className="text-yellow-600 font-medium">{action.payment_status || 'Pending'}</span>}
                                                    </td>
                                                     <td className="px-6 py-4 text-gray-500 font-medium">
                                                        ₹ {action.paid_amount || '0'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Form Submissions */}
                        <div className="admin-card">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Form Submissions</h2>
                            </div>
                            {responses.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No form submissions recorded yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4">Member Name</th>
                                                <th className="px-6 py-4">Submission Date</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {responses.map((resp) => (
                                                <tr key={resp.id} className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                                        {resp.first_name} {resp.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500">
                                                        {new Date(resp.submitted_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button type="button" onClick={() => alert("Deep view not implemented")} className="text-indigo-600 font-semibold hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg">
                                                            View Full Response
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="admin-card p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                        {isEdit && (
                            <button
                                type="button"
                                onClick={async () => {
                                    if (window.confirm("PERMANENTLY delete this meeting?")) {
                                        try {
                                            await api.delete(`/admin/meetings?id=${id}`);
                                            navigate('/admin/meetings');
                                        } catch(e) { alert("Delete failed"); }
                                    }
                                }}
                                className="px-5 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate('/admin/meetings')} className="admin-button-secondary">Cancel</button>
                        <button type="submit" disabled={saving} className="admin-button-primary px-8">
                            {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Meeting')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminMeetingEditor;
