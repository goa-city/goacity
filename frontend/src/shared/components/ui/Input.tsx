import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

import { useLocation } from 'react-router-dom';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, ...props }, ref) => {
        const location = useLocation();
        const isAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin');

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <label className={cn(
                        "text-[10px] font-black uppercase tracking-widest ml-1",
                        isAdmin ? "text-slate-500" : "text-zinc-400"
                    )}>
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        isAdmin ? "admin-input" : "member-input",
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider ml-1">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
