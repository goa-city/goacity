import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { 
    EnvelopeOpenIcon, ArrowLeftIcon, 
    AtSymbolIcon, TagIcon 
} from '@heroicons/react/24/outline';
import QuillEditor from '../../components/QuillEditor';

const AdminEmailTemplateEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = id && id !== 'create';

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        message: ''
    });

    const commonPlaceholders = [
        { label: 'First Name', value: '{{first_name}}' },
        { label: 'Last Name', value: '{{last_name}}' },
        { label: 'OTP Code (Login Only)', value: '{{otp_code}}' },
        { label: 'Meeting Title', value: '{{meeting_title}}' },
        { label: 'Meeting Date', value: '{{meeting_date}}' },
        { label: 'Meeting Time', value: '{{meeting_time}}' },
        { label: 'Location Name', value: '{{location_name}}' },
        { label: 'Map Link', value: '{{map_link}}' },
        { label: 'Zoom Link', value: '{{zoom_link}}' },
        { label: 'Meeting Recap', value: '{{recap_content}}' },
        { label: 'Meeting URL', value: '{{meeting_url}}' },
        { label: 'Current Date', value: '{{current_date}}' }
    ];

    useEffect(() => {
        if (isEdit) {
            fetchTemplate();
        }
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const res = await api.get(`/admin/email-templates/${id}`);
            setFormData(res.data);
        } catch (error) {
            console.error("Failed to fetch template:", error);
            navigate('/admin/email-templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/admin/email-templates/${id}`, formData);
            } else {
                await api.post('/admin/email-templates', formData);
            }
            navigate('/admin/email-templates');
        } catch (error) {
            console.error("Failed to save template:", error);
            alert("Error saving template. Ensure Title is unique.");
        } finally {
            setSaving(false);
        }
    };

    const handleCopyPlaceholder = (val) => {
        navigator.clipboard.writeText(val);
        alert(`Copied ${val} to clipboard!`);
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading editor...</div>;

    return (
        <div className="admin-container">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/email-templates')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-indigo-500">
                        <EnvelopeOpenIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Edit Template' : 'Create Template'}
                        </h1>
                        <p className="text-sm text-gray-500">Design your automated system email</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Editor Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="admin-card p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Template Title (Used as internal ID)
                                </label>
                                <div className="relative">
                                    <TagIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. OTP Login, Welcome Member..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-400 italic">Use 'OTP Login' for the login system template.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Email Subject Line
                                </label>
                                <div className="relative">
                                    <AtSymbolIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Enter the subject line..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                                    Email Content
                                </label>
                                <div className="rounded-xl border border-gray-100 overflow-hidden">
                                     <QuillEditor 
                                        value={formData.message} 
                                        onChange={(val) => setFormData({ ...formData, message: val })}
                                        className="h-96"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="admin-button-primary justify-center py-4 text-base shadow-lg shadow-indigo-500/20"
                                >
                                    {saving ? 'Saving Changes...' : 'Save Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar / Placeholders */}
                <div className="space-y-6">
                    <div className="admin-card p-6">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Common Elements</h2>
                        <p className="text-xs text-gray-500 mb-4">Click to copy placeholder to clipboard and paste it in your editor.</p>
                        
                        <div className="space-y-2">
                            {commonPlaceholders.map(ph => (
                                <button
                                    key={ph.value}
                                    onClick={() => handleCopyPlaceholder(ph.value)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-white hover:shadow-sm border border-gray-100 rounded-xl transition-all group"
                                >
                                    <span className="text-sm text-gray-700 font-medium">{ph.label}</span>
                                    <span className="text-[10px] font-mono text-indigo-500 group-hover:scale-110 transition-transform">{ph.value}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Editor Tip</h3>
                        <p className="text-xs text-amber-800 leading-relaxed">
                            Use placeholders exactly as shown (with double curly braces). The system will automatically replace them with real data when the email is sent.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmailTemplateEditor;
