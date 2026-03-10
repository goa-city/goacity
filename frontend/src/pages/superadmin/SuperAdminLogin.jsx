import { useState, useEffect } from 'react';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const SuperAdminLogin = () => {
    const { login, superAdminUser } = useSuperAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (superAdminUser) {
            navigate('/superadmin/cities', { replace: true });
        }
    }, [superAdminUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/superadmin/cities', { replace: true });
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

            <div className="relative w-full max-w-sm">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-900/50 mb-5">
                        <GlobeAltIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-widest uppercase italic">
                        GOA<span className="text-violet-400">.</span>CITY
                    </h1>
                    <p className="text-[11px] font-black uppercase tracking-[0.35em] text-violet-400 mt-1">
                        Super Admin Console
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h2 className="text-white font-bold text-lg mb-1">Secure Access</h2>
                    <p className="text-slate-400 text-sm mb-7">Super admin credentials required.</p>

                    {error && (
                        <div className="mb-5 px-4 py-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-400 text-sm font-medium flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                                Email Address
                            </label>
                            <input
                                id="superadmin-email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                                placeholder="admin@goa.city"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                                Password
                            </label>
                            <input
                                id="superadmin-password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-600 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            id="superadmin-submit"
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-violet-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-2"
                        >
                            {loading ? 'Authenticating...' : 'Authenticate'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-600 text-[11px] mt-6 font-medium">
                    This area is restricted to Super Administrators only.
                </p>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
