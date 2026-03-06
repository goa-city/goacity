import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
            {/* Background blur effects */}
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-sky-500/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-indigo-500/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[32px] shadow-2xl">
                    <div className="flex flex-col items-center mb-10">
                         <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-sky-500/20">
                            <ShieldCheckIcon className="w-8 h-8 text-white" />
                         </div>
                        <h2 className="text-2xl font-black tracking-widest text-white uppercase italic">
                            GOA.CITY
                        </h2>
                        <p className="mt-2 text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">
                            Management Portal
                        </p>
                    </div>
                    
                    {error && (
                        <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 ml-1">Access Email</label>
                            <input
                                id="email" name="email" type="email" required
                                className="block w-full rounded-2xl border-0 bg-slate-800/50 py-4 text-white ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm px-5 transition-all outline-none"
                                placeholder="name@goa.city"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 ml-1">Security Token</label>
                            <input
                                id="password" name="password" type="password" required
                                className="block w-full rounded-2xl border-0 bg-slate-800/50 py-4 text-white ring-1 ring-inset ring-slate-800 placeholder:text-slate-600 focus:ring-2 focus:ring-inset focus:ring-sky-500 sm:text-sm px-5 transition-all outline-none"
                                placeholder="••••••••"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="group relative flex w-full justify-center rounded-2xl bg-sky-500 py-4 text-sm font-black text-white hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 uppercase tracking-widest transition-all shadow-xl shadow-sky-500/20 active:scale-[0.98]"
                            >
                                <LockClosedIcon className="w-4 h-4 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                Authenticate
                            </button>
                        </div>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
