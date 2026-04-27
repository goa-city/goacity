import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatDate } from '../../utils/date';
import { 
    PencilSquareIcon, PlusIcon, EnvelopeIcon, 
    TrashIcon 
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const AdminEmailTemplates: React.FC = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<any[]>([]);
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

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            await api.delete(`/admin/email-templates/${id}`);
            setTemplates(templates.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete template:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="flex flex-wrap gap-6 justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
                        Email Templates
                        <EnvelopeIcon className="w-8 h-8 text-indigo-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">Manage automated system emails</p>
                </div>
                <Button onClick={() => navigate('/admin/email-templates/create')} className="px-8 shadow-xl shadow-indigo-600/20">
                    <PlusIcon className="w-5 h-5 mr-2" /> Create Template
                </Button>
            </div>

            <Card className="border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center font-black uppercase tracking-widest text-zinc-400 text-sm animate-pulse">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">No templates found</p>
                            <p className="text-zinc-500 mt-1">Create one to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-50 dark:border-zinc-800">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Title (Slug)</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Subject</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Last Updated</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/email-templates/${template.id}`)}>
                                        <td className="px-8 py-5 font-black text-sm text-zinc-900 dark:text-white">
                                            {template.title}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            {template.subject}
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell text-zinc-400 text-xs font-black tracking-widest uppercase">
                                            {formatDate(template.updated_at)}
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 isolate">
                                                <button 
                                                    onClick={() => navigate(`/admin/email-templates/${template.id}`)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-indigo-600 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                 <button 
                                                    onClick={() => handleDelete(template.id)}
                                                    disabled={template.id === 1 || template.id === 2}
                                                    className={`p-2 rounded-xl transition-all ${[1, 2].includes(template.id) ? 'opacity-20 cursor-not-allowed text-zinc-300' : 'text-zinc-300 group-hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'}`}
                                                    title={[1, 2].includes(template.id) ? "System protected template" : "Delete template"}
                                                 >
                                                     <TrashIcon className="w-5 h-5" />
                                                 </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminEmailTemplates;
