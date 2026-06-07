import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOnboardingForm, submitOnboarding } from '../api/onboarding.api';
import { getFilteredQuestions } from '../utils/formUtils';
import { OnboardingForm, OnboardingQuestion } from '../types/onboarding.types';

export const useOnboarding = (formId?: string) => {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const isInitialized = useRef(false);

    const { data: form, isLoading, error } = useQuery<OnboardingForm>({
        queryKey: ['onboarding-form', formId],
        queryFn: () => fetchOnboardingForm(formId),
        enabled: !!formId,
        // Always fetch fresh from server — no cache
        staleTime: 0,
        gcTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
    });

    // Run only once when the form first loads from the DB
    useEffect(() => {
        if (form && !isInitialized.current) {
            isInitialized.current = true;
            // Populate form data from DB answers
            setFormData(form.answers || {});
            // Restore the step the user was on (use >= 0 to handle step 0)
            const savedStep = form.lastStepIndex ?? 0;
            setCurrentStep(savedStep);
        }
    }, [form]);

    const filteredQuestions = form ? getFilteredQuestions(form.questions, formData) : [];

    const saveProgress = useCallback(async (stepToSave: number) => {
        if (!form?.id) return;
        try {
            await submitOnboarding(
                formData,
                true,
                stepToSave,
                form.id
            );
        } catch (err) {
            console.error("[ONBOARDING] Autosave failed", err);
        }
    }, [formData, form?.id]);

    const submitFinal = async () => {
        if (!form?.id) return;
        const result = await submitOnboarding(formData, false, currentStep, form.id);
        // Invalidate and remove cache so next load hits server fresh
        queryClient.removeQueries({ queryKey: ['onboarding-form', formId] });
        return result;
    };

    // Debounced autosave on formData change (only after initial load)
    useEffect(() => {
        if (isLoading || !form || !isInitialized.current) return;
        const timer = setTimeout(() => saveProgress(currentStep), 2000);
        return () => clearTimeout(timer);
    }, [formData]);

    return {
        form,
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        filteredQuestions,
        isLoading,
        error,
        saveProgress,
        submitFinal
    };
};
