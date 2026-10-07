import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';

interface LoginFormProps {
    backgroundImage?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ backgroundImage }) => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [step, setStep] = useState(1); // 1: Identifier, 2: OTP
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const { sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        setInfoMessage('');
        const res = await sendOtp(identifier);
        setLoading(false);
        if (res.success) {
            if (res.message) {
                setInfoMessage(res.message);
            }
            setResendCooldown(30);
            setStep(2);
        } else {
            setError(res.message ?? 'Unable to send login code.');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }
        setLoading(true);
        setError('');
        const res = await verifyOtp(identifier, otp, rememberMe);
        setLoading(false);
        if (res.success) {
            const savedRedirect = sessionStorage.getItem('redirect_after_login');
            if (savedRedirect && savedRedirect !== '/' && !savedRedirect.startsWith('/admin') && !savedRedirect.startsWith('/superadmin')) {
                sessionStorage.removeItem('redirect_after_login');
                navigate(savedRedirect, { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(res.message ?? 'Unable to verify login code.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#f9f6e8] dark:bg-zinc-950 transition-colors duration-500">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 bg-cover sm:bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
            </div>

            <Card className="w-full max-w-md z-10 relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/20 dark:border-zinc-800/80 mb-12 overflow-hidden rounded-2xl shadow-xl">
                <CardHeader className="text-center pt-10">
                    <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {step === 1 ? 'Sign in to GOA.CITY' : 'Enter Verification Code'}
                    </CardTitle>
                    <CardDescription className="mt-2 text-zinc-600 dark:text-zinc-400">
                        {step === 1
                            ? 'Enter your registered phone number or email to receive a login code'
                            : `We sent a 6-digit verification code to ${identifier}`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 sm:px-10 pb-10">
                    {infoMessage && step === 2 && (
                        <div className="mb-4 p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 text-xs sm:text-sm font-medium border border-sky-200 dark:border-sky-800/50 flex items-start gap-2.5 animate-in fade-in">
                            <span className="text-base select-none">💬</span>
                            <div className="flex-1 leading-snug">{infoMessage}</div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-center text-sm font-medium border border-red-100 dark:border-red-900/50 animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <Input
                                id="identifier"
                                label="Phone Number or Email"
                                type="text"
                                required
                                autoFocus
                                placeholder="e.g. 9876543210 or name@example.com"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />

                            <Button
                                type="submit"
                                className="w-full rounded-xl py-3 font-semibold shadow-md"
                                isLoading={loading}
                            >
                                Send Login Code
                            </Button>

                            <div className="text-center pt-2">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                                    Not a member yet?{' '}
                                    <Link
                                        to="/register"
                                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
                                    >
                                        Join here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <div>
                                <Input
                                    id="otp"
                                    label="6-Digit Verification Code"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    required
                                    autoFocus
                                    placeholder="• • • • • •"
                                    maxLength={6}
                                    className="text-center tracking-widest text-lg font-mono font-bold"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 6) setOtp(val);
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                                        Remember me
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    disabled={resendCooldown > 0 || loading}
                                    onClick={() => handleSendOtp()}
                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed hover:underline transition-colors"
                                >
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                                </button>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1 rounded-xl"
                                    onClick={() => {
                                        setStep(1);
                                        setError('');
                                        setOtp('');
                                    }}
                                >
                                    Change
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] rounded-xl font-semibold shadow-md"
                                    isLoading={loading}
                                >
                                    Verify & Login
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginForm;
