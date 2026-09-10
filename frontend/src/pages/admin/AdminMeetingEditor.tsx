import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
    CalendarDaysIcon, ArrowLeftIcon, MapPinIcon,
    CurrencyRupeeIcon, BeakerIcon, SwatchIcon, ClockIcon,
    CloudArrowUpIcon, TrashIcon, DocumentIcon, DocumentTextIcon,
    VideoCameraIcon, EnvelopeIcon, ChevronDownIcon, ChatBubbleLeftRightIcon, EyeIcon, ArrowDownTrayIcon,
    XMarkIcon, PhotoIcon, UsersIcon, LinkIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftOutline } from '@heroicons/react/24/outline';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';
import QuillEditor from '../../components/QuillEditor';
import QRCode from 'react-qr-code';

const getLocalYYYYMMDD = (dateInput: any) => {
    const d = new Date(dateInput);
    const offset = d.getTimezoneOffset() * 60000;
    return (new Date(d.getTime() - offset)).toISOString().slice(0, 10);
};

type NotifyType = 'email' | 'whatsapp';
type TargetAudience = 'all' | 'going' | 'maybe' | 'no' | 'paid' | 'checked_in';

const AdminMeetingEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const { register, handleSubmit, setValue, reset, watch, control, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [forms, setForms] = useState<any[]>([]); // For Feedback form select
    const [streams, setStreams] = useState<any[]>([]); // For Stream select
    const [qrPreview, setQrPreview] = useState<any>(null); // QR Code Preview
    const [qrFile, setQrFile] = useState<File | null>(null);
    const [removeQr, setRemoveQr] = useState(false);
    const [posterPreview, setPosterPreview] = useState<any>(null); // Poster Invite Preview
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [removePoster, setRemovePoster] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [responses, setResponses] = useState<any[]>([]);
    const [meetingActions, setMeetingActions] = useState<any[]>([]);
    const [recapContent, setRecapContent] = useState('');
    const [meetingResources, setMeetingResources] = useState<any[]>([]);
    const [uploadingResource, setUploadingResource] = useState(false);
    const [notifying, setNotifying] = useState(false);
    const [emailTemplates, setEmailTemplates] = useState<any[]>([]);
    const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
    const [showNotifyMenu, setShowNotifyMenu] = useState(false);
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notifyType, setNotifyType] = useState<'email' | 'whatsapp'>('email');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
    const [upiVpa, setUpiVpa] = useState('');
    const [payeeName, setPayeeName] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const meetingDate = watch('meeting_date');
    const title = watch('title');
    const slug = watch('slug');
    const watchedPaymentAmount = watch('payment_amount');
    const isPastDate = meetingDate ? getLocalYYYYMMDD(meetingDate) < getLocalYYYYMMDD(new Date()) : false;

    // Live generated UPI URI
    const generatedUpiUri = React.useMemo(() => {
        const vpa = upiVpa.trim();
        if (!vpa) return '';
        if (vpa.startsWith('upi://pay')) {
            try {
                const urlObj = new URL(vpa.replace('upi://pay', 'https://dummy.local'));
                if (watchedPaymentAmount) urlObj.searchParams.set('am', String(watchedPaymentAmount).trim());
                if (payeeName.trim()) urlObj.searchParams.set('pn', payeeName.trim());
                if (paymentNote.trim()) urlObj.searchParams.set('tn', paymentNote.trim());
                if (!urlObj.searchParams.get('cu')) urlObj.searchParams.set('cu', 'INR');
                return urlObj.toString().replace('https://dummy.local', 'upi://pay');
            } catch (e) {
                return vpa;
            }
        }
        const params = new URLSearchParams();
        params.set('pa', vpa);
        if (payeeName.trim()) params.set('pn', payeeName.trim());
        if (watchedPaymentAmount && Number(watchedPaymentAmount) > 0) params.set('am', String(watchedPaymentAmount).trim());
        params.set('cu', 'INR');
        if (paymentNote.trim()) params.set('tn', paymentNote.trim());
        return `upi://pay?${params.toString()}`;
    }, [upiVpa, payeeName, paymentNote, watchedPaymentAmount]);

    // Auto-slug logic
    useEffect(() => {
        if (!isEdit && title) {
            const generatedSlug = title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            // Only auto-update if slug is empty or seems to be following the title pattern
            if (!slug || slug === title.slice(0, -1).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')) {
                setValue('slug', generatedSlug);
            }
        }
    }, [title, isEdit, setValue, slug]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [formsRes, streamsRes, emailRes, whatsappRes] = await Promise.all([
                    api.get('/admin/forms'),
                    api.get('/admin/streams'),
                    api.get('/admin/email-templates'),
                    api.get('/admin/whatsapp-templates')
                ]);
                setForms(formsRes.data);
                setStreams(streamsRes.data);
                setEmailTemplates(emailRes.data);
                setWhatsappTemplates(whatsappRes.data);
            } catch (error) { console.error(error); }
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
                        start_time: data.start_time_display || '',
                        end_time: data.end_time_display || '',
                        is_paid: data.is_paid == 1,
                        archived: data.archived == 1,
                        feedback_form_id: data.feedback_form_id ? String(data.feedback_form_id) : '',
                        stream_id: data.stream_id ? String(data.stream_id) : '',
                        payment_amount: data.payment_amount || '0',
                    });
                    // Parse existing upi_link into upiVpa, payeeName, paymentNote
                    if (data.upi_link) {
                        const linkStr = String(data.upi_link).trim();
                        if (linkStr.startsWith('upi://pay')) {
                            try {
                                const urlObj = new URL(linkStr.replace('upi://pay', 'https://dummy.local'));
                                setUpiVpa(urlObj.searchParams.get('pa') || '');
                                setPayeeName(urlObj.searchParams.get('pn') || '');
                                setPaymentNote(urlObj.searchParams.get('tn') || '');
                            } catch (e) {
                                setUpiVpa(linkStr);
                            }
                        } else if (linkStr.includes('@')) {
                            setUpiVpa(linkStr);
                        }
                    }

                    if (data.payment_qr_image_url) setQrPreview(data.payment_qr_image_url);
                    else if (data.payment_qr_image) setQrPreview(`${baseUrl}/uploads/${data.payment_qr_image}`);

                    if (data.poster_image_url) setPosterPreview(data.poster_image_url);
                    else if (data.poster_image) setPosterPreview(`${baseUrl}/uploads/${data.poster_image}`);

                    setRecapContent(data.recap_content || '');
                    setMeetingResources(data.resources || []);
                    setMeetingActions(data.meeting_responses || []);
                })
                .catch(err => console.error("Failed to fetch meeting", err))
                .finally(() => setLoading(false));
        }
    }, [id, reset]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const onSubmit = async (data: Record<string, unknown>) => {
        setSaving(true);
        try {
            // Generate canonical upi_link from structured fields if paid
            if (data.is_paid) {
                const vpa = upiVpa.trim();
                const amt = data.payment_amount ? String(data.payment_amount).trim() : '';
                const pn = payeeName.trim();
                const tn = paymentNote.trim();

                if (!vpa) {
                    showToast("Please enter a valid UPI ID (e.g. yourname@bank).");
                    setSaving(false);
                    return;
                }

                if (!amt || Number(amt) <= 0) {
                    showToast("Please enter a valid Payment Amount (₹).");
                    setSaving(false);
                    return;
                }

                if (vpa.startsWith('upi://pay')) {
                    // It is already a full URI, update amount/note/name if provided
                    try {
                        const urlObj = new URL(vpa.replace('upi://pay', 'https://dummy.local'));
                        if (amt) urlObj.searchParams.set('am', amt);
                        if (pn) urlObj.searchParams.set('pn', pn);
                        if (tn) urlObj.searchParams.set('tn', tn);
                        if (!urlObj.searchParams.get('cu')) urlObj.searchParams.set('cu', 'INR');
                        data.upi_link = urlObj.toString().replace('https://dummy.local', 'upi://pay');
                    } catch (e) {
                        data.upi_link = vpa;
                    }
                } else {
                    // Standard UPI VPA (e.g. yourname@bank)
                    const params = new URLSearchParams();
                    params.set('pa', vpa);
                    if (pn) params.set('pn', pn);
                    if (amt) params.set('am', amt);
                    params.set('cu', 'INR');
                    if (tn) params.set('tn', tn);
                    data.upi_link = `upi://pay?${params.toString()}`;
                }
            } else {
                data.upi_link = '';
            }

            const formData = new FormData();
            if (isEdit && id) formData.append('id', String(id));

            Object.keys(data).forEach(key => {
                if (key === 'id' || key === 'payment_qr_image_url' || key === 'poster_image_url' || key === 'resources' || key === 'description' || key === 'recap_content' || key === 'payment_qr_image' || key === 'poster_image') return;

                const value = data[key];

                if (key === 'meeting_date') {
                    if (value) {
                        const date = new Date(value as string | number | Date);
                        const offset = date.getTimezoneOffset();
                        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
                        formData.append(key, adjustedDate.toISOString().split('T')[0]);
                    } else {
                        formData.append(key, '');
                    }
                } else if (key === 'is_paid' || key === 'archived') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, value === null || value === undefined ? '' : String(value));
                }
            });

            // Append QR Code if newly uploaded
            if (qrFile) {
                formData.append('payment_qr_image', qrFile);
            } else if (removeQr) {
                formData.append('remove_payment_qr', '1');
            }

            // Append Poster Invite if newly uploaded or deleted
            if (posterFile) {
                formData.append('poster_image', posterFile);
            } else if (removePoster) {
                formData.append('remove_poster_image', '1');
            }

            formData.append('recap_content', recapContent);
            formData.delete('description'); // Explicitly ensure description is not sent

            const res = await api.post('/admin/meetings', formData);

            showToast(isEdit ? "Meeting updated successfully!" : "Meeting created successfully!");
            if (!isEdit && res.data.id) {
                setTimeout(() => navigate(`/admin/meetings/${res.data.id}`, { replace: true }), 1000);
            }
        } catch (error: any) {
            console.error("Save failed", error);
            showToast(error.response?.data?.message || "Failed to save meeting.");
        } finally {
            setSaving(false);
        }
    };

    const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !id) return;

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
            showToast("Failed to upload file.");
        } finally {
            setUploadingResource(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleNotify = (type: NotifyType) => {
        const currentStreamId = watch('stream_id');
        if (!currentStreamId) {
            showToast("Meeting Stream is required before sending notifications. Please select and save a stream.");
            return;
        }
        setNotifyType(type);
        setSelectedTemplateId(type === 'email' ? '2' : '1');
        setTargetAudience('all');
        setShowNotifyModal(true);
    };

    const executeNotify = async () => {
        const currentStreamId = watch('stream_id');
        if (!currentStreamId) {
            showToast("Meeting Stream is required before sending notifications.");
            return;
        }

        const audienceLabels: Record<TargetAudience, string> = {
            all: 'Everyone in stream',
            going: 'Said Going',
            maybe: 'Said Maybe',
            no: 'Said No',
            paid: 'Paid',
            checked_in: 'Checked In'
        };

        if (!window.confirm(`Send ${notifyType.toUpperCase()} notification to [${audienceLabels[targetAudience]}] using the selected template?`)) return;
        setNotifying(true);
        setShowNotifyModal(false);
        try {
            const res = await api.post(`/admin/meetings/${id}/notify`, {
                type: notifyType,
                templateId: selectedTemplateId,
                targetAudience
            });
            showToast(res.data?.message || "Notifications sent successfully!");
        } catch (e: any) {
            console.error(e);
            showToast(e.response?.data?.message || "Failed to send notifications.");
        } finally {
            setNotifying(false);
        }
    };

    const handleResourceDelete = async (resId: number) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            await api.delete(`/admin/meetings/resources/${resId}`);
            setMeetingResources(meetingResources.filter(r => r.id !== resId));
            showToast("Resource deleted");
        } catch (error) {
            showToast("Delete failed");
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
                className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors mb-8 group"
            >
                <ArrowLeftOutline className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                <span className="text-xl font-medium">Back to Meetings</span>
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
                            {isEdit && watch('stream_id') && !isPastDate && (
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleNotify('email')}
                                        disabled={notifying}
                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                    >
                                        <EnvelopeIcon className="w-4 h-4" />
                                        {notifying && notifyType === 'email' ? 'Sending...' : 'Notify: Email'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleNotify('whatsapp')}
                                        disabled={notifying}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                                    >
                                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                        {notifying && notifyType === 'whatsapp' ? 'Sending...' : 'Notify: WhatsApp'}
                                    </button>
                                </div>
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

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">URL Slug</label>
                            <input
                                {...register('slug')}
                                onInput={(e: any) => {
                                    e.target.value = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                                }}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium"
                                placeholder="auto-generated-if-empty"
                            />
                            {slug && (
                                <p className="mt-1 text-[9px] text-indigo-500 font-bold uppercase tracking-widest ml-1">
                                    Public Link: <a href={`https://goa.city/meetings/${slug}`} target="_blank" rel="noopener noreferrer" className="hover:underline">goa.city/meetings/{slug}</a>
                                </p>
                            )}
                            <p className="mt-1 text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Clean URL. Leave blank to auto-generate.</p>
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
                                            onChange={(date: Date | null) => field.onChange(date)}
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
                                <input {...register('start_time', { required: true })} type="text" placeholder="e.g. 06:30pm" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">End Time</label>
                                <input {...register('end_time', { required: true })} type="text" placeholder="e.g. 09:00pm" className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-4 font-medium" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Location Name</label>
                            <div className="relative">
                                <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input {...register('location_name')} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium" placeholder="Location Name" />
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
                            <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                                Stream <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <SwatchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                                <select
                                    {...register('stream_id', { required: "Stream is required" })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pl-12 h-14 font-medium appearance-none"
                                >
                                    <option value="">-- Select Stream (Required) --</option>
                                    {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            {errors.stream_id && <p className="mt-1 text-[10px] font-black tracking-widest uppercase text-red-500">Stream is required</p>}
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
                        <div className="space-y-6 p-5 sm:p-6 bg-slate-50/60 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
                            {/* UPI ID Field (Required) */}
                            <div>
                                <label className="block text-sm font-bold text-slate-800 dark:text-zinc-200 mb-2">
                                    UPI ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={upiVpa}
                                    onChange={(e) => setUpiVpa(e.target.value)}
                                    placeholder="yourname@bank"
                                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3.5 text-base font-medium shadow-sm transition-all"
                                />
                            </div>

                            {/* Your Name Field (Optional) */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                        Your name
                                    </label>
                                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
                                        optional — leave blank for best compatibility
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={payeeName}
                                    onChange={(e) => setPayeeName(e.target.value)}
                                    placeholder=""
                                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3.5 text-base font-medium shadow-sm transition-all"
                                />
                            </div>

                            {/* Row: Amount (₹) & Note */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                            Amount (₹) <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    <input
                                        {...register('payment_amount')}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3.5 text-base font-medium shadow-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                            Note
                                        </label>
                                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-normal">
                                            optional
                                        </span>
                                    </div>
                                    <input
                                        type="text"
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        placeholder=""
                                        className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 p-3.5 text-base font-medium shadow-sm transition-all"
                                    />
                                </div>
                            </div>

                            {/* Optional Custom QR Override or Dynamic Generation */}
                            <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">Custom Payment QR Code Image</p>
                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                            Optional. If not provided, a QR code is generated dynamically from the UPI ID & Amount.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {qrPreview && (
                                            <div className="relative group/qr w-14 h-14 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden shrink-0">
                                                <img src={qrPreview} alt="QR Preview" className="w-full h-full object-contain" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setQrPreview(null);
                                                            setQrFile(null);
                                                            setRemoveQr(true);
                                                            setValue('payment_qr_image', null);
                                                        }}
                                                        className="p-1 bg-white text-red-600 rounded hover:scale-110 transition-transform shadow"
                                                        title="Delete Custom QR"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setQrFile(file);
                                                    setRemoveQr(false);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setQrPreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="text-xs text-slate-500 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 dark:file:bg-zinc-800 dark:file:text-zinc-300 hover:file:bg-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Live Payment QR & Link Preview Card */}
                            {(upiVpa || qrPreview) && (
                                <div className="p-4 bg-white dark:bg-zinc-950 rounded-xl border border-sky-200/80 dark:border-sky-900/50 shadow-sm space-y-4">
                                    <div className="flex flex-col sm:flex-row items-center gap-5">
                                        <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm shrink-0">
                                            {qrPreview ? (
                                                <img src={qrPreview} alt="Custom QR" className="w-28 h-28 object-contain" />
                                            ) : generatedUpiUri ? (
                                                <QRCode value={generatedUpiUri} size={112} />
                                            ) : null}
                                        </div>
                                        <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                                                Live QR Code Active
                                            </span>
                                            <p className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300 break-all">
                                                {generatedUpiUri || upiVpa}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Attendees can scan this QR with Google Pay, PhonePe, Paytm, BHIM, or any UPI app.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Public Payment Page Link */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Public Payment Page Link</p>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                                    https://goa.city/pay/{slug || (isEdit && id ? id : 'meeting-slug')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const url = `https://goa.city/pay/${slug || (isEdit && id ? id : '')}`;
                                                    navigator.clipboard.writeText(url);
                                                    showToast('Payment link copied to clipboard!');
                                                }}
                                                className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                                            >
                                                Copy Link
                                            </button>
                                            <a
                                                href={`/pay/${slug || (isEdit && id ? id : '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                                            >
                                                <span>Preview</span>
                                                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Poster Invite Section */}
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                <PhotoIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Meeting Poster Invite</p>
                                <p className="text-[10px] text-zinc-500 font-medium">Upload a flyer / poster image to display on the meetings page and details</p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start gap-6 pt-2">
                            {posterPreview ? (
                                <div className="relative group/poster w-48 max-h-64 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden shrink-0">
                                    <img src={posterPreview} alt="Poster Preview" className="w-full h-auto max-h-64 object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPosterPreview(null);
                                                setPosterFile(null);
                                                setRemovePoster(true);
                                                setValue('poster_image', null);
                                            }}
                                            className="p-2 bg-white text-red-600 rounded-lg hover:scale-110 transition-transform shadow-lg"
                                            title="Delete Poster"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                        <a
                                            href={posterPreview}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-white text-indigo-600 rounded-lg hover:scale-110 transition-transform shadow-lg"
                                            title="View Full Size"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-48 h-36 bg-zinc-100 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center shrink-0">
                                    <PhotoIcon className="w-8 h-8 text-zinc-300 mb-1" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">No Poster Uploaded</p>
                                </div>
                            )}

                            <div className="flex-1 space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">
                                    {posterPreview ? 'Replace Poster Image' : 'Select Poster Image'}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setPosterFile(file);
                                            setRemovePoster(false);
                                            const reader = new FileReader();
                                            reader.onloadend = () => setPosterPreview(reader.result);
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/30 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/50"
                                />
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                    Supports JPG, PNG, WEBP. Will be optimized automatically for fast load times.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-red-50/30 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-widest">Archive Meeting</p>
                            <p className="text-[10px] text-red-500/70 font-medium">Hide this meeting from the public site</p>
                        </div>
                        <input {...register('archived')} type="checkbox" className="w-5 h-5 rounded border-red-300 text-red-500 focus:ring-red-500" />
                    </div>
                </Card>

                {/* Presentation & Resources Section */}
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-sky-50/20 dark:bg-sky-950/10">
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <CloudArrowUpIcon className="w-5 h-5 text-sky-500" />
                            Presentation & Resources
                        </h2>
                    </div>
                    <div className="p-6">
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
                                        <div className="flex items-center gap-1">
                                            <a
                                                href={res.url_display || `${baseUrl}/uploads/${res.url}`}
                                                download={res.title || 'download'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title="Download File"
                                            >
                                                <ArrowDownTrayIcon className="w-4 h-4" />
                                            </a>
                                            <button
                                                type="button"
                                                onClick={() => handleResourceDelete(res.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete File"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* Member Actions Section */}
                {isEdit && (
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
                                            {isPaid && <th className="px-6 py-4">Payment Status</th>}
                                            {isPaid && <th className="px-6 py-4">Payment Amount</th>}
                                            {isPaid && <th className="px-6 py-4">Payment Proof</th>}
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
                                                {isPaid && (
                                                    <td className="px-6 py-4">
                                                        {action.payment_status === 'paid_online' ? <span className="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Paid Online</span> :
                                                            action.payment_status === 'paid_cash' ? <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Paid Cash</span> :
                                                                <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{action.payment_status || 'Pending'}</span>}
                                                    </td>
                                                )}
                                                {isPaid && (
                                                    <td className="px-6 py-4 text-zinc-500 font-medium">
                                                        ₹ {action.paid_amount || '0'}
                                                    </td>
                                                )}
                                                {isPaid && (
                                                    <td className="px-6 py-4">
                                                        {action.payment_proof_url ? (
                                                            <a
                                                                href={action.payment_proof_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:underline"
                                                            >
                                                                <span>View Proof</span>
                                                                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <span className="text-zinc-400 text-xs">-</span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                )}

                {/* Recap Section */}
                <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-sky-50/20 dark:bg-sky-950/10">
                        <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-sky-500" />
                            Meeting Recap & Notes
                        </h2>
                    </div>
                    <div className="p-6">
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
                </Card>

                {/* Form Submissions Section */}
                {isEdit && (
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
                                                    <button type="button" onClick={() => showToast("Deep view not implemented")} className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-[10px] hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1.5 rounded-lg">
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
                                    } catch (e) { showToast("Delete failed"); }
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

            {/* Notification Modal */}
            {showNotifyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Header */}
                        <div className="p-8 pb-4 relative shrink-0 border-b border-zinc-100 dark:border-zinc-800/60">
                            <button
                                onClick={() => setShowNotifyModal(false)}
                                className="absolute top-8 right-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>

                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest mb-3 ${notifyType === 'email' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'}`}>
                                {notifyType === 'email' ? 'Email Broadcaster' : 'WhatsApp Broadcaster'}
                            </div>
                            <h3 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight tracking-tighter uppercase italic">
                                Select <span className={notifyType === 'email' ? 'text-indigo-600' : 'text-emerald-600'}>Template</span>
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">
                                Choose a notification template and target audience to send to participants.
                            </p>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            {/* Target Audience Selector */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <UsersIcon className="w-4 h-4 text-zinc-400" />
                                        Send To (Recipient Filter)
                                    </span>
                                    {targetAudience !== 'all' && (
                                        <span className="text-[10px] text-zinc-400 font-bold lowercase">
                                            {meetingActions.filter(a => {
                                                if (targetAudience === 'going') return a.rsvp_status === 'going';
                                                if (targetAudience === 'maybe') return a.rsvp_status === 'not_sure';
                                                if (targetAudience === 'no') return a.rsvp_status === 'cant_go';
                                                if (targetAudience === 'paid') return ['paid', 'paid_online', 'paid_cash'].includes(a.payment_status) || Number(a.paid_amount) > 0;
                                                if (targetAudience === 'checked_in') return a.checked_in == 1;
                                                return true;
                                            }).length} matching responses recorded
                                        </span>
                                    )}
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'all', label: 'Everyone in Stream', desc: 'All stream members' },
                                        { id: 'going', label: 'Going', desc: 'RSVP Going' },
                                        { id: 'maybe', label: 'Maybe', desc: 'RSVP Maybe' },
                                        { id: 'no', label: 'No', desc: 'RSVP Can\'t Go' },
                                        { id: 'paid', label: 'Paid', desc: 'Completed Payment' },
                                        { id: 'checked_in', label: 'Checked In', desc: 'Checked in at venue' },
                                    ].map((opt) => {
                                        const isSelected = targetAudience === opt.id;
                                        const count = opt.id === 'all'
                                            ? undefined
                                            : meetingActions.filter(a => {
                                                if (opt.id === 'going') return a.rsvp_status === 'going';
                                                if (opt.id === 'maybe') return a.rsvp_status === 'not_sure';
                                                if (opt.id === 'no') return a.rsvp_status === 'cant_go';
                                                if (opt.id === 'paid') return ['paid', 'paid_online', 'paid_cash'].includes(a.payment_status) || Number(a.paid_amount) > 0;
                                                if (opt.id === 'checked_in') return a.checked_in == 1;
                                                return true;
                                            }).length;

                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setTargetAudience(opt.id as TargetAudience)}
                                                className={`p-3 rounded-2xl border text-left transition-all relative ${isSelected
                                                    ? notifyType === 'email'
                                                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                                                        : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                                                    : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                                    <span className="font-bold text-xs">{opt.label}</span>
                                                    {count !== undefined && (
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isSelected
                                                            ? notifyType === 'email'
                                                                ? 'bg-indigo-600 text-white'
                                                                : 'bg-emerald-600 text-white'
                                                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                                            }`}>
                                                            {count}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{opt.desc}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Available Templates</label>
                                <div className="relative">
                                    <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                                    <select
                                        value={selectedTemplateId || ''}
                                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-6 h-14 font-medium appearance-none"
                                    >
                                        {(notifyType === 'email' ? emailTemplates : whatsappTemplates).map(t => (
                                            <option key={t.id} value={t.id}>{t.title} {t.subject ? `(${t.subject})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest mb-3">Content Preview</p>
                                <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                    {(() => {
                                        const templates = notifyType === 'email' ? emailTemplates : whatsappTemplates;
                                        const selected = templates.find(t => String(t.id) === String(selectedTemplateId));
                                        if (!selected) return <p className="text-zinc-400 italic text-sm">No template selected</p>;
                                        return (
                                            <div className="space-y-4">
                                                {selected.subject && (
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-zinc-400">Subject:</p>
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{selected.subject}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-zinc-400">Message Body:</p>
                                                    <div
                                                        className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap mt-1"
                                                        dangerouslySetInnerHTML={{ __html: selected.content || selected.message || selected.body || '' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0 flex gap-3">
                            <Button
                                onClick={executeNotify}
                                loading={notifying}
                                className={`flex-1 justify-center py-4 rounded-2xl shadow-xl ${notifyType === 'email' ? 'shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}
                            >
                                Confirm & Send {notifyType === 'email' ? 'Email' : 'WhatsApp'}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setShowNotifyModal(false)}
                                className="px-8 justify-center py-4 rounded-2xl"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMeetingEditor;
