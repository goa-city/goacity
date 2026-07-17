import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    loading?: boolean;
}

import { useLocation } from 'react-router-dom';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, loading, children, ...props }, ref) => {
        const location = useLocation();
        const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');
        const isBusy = isLoading || loading;

        const variants = {
            primary: isAdmin 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' 
                : 'bg-primary text-white hover:bg-primary/90 shadow-md',
            secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700',
            outline: 'border-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900',
            ghost: 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900',
            danger: 'bg-red-500 text-white hover:bg-red-600'
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs font-bold',
            md: 'px-6 py-2.5 text-sm font-bold',
            lg: 'px-8 py-3 text-base font-bold'
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
                    isAdmin ? 'admin-btn' : 'member-btn',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isBusy || props.disabled}
                {...props}
            >
                {isBusy ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Please wait...</span>
                    </div>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
