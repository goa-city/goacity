import React, { useState, useEffect } from 'react';
import { useSuperAdminAuth } from '../../context/SuperAdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const SuperAdminLogin: React.FC = () => {
    const { login, superAdmin } = useSuperAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect
    useEffect(() => {
        if (superAdmin) {
            navigate('/superadmin/cities', { replace: true });
        }
    }, [superAdmin, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const res = await login({ email, password });
        if (res.success) {
            navigate('/superadmin/cities', { replace: true });
        } else {
            setError(res.message ?? 'Authentication failed.');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background texture */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

            <div className="relative w-full max-w-sm">
                {/* Logo Area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-900/50 mb-6 group hover:scale-110 transition-transform duration-500">
                        <GlobeAltIcon className="w-10 h-10 text-white stroke-[2px]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase italic">
                        GOA<span className="text-violet-400">.</span>CITY
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-500 mt-2">
                        Super Admin Protocol
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                    <div className="mb-8">
                        <h2 className="text-white font-black text-xl uppercase tracking-tight italic mb-1">Authorization</h2>
                        <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest">Elite Access Credentials Required</p>
                    </div>

                    {error && (
                        <div className="mb-6 px-5 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 ml-2">
                                Operator Email
                            </label>
                            <input
                                id="superadmin-email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-700 transition-all outline-none"
                                placeholder="operator@goa.city"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 ml-2">
                                Security Token
                            </label>
                            <input
                                id="superadmin-password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-slate-700 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            id="superadmin-submit"
                            type="submit"
                            disabled={loading}
                            className="group relative w-full py-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-violet-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-4 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <span className="relative z-10">
                                {loading ? 'Validating...' : 'Authenticate'}
                            </span>
                        </button>
                    </form>
                </div>

                <p className="text-center text-slate-700 text-[10px] mt-10 font-black uppercase tracking-[0.5em] opacity-50">
                    Restricted Area
                </p>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
