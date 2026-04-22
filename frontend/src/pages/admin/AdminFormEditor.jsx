import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const ConditionValueInput = ({ field, index, fields, handleFieldChange }) => {
    const parent = (fields || []).find(f => f && f.field_key === field.conditions?.field);
    if (parent && (['choice', 'dropdown_choice', 'multiselect'].includes(parent.field_type))) {
        const opts = Array.isArray(parent.options) ? parent.options : [];
        return (
            <select 
                className="admin-input text-xs" 
                value={field.conditions?.value || ''} 
                onChange={e => handleFieldChange(index, 'conditions', {...field.conditions, value: e.target.value})}
            >
                <option value="">Select Value</option>
                {opts.filter(Boolean).map(o => <option key={String(o)} value={String(o)}>{String(o)}</option>)}
            </select>
        );
    }
    return (
        <input 
            className="admin-input text-xs" 
            value={field.conditions?.value || ''} 
            onChange={e => handleFieldChange(index, 'conditions', {...field.conditions, value: e.target.value})}
            placeholder="Target Value"
        />
    );
};

const FormPreview = ({ fields, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    
    // Evaluate conditions locally for the preview
    const checkCondition = (condition, data) => {
        if (!condition) return true;
        const { field, operator, value } = condition;
        const fieldValue = data[field];
        if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
             if (operator === 'neq' && value !== '') return false;
             if (operator !== 'not_empty') return false; 
        }
        if (operator === 'eq') return String(fieldValue) === String(value);
        if (operator === 'neq') return String(fieldValue) !== String(value);
        if (operator === 'contains') return Array.isArray(fieldValue) ? fieldValue.includes(value) : String(fieldValue).includes(value);
        if (operator === 'not_empty') return fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
        return true;
    };

    const filtered = (fields || []).filter(q => checkCondition(q.conditions, formData));
    const currentQ = filtered[currentStep];

    const handleNext = () => {
        if (currentStep < filtered.length - 1) setCurrentStep(s => s + 1);
        else alert("Form Complete (Preview Only)");
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(s => s - 1);
    };

    const handleChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));

    const handleMultiSelect = (field, value) => {
        const current = formData[field] || [];
        if (current.includes(value)) {
            handleChange(field, current.filter(item => item !== value));
        } else {
            handleChange(field, [...current, value]);
        }
    };

    if (!currentQ && fields.length > 0) return <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">No fields match current conditions. <button onClick={onClose} className="ml-4 text-sky-600">Close</button></div>;

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-zinc-100 dark:bg-zinc-800">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-500" 
                    style={{ width: `${((currentStep) / (Math.max(1, filtered.length - 1))) * 100}%` }}
                />
            </div>

            {/* Preview Controls */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-50 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm z-50">
                <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">Preview Mode</span>
                    <span className="text-[10px] text-gray-400">Step {currentStep + 1} of {filtered.length}</span>
                </div>
                <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest">
                    Exit Preview
                </button>
            </div>

            {/* Centered Question Content */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 relative max-w-4xl mx-auto w-full">
                {currentQ ? (
                    <div className="w-full">
                        <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">
                            {currentQ.label}
                            {currentQ.is_optional == 1 && (
                                <span className="ml-3 text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded uppercase tracking-wider align-middle">Optional</span>
                            )}
                        </h2>
                        
                        {currentQ.subtitle && (
                            <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-8 font-light leading-relaxed">
                                {currentQ.subtitle}
                            </p>
                        )}

                        <div className="mt-6 mb-12">
                            {currentQ.field_type === 'text' && (
                                <input
                                    type="text"
                                    value={formData[currentQ.field_key] || ''}
                                    onChange={(e) => handleChange(currentQ.field_key, e.target.value)}
                                    placeholder={currentQ.placeholder}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 outline-none text-2xl py-3 placeholder:text-zinc-200"
                                    autoFocus
                                />
                            )}

                            {currentQ.field_type === 'date' && (
                                <input
                                    type="date"
                                    value={formData[currentQ.field_key] || ''}
                                    onChange={(e) => handleChange(currentQ.field_key, e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 outline-none text-2xl py-3"
                                />
                            )}

                            {currentQ.field_type === 'textarea' && (
                                <textarea
                                    rows={3}
                                    value={formData[currentQ.field_key] || ''}
                                    onChange={(e) => handleChange(currentQ.field_key, e.target.value)}
                                    placeholder={currentQ.placeholder}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 outline-none text-xl py-3 placeholder:text-zinc-200 resize-none"
                                />
                            )}

                            {currentQ.field_type === 'choice' && (
                                <div className="flex flex-col gap-2 max-w-lg">
                                    {(currentQ.options || []).map((opt, i) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                handleChange(currentQ.field_key, opt);
                                                setTimeout(handleNext, 300);
                                            }}
                                            className={`w-full text-left px-5 py-4 rounded-xl border text-lg font-medium transition-all flex items-center justify-between
                                                ${formData[currentQ.field_key] === opt 
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
                                                }`}
                                        >
                                            <span className="flex items-center">
                                                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
                                                {opt}
                                            </span>
                                            {formData[currentQ.field_key] === opt && <span>✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQ.field_type === 'choice_bool' && (
                                <div className="flex flex-col gap-2 max-w-lg">
                                    {['Yes', 'No'].map((opt, i) => {
                                        const isSelected = formData[currentQ.field_key] === (opt === 'Yes');
                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => {
                                                    handleChange(currentQ.field_key, opt === 'Yes');
                                                    setTimeout(handleNext, 300);
                                                }}
                                                className={`w-full text-left px-5 py-4 rounded-xl border text-lg font-medium transition-all flex items-center justify-between
                                                    ${isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-300'
                                                    }`}
                                            >
                                                <span className="flex items-center">
                                                    <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
                                                    {opt}
                                                </span>
                                                {isSelected && <span>✓</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {currentQ.field_type === 'dropdown_choice' && (
                                <div className="relative max-w-lg">
                                    <select
                                        value={formData[currentQ.field_key] || ''}
                                        onChange={(e) => {
                                            handleChange(currentQ.field_key, e.target.value);
                                            if (e.target.value) setTimeout(handleNext, 400);
                                        }}
                                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 outline-none text-2xl py-3 appearance-none cursor-pointer pr-10"
                                    >
                                        <option value="">{currentQ.placeholder || "Select an option..."}</option>
                                        {(currentQ.options || []).map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {currentQ.field_type === 'multiselect' && (
                                <div className="flex flex-wrap gap-2 max-h-[40vh] overflow-y-auto pr-2">
                                    {(currentQ.options || []).map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => handleMultiSelect(currentQ.field_key, opt)}
                                            className={`px-4 py-2 rounded-full border text-base font-medium transition-all ${
                                                (formData[currentQ.field_key] || []).includes(opt)
                                                ? 'border-indigo-600 bg-indigo-600 text-white' 
                                                : 'border-zinc-200 dark:border-zinc-700 text-zinc-600'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQ.field_type === 'file' && (
                                <div className="flex flex-col items-center justify-center w-full max-w-sm h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-zinc-50/50">
                                    <div className="text-zinc-400 text-center">
                                        <span className="text-4xl block mb-2">☁️</span>
                                        <p className="text-sm font-medium">Click to upload file</p>
                                        <p className="text-[10px] mt-1">(Preview Mode Only)</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between w-full">
                            {currentStep > 0 ? (
                                <button onClick={handleBack} className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all">
                                    ←
                                </button>
                            ) : <div className="w-12 h-12" />}

                            <button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center gap-2">
                                {currentStep === filtered.length - 1 ? 'Finish' : 'Next'} <span>→</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400">Add some questions to see them in preview.</div>
                )}
            </div>
            
            {/* Background Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-gray-50/50 dark:from-zinc-950/20 to-transparent pointer-events-none -z-10" />
        </div>
    );
};

const AdminFormEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const handleDragStart = (index) => {
        dragItem.current = index;
    };
    const handleDragEnter = (index) => {
        dragOverItem.current = index;
    };
    const handleDragEnd = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }
        const updated = [...fields];
        const draggedField = updated.splice(dragItem.current, 1)[0];
        updated.splice(dragOverItem.current, 0, draggedField);
        setFields(updated);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const fetchForm = useCallback(async () => {
        try {
            const res = await api.get(`/admin/forms?id=${id}`);
            setForm(res.data.form);
            setFields(res.data.fields || []);
        } catch (error) {
            console.error("Failed to fetch form", error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchForm();
    }, [id, fetchForm]);

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
            is_optional: 0,
            is_profile: 0
        };
        setFields([...fields, newField]);
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
        <div className="admin-container max-w-4xl pb-32 relative">
            {toast && <div className="admin-toast">{toast}</div>}
            {isPreviewOpen && <FormPreview fields={fields} onClose={() => setIsPreviewOpen(false)} />}

            <div className="flex justify-between items-center mb-8">
                <button onClick={() => navigate('/admin/forms')} className="text-gray-500 hover:text-sky-600 text-sm flex items-center gap-2">
                    <span>←</span> Back to Forms
                </button>
                <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100 flex items-center gap-2">
                    <span>👁️</span> Preview Form
                </button>
            </div>

            <div className="admin-card mb-8 p-6 bg-indigo-50/10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-xl font-bold">Form Settings</h1>
                        <p className="text-xs text-gray-400">ID: {id}</p>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="admin-button-primary px-8">
                        {saving ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <input className="admin-input" value={form?.title || ''} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" />
                    <input className="admin-input" value={form?.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" />
                </div>
            </div>

            <div className="space-y-6">
                {fields.map((field, index) => (
                    <div
                        key={field.id || index}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`admin-card p-6 transition-all relative cursor-grab active:cursor-grabbing ${field.conditions ? 'ml-12 border-l-4 border-l-sky-400 bg-sky-25/10' : ''}`}
                    >
                        {field.conditions && (
                            <div className="absolute -left-12 top-10 w-12 h-px bg-sky-200">
                                <div className="absolute -top-2 left-2 text-[8px] font-black text-sky-500 uppercase tracking-tighter">If</div>
                            </div>
                        )}
                        <div className="flex justify-between mb-4 border-b pb-2 items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300 cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⠿</span>
                                <span className="text-xs font-bold uppercase p-1 px-2 bg-sky-50 text-sky-600 rounded">
                                    {fieldTypes.find(t => t.type === field.field_type)?.label || field.field_type}
                                </span>
                                <span className="text-[10px] font-mono text-gray-300">key: {field.field_key}</span>
                            </div>
                            <div className="flex gap-1 items-center">
                                <button onClick={() => moveField(index, -1)} className="p-1 px-2 hover:bg-gray-100 rounded text-[10px]">UP</button>
                                <button onClick={() => moveField(index, 1)} className="p-1 px-2 hover:bg-gray-100 rounded text-[10px]">DOWN</button>
                                <button onClick={() => handleRemoveField(index)} className="p-1 px-2 hover:bg-red-50 text-red-500 rounded text-[10px]">REMOVE</button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Label</label>
                                <input className="admin-input" value={field.label || ''} onChange={e => handleFieldChange(index, 'label', e.target.value)} placeholder="Question Title" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Subtitle</label>
                                    <input className="admin-input" value={field.subtitle || ''} onChange={e => handleFieldChange(index, 'subtitle', e.target.value)} placeholder="Instructional helper text" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Placeholder</label>
                                    <input className="admin-input" value={field.placeholder || ''} onChange={e => handleFieldChange(index, 'placeholder', e.target.value)} placeholder="Value to show in empty field" />
                                </div>
                            </div>
                            
                            {['choice', 'dropdown_choice', 'multiselect'].includes(field.field_type) && (
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Options (one per line)</label>
                                    <textarea 
                                        className="admin-input text-xs font-mono" 
                                        rows={4}
                                        defaultValue={Array.isArray(field.options) ? field.options.join('\n') : ''}
                                        onBlur={e => handleOptionsChange(index, e.target.value)}
                                        placeholder="Option A&#10;Option B"
                                    />
                                </div>
                            )}

                            <div className="pt-3 border-t mt-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase">Field Configuration</h4>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer">
                                            <input type="checkbox" checked={!!field.is_required} onChange={e => handleFieldChange(index, 'is_required', e.target.checked ? 1 : 0)} />
                                            REQUIRED
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer">
                                            <input type="checkbox" checked={!!field.is_optional} onChange={e => handleFieldChange(index, 'is_optional', e.target.checked ? 1 : 0)} />
                                            SHOW "OPTIONAL" TAG
                                        </label>
                                        <label className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 cursor-pointer bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            <input type="checkbox" checked={!!field.is_profile} onChange={e => handleFieldChange(index, 'is_profile', e.target.checked ? 1 : 0)} />
                                            👤 SYNC TO PROFILE
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold text-gray-500 cursor-pointer mb-2">
                                        <input 
                                            type="checkbox" 
                                            checked={!!field.conditions} 
                                            onChange={e => handleFieldChange(index, 'conditions', e.target.checked ? {field: '', operator: 'eq', value: ''} : null)} 
                                        />
                                        ENABLE CONDITIONAL LOGIC
                                    </label>
                                    {field.conditions && (
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-2">
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Show if Field:</label>
                                                <select 
                                                    className="admin-input py-1 text-xs" 
                                                    value={field.conditions.field || ''} 
                                                    onChange={e => handleFieldChange(index, 'conditions', {...field.conditions, field: e.target.value})}
                                                >
                                                    <option value="">Select Field</option>
                                                    {fields.slice(0, index).filter(f => f.field_key).map(f => <option key={f.field_key} value={f.field_key}>{f.label || f.field_key}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Operator:</label>
                                                <select 
                                                    className="admin-input py-1 text-xs" 
                                                    value={field.conditions.operator || 'eq'} 
                                                    onChange={e => handleFieldChange(index, 'conditions', {...field.conditions, operator: e.target.value})}
                                                >
                                                    <option value="eq">Equals</option>
                                                    <option value="neq">Not Equals</option>
                                                    <option value="contains">Contains</option>
                                                    <option value="not_empty">Is Not Empty</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-bold text-gray-400 block mb-0.5">Target Value:</label>
                                                <ConditionValueInput field={field} index={index} fields={fields} handleFieldChange={handleFieldChange} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* Floating Add Field Panel — Google Forms style */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2">
                {/* Toggle button */}
                <button
                    onClick={() => setIsAddPanelOpen(!isAddPanelOpen)}
                    className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg font-bold transition-all duration-200 border-2 ${
                        isAddPanelOpen
                            ? 'bg-gray-800 text-white border-gray-700 rotate-45'
                            : 'bg-white text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:shadow-xl'
                    }`}
                    title="Add new field"
                >
                    +
                </button>

                {/* Panel */}
                {isAddPanelOpen && (
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 w-44 animate-in fade-in slide-in-from-right-2 duration-200">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">Add Field</p>
                        <div className="flex flex-col gap-1">
                            {fieldTypes.map(ft => (
                                <button
                                    key={ft.type}
                                    onClick={() => { handleAddField(ft.type); setIsAddPanelOpen(false); }}
                                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    {ft.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminFormEditor;
