import React, { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminForms } from '../hooks/useAdminForms';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import FormFieldCard from './FormFieldCard';
import FormPreview from './FormPreview';
import { FormField, AdminUser, fetchAdmins } from '../api/admin-forms.api';
import {
    PlusIcon,
    EyeIcon, 
    CheckIcon,
} from '@heroicons/react/24/solid';
import { ArrowLeftIcon as ArrowLeftOutline } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

const FormEditor: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { form, isLoading, saveForm, isSaving } = useAdminForms(Number(id));
    
    const [fields, setFields] = useState<FormField[]>([]);
    const [formInfo, setFormInfo] = useState({ 
        title: '', 
        description: '',
        fields_per_page: 1,
        visibility: 'members' as 'members' | 'public',
        redirect_url: '',
        notify_admin: false,
        notify_admin_ids: ''
    });
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [addAtIndex, setAddAtIndex] = useState<number | null>(null);

    useEffect(() => {
        const loadAdmins = async () => {
            try {
                const data = await fetchAdmins();
                setAdmins(data);
            } catch (err) {
                console.error("Failed to load admins", err);
            }
        };
        loadAdmins();
    }, []);

    useEffect(() => {
        if (form) {
            // Normalize fields from DB so subtitle/placeholder/is_optional are populated
            const normalized = (form.fields || []).map((f: any) => ({
                ...f,
                label: f.label || '',
                subtitle: f.subtitle || '',
                placeholder: f.placeholder || '',
                required: f.is_required === 1 || f.required === true,
                is_optional: f.is_optional === 1 || (f as any).is_optional === true,
                is_profile: f.is_profile === 1 || f.is_profile === true,
                options: Array.isArray(f.options) ? f.options : (
                    f.options ? (
                        typeof f.options === 'string' 
                            ? f.options.split(',').map((s: string) => s.trim()) 
                            : Object.values(f.options)
                    ) : []
                ),
                conditional_logic: f.conditions && Object.keys(f.conditions).length > 0
                    ? f.conditions
                    : null,
            }));
            setFields(normalized);
            setFormInfo({ 
                title: form.title || '', 
                description: form.description || '',
                fields_per_page: form.fields_per_page ?? 1,
                visibility: form.visibility || 'members',
                redirect_url: form.redirect_url || '',
                notify_admin: !!form.notify_admin,
                notify_admin_ids: form.notify_admin_ids || ''
            });
        }
    }, [form]);

    const handleAddField = (type: string, index?: number) => {
        const newField: FormField = {
            field_key: `q_${Date.now()}`,
            field_type: type,
            label: 'New Question',
            subtitle: '',
            placeholder: '',
            required: false,
            is_optional: false,
            is_profile: false,
            options: []
        } as any;
        
        const insertIndex = index !== undefined ? index : fields.length;
        const newFields = [...fields];
        newFields.splice(insertIndex, 0, newField);
        setFields(newFields);
        setAddAtIndex(null);
    };

    const handleUpdateField = (index: number, updatedField: FormField) => {
        const newFields = [...fields];
        newFields[index] = updatedField;
        setFields(newFields);
    };

    const handleRemoveField = (index: number) => {
        setFields(fields.filter((_, i) => i !== index));
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newFields = [...fields];
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
        setFields(newFields);
    };

    const handleMoveDown = (index: number) => {
        if (index === fields.length - 1) return;
        const newFields = [...fields];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        setFields(newFields);
    };

    const handleSave = async () => {
        await saveForm({
            ...formInfo,
            fields: fields.map((f, i) => ({
                ...f,
                sort_order: i,
                options: Array.isArray(f.options) 
                    ? f.options.map(o => typeof o === 'string' ? o.trim() : o).filter(Boolean) 
                    : f.options,
                // Map frontend keys back to DB keys
                is_required: (f as any).required ? 1 : 0,
                is_optional: (f as any).is_optional ? 1 : 0,
                is_profile: (f as any).is_profile ? 1 : 0,
                conditions: (f as any).conditional_logic || {},
            }))
        });
    };

    if (isLoading) return <div className="p-10 animate-pulse text-zinc-400 font-black uppercase text-center tracking-widest">Building your dynamic form...</div>;

    const fieldTypes = [
        { type: 'intro', label: '🌟 Intro Screen' },
        { type: 'text', label: '📝 Short Text' },
        { type: 'textarea', label: '📄 Long Text' },
        { type: 'choice', label: '🔘 Single Choice' },
        { type: 'choice_bool', label: '✅ Yes / No' },
        { type: 'dropdown_choice', label: '📋 Dropdown' },
        { type: 'multiselect', label: '☑️ Multi-Select' },
        { type: 'date', label: '📅 Date Picker' },
        { type: 'file', label: '📎 File Upload' },
    ];

    const FieldTypeMenu: React.FC<{ onSelect: (type: string) => void }> = ({ onSelect }) => (
        <Card className="shadow-2xl border-zinc-100 dark:border-zinc-800 p-3 w-52 mb-2 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="grid grid-cols-1 gap-1">
                {fieldTypes.map(ft => (
                    <button
                        key={ft.type}
                        onClick={() => onSelect(ft.type)}
                        className="w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:text-indigo-600 transition-colors"
                    >
                        {ft.label}
                    </button>
                ))}
            </div>
        </Card>
    );

    const InsertPoint: React.FC<{ index: number }> = ({ index }) => (
        <div className="relative h-8 flex items-center justify-center group/insert">
            <div className={`absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent transition-opacity ${addAtIndex === index ? 'opacity-100' : 'opacity-0 group-hover/insert:opacity-100'}`} />
            <button
                onClick={() => setAddAtIndex(addAtIndex === index ? null : index)}
                className={`z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg transition-all hover:border-indigo-500 hover:text-indigo-600 text-[10px] font-black uppercase tracking-widest ${addAtIndex === index ? 'opacity-100 border-indigo-500 text-indigo-600 ring-4 ring-indigo-500/10' : 'opacity-0 group-hover/insert:opacity-100 text-zinc-400'}`}
            >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Insert Question</span>
            </button>
            {addAtIndex === index && (
                <div className="absolute top-full mt-2 z-50">
                    <FieldTypeMenu onSelect={(type) => handleAddField(type, index)} />
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            {isPreviewOpen && (
                <FormPreview 
                    fields={fields} 
                    fieldsPerPage={formInfo.fields_per_page}
                    onClose={() => setIsPreviewOpen(false)} 
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <button 
                    onClick={() => navigate('/admin/forms')} 
                    className="flex items-center text-zinc-500 hover:text-zinc-800 transition-colors group"
                >
                    <ArrowLeftOutline className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform stroke-[1.5]" />
                    <span className="text-xl font-medium">Back to Forms</span>
                </button>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setIsPreviewOpen(true)} className="px-6">
                        <EyeIcon className="w-4 h-4 mr-2" /> Preview
                    </Button>
                    <Button onClick={handleSave} isLoading={isSaving} className="px-8 shadow-xl shadow-indigo-600/20">
                        <CheckIcon className="w-4 h-4 mr-2" /> Save Form
                    </Button>
                </div>
            </div>

            {/* Form Settings */}
            <Card className="mb-10 border-zinc-100 dark:border-zinc-800 bg-indigo-50/20 dark:bg-indigo-950/10">
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="Form Title"
                            value={formInfo.title}
                            onChange={(e) => setFormInfo({ ...formInfo, title: e.target.value })}
                            className="bg-white dark:bg-zinc-950"
                        />
                        <Input 
                            label="Description"
                            value={formInfo.description}
                            onChange={(e) => setFormInfo({ ...formInfo, description: e.target.value })}
                            className="bg-white dark:bg-zinc-950"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Form Configurations */}
            <Card className="mb-10 border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <CardContent className="p-8">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        Form Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Visibility & Pagination */}
                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Visibility</label>
                                <select 
                                    value={formInfo.visibility}
                                    onChange={(e) => setFormInfo({ ...formInfo, visibility: e.target.value as any })}
                                    className="admin-input w-full"
                                >
                                    <option value="members">Members Only (Requires Login)</option>
                                    <option value="public">Public (Anyone can access)</option>
                                </select>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Questions per Page</label>
                                <select 
                                    value={formInfo.fields_per_page}
                                    onChange={(e) => setFormInfo({ ...formInfo, fields_per_page: Number(e.target.value) })}
                                    className="admin-input w-full"
                                >
                                    <option value={1}>1 Question per page (Standard)</option>
                                    <option value={2}>2 Questions per page</option>
                                    <option value={3}>3 Questions per page</option>
                                    <option value={5}>5 Questions per page</option>
                                    <option value={0}>Show all questions on one page</option>
                                </select>
                            </div>
                        </div>

                        {/* Redirection & Notifications */}
                        <div className="space-y-6">
                            <Input 
                                label="Success Redirect URL"
                                placeholder="/dashboard"
                                value={formInfo.redirect_url || ''}
                                onChange={(e) => setFormInfo({ ...formInfo, redirect_url: e.target.value })}
                                className="bg-zinc-50 dark:bg-zinc-900/50"
                            />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox"
                                        id="notify_admin"
                                        checked={formInfo.notify_admin}
                                        onChange={(e) => setFormInfo({ ...formInfo, notify_admin: e.target.checked })}
                                        className="w-5 h-5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="notify_admin" className="text-xs font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                        Notify admins on new submission
                                    </label>
                                </div>

                                {formInfo.notify_admin && (
                                    <div className="space-y-1.5 pl-8 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admins to Notify</label>
                                        <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 custom-scrollbar">
                                            {admins.length > 0 ? admins.map(admin => {
                                                const selectedIds = formInfo.notify_admin_ids ? formInfo.notify_admin_ids.split(',').filter(Boolean) : [];
                                                const isSelected = selectedIds.includes(String(admin.id));
                                                return (
                                                    <label key={admin.id} className="flex items-center gap-3 cursor-pointer group">
                                                        <input 
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                let newIds = [...selectedIds];
                                                                if (e.target.checked) newIds.push(String(admin.id));
                                                                else newIds = newIds.filter(id => id !== String(admin.id));
                                                                setFormInfo({ ...formInfo, notify_admin_ids: newIds.join(',') });
                                                            }}
                                                            className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                        <span className="text-[11px] font-medium text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                                                            {admin.full_name} ({admin.email})
                                                        </span>
                                                    </label>
                                                );
                                            }) : (
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center py-2">No other admins found</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Question count */}
            {fields.length > 0 && (
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">
                    {fields.length} question{fields.length !== 1 ? 's' : ''}
                </p>
            )}

            {/* Field List */}
            <div className="space-y-0">
                {fields.map((field, index) => (
                    <Fragment key={`${field.field_key}-${index}`}>
                        <InsertPoint index={index} />
                        <FormFieldCard 
                            field={field}
                            index={index}
                            totalFields={fields.length}
                            allFields={fields}
                            onChange={(updated) => handleUpdateField(index, updated)}
                            onRemove={() => handleRemoveField(index)}
                            onMoveUp={() => handleMoveUp(index)}
                            onMoveDown={() => handleMoveDown(index)}
                        />
                    </Fragment>
                ))}

                {fields.length > 0 && <InsertPoint index={fields.length} />}

                {fields.length === 0 && (
                    <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <p className="text-zinc-400 font-black uppercase tracking-widest text-sm">Your form is empty</p>
                        <p className="text-zinc-500 mt-1">Click the + button below to add your first question.</p>
                        <div className="mt-6 flex justify-center">
                            <InsertPoint index={0} />
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-3">
                {addAtIndex === fields.length && (
                    <FieldTypeMenu onSelect={(type) => handleAddField(type, fields.length)} />
                )}
                <button
                    onClick={() => setAddAtIndex(addAtIndex === fields.length ? null : fields.length)}
                    className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
                        addAtIndex === fields.length ? 'bg-zinc-900 rotate-45' : 'bg-indigo-600 hover:scale-110 active:scale-95'
                    }`}
                >
                    <PlusIcon className="w-8 h-8 text-white" />
                </button>
            </div>
        </div>
    );
};

export default FormEditor;
