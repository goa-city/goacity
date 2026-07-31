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
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary text-base sm:text-lg py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-semibold transition-colors"
                />
            );

        case 'number_field':
            return (
                <input
                    ref={inputRef}
                    type="number"
                    value={value !== undefined && value !== null ? value : ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(question.field, val === '' ? '' : Number(val));
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={question.placeholder}
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary text-base sm:text-lg py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-semibold transition-colors"
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
                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary text-base sm:text-lg py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-semibold transition-colors resize-none leading-relaxed"
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
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary text-base sm:text-lg py-2.5 outline-none text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 font-semibold transition-colors"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                        maxDate={new Date()}
                        autoFocus
                    />
                    <CalendarIcon className="w-6 h-6 absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none" />
                </div>
            );

        case 'choice':
        case 'choice_bool':
            const rawOptions = question.type === 'choice_bool'
                ? (Array.isArray(question.options) && question.options.length > 0 ? question.options : ['Yes', 'No'])
                : (question.options || []);
            let options = Array.isArray(rawOptions) ? rawOptions.filter(Boolean) : [];
            if (question.type === 'choice' && question.show_other) {
                options = [...options, 'Other'];
            }
            const isOtherActive = question.type === 'choice' && question.show_other && value !== undefined && value !== null && value !== '' && !rawOptions.filter(Boolean).includes(value);
            return (
                <div className="flex flex-col gap-2 max-w-xl">
                    {options.map((opt, i) => {
                        const isSelected = question.type === 'choice_bool'
                            ? (value !== '' && value !== undefined && value !== null && value === (i === 0))
                            : (opt === 'Other'
                                ? (value !== undefined && value !== null && value !== '' && !rawOptions.filter(Boolean).includes(value))
                                : (value === opt));
                        return (
                            <button
                                key={opt}
                                onClick={() => {
                                    const newVal = question.type === 'choice_bool' ? (i === 0) : opt;
                                    onChange(question.field, newVal);
                                    if (opt !== 'Other') {
                                        setTimeout(() => onNext(newVal), 300);
                                    }
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm sm:text-base font-semibold transition-all flex items-center justify-between group
                                    ${isSelected
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-zinc-100 dark:border-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-primary/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                            >
                                <span className="flex items-center">
                                    <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[10px] mr-3 opacity-50 font-bold">{String.fromCharCode(65 + i)}</span>
                                    {opt}
                                </span>
                                {isSelected && <CheckIcon className="w-5 h-5" />}
                            </button>
                        );
                    })}
                    {isOtherActive && (
                        <input
                            type="text"
                            placeholder="Please specify..."
                            value={value === 'Other' ? '' : value}
                            onChange={(e) => onChange(question.field, e.target.value || 'Other')}
                            className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary text-base sm:text-lg py-2.5 outline-none text-zinc-900 dark:text-white font-semibold transition-colors mt-1"
                            autoFocus
                        />
                    )}
                </div>
            );

        case 'multiselect':
            const currentValues = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-2 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                    {question.options?.map(opt => (
                        <button
                            key={opt}
                            onClick={() => {
                                const newVal = currentValues.includes(opt)
                                    ? currentValues.filter(v => v !== opt)
                                    : [...currentValues, opt];
                                onChange(question.field, newVal);
                            }}
                            className={`px-4 py-2 rounded-xl border-2 text-sm sm:text-base font-semibold transition-all ${currentValues.includes(opt)
                                ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                                : 'border-zinc-100 dark:border-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-primary/30'
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
                <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-44 h-44 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-primary transition-colors cursor-pointer bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden group">
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
                            <div className="text-center p-6">
                                <CloudArrowUpIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
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
                                    try {
                                        const { resizeImageToBase64 } = await import('../../../utils/image');
                                        const base64 = await resizeImageToBase64(file);
                                        onChange(question.field, base64);
                                    } catch (err) {
                                        console.error("Image processing failed:", err);
                                        onChange(question.field, file);
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
                        className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 focus:border-primary dark:focus:border-primary text-base sm:text-lg py-2.5 outline-none text-zinc-900 dark:text-white font-semibold transition-colors cursor-pointer appearance-none"
                    >
                        <option value="" className="text-zinc-400">{question.placeholder || "Select an option"}</option>
                        {question.options?.filter(Boolean).map(opt => (
                            <option key={opt} value={opt} className="text-zinc-900">{opt}</option>
                        ))}
                    </select>
                    <ChevronRightIcon className="w-6 h-6 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-600 pointer-events-none rotate-90" />
                </div>
            );

        default:
            return null;
    }
};

export default QuestionRenderer;
