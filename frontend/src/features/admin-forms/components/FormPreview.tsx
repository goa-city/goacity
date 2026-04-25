import React, { useState } from 'react';
import { FormField } from '../api/admin-forms.api';
import Button from '../../../shared/components/ui/Button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse, isValid } from 'date-fns';
import { 
    XMarkIcon, 
    ArrowRightIcon, 
    ArrowLeftIcon,
    CheckIcon,
    CalendarIcon,
    CloudArrowUpIcon,
    ChevronRightIcon
} from '@heroicons/react/24/solid';

interface FormPreviewProps {
    fields: FormField[];
    onClose: () => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ fields, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [validationError, setValidationError] = useState<string | null>(null);

    const checkCondition = (logic: any, data: any) => {
        if (!logic || !logic.field) return true;
        const fieldValue = data[logic.field];
        const targetValue = logic.value;

        switch (logic.operator) {
            case 'eq': return String(fieldValue) === String(targetValue);
            case 'neq': return String(fieldValue) !== String(targetValue);
            case 'contains': return Array.isArray(fieldValue) ? fieldValue.includes(targetValue) : String(fieldValue).includes(targetValue);
            case 'not_empty': return fieldValue && fieldValue.length > 0;
            default: return true;
        }
    };

    const activeFields = fields.filter(f => checkCondition(f.conditional_logic, responses));
    const currentField = activeFields[currentStep];

    const handleNext = (incomingValue?: any) => {
        // Validation logic
        if (currentField?.required && currentField.field_type !== 'intro') {
            const val = incomingValue !== undefined ? incomingValue : responses[currentField.field_key];
            const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
            
            if (isEmpty) {
                setValidationError("This field is required to continue.");
                return;
            }
        }

        setValidationError(null);
        if (currentStep < activeFields.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            alert('Form Complete (Preview Mode)');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setValidationError(null);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleChange = (key: string, value: any) => {
        setValidationError(null);
        setResponses({ ...responses, [key]: value });
    };

    if (!currentField && fields.length > 0) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6">
                <p className="text-zinc-400 font-black uppercase tracking-widest text-sm mb-4">No fields match current logic</p>
                <Button onClick={onClose}>Exit Preview</Button>
            </div>
        );
    }

    const rawOptions = currentField?.field_type === 'choice_bool'
        ? ['Yes', 'No']
        : (Array.isArray(currentField?.options) ? currentField.options : []);
    const options = rawOptions.filter(Boolean);

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-zinc-950 flex flex-col animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex justify-between items-center px-8 py-6 border-b border-zinc-50 dark:border-zinc-900">
                <div className="flex items-center gap-4">
                    <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200/50">
                        Preview Mode
                    </span>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Question {currentStep + 1} of {activeFields.length}
                    </span>
                </div>
                <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="w-8 h-8" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-zinc-50 dark:bg-zinc-900">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-700 ease-out"
                    style={{ width: `${((currentStep + 1) / activeFields.length) * 100}%` }}
                />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full px-8 pb-20">
                <div className="w-full space-y-8">

                    {/* Title + Required/Optional Tags */}
                    <div>
                        <h2 className={`font-black text-zinc-900 dark:text-white tracking-tight leading-tight ${currentField.field_type === 'intro' ? 'text-2xl md:text-4xl text-center' : 'text-xl md:text-3xl'}`}>
                            {currentField.label}
                            {currentField.required && currentField.field_type !== 'intro' && <span className="text-red-500 ml-1">*</span>}
                        </h2>
                        {(currentField as any).is_optional && currentField.field_type !== 'intro' && (
                            <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">Optional</span>
                        )}
                    </div>

                    {/* Subtitle */}
                    {(currentField as any).subtitle && (
                        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed w-full">
                            {(currentField as any).subtitle}
                        </p>
                    )}

                    {/* Field Renderer */}
                    <div className="w-full">
                        {/* Text */}
                        {currentField.field_type === 'text' && (
                            <input 
                                type="text"
                                className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-indigo-600 outline-none text-xl sm:text-2xl font-bold py-4 transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                                placeholder={currentField.placeholder || "Type your answer here..."}
                                value={responses[currentField.field_key] || ''}
                                onChange={(e) => handleChange(currentField.field_key, e.target.value)}
                            />
                        )}

                        {/* Textarea */}
                        {currentField.field_type === 'textarea' && (
                            <textarea 
                                rows={3}
                                className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-indigo-600 outline-none text-lg sm:text-xl font-bold py-4 transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800 resize-none"
                                placeholder={currentField.placeholder || "Type your answer here..."}
                                value={responses[currentField.field_key] || ''}
                                onChange={(e) => handleChange(currentField.field_key, e.target.value)}
                            />
                        )}

                        {/* Date */}
                        {currentField.field_type === 'date' && (
                            <div className="relative">
                                <DatePicker
                                    selected={responses[currentField.field_key] ? parse(responses[currentField.field_key], 'yyyy-MM-dd', new Date()) : null}
                                    onChange={(date) => handleChange(currentField.field_key, date && isValid(date) ? format(date, 'yyyy-MM-dd') : '')}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-indigo-600 outline-none text-xl sm:text-2xl font-bold py-4 transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                                    showYearDropdown
                                    scrollableYearDropdown
                                    yearDropdownItemNumber={100}
                                    maxDate={new Date()}
                                />
                                <CalendarIcon className="w-8 h-8 absolute right-0 top-1/2 -translate-y-1/2 text-zinc-200 dark:text-zinc-800 pointer-events-none" />
                            </div>
                        )}

                        {/* Choice / Choice Bool */}
                        {['choice', 'choice_bool'].includes(currentField.field_type) && (
                            <div className="flex flex-col gap-3 max-w-xl">
                                {options.map((opt: string, i: number) => {
                                    const isSelected = currentField.field_type === 'choice_bool'
                                        ? (responses[currentField.field_key] !== undefined && responses[currentField.field_key] === (opt === 'Yes'))
                                        : responses[currentField.field_key] === opt;
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                const newVal = currentField.field_type === 'choice_bool' ? (opt === 'Yes') : opt;
                                                handleChange(currentField.field_key, newVal);
                                                setTimeout(() => handleNext(newVal), 300);
                                            }}
                                            className={`w-full text-left px-6 py-4 rounded-xl border-2 text-base font-bold transition-all flex items-center justify-between group
                                                ${isSelected 
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300' 
                                                    : 'border-zinc-100 dark:border-zinc-900 text-zinc-500 hover:border-indigo-200 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                                }`}
                                        >
                                            <span className="flex items-center">
                                                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-[10px] mr-4 opacity-40 font-black">{String.fromCharCode(65 + i)}</span>
                                                {opt}
                                            </span>
                                            {isSelected && <CheckIcon className="w-5 h-5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Dropdown */}
                        {currentField.field_type === 'dropdown_choice' && (
                            <div className="relative max-w-xl">
                                <select
                                    value={responses[currentField.field_key] || ''}
                                    onChange={(e) => handleChange(currentField.field_key, e.target.value)}
                                    className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-indigo-600 outline-none text-xl py-4 font-bold transition-colors cursor-pointer appearance-none"
                                >
                                    <option value="">{currentField.placeholder || "Select an option"}</option>
                                    {options.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <ChevronRightIcon className="w-6 h-6 absolute right-0 top-1/2 -translate-y-1/2 text-zinc-200 rotate-90 pointer-events-none" />
                            </div>
                        )}

                        {/* Multi-select */}
                        {currentField.field_type === 'multiselect' && (
                            <div className="flex flex-wrap gap-3">
                                {options.map((opt: string) => {
                                    const vals = Array.isArray(responses[currentField.field_key]) ? responses[currentField.field_key] : [];
                                    const selected = vals.includes(opt);
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleChange(currentField.field_key, selected ? vals.filter((v: string) => v !== opt) : [...vals, opt])}
                                            className={`px-6 py-3 rounded-xl border-2 text-base font-bold transition-all ${
                                                selected
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                                : 'border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-indigo-200'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* File */}
                        {currentField.field_type === 'file' && (
                            <div className="mt-4">
                                <label className="flex flex-col items-center justify-center w-48 h-48 border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-xl hover:border-indigo-600 transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900/50">
                                    <CloudArrowUpIcon className="w-10 h-10 text-zinc-200 dark:text-zinc-800 mb-3" />
                                    <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Upload File</span>
                                    <input type="file" className="hidden" onChange={() => {}} />
                                </label>
                            </div>
                        )}

                        {/* Intro */}
                        {currentField.field_type === 'intro' && (
                            <div className="text-center py-8">
                                <p className="text-zinc-400 text-sm font-medium">This is an intro screen. Press Next to continue.</p>
                            </div>
                        )}

                        {validationError && (
                            <p className="mt-6 text-red-500 font-bold text-sm flex items-center gap-2 animate-pulse">
                                <span className="w-2 h-2 bg-red-500 rounded-full" />
                                {validationError}
                            </p>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-8">
                        {currentStep > 0 ? (
                            <button onClick={handleBack} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 transition-all text-zinc-500">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                        ) : <div />}

                        <Button 
                            onClick={handleNext}
                            className="h-14 px-10 rounded-xl text-base shadow-2xl shadow-indigo-600/20"
                        >
                            {currentStep === activeFields.length - 1 ? 'Finish' : 'Next'}
                            <ArrowRightIcon className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormPreview;
