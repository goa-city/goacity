import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    BriefcaseIcon, 
    MapPinIcon, 
    CalendarIcon, 
    ArrowLeftIcon,
    PaperClipIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { Card } from '../shared/components/ui/Card';
import Button from '../shared/components/ui/Button';
import { formatDate } from '../utils/date';

const JobView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [cvFile, setCvFile] = useState<File | null>(null);

    useEffect(() => {
        api.get(`/member/jobs/${id}`)
            .then(res => setJob(res.data))
            .catch(err => {
                console.error('Failed to load job:', err);
                setError('Job not found');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext && ['pdf', 'doc', 'docx'].includes(ext)) {
                setCvFile(file);
                setError('');
            } else {
                setError('Please upload a PDF or Word document only.');
                e.target.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cvFile) {
            setError('Please upload your CV.');
            return;
        }

        setApplying(true);
        setError('');

        const data = new FormData();
        data.append('full_name', formData.full_name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('message', formData.message);
        data.append('cv', cvFile);

        try {
            await api.post(`/member/jobs/${id}/apply`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSubmitted(true);
        } catch (err: any) {
            console.error('Application failed:', err);
            setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
        } finally {
            setApplying(false);
        }
    };

    const ApplyForm = () => (
        <div className="flex flex-col bg-white dark:bg-zinc-950 p-6 
            w-full xl:w-80
            xl:fixed xl:right-0 xl:top-0 xl:h-screen xl:border-l border-zinc-100 dark:border-zinc-800 xl:overflow-y-auto
            border-t xl:border-t-0 mt-8 xl:mt-0 pb-20
        ">
            {submitted ? (
                <div className="text-center py-10 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-8">
                    <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Application Sent!</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">Your application and CV have been successfully submitted.</p>
                    <Button onClick={() => navigate('/jobs')} className="w-full">Back to Jobs</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white">Apply for this Position</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Full Name</label>
                            <input 
                                type="text" required
                                value={formData.full_name}
                                onChange={e => setFormData({...formData, full_name: e.target.value})}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Email Address</label>
                            <input 
                                type="email" required
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Phone (Optional)</label>
                            <input 
                                type="tel"
                                value={formData.phone}
                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                                placeholder="+91..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Cover Message</label>
                            <textarea 
                                rows={4}
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                                placeholder="Tell them why you're a great fit..."
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Upload CV (PDF/Word)</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`w-full border-2 border-dashed ${cvFile ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'} rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 group-hover:border-sky-400`}>
                                    <PaperClipIcon className={`w-6 h-6 ${cvFile ? 'text-sky-500' : 'text-zinc-400'}`} />
                                    <span className={`text-xs font-bold ${cvFile ? 'text-sky-700 dark:text-sky-400' : 'text-zinc-500'}`}>
                                        {cvFile ? cvFile.name : 'Click or Drag CV here'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p className="text-rose-500 text-xs font-bold">{error}</p>
                        )}

                        <Button 
                            type="submit" 
                            disabled={applying}
                            className="w-full py-4 text-sm font-black shadow-lg shadow-sky-600/20"
                        >
                            {applying ? 'SUBMITTING...' : 'APPLY FOR JOB'}
                        </Button>

                        <p className="text-[10px] text-zinc-400 text-center uppercase font-bold tracking-widest leading-relaxed">
                            By applying, your profile details and CV will be shared with the recruiter.
                        </p>
                    </form>
                </div>
            )}
        </div>
    );

    if (loading) return (
        <DashboardLayout>
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-64 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
        </DashboardLayout>
    );

    if (error && !job) return (
        <DashboardLayout>
            <div className="text-center py-20">
                <p className="text-xl text-gray-500">{error}</p>
                <Button onClick={() => navigate('/jobs')} className="mt-4">Back to Jobs</Button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout rightSidebar={<ApplyForm />}>
            <div className="max-w-full mb-12">
                <button 
                    onClick={() => navigate('/jobs')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300 font-bold text-sm mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    BACK TO JOB BOARD
                </button>

                <div className="space-y-6">
                    <Card className="p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-black text-zinc-900 dark:text-white leading-tight mb-2">{job.title}</h1>
                                <p className="text-lg text-sky-600 font-bold">{job.company}</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                job.type === 'Full Time' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                                job.type === 'Freelance' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                job.type === 'Internship' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-zinc-50 text-zinc-600 border border-zinc-100'
                            }`}>
                                {job.type}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-6 mb-8 py-6 border-y border-zinc-50 dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <MapPinIcon className="w-5 h-5 text-sky-400" />
                                <span className="text-sm font-bold uppercase tracking-wide">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <BriefcaseIcon className="w-5 h-5 text-sky-400" />
                                <span className="text-sm font-bold uppercase tracking-wide">{job.category || 'General'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <CalendarIcon className="w-5 h-5 text-sky-400" />
                                <span className="text-sm font-bold uppercase tracking-wide">
                                    Posted {formatDate(job.created_at)}
                                </span>
                            </div>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert max-w-none">
                            <h3 className="text-zinc-900 dark:text-white font-black text-xl mb-6">Job Description</h3>
                            <div 
                                className="text-zinc-600 dark:text-zinc-400 leading-relaxed job-description-content mb-10"
                                dangerouslySetInnerHTML={{ __html: job.description }}
                            />

                            {job.company_profile && (
                                <div className="mt-12 pt-8 border-t border-zinc-50 dark:border-zinc-800">
                                    <h3 className="text-zinc-900 dark:text-white font-black text-xl mb-4">About {job.company}</h3>
                                    <div 
                                        className="text-zinc-600 dark:text-zinc-400 leading-relaxed job-company-profile-content"
                                        dangerouslySetInnerHTML={{ __html: job.company_profile }}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                    
                    {/* Mobile Only: Show form at bottom */}
                    <div className="xl:hidden">
                        <ApplyForm />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default JobView;
