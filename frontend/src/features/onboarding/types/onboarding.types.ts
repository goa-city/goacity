export interface OnboardingQuestion {
    id: number;
    field: string;
    field_key: string;
    type: 'text' | 'textarea' | 'date' | 'choice' | 'choice_bool' | 'multiselect' | 'file' | 'dropdown_choice' | 'intro';
    title: string;
    subtitle?: string;
    description?: string;
    placeholder?: string;
    options?: string[];
    is_required: boolean;
    is_optional?: boolean;
    conditions?: any;
}

export interface OnboardingForm {
    id: number;
    title: string;
    questions: OnboardingQuestion[];
    answers: Record<string, any>;
    lastStepIndex: number;
    fields_per_page?: number;
    visibility?: 'members' | 'public';
    redirect_url?: string;
}
