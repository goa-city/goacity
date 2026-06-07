import api from '../../../api/axios';

export const fetchOnboardingForm = async (formId?: number | string | null) => {
    let url = '/form-progress?code=mp-onboarding';
    if (formId) {
        if (isNaN(Number(formId))) {
            url = `/form-progress?code=${formId}`;
        } else {
            url = `/form-progress?id=${formId}`;
        }
    }
    const { data } = await api.get(url);
    
    // Normalize response
    const rawQuestions = data.questions || data.data?.questions || data.fields || [];
    const questions = rawQuestions.map((q: any) => {
        let type = q.type || q.field_type;
        // Map common DB field types to QuestionRenderer types
        if (type === 'select' || type === 'radio') type = 'choice';
        if (type === 'checkbox_group') type = 'multiselect';
        if (type === 'date') type = 'date';
        
        return {
            ...q,
            // Map DB names → frontend names
            field: q.field || q.field_key,
            title: q.title || q.label,
            type,
            subtitle: q.subtitle || null,
            placeholder: q.placeholder || null,
            is_required: q.is_required === 1 || q.required === true,
            is_optional: q.is_optional === 1 || q.is_optional === true,
            // Normalize options: DB may store as {0:'x',1:'y'} or []
            options: Array.isArray(q.options)
                ? q.options
                : (q.options && typeof q.options === 'object' ? Object.values(q.options) : []),
            // Normalize conditions
            conditions: q.conditions && Object.keys(q.conditions).length > 0 ? q.conditions : null,
        };
    });
    
    const answers = data.answers || data.data?.answers || {};
    const lastStepIndex = data.last_step_index || data.data?.last_step_index || 0;
    
    return { 
        ...data,
        questions, 
        answers, 
        lastStepIndex,
        fields_per_page: data.fields_per_page ?? 1,
        visibility: data.visibility || 'members',
        redirect_url: data.redirect_url
    };
};

export const submitOnboarding = async (formData: any, isPartial = false, lastStepIndex = 0, formId?: number | string | null) => {
    const payload = new FormData();
    
    Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value instanceof File) {
            // Only append files on final submit or if explicitly changed
            if (!isPartial) payload.append(key, value);
        } else if (typeof value === 'object' && value !== null) {
            payload.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
            payload.append(key, String(value));
        } else {
            payload.append(key, value !== null && value !== undefined ? String(value) : '');
        }
    });

    payload.append('is_partial', isPartial ? '1' : '0');
    payload.append('last_step_index', lastStepIndex.toString());

    let endpoint = '/onboarding';
    if (formId) {
        endpoint = '/submit-form';
        payload.append('form_id', String(formId));
    }

    const { data } = await api.post(endpoint, payload);
    
    return data;
};
