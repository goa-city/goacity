import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilIcon, PlusIcon, EnvelopeIcon, 
    TrashIcon 
} from '@heroicons/react/24/outline';

const AdminEmailTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/admin/email-templates');
            setTemplates(res.data);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await api.delete(`/admin/email-templates/${id}`);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete template:", error);
        }
    };

    return (
        <div className="admin-container">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="admin-header-icon bg-indigo-500">
                        <EnvelopeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                        <p className="text-sm text-gray-500">Manage automated system emails</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/admin/email-templates/create')}
                    className="admin-button-primary"
                >
                    <PlusIcon className="h-4 w-4" /> Create Template
                </button>
            </div>

            <div className="admin-card">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading templates...</div>
                ) : templates.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">No templates found. Create one to get started.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="admin-table-head">Title (Slug)</th>
                                <th className="admin-table-head">Subject</th>
                                <th className="admin-table-head hidden md:table-cell">Last Updated</th>
                                <th className="admin-table-head text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {templates.map((template) => (
                                <tr key={template.id} className="admin-table-row">
                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                        {template.title}
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">
                                        {template.subject}
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell text-gray-400 text-xs">
                                        {new Date(template.updated_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => navigate(`/admin/email-templates/${template.id}`)}
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(template.id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminEmailTemplates;
