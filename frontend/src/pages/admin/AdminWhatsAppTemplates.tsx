import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    PencilSquareIcon, PlusIcon, ChatBubbleLeftRightIcon, 
    TrashIcon 
} from '@heroicons/react/24/solid';
import { Card } from '../../shared/components/ui/Card';
import Button from '../../shared/components/ui/Button';

const AdminWhatsAppTemplates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await api.get('/admin/whatsapp-templates');
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
            await api.delete(`/admin/whatsapp-templates/${id}`);
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
                        WhatsApp Templates
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-emerald-600" />
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium">Reusable messages for WhatsApp broadcasts</p>
                </div>
                <Button onClick={() => navigate('/admin/whatsapp/templates/create')} className="px-8 shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 border-none">
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
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Template Title</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Content Snippet</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hidden md:table-cell">Last Updated</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/whatsapp/templates/${template.id}`)}>
                                        <td className="px-8 py-5 font-black text-sm text-zinc-900 dark:text-white">
                                            {template.title}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                            <div className="max-w-xs truncate">{template.content}</div>
                                        </td>
                                        <td className="px-8 py-5 hidden md:table-cell text-zinc-400 text-xs font-black tracking-widest uppercase">
                                            {new Date(template.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2 isolate">
                                                <button 
                                                    onClick={() => navigate(`/admin/whatsapp/templates/${template.id}`)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-emerald-600 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(template.id)}
                                                    className="p-2 rounded-xl text-zinc-300 group-hover:text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-950/30"
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

export default AdminWhatsAppTemplates;
