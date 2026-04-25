import React from 'react';
import { Card, CardContent } from '../../../shared/components/ui/Card';
import Input from '../../../shared/components/ui/Input';
import { FormField } from '../api/admin-forms.api';
import { 
    TrashIcon, 
    UserCircleIcon,
    VariableIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '@heroicons/react/24/solid';

interface FormFieldCardProps {
    field: FormField;
    index: number;
    totalFields: number;
    allFields: FormField[];
    onChange: (field: FormField) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

const FormFieldCard: React.FC<FormFieldCardProps> = ({ field, index, totalFields, allFields, onChange, onRemove, onMoveUp, onMoveDown }) => {
    
    const handleOptionChange = (valueString: string) => {
        const options = valueString.split('\n').map(s => s.trim());
        onChange({ ...field, options });
    };

    const hasOptions = ['choice', 'dropdown_choice', 'multiselect'].includes(field.field_type);

    return (
        <Card className="border-zinc-100 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none relative overflow-visible">
            <CardContent className="p-6">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-6 border-b border-zinc-50 dark:border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                        {/* Up/Down Arrows */}
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={onMoveUp}
                                disabled={index === 0}
                                className="p-1 rounded text-zinc-300 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                title="Move Up"
                            >
                                <ChevronUpIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onMoveDown}
                                disabled={index === totalFields - 1}
                                className="p-1 rounded text-zinc-300 hover:text-indigo-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                title="Move Down"
                            >
                                <ChevronDownIcon className="w-4 h-4" />
                            </button>
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                            {field.field_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-300">#{index + 1} · {field.field_key}</span>
                    </div>
                    <button onClick={onRemove} className="text-zinc-300 hover:text-red-500 transition-colors">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Label */}
                    <Input 
                        label="Question Label"
                        value={field.label || ''}
                        onChange={(e) => onChange({ ...field, label: e.target.value })}
                        placeholder="e.g. What is your full name?"
                    />

                    {/* Subtitle */}
                    <Input 
                        label="Subheading / Subtitle (optional)"
                        value={(field as any).subtitle || ''}
                        onChange={(e) => onChange({ ...field, subtitle: e.target.value } as any)}
                        placeholder="e.g. This will appear below the question title"
                    />

                    {/* Placeholder */}
                    {!hasOptions && field.field_type !== 'file' && field.field_type !== 'intro' && (
                        <Input 
                            label="Placeholder Text (optional)"
                            value={field.placeholder || ''}
                            onChange={(e) => onChange({ ...field, placeholder: e.target.value } as any)}
                            placeholder="e.g. Type your answer here..."
                        />
                    )}

                    {/* Options */}
                    {hasOptions && (
                        <div>
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 block mb-2">
                                Options (One per line)
                            </label>
                            <textarea 
                                className="w-full min-h-[120px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-mono"
                                value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                                onChange={(e) => handleOptionChange(e.target.value)}
                                placeholder={"Option 1\nOption 2\nOption 3"}
                            />
                        </div>
                    )}

                    {/* Settings Toggles */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={field.required || false}
                                onChange={(e) => onChange({ ...field, required: e.target.checked })}
                                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">Required</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={(field as any).is_optional || false}
                                onChange={(e) => onChange({ ...field, is_optional: e.target.checked } as any)}
                                className="w-4 h-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-400"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 group-hover:text-amber-600 transition-colors">Show Optional Tag</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={field.is_profile || false}
                                onChange={(e) => onChange({ ...field, is_profile: e.target.checked })}
                                className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                                <UserCircleIcon className="w-3.5 h-3.5" /> Sync to Profile
                            </span>
                        </label>
                    </div>

                    {/* Conditional Logic */}
                    <div className="pt-2">
                        <button 
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors"
                            onClick={() => onChange({ ...field, conditional_logic: field.conditional_logic ? null : { field: '', operator: 'eq', value: '' } })}
                        >
                            <VariableIcon className="w-4 h-4" />
                            {field.conditional_logic ? 'Disable Logic' : 'Enable Conditional Logic'}
                        </button>
                        
                        {field.conditional_logic && (
                            <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">If Field</label>
                                    <select 
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold px-3 outline-none"
                                        value={field.conditional_logic.field}
                                        onChange={(e) => onChange({ ...field, conditional_logic: { ...field.conditional_logic, field: e.target.value } })}
                                    >
                                        <option value="">Select Field</option>
                                        {allFields.slice(0, index).map(f => (
                                            <option key={f.field_key} value={f.field_key}>{f.label || f.field_key}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Operator</label>
                                    <select 
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold px-3 outline-none"
                                        value={field.conditional_logic.operator}
                                        onChange={(e) => onChange({ ...field, conditional_logic: { ...field.conditional_logic, operator: e.target.value } })}
                                    >
                                        <option value="eq">Equals</option>
                                        <option value="neq">Does not equal</option>
                                        <option value="contains">Contains</option>
                                        <option value="not_empty">Is not empty</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Value</label>
                                    <input 
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-bold px-3 outline-none"
                                        value={field.conditional_logic.value}
                                        onChange={(e) => onChange({ ...field, conditional_logic: { ...field.conditional_logic, value: e.target.value } })}
                                        placeholder="Target value"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default FormFieldCard;
