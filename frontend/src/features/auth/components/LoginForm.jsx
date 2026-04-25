import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../shared/components/ui/Card';

const LoginForm = ({ backgroundImage }) => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [step, setStep] = useState(1); // 1: Identifier, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { sendOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await sendOtp(identifier);
        setLoading(false);
        if (res.success) {
            setStep(2);
        } else {
            setError(res.message);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await verifyOtp(identifier, otp, rememberMe);
        setLoading(false);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
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

            <Card className="w-full max-w-md z-10 relative bg-white/95 backdrop-blur-md border-white/20 mb-12 overflow-hidden rounded-xl">
                <CardHeader className="text-center pt-10">
                    <CardTitle className="text-3xl">
                        {step === 1 ? 'Sign in to GOA.CITY' : 'Enter OTP'}
                    </CardTitle>
                    <CardDescription className="mt-2">
                        {step === 1 
                            ? 'Enter your email to access your dashboard' 
                            : `Check your inbox, we sent a code to ${identifier}`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-10 pb-10">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-center text-sm font-medium border border-red-100 animate-in fade-in zoom-in-95">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form className="space-y-6" onSubmit={handleSendOtp}>
                            <Input
                                id="identifier"
                                label="Email Address"
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />

                            <Button
                                type="submit"
                                className="w-full rounded-xl"
                                isLoading={loading}
                            >
                                Send Login Code
                            </Button>
                        </form>
                    ) : (
                        <form className="space-y-6" onSubmit={handleVerifyOtp}>
                            <Input
                                id="otp"
                                label="Verification Code"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                required
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    if (val.length <= 6) setOtp(val);
                                }}
                            />

                            <div className="flex items-center px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="text-sm text-zinc-500 group-hover:text-zinc-700 transition-colors">
                                        Remember me
                                    </span>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1 rounded-xl"
                                    onClick={() => {
                                        setStep(1);
                                        setError('');
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-[2] rounded-xl"
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
