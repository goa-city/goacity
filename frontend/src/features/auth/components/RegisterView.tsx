import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SunIcon,
    MoonIcon,
    CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import httpClient from '../../../shared/api/httpClient';
import QuestionRenderer from '../../onboarding/components/QuestionRenderer';
import { getFilteredQuestions, chunkQuestions } from '../../onboarding/utils/formUtils';
import { registerPublicMember } from '../api/auth.api';
import GoaLandscape from '../../../components/GoaLandscape';

const RegisterView: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [isDark, setIsDark] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [direction, setDirection] = useState(1);
    const inputRef = useRef<any>(null);

    // Fetch Page 3 (Registration Intro/Content)
    const { data: page } = useQuery({
        queryKey: ['public-page', 'register'],
        queryFn: async () => {
            try {
                const { data } = await httpClient.get('/pages/register');
                return data;
            } catch {
                return null; // Fallback if page not found
            }
        },
        retry: false
    });

    // Fetch Form 8 (Registration Form)
    const { data: form, isLoading, error } = useQuery({
        queryKey: ['public-form', 8],
        queryFn: async () => {
            const { data } = await httpClient.get('/forms/get?id=8');
            // Adapt backend field structure to frontend question structure
            return {
                ...data,
                questions: (data.fields || []).map((f: any) => ({
                    id: f.id,
                    field: f.field_key,
                    type: f.field_type,
                    title: f.label,
                    subtitle: f.subtitle,
                    placeholder: f.placeholder,
                    options: f.options,
                    is_required: f.is_required === 1,
                    conditions: f.conditions
                }))
            };
        },
        staleTime: 0
    });

    const filteredQuestions = form ? getFilteredQuestions(form.questions, formData) : [];

    const pages = React.useMemo(() => {
        return chunkQuestions(filteredQuestions, form?.fields_per_page ?? 1);
    }, [filteredQuestions, form?.fields_per_page]);

    const currentPageQuestions = pages[currentStep] || [];

    const handleNext = async (incomingValue?: any) => {
        // Validation for all questions on page
        for (const q of currentPageQuestions) {
            if (q.is_required) {
                const val = q.field === currentPageQuestions[currentPageQuestions.length - 1].field && incomingValue !== undefined
                    ? incomingValue
                    : formData[q.field];

                const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);

                if (isEmpty) {
                    setValidationError(`"${q.title}" is required.`);
                    return;
                }
            }
        }

        setValidationError(null);

        if (currentStep < pages.length - 1) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setValidationError(null);
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('form_id', '8');
            Object.entries(formData).forEach(([key, value]) => {
                if (value instanceof File) {
                    data.append(key, value);
                } else if (typeof value === 'object') {
                    data.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    data.append(key, String(value));
                }
            });

            await registerPublicMember(data);
            setIsSuccess(true);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
            setValidationError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-zinc-400 uppercase tracking-widest text-[10px] font-black animate-pulse">
                Preparing...
            </div>
        </div>
    );

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md bg-zinc-50 dark:bg-zinc-900/50 p-12 rounded-[32px] border border-zinc-100 dark:border-zinc-800 shadow-2xl shadow-primary/5"
                >
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-8" />
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-6 tracking-tight">Success!</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-1 leading-relaxed text-lg">
                        Thank you for joining Goa.City. Your application is currently being reviewed.
                        You will be notified once your membership is activated.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (filteredQuestions.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
            <div className="bg-red-50 dark:bg-red-950/20 p-10 rounded-xl border border-red-100 dark:border-red-900/50 max-w-md">
                <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-4">Form Unavailable</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
                    We couldn't load the registration form. Please contact an admin.
                    <br />
                    <a href='mailto:admin@goa.city'>admin@goa.city</a>
                </p>
            </div>
        </div>
    );
    const variants = {
        enter: (dir: number) => ({ y: dir > 0 ? 30 : -30, opacity: 0, scale: 0.98 }),
        center: { y: 0, opacity: 1, scale: 1 },
        exit: (dir: number) => ({ y: dir > 0 ? -30 : 30, opacity: 0, scale: 0.98 })
    };

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-500 flex flex-col font-sans overflow-hidden">

            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full z-50">
                <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900">
                    <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${((currentStep + 1) / filteredQuestions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between items-center px-6 py-6">
                    <button onClick={() => setIsDark(!isDark)} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 transition-colors">
                        {isDark ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-zinc-400" />}
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
                        <div className="hidden sm:block text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase">
                            Goa.City
                        </div>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center px-6 sm:px-12 relative z-10 overflow-y-auto pt-32 pb-20">
                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-4xl"
                    >
                        {/* Page Content (only on first step) */}
                        {currentStep === 0 && page && (
                            <div className="mb-12">
                                <h1 className="text-3xl sm:text-6xl font-black tracking-tighter mb-6 leading-[0.9]">
                                    {page.title}
                                </h1>
                                <div
                                    className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed max-w-2xl"
                                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                                />
                                <div className="mt-8 w-20 h-1 bg-primary rounded-full" />
                            </div>
                        )}

                        <div className="space-y-12">
                            {currentPageQuestions.map((q, idx) => (
                                <div key={q.id || q.field} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="mb-6">
                                        <h2 className={`font-black leading-[1.15] tracking-tight text-xl sm:text-3xl`}>
                                            {q.title}
                                            {q.is_required && <span className="text-red-500 ml-1">*</span>}
                                        </h2>
                                        {q.is_optional && (
                                            <span className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">Optional</span>
                                        )}
                                    </div>

                                    {q.subtitle && (
                                        <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed w-full">
                                            {q.subtitle}
                                        </p>
                                    )}

                                    <div className="mt-10">
                                        <QuestionRenderer
                                            question={q}
                                            value={formData[q.field]}
                                            onChange={(field, val) => {
                                                setValidationError(null);
                                                setFormData(prev => ({ ...prev, [field]: val }));
                                            }}
                                            onNext={(val) => {
                                                if (currentPageQuestions.length === 1) handleNext(val);
                                            }}
                                            inputRef={idx === 0 ? inputRef : undefined}
                                        />
                                    </div>
                                </div>
                            ))}

                            {validationError && (
                                <motion.p
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="mt-6 text-red-500 font-bold text-sm flex items-center gap-3 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50"
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    {validationError}
                                </motion.p>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="mt-16 flex items-center justify-between">
                            {currentStep > 0 ? (
                                <button onClick={handleBack} className="w-14 h-14 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary transition-all">
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                            ) : <div />}

                            <button
                                onClick={() => handleNext()}
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl text-lg font-black shadow-2xl shadow-primary/20 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Finalizing...' : (currentStep === pages.length - 1 ? 'Join Goa.City' : 'Continue')}
                                {!isSubmitting && <ChevronRightIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Art */}
            <div className="fixed bottom-0 left-0 w-full z-0 pointer-events-none flex justify-center opacity-20 dark:opacity-5 grayscale">
                <GoaLandscape className="w-full max-w-5xl h-auto text-zinc-500" />
            </div>
        </div>
    );
};

export default RegisterView;
