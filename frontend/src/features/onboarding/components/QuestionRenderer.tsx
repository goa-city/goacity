import React from 'react';
import { CheckIcon, CalendarIcon, CloudArrowUpIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse, isValid } from 'date-fns';
import { OnboardingQuestion } from '../types/onboarding.types';

interface QuestionRendererProps {
    question: OnboardingQuestion;
    value: any;
    onChange: (field: string, value: any) => void;
    onNext: (value?: any) => void;
    inputRef?: React.Ref<any>;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, value, onChange, onNext, inputRef }) => {
    if (!question) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey && !['textarea', 'intro'].includes(question.type)) {
            e.preventDefault();
            onNext();
        }
    };

    switch (question.type) {
        case 'text':
            return (
                <input
                    ref={inputRef}
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(question.field, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={question.placeholder}
                    className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-primary dark:focus:border-primary text-xl sm:text-2xl py-4 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 font-bold transition-colors"
                />
            );

        case 'textarea':
            return (
                <textarea
                    ref={inputRef}
                    rows={2}
                    value={value || ''}
                    onChange={(e) => onChange(question.field, e.target.value)}
                    placeholder={question.placeholder}
                    className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-primary dark:focus:border-primary text-lg sm:text-xl py-4 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 font-bold transition-colors resize-none leading-tight"
                />
            );

        case 'date':
            return (
                <div className="relative">
                    <DatePicker
                        selected={value ? parse(value, 'yyyy-MM-dd', new Date()) : null}
                        onChange={(date: Date | null) => onChange(question.field, date && isValid(date) ? format(date, 'yyyy-MM-dd') : '')}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="DD/MM/YYYY"
                        className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-primary dark:focus:border-primary text-xl sm:text-2xl py-4 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-200 dark:placeholder:text-zinc-800 font-bold transition-colors"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        maxDate={new Date()}
                        autoFocus
                    />
                    <CalendarIcon className="w-10 h-10 absolute right-0 top-1/2 -translate-y-1/2 text-zinc-200 dark:text-zinc-800 pointer-events-none" />
                </div>
            );

        case 'choice':
        case 'choice_bool':
            const rawOptions = question.type === 'choice_bool' 
                ? (Array.isArray(question.options) && question.options.length > 0 ? question.options : ['Yes', 'No'])
                : (question.options || []);
            const options = Array.isArray(rawOptions) ? rawOptions.filter(Boolean) : [];
            return (
                <div className="flex flex-col gap-3 max-w-xl">
                    {options.map((opt, i) => {
                        const isSelected = question.type === 'choice_bool' 
                            ? (value !== '' && value !== undefined && value !== null && value === (i === 0)) 
                            : (value === opt);
                        return (
                            <button
                                key={opt}
                                onClick={() => {
                                    const newVal = question.type === 'choice_bool' ? (i === 0) : opt;
                                    onChange(question.field, newVal);
                                    setTimeout(() => onNext(newVal), 300);
                                }}
                                className={`w-full text-left px-6 py-4 rounded-xl border-2 text-base font-bold transition-all flex items-center justify-between group
                                    ${isSelected 
                                        ? 'border-primary bg-primary/5 text-primary' 
                                        : 'border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-primary/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                            >
                                <span className="flex items-center">
                                    <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-[10px] mr-5 opacity-40 font-black">{String.fromCharCode(65 + i)}</span>
                                    {opt}
                                </span>
                                {isSelected && <CheckIcon className="w-6 h-6" />}
                            </button>
                        );
                    })}
                </div>
            );

        case 'multiselect':
            const currentValues = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-3 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    {question.options?.map(opt => (
                        <button
                            key={opt}
                            onClick={() => {
                                const newVal = currentValues.includes(opt) 
                                    ? currentValues.filter(v => v !== opt) 
                                    : [...currentValues, opt];
                                onChange(question.field, newVal);
                            }}
                            className={`px-6 py-3 rounded-xl border-2 text-base font-bold transition-all ${
                                currentValues.includes(opt)
                                ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20' 
                                : 'border-zinc-100 dark:border-zinc-900 text-zinc-400 hover:border-primary/30'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            );

        case 'file':
            const isBase64 = typeof value === 'string' && value.startsWith('data:image');
            const previewUrl = value instanceof File 
                ? URL.createObjectURL(value) 
                : (isBase64 ? value : (typeof value === 'string' && value ? (value.startsWith('http') ? value : `/uploads/${value}`) : ''));

            return (
                <div className="mt-4">
                    <label className="flex flex-col items-center justify-center w-56 h-56 border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-xl hover:border-primary transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden group">
                        {previewUrl ? (
                            <>
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-black uppercase text-xs tracking-widest">Change Image</span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-8">
                                <CloudArrowUpIcon className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Upload Profile Art</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={async (e) => {
                                const file = e.target.files ? e.target.files[0] : null;
                                if (file) {
                                    // Always resize to Base64 as requested for better reliability
                                    try {
                                        const { resizeImageToBase64 } = await import('../../../utils/image');
                                        const base64 = await resizeImageToBase64(file);
                                        onChange(question.field, base64);
                                    } catch (err) {
                                        console.error("Image processing failed:", err);
                                        onChange(question.field, file); // Fallback to raw file if resize fails
                                    }
                                }
                            }} 
                        />
                    </label>
                </div>
            );

        case 'dropdown_choice':
            return (
                <div className="relative max-w-xl">
                    <select
                        ref={inputRef}
                        value={value || ''}
                        onChange={(e) => onChange(question.field, e.target.value)}
                        className="w-full bg-transparent border-b-3 border-zinc-100 dark:border-zinc-900 focus:border-primary dark:focus:border-primary text-xl py-4 outline-none text-zinc-900 dark:text-white font-bold transition-colors cursor-pointer appearance-none"
                    >
                        <option value="" className="text-zinc-400">{question.placeholder || "Select an option"}</option>
                        {question.options?.filter(Boolean).map(opt => (
                            <option key={opt} value={opt} className="text-zinc-900">{opt}</option>
                        ))}
                    </select>
                    <ChevronRightIcon className="w-8 h-8 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-200 dark:text-zinc-800 pointer-events-none rotate-90" />
                </div>
            );

        default:
            return null;
    }
};

export default QuestionRenderer;
