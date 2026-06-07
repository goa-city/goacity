import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/context/AuthContext';
import { getProfilePhotoUrl } from '../utils/image';
import {
    HomeIcon,
    NewspaperIcon,
    BookOpenIcon,
    BriefcaseIcon,
    SparklesIcon,
    UsersIcon,
    LightBulbIcon,
    HeartIcon,
    CalendarDaysIcon,
    XMarkIcon,
    ArrowLeftOnRectangleIcon,
    MoonIcon,
    SunIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

interface SidebarLeftProps {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ mobileOpen, setMobileOpen }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const getInitials = (firstName?: string, lastName?: string) => {
        const first = firstName?.[0] || '';
        const last = lastName?.[0] || '';
        return (first + last).toUpperCase() || 'M';
    };

    const profileImage = user?.profile_photo;
    const initials = getInitials(user?.first_name, user?.last_name);

    // Use latest stream color
    const latestStreamColor = (user as any)?.streams?.[0]?.color || '#4F46E5';

    const navigation = [
        { name: 'City', href: '/dashboard', icon: HomeIcon },
        { name: 'News', href: '/news', icon: NewspaperIcon },
        { name: 'My People', href: '/my-people', icon: UsersIcon },
        { name: 'Mentorship', href: '/mentorship', icon: HeartIcon },
        { name: 'Meetings', href: '/meetings', icon: CalendarDaysIcon },
        { name: 'Stewardship', href: '/stewardship', icon: SparklesIcon },
        { name: 'Resources', href: '/resources', icon: BookOpenIcon },
        { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
        { name: 'Idea Lab', href: '/incubator/explore', icon: LightBulbIcon },
    ];

    const isActive = (path: string) => {
        if (path === '/mentorship') {
            return location.pathname === '/mentorship' || location.pathname.startsWith('/dashboard/mentorship') || location.pathname.startsWith('/mentorship');
        }
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            <div className={`
                fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-100 dark:border-zinc-800 z-50 overflow-y-auto transition-transform duration-300
                lg:translate-x-0
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="p-6 flex justify-between items-center">
                    <span className="text-xl font-black tracking-widest text-zinc-900 dark:text-white">Goa.City</span>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Profile Section */}
                <div className="flex flex-col items-center px-6 mb-8 text-center mt-4">
                    <button
                        onClick={() => navigate(user?.slug ? `/profile/${user.slug}` : `/profile/${user?.id}`)}
                        className="relative group transition-transform active:scale-95"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative">
                            {profileImage ? (
                                <img
                                    src={getProfilePhotoUrl(profileImage)}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-zinc-900 shadow-xl"
                                />
                            ) : (
                                <div
                                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white border-4 border-white dark:border-zinc-900 shadow-xl"
                                    style={{ backgroundColor: latestStreamColor }}
                                >
                                    {initials}
                                </div>
                            )}
                        </div>
                    </button>
                    <button
                        onClick={() => navigate(user?.slug ? `/profile/${user.slug}` : `/profile/${user?.id}`)}
                        className="mt-6 block group"
                    >
                        <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'City Member'}
                        </h2>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1">
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <button
                                key={item.name}
                                onClick={() => {
                                    navigate(item.href);
                                    setMobileOpen(false);
                                }}
                                className={`flex items-center w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${active
                                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                                {item.name}
                            </button>
                        )
                    })}

                    <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                            onClick={toggleTheme}
                            className="flex items-center w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        >
                            {theme === 'dark' ? (
                                <>
                                    <SunIcon className="w-5 h-5 mr-3" />
                                    Light Mode
                                </>
                            ) : (
                                <>
                                    <MoonIcon className="w-5 h-5 mr-3" />
                                    Dark Mode
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                setMobileOpen(false);
                                navigate('/');
                            }}
                            className="flex items-center w-full px-4 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </nav>

                <div className="p-8 text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                    &copy; 2026 Goa.City
                    <div className="flex flex-col gap-2 mt-4 opacity-60">
                        <button onClick={() => navigate('/pages/credits')} className="text-left hover:text-indigo-600 transition-colors">Credits</button>
                        <button onClick={() => navigate('/pages/terms')} className="text-left hover:text-indigo-600 transition-colors">Terms & Conditions</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SidebarLeft;
