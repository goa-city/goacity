import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
    CalendarDaysIcon, ArrowLeftIcon, MapPinIcon, 
    CurrencyRupeeIcon, BeakerIcon, SwatchIcon, ClockIcon,
    CloudArrowUpIcon, TrashIcon, DocumentIcon, DocumentTextIcon,
    VideoCameraIcon, EnvelopeIcon
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import QuillEditor from '../../components/QuillEditor';

const AdminMeetingEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { register, handleSubmit, setValue, reset, watch, control, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [forms, setForms] = useState([]); // For Feedback form select
    const [streams, setStreams] = useState([]); // For Stream select
    const [qrPreview, setQrPreview] = useState(null); // QR Code Preview
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [responses, setResponses] = useState([]);
    const [meetingActions, setMeetingActions] = useState([]);
    const [recapContent, setRecapContent] = useState('');
    const [meetingResources, setMeetingResources] = useState([]);
    const [uploadingResource, setUploadingResource] = useState(false);
    const [notifying, setNotifying] = useState(false);

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
                        meeting_date: data.meeting_date ? new Date(data.meeting_date) : null,
                        is_paid: data.is_paid == 1,
                        archived: data.archived == 1,
                        feedback_form_id: data.feedback_form_id || '',
                        stream_id: data.stream_id || '',
                    });
                    if (data.payment_qr_image_url) setQrPreview(data.payment_qr_image_url);
                    setRecapContent(data.recap_content || '');
                    setMeetingResources(data.resources || []);
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
                if (key === 'id' || key === 'payment_qr_image_url' || key === 'resources' || key === 'description') return; 
                if (key === 'payment_qr_image') {
                    if (data[key] && data[key].length > 0) formData.append(key, data[key][0]);
                } else if (key === 'meeting_date') {
                    if (data[key]) {
                        const date = new Date(data[key]);
                        const offset = date.getTimezoneOffset();
                        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                        formData.append(key, adjustedDate.toISOString().split('T')[0]);
                    } else {
                        formData.append(key, '');
                    }
                } else if (key === 'is_paid' || key === 'archived') {
                    formData.append(key, data[key] ? 1 : 0);
                } else {
                    formData.append(key, data[key] === null || data[key] === undefined ? '' : data[key]);
                }
            });
            
            formData.append('recap_content', recapContent);
            formData.delete('description'); // Explicitly ensure description is not sent

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

    const handleResourceUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingResource(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);

            const res = await api.post(`/admin/meetings/${id}/resources`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setMeetingResources([...meetingResources, res.data.resource]);
            showToast("Resource uploaded!");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file.");
        } finally {
            setUploadingResource(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleResourceDelete = async (resId) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            await api.delete(`/admin/meetings/resources/${resId}`);
            setMeetingResources(meetingResources.filter(r => r.id !== resId));
            showToast("Resource deleted");
        } catch (error) {
            alert("Delete failed");
        }
    };

    const isPaid = watch('is_paid');
    const isArchived = watch('archived');

    if (loading) return <div className="p-12 text-center text-gray-400">Loading meeting details...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            {toast && <div className="fixed bottom-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-[10px] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4">{toast}</div>}

            <button
                onClick={() => navigate('/admin/meetings')}
                className="flex items-center text-zinc-500 hover:text-sky-600 transition-colors mb-8 group text-sm font-medium"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Meetings
            </button>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Header Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800 overflow-hidden mb-6">
                    <div className="p-6 flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
                                <CalendarDaysIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{isEdit ? 'Edit Meeting' : 'New Meeting'}</h1>
                                <p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase mt-1">{isEdit ? `ID: ${id}` : 'Create a new event'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isEdit && watch('stream_id') && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!window.confirm("Send update notification to all stream members?")) return;
                                        setNotifying(true);
                                        try {
                                            await api.post(`/admin/meetings/${id}/notify`);
                                            showToast("Notifications sent successfully!");
                                        } catch (e) {
                                            alert("Failed to send notifications.");
                                        } finally {
                                            setNotifying(false);
                                        }
                                    }}
                                    disabled={notifying}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                                >
                                    <EnvelopeIcon className="w-4 h-4" />
                                    {notifying ? 'Sending...' : 'Notify Members'}
                                </button>
                            )}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${isArchived ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                {isArchived ? 'Archived' : 'Active'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Content */}
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Meeting Title <span className="text-red-500">*</span></label>
                            <input {...register('title', { required: true })} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" placeholder="e.g. Monthly Community Meetup" />
                            {errors.title && <p className="mt-1 text-[10px] font-black tracking-widest uppercase text-red-500">Title is required</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Meeting Date <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Controller
                                    name="meeting_date"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value ? new Date(field.value) : null}
                                            onChange={(date) => field.onChange(date)}
                                            dateFormat="dd/MM/yyyy"
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium"
                                            placeholderText="dd/mm/yyyy"
                                            autoComplete="off"
                                        />
                                    )}
                                />
                            </div>
                            {errors.meeting_date && <p className="mt-1 text-[10px] font-black tracking-widest uppercase text-red-500">Date is required</p>}
                         </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Start Time</label>
                                <input {...register('start_time', { required: true })} type="time" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">End Time</label>
                                <input {...register('end_time', { required: true })} type="time" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Location Name</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input {...register('location_name')} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium" placeholder="e.g. Goa Innovation Lab" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Map Link</label>
                            <input {...register('map_link')} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" placeholder="Google Maps URL" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Zoom Meeting URL</label>
                            <div className="relative">
                                <VideoCameraIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input {...register('zoom_link')} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium" placeholder="https://zoom.us/j/..." />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Stream</label>
                            <div className="relative">
                                <SwatchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                                <select {...register('stream_id')} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium appearance-none">
                                    <option value="">-- No Stream Linked --</option>
                                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Feedback Form</label>
                            <div className="relative">
                                <BeakerIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                                <select {...register('feedback_form_id')} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium appearance-none">
                                    <option value="">-- No Feedback Form --</option>
                                    {forms.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Paid Section */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPaid ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                                <CurrencyRupeeIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Paid Meeting</p>
                                <p className="text-[10px] text-zinc-500 font-medium">Require payment for attendance</p>
                            </div>
                        </div>
                        <input {...register('is_paid')} type="checkbox" className="w-5 h-5 rounded border-zinc-300 text-sky-500 focus:ring-sky-500" />
                    </div>

                    {isPaid && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-sky-50/30 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/50">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Payment Amount (INR)</label>
                                <input {...register('payment_amount')} type="number" step="0.01" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Payment QR Code</label>
                                <input {...register('payment_qr_image')} type="file" accept="image/*" className="text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950/30 dark:file:text-sky-400 hover:file:bg-sky-100 dark:hover:file:bg-sky-900/50" />
                                {qrPreview && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <img src={qrPreview} alt="QR Preview" className="h-10 w-10 object-contain rounded border bg-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-red-50/30 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Archive Meeting</p>
                            <p className="text-[10px] text-red-500/70 font-medium">Hide this meeting from the public site</p>
                        </div>
                        <input {...register('archived')} type="checkbox" className="w-5 h-5 rounded border-red-300 text-red-500 focus:ring-red-500" />
                    </div>
                </Card>

                {/* Recap & Resources Section */}
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-sky-50/20 dark:bg-sky-950/10">
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-sky-500" />
                            Meeting Recap & Notes
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Recap Content (Rich Text)</label>
                            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                                <QuillEditor
                                    value={recapContent}
                                    onChange={setRecapContent}
                                    placeholder="Summarize the meeting highlights, decisions, and next steps..."
                                    style={{ minHeight: '300px' }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Upload Presentation / Notes (PDF, Word, PPT)</label>
                            <div className="mt-2">
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadingResource ? 'bg-gray-50 border-gray-200' : 'bg-sky-50/30 border-sky-200 hover:bg-sky-50 hover:border-sky-300'}`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {uploadingResource ? (
                                            <div className="flex items-center gap-2 text-sky-600 font-semibold">
                                                <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                                                Uploading...
                                            </div>
                                        ) : (
                                            <>
                                                <CloudArrowUpIcon className="w-8 h-8 mb-2 text-sky-500" />
                                                <p className="text-sm text-sky-700 font-medium">Click to upload files</p>
                                                <p className="text-xs text-sky-500 mt-1">Word, PPT or PDF</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" disabled={uploadingResource || !isEdit} onChange={handleResourceUpload} />
                                </label>
                                {!isEdit && <p className="mt-2 text-[10px] text-red-400">Save the meeting first to upload resource files.</p>}
                            </div>

                            {meetingResources.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {meetingResources.map((res) => (
                                        <div key={res.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400">
                                                    <DocumentIcon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{res.title}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => handleResourceDelete(res.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Member Submissions & Actions */}
                {isEdit && (
                    <div className="space-y-6">
                        {/* Member RSVP/Check-in/Payment Data */}
                        <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest">Member Actions</h2>
                            </div>
                            {meetingActions.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400 font-medium">
                                    No members have RSVP'd or checked in yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-4">Member Name</th>
                                                <th className="px-6 py-4">RSVP Status</th>
                                                <th className="px-6 py-4">Check-in Status</th>
                                                <th className="px-6 py-4">Payment Status</th>
                                                <th className="px-6 py-4">Payment Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                            {meetingActions.map((action, idx) => (
                                                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                                    <td className="px-6 py-4 font-black text-zinc-900 dark:text-white">
                                                        {action.first_name} {action.last_name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {action.rsvp_status === 'going' ? <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Going</span> : 
                                                         action.rsvp_status === 'not_sure' ? <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Maybe</span> : 
                                                         action.rsvp_status === 'cant_go' ? <span className="text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Can't Go</span> : 
                                                         <span className="text-zinc-400">None</span>}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {action.checked_in == 1 ? (
                                                            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                                                                Checked In
                                                            </span>
                                                        ) : (
                                                            <span className="text-zinc-400">Not Checked In</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {action.payment_status === 'paid_online' ? <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Paid Online</span> :
                                                         action.payment_status === 'paid_cash' ? <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Paid Cash</span> :
                                                         <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{action.payment_status || 'Pending'}</span>}
                                                    </td>
                                                     <td className="px-6 py-4 text-zinc-500 font-medium">
                                                        ₹ {action.paid_amount || '0'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>

                        {/* Form Submissions */}
                        <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                                <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest">Form Submissions</h2>
                            </div>
                            {responses.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 font-medium">
                                    No form submissions recorded yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                                            <tr>
                                                <th className="px-6 py-4">Member Name</th>
                                                <th className="px-6 py-4">Submission Date</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                            {responses.map((resp) => (
                                                <tr key={resp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                                    <td className="px-6 py-4 font-black text-zinc-900 dark:text-white">
                                                        {resp.first_name} {resp.last_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-500 font-medium">
                                                        {new Date(resp.submitted_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button type="button" onClick={() => alert("Deep view not implemented")} className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1.5 rounded-lg">
                                                            View Full Response
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </Card>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
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
                            className="px-5 py-2.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-900/50 mr-auto"
                        >
                            Delete
                        </button>
                    )}
                    <button type="button" onClick={() => navigate('/admin/meetings')} className="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-sm font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700">Cancel</button>
                    <Button type="submit" disabled={saving} className="px-8 py-2.5 text-sm shadow-xl shadow-indigo-600/20">
                        {saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Meeting')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminMeetingEditor;
