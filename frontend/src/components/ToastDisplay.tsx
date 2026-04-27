import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    type: ToastType;
    message: string;
}

interface ToastDisplayProps {
    toast: Toast | null;
    onDismiss?: () => void;
}

const STYLES: Record<ToastType, { bg: string, icon: any, iconColor: string }> = {
    success: {
        bg: 'bg-zinc-900 dark:bg-zinc-800',
        icon: CheckCircleIcon,
        iconColor: 'text-emerald-400',
    },
    error: {
        bg: 'bg-rose-600',
        icon: ExclamationCircleIcon,
        iconColor: 'text-white',
    },
    info: {
        bg: 'bg-indigo-600',
        icon: InformationCircleIcon,
        iconColor: 'text-white',
    },
};

const ToastDisplay: React.FC<ToastDisplayProps> = ({ toast, onDismiss }) => {
    if (!toast) return null;

    const style = STYLES[toast.type] || STYLES.success;
    const Icon = style.icon;

    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] max-w-sm w-[90%] border border-white/10 ${style.bg}`}
            style={{ 
                animation: 'toast-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                backdropFilter: 'blur(8px)'
            }}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
            <span className="flex-1 leading-tight">{toast.message}</span>
            {onDismiss && (
                <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-lg transition-all">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ToastDisplay;
