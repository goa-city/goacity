import React, { useEffect } from 'react';

interface ThemeConfig {
    primary?: string;
    secondary?: string;
    accent?: string;
}

interface ThemeHandlerProps {
    config?: ThemeConfig | null;
}

export const ThemeHandler: React.FC<ThemeHandlerProps> = ({ config }) => {
    useEffect(() => {
        if (!config) {
            // Reset to defaults
            document.documentElement.style.setProperty('--brand-primary', '#4f46e5');
            document.documentElement.style.setProperty('--brand-secondary', '#0ea5e9');
            document.documentElement.style.setProperty('--brand-accent', '#6366f1');
            return;
        }

        if (config.primary) {
            document.documentElement.style.setProperty('--brand-primary', config.primary);
        }
        if (config.secondary) {
            document.documentElement.style.setProperty('--brand-secondary', config.secondary);
        }
        if (config.accent) {
            document.documentElement.style.setProperty('--brand-accent', config.accent);
        }
    }, [config]);

    return null; // This component doesn't render anything
};
