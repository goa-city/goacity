import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { GlobeAltIcon, PowerIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';

const SuperAdminLayout = () => {
    const { superAdminUser, logout, loading } = useSuperAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <p className="text-violet-400 font-black uppercase tracking-[0.3em] animate-pulse text-sm">
                    Loading…
                </p>
            </div>
        );
    }

    if (!superAdminUser) {
        return <Navigate to="/superadmin/login" replace />;
    }

    const navItems = [
        { path: '/superadmin/cities', label: 'Cities Management', icon: BuildingOffice2Icon },
    ];

    return (
        <div className="flex h-screen bg-[#0a0a0f] font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-[#0d0d14] border-r border-white/5 text-white flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="px-8 py-8 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-tighter italic px-2 py-1 min-w-[36px] h-9">
                            G
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-widest text-white uppercase italic">
                                GOA<span className="text-violet-400">.</span>CITY
                            </h1>
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] ml-12">Super Admin</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                    isActive
                                        ? 'bg-violet-600/20 text-violet-300 font-bold'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 w-0.5 h-5 bg-violet-500 rounded-r-full" />
                                )}
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-300'}`} />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2 mb-5">
                        <div className="w-9 h-9 rounded-xl bg-violet-900/40 border border-violet-700/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                            {(superAdminUser?.full_name || 'S')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-600">Super Admin</p>
                            <p className="text-sm font-bold text-slate-300 truncate">{superAdminUser?.full_name || superAdminUser?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/10 transition-all duration-300 font-bold text-xs uppercase tracking-widest"
                    >
                        <PowerIcon className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0f0f1a]">
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
