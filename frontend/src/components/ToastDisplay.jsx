import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const STYLES = {
    success: {
        bg: 'bg-gray-900',
        icon: CheckCircleIcon,
        iconColor: 'text-green-400',
    },
    error: {
        bg: 'bg-red-600',
        icon: ExclamationCircleIcon,
        iconColor: 'text-white',
    },
    info: {
        bg: 'bg-sky-600',
        icon: InformationCircleIcon,
        iconColor: 'text-white',
    },
};

/**
 * Renders an animated toast notification.
 * Place this component at the top-level of any page that uses useToast().
 *
 * <ToastDisplay toast={toast} />
 */
const ToastDisplay = ({ toast, onDismiss }) => {
    if (!toast) return null;

    const style = STYLES[toast.type] || STYLES.success;
    const Icon = style.icon;

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold max-w-xs w-full ${style.bg}`}
            style={{ animation: 'toast-in 0.3s ease-out forwards' }}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${style.iconColor}`} />
            <span className="flex-1">{toast.message}</span>
            {onDismiss && (
                <button onClick={onDismiss} className="opacity-70 hover:opacity-100 transition-opacity">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ToastDisplay;
