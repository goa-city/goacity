import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { 
    ChevronUpIcon, ChevronDownIcon, TrashIcon, 
    ArrowLeftIcon, DocumentTextIcon, PlusIcon,
    Bars3CenterLeftIcon, IdentificationIcon
} from '@heroicons/react/24/outline';

const AdminFormEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchForm();
    }, [id]);

    const fetchForm = async () => {
        try {
            const res = await api.get(`/admin/forms?id=${id}`);
            setForm(res.data.form);
            setFields(res.data.fields || []);
        } catch (error) {
            console.error("Failed to fetch form", error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleFieldChange = (index, key, value) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        setFields(updated);
    };

    const handleOptionsChange = (index, valueString) => {
        const options = valueString.split('\n').map(s => s.trim()).filter(Boolean);
        handleFieldChange(index, 'options', options);
    };

    const moveField = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === fields.length - 1) return;

        const updated = [...fields];
        const temp = updated[index];
        updated[index] = updated[index + direction];
        updated[index + direction] = temp;
        setFields(updated);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const fieldsWithOrder = fields.map((f, i) => ({ ...f, sort_order: i + 1 }));
            await api.put('/admin/forms', {
                id: form.id,
                title: form.title,
                description: form.description,
                fields: fieldsWithOrder
            });
            showToast("Form saved successfully!");
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveField = (index) => {
        if (window.confirm("Are you sure you want to remove this field?")) {
            const updated = [...fields];
            updated.splice(index, 1);
            setFields(updated);
        }
    };

    const handleAddField = (type) => {
        const newField = {
            id: null,
            field_key: `q_${Date.now()}`,
            field_type: type,
            label: 'New Question',
            subtitle: '',
            placeholder: '',
            options: [],
            is_required: 0,
            is_optional: 0
        };
        setFields([...fields, newField]);
        
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
    };

    if (loading) return <div className="p-12 text-center text-gray-400">Loading form builder...</div>;

    const fieldTypes = [
        { type: 'text', label: 'Short Text' },
        { type: 'textarea', label: 'Long Text' },
        { type: 'choice', label: 'Single Choice' },
        { type: 'dropdown_choice', label: 'Dropdown' },
        { type: 'multiselect', label: 'Multi-Select' },
        { type: 'date', label: 'Date' },
        { type: 'file', label: 'File Upload' },
        { type: 'intro', label: 'Intro Screen' }
    ];

    return (
        <div className="admin-container max-w-4xl pb-32">
            {toast && <div className="admin-toast">{toast}</div>}

            <button
                onClick={() => navigate('/admin/forms')}
                className="flex items-center text-gray-500 hover:text-sky-600 transition-colors mb-8 group text-sm"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Forms
            </button>

            {/* Header / Meta Settings */}
            <div className="admin-card mb-8">
                <div className="p-6 bg-indigo-50/30">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="admin-header-icon bg-indigo-500">
                                <DocumentTextIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Form Settings</h1>
                                <p className="text-xs text-gray-400 mt-0.5">Form ID: {id} — Definition Builder</p>
                            </div>
                        </div>
                        <button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="admin-button-primary px-8"
                        >
                            {saving ? 'Saving...' : 'Save All Changes'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="admin-label">Form Title</label>
                            <input 
                                type="text" className="admin-input"
                                value={form?.title || ''}
                                onChange={e => setForm({...form, title: e.target.value})}
                                placeholder="e.g. Member Onboarding"
                            />
                        </div>
                        <div>
                            <label className="admin-label">Description</label>
                            <input 
                                type="text" className="admin-input"
                                value={form?.description || ''}
                                onChange={e => setForm({...form, description: e.target.value})}
                                placeholder="What is this form for?"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div key={field.id || index} className="admin-card group">
                        {/* Field Header */}
                        <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1 bgColor-white rounded-lg border border-gray-100 shadow-sm">
                                    <Bars3CenterLeftIcon className="w-4 h-4 text-gray-400" />
                                </div>
                                <span className="text-[10px] font-bold tracking-wider uppercase bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                                    {field.field_type}
                                </span>
                                <span className="text-[10px] font-mono text-gray-300">
                                    key: {field.field_key}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => moveField(index, -1)} disabled={index === 0} className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-white rounded-lg transition-all disabled:opacity-0">
                                    <ChevronUpIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="p-1.5 text-gray-300 hover:text-gray-600 hover:bg-white rounded-lg transition-all disabled:opacity-0">
                                    <ChevronDownIcon className="w-4 h-4" />
                                </button>
                                <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                <button onClick={() => handleRemoveField(index)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Field Body */}
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="admin-label">Question Label</label>
                                <input
                                    type="text" value={field.label || ''}
                                    onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                    className="admin-input font-medium" placeholder="Label for this question"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="admin-label">Subtitle / Helper Text</label>
                                    <input
                                        type="text" value={field.subtitle || ''}
                                        onChange={(e) => handleFieldChange(index, 'subtitle', e.target.value)}
                                        className="admin-input" placeholder="Instructional text"
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">Placeholder Text</label>
                                    <input
                                        type="text" value={field.placeholder || ''}
                                        onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)}
                                        className="admin-input" placeholder="Example input..."
                                    />
                                </div>
                            </div>

                            {/* Options Editor */}
                            {(['choice', 'dropdown_choice', 'multiselect'].includes(field.field_type)) && (
                                <div>
                                    <label className="admin-label">Options <span className="text-[10px] text-gray-400 font-normal ml-2">(one per line)</span></label>
                                    <textarea
                                        rows={4}
                                        defaultValue={Array.isArray(field.options) ? field.options.join('\n') : ''}
                                        onBlur={(e) => handleOptionsChange(index, e.target.value)}
                                        className="admin-input font-mono text-xs leading-relaxed"
                                        placeholder="Option A&#10;Option B&#10;Option C"
                                    />
                                </div>
                            )}

                            {/* Toggles */}
                            <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-50">
                                <label className="flex items-center gap-2 cursor-pointer group/label">
                                    <input 
                                        type="checkbox" checked={!!field.is_required}
                                        onChange={(e) => handleFieldChange(index, 'is_required', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" 
                                    />
                                    <span className="text-xs font-semibold text-gray-600 group-hover/label:text-gray-900 transition-colors">Required Field</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group/label">
                                    <input 
                                        type="checkbox" checked={!!field.is_optional}
                                        onChange={(e) => handleFieldChange(index, 'is_optional', e.target.checked ? 1 : 0)}
                                        className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-500" 
                                    />
                                    <span className="text-xs font-semibold text-gray-600 group-hover/label:text-gray-900 transition-colors">Show "Optional" Tag</span>
                                </label>
                                <div className="ml-auto">
                                    <label className="flex items-center gap-2 cursor-pointer p-1.5 px-3 bg-emerald-50 rounded-xl border border-emerald-100 group/label hover:bg-emerald-100 transition-colors">
                                        <input 
                                            type="checkbox" checked={!!field.is_profile}
                                            onChange={(e) => handleFieldChange(index, 'is_profile', e.target.checked ? 1 : 0)}
                                            className="w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500" 
                                        />
                                        <div className="flex items-center gap-1.5">
                                            <IdentificationIcon className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-xs font-bold text-emerald-700">Save to Member Profile</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Field Section */}
                <div className="admin-card bg-gray-50/50 border-dashed border-2 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm mb-4">
                        <PlusIcon className="w-6 h-6 text-sky-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Add New Field</h3>
                    <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">Select a field type to add it to the bottom of the form.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                        {fieldTypes.map(ft => (
                            <button
                                key={ft.type}
                                onClick={() => handleAddField(ft.type)}
                                className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-xs font-bold text-gray-700 hover:border-sky-300 hover:text-sky-600 hover:shadow-md transition-all active:scale-95"
                            >
                                {ft.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Persistent Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pl-72 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-40">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="admin-button-primary px-16 py-3 text-base shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default AdminFormEditor;
