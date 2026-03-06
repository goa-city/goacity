import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import goa1 from '../assets/goa1.webp';
import goa2 from '../assets/goa2.webp';
import goa3 from '../assets/goa3.webp';
import goa4 from '../assets/goa4.webp';

const images = [goa1, goa2, goa3, goa4];

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [step, setStep] = useState(1); // 1: Identifier, 2: OTP
    const [error, setError] = useState('');
    const { sendOtp, verifyOtp, user } = useAuth();
    const navigate = useNavigate();

    // Pick a random image once when the component is first created
    const backgroundImage = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);


    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        const res = await sendOtp(identifier, 'email');
        if (res.success) {
            setStep(2);
        } else {
            setError(res.message);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        const res = await verifyOtp(identifier, otp, rememberMe);
        if (res.success) {
            navigate('/dashboard');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ backgroundColor: 'rgb(249, 246, 232)' }}>
            {/* Full Page Static Random Background */}
            <div 
                className="absolute inset-0 z-0 bg-cover sm:bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
            </div>

            <div className="w-full max-w-md space-y-8 z-10 relative bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl border border-white/20 mb-12">
                <div className="text-center">
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {step === 1 ? 'Sign in to GOA.CITY' : 'Enter OTP'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400 font-medium">
                        {step === 1 ? 'Enter your email to access your dashboard' : `Check your inbox, we sent a code to ${identifier}`}
                    </p>
                </div>
                
                {error && <div className="text-red-500 text-center text-sm">{error}</div>}

                {step === 1 ? (
                    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                        <div className="-space-y-px rounded-md shadow-sm">
                            <div>
                                <label htmlFor="identifier" className="sr-only">Email Address</label>
                                <input
                                    id="identifier"
                                    name="identifier"
                                    type="email"
                                    required
                                    className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4"
                                    placeholder="Enter your email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center rounded-2xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300 shadow-lg shadow-indigo-600/20"
                            >
                                Send Login Code
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                        <div className="-space-y-px rounded-md shadow-sm">
                            <div>
                                <label htmlFor="otp" className="sr-only">OTP Code</label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    required
                                    className="relative block w-full rounded-md border-0 py-2.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\s/g, '');
                                        if (val.length <= 6) {
                                            setOtp(val);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 font-medium">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setError('');
                                }}
                                className="flex-1 flex justify-center rounded-2xl bg-gray-100 py-3 px-4 text-sm font-bold text-gray-600 hover:bg-gray-200 transition-all duration-300"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-1 flex justify-center rounded-2xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white hover:bg-indigo-500 transition-all duration-300 shadow-lg shadow-indigo-600/20"
                            >
                                Verify & Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
