import { useState, useCallback } from 'react';

/**
 * A simple cross-platform toast hook.
 * On web: shows an in-app floating toast.
 * Replaces native alert() calls throughout the member frontend.
 *
 * Usage:
 *   const { toast, showToast } = useToast();
 *   showToast('Saved!', 'success');
 *   // Render <ToastDisplay toast={toast} /> somewhere in JSX
 */
export const useToast = () => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }, []);

    return { toast, showToast };
};
