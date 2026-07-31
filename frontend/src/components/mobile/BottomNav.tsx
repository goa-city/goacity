import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    HomeIcon, 
    CalendarDaysIcon, 
    UsersIcon, 
    NewspaperIcon,
} from '@heroicons/react/24/outline';
import { 
    HomeIcon as HomeIconSolid, 
    CalendarDaysIcon as CalendarDaysIconSolid, 
    UsersIcon as UsersIconSolid, 
    NewspaperIcon as NewspaperIconSolid,
} from '@heroicons/react/24/solid';
import { MentorshipIcon } from '../icons/MentorshipIcon';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    interface NavItem {
        name: string;
        href: string;
        outlineIcon: React.ComponentType<any>;
        solidIcon: React.ComponentType<any>;
    }

    // Left items
    const leftItems: NavItem[] = [
        { name: 'People', href: '/my-people', outlineIcon: UsersIcon, solidIcon: UsersIconSolid },
        { name: 'News', href: '/news', outlineIcon: NewspaperIcon, solidIcon: NewspaperIconSolid },
    ];

    // Right items
    const rightItems: NavItem[] = [
        { name: 'Mentorship', href: '/mentorship', outlineIcon: MentorshipIcon, solidIcon: MentorshipIcon },
        { name: 'Meetings', href: '/meetings', outlineIcon: CalendarDaysIcon, solidIcon: CalendarDaysIconSolid },
    ];

    const centerItem: NavItem = { name: 'Home', href: '/dashboard', outlineIcon: HomeIcon, solidIcon: HomeIconSolid };

    const isCurrentActive = (href: string) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        if (href === '/mentorship') {
            return location.pathname.startsWith('/mentorship') || location.pathname.startsWith('/dashboard/mentorship');
        }
        return location.pathname === href;
    };

    const renderNavItem = (item: NavItem) => {
        const isActive = isCurrentActive(item.href);
        const Icon = isActive ? item.solidIcon : item.outlineIcon;
        return (
            <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="flex flex-col items-center justify-center w-full h-full text-[9px] font-black uppercase tracking-widest focus:outline-none group"
            >
                <div className={`p-1 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''}`}>
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}`} />
                </div>
                <span className={`mt-1 transition-colors duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                    {item.name}
                </span>
            </button>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-100/80 dark:border-zinc-800/80 z-50 pb-safe transition-all shadow-[0_-8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgb(0,0,0,0.3)] lg:hidden rounded-t-[24px]">
            <div className="flex justify-between items-center h-16 px-2 relative">
                {/* Left side */}
                <div className="flex flex-1 justify-around items-center h-full">
                    {leftItems.map(renderNavItem)}
                </div>

                {/* Center Floating Button */}
                <div className="flex flex-col items-center justify-center relative -top-4 w-20">
                    <button
                        onClick={() => navigate(centerItem.href)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 active:scale-95 focus:outline-none border-4 border-white dark:border-zinc-950 ${
                            isCurrentActive(centerItem.href)
                                ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-zinc-200 dark:shadow-none hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                    >
                        <HomeIcon className="w-6 h-6" />
                    </button>
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-colors duration-300 ${isCurrentActive(centerItem.href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 dark:text-zinc-500'}`}>
                        {centerItem.name}
                    </span>
                </div>

                {/* Right side */}
                <div className="flex flex-1 justify-around items-center h-full">
                    {rightItems.map(renderNavItem)}
                </div>
            </div>
        </div>
    );
};

export default BottomNav;
