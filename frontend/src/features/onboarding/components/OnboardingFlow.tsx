import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SunIcon,
    MoonIcon
} from '@heroicons/react/24/solid';
import { Navigate } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';
import QuestionRenderer from './QuestionRenderer';
import GoaLandscape from '../../../components/GoaLandscape';
import { getFilteredQuestions, chunkQuestions } from '../utils/formUtils';

const OnboardingFlow: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formId } = useParams<{ formId: string }>();

    const {
        form,
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        formDataRef,
        filteredQuestions,
        isLoading,
        error,
        saveProgress,
        submitFinal
    } = useOnboarding(formId);

    const [direction, setDirection] = useState(1);
    const [isDark, setIsDark] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

    const pages = React.useMemo(() => {
        return chunkQuestions(filteredQuestions, form?.fields_per_page ?? 1);
    }, [filteredQuestions, form?.fields_per_page]);

    const currentPageQuestions = pages[currentStep] || [];

    const handleNext = async () => {
        // Validation logic for all questions on current page
        for (const q of currentPageQuestions) {
            if (q.is_required && q.type !== 'intro') {
                const val = formDataRef.current[q.field];
                const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);

                if (isEmpty) {
                    setValidationError(`"${q.title}" is required.`);
                    return;
                }
            }
        }

        setValidationError(null);

        if (currentStep < pages.length - 1) {
            const nextStep = currentStep + 1;
            // Save progress if logged in
            if (user) {
                await saveProgress(nextStep);
            }
            setDirection(1);
            setCurrentStep(nextStep);
        } else {
            setIsSubmitting(true);
            try {
                const result: any = await submitFinal();
                let target = form?.redirect_url || '/dashboard';
                
                // If it's a mentorship assessment, append the response ID for matching
                if (result?.data?.id && target.includes('mentorship/recommendations')) {
                    target = `${target}${target.includes('?') ? '&' : '?'}response_id=${result.data.id}`;
                }

                navigate(target);
            } catch (err) {
                alert("Failed to submit form. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setValidationError(null);
            setDirection(-1);
            const prevStep = currentStep - 1;
            if (user) saveProgress(prevStep);
            setCurrentStep(prevStep);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [isDark]);

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-zinc-400 uppercase tracking-widest text-[10px] font-black animate-pulse">
                Initializing...
            </div>
        </div>
    );

    if (form?.visibility === 'members' && !user) {
        return <Navigate to="/" replace />;
    }

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
            <div className="bg-red-50 dark:bg-red-950/20 p-10 rounded-xl border border-red-100 dark:border-red-900/50 max-w-md">
                <h2 className="text-2xl font-black text-red-600 dark:text-red-400 mb-4">Path Blocked</h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
                    We couldn't load this onboarding path. It might have been moved or archived.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    if (currentPageQuestions.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
            <div className="p-10 rounded-xl border border-zinc-100 dark:border-zinc-800 max-w-md">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">
                    {form?.title || 'No Questions Yet'}
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">
                    This onboarding form has no questions yet. Contact an admin to set up the questions for this stream.
                </p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-opacity"
                >
                    Return to Dashboard
                </button>
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
            <div className="fixed top-0 left-0 w-full z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100/80 dark:border-zinc-800/80 shadow-sm">
                <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900">
                    <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${((currentStep) / (pages.length - 1 || 1)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <div className="flex justify-between items-center px-6 py-3">
                    <button onClick={() => setIsDark(!isDark)} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 transition-colors">
                        {isDark ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-zinc-400" />}
                    </button>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-[10px] font-black text-zinc-400 hover:text-primary tracking-[0.1em] uppercase transition-colors"
                        >
                            Back to Dashboard
                        </button>
                        <div className="hidden sm:block w-px h-3 bg-zinc-200 dark:bg-zinc-800" />
                        <div className="hidden sm:block text-[10px] font-black text-zinc-400 tracking-[0.2em] uppercase">
                            {user?.first_name} {user?.last_name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center px-6 sm:px-12 relative z-10 overflow-y-auto pt-32 sm:pt-40 pb-16">
                {form?.title && (
                    <div className="w-full max-w-3xl text-center mb-8 shrink-0">
                        <h1 className="page-heading">
                            {form.title}
                        </h1>
                        <div className="h-1 w-16 bg-indigo-600 dark:bg-indigo-400 mx-auto mt-3 rounded-full opacity-80" />
                    </div>
                )}

                <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-3xl"
                    >
                        <div className="space-y-6">
                            {currentPageQuestions.map((q, idx) => (
                                <div key={q.id || q.field} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <div className="mb-2">
                                        <h2 className={`font-black leading-snug tracking-tight ${q.type === 'intro' ? 'text-2xl sm:text-3xl text-center mb-4' : 'text-lg sm:text-xl'}`}>
                                            {q.title}
                                            {q.is_required && q.type !== 'intro' && <span className="text-red-500 ml-1">*</span>}
                                        </h2>
                                        {q.is_optional && q.type !== 'intro' && (
                                            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">Optional</span>
                                        )}
                                    </div>

                                    {(q.subtitle || q.description) && (
                                        <p className={`text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-3 font-medium leading-relaxed w-full ${q.type === 'intro' ? 'text-center text-sm sm:text-base' : ''}`}>
                                            {q.subtitle || q.description}
                                        </p>
                                    )}

                                    <div className="mt-2">
                                        <QuestionRenderer
                                            question={q}
                                            value={formData[q.field]}
                                            onChange={(field, val) => {
                                                setValidationError(null);
                                                handleChange(field, val);
                                            }}
                                            onNext={(val) => {
                                                if (currentPageQuestions.length === 1) handleNext();
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
                                    className="mt-4 text-red-500 font-bold text-xs sm:text-sm flex items-center gap-2 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/50"
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                                    {validationError}
                                </motion.p>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="mt-10 flex items-center justify-between">
                            {currentStep > 0 ? (
                                <button onClick={handleBack} className="w-11 h-11 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-primary transition-all">
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                            ) : <div />}

                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-base font-bold shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
                            >
                                {isSubmitting ? 'Finalizing...' : (currentStep === pages.length - 1 ? 'Complete Path' : 'Continue')}
                                {!isSubmitting && <ChevronRightIcon className="w-4 h-4" />}
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

export default OnboardingFlow;
