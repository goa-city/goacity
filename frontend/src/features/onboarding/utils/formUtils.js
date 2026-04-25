export const checkCondition = (condition, data) => {
    if (!condition) return true;
    
    // Support both flat {field, operator, value} and wrapped {show_if: {field, operator, value}}
    const rule = condition.show_if || condition;
    
    // If it's an empty object or has no valid field, don't filter it out
    if (!rule || !rule.field) return true;

    const { field, operator, value } = rule;
    const fieldValue = data[field];

    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        if (operator === 'neq' && value !== '') return false; // Hide until answered
        if (operator !== 'not_empty') return false; 
    }

    if (operator === 'eq') return fieldValue === value;
    if (operator === 'neq') return fieldValue !== value;
    if (operator === 'contains') return Array.isArray(fieldValue) ? fieldValue.includes(value) : fieldValue?.includes(value);
    if (operator === 'not_empty') return fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
    return true;
};

export const getFilteredQuestions = (questions, data) => {
    if (!questions) return [];
    return questions.filter(q => {
        const cond = q.conditions || q.conditional_logic || null;
        return checkCondition(cond, data);
    });
};
