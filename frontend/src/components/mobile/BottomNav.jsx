import { useNavigate, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    CalendarDaysIcon, 
    UsersIcon, 
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { 
    HomeIcon as HomeIconSolid, 
    CalendarDaysIcon as CalendarDaysIconSolid, 
    UsersIcon as UsersIconSolid, 
    UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';
import { Capacitor } from '@capacitor/core';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) return null;

    const navItems = [
        { name: 'City', href: '/dashboard', outlineIcon: HomeIcon, solidIcon: HomeIconSolid },
        { name: 'Meetings', href: '/meetings', outlineIcon: CalendarDaysIcon, solidIcon: CalendarDaysIconSolid },
        { name: 'My People', href: '/my-people', outlineIcon: UsersIcon, solidIcon: UsersIconSolid },
        { name: 'Profile', href: '/profile', outlineIcon: UserCircleIcon, solidIcon: UserCircleIconSolid },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 z-50 pb-safe transition-colors">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = isActive ? item.solidIcon : item.outlineIcon;
                    
                    return (
                        <button
                            key={item.href}
                            onClick={() => navigate(item.href)}
                            className="flex flex-col items-center justify-center w-full h-full text-[10px] font-black uppercase tracking-widest focus:outline-none"
                        >
                            <Icon className={`w-6 h-6 mb-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                {item.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default BottomNav;
