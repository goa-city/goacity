import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import BottomNav from '../components/mobile/BottomNav';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Capacitor } from '@capacitor/core';

import logo from '../assets/Goa.City.Logo.svg';

interface DashboardLayoutProps {
    children: React.ReactNode;
    rightSidebar?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, rightSidebar }) => {
    const isNative = Capacitor.isNativePlatform();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    // We will render SidebarRight inline on the dashboard to merge it with the main content area, so hasRightSidebar is false for /dashboard to give it full width
    const hasRightSidebar = (isDashboard ? false : (isDashboard || !!rightSidebar));

    return (
        <div className={`min-h-screen bg-gradient-to-br from-[#fbfbfb] to-[#f9f6e8] dark:bg-zinc-950 ${isNative ? 'pt-safe pb-safe pl-safe pr-safe' : ''}`}>
            <SidebarLeft mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
            
            {/* Mobile Header */}
            <div className="lg:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md px-6 py-3 flex items-center justify-between sticky top-0 z-30 border-b border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center cursor-pointer">
                    <img src={logo} alt="Goa.City Logo" className="w-24 h-auto object-contain dark:invert" />
                </div>
                <button 
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 -mr-2 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 rounded-md transition-colors"
                >
                    <Bars3Icon className="w-8 h-8" strokeWidth={2.5} />
                </button>
            </div>

            {/* Main Content Area */}
            {/* Add bottom padding to prevent content being hidden under BottomNav on mobile/tablet */}
            <div className={`lg:ml-64 ${hasRightSidebar ? 'xl:mr-80' : ''} min-h-screen transition-all duration-300 pb-24 lg:pb-0`}>
                <div className={`${isDashboard ? 'p-0' : 'p-4 sm:p-8'} max-w-full mx-auto`}>
                    {children}
                </div>
            </div>

            {/* Fixed right sidebar on desktop only */}
            {hasRightSidebar && !isDashboard && (
                <div className="hidden xl:block">
                    {rightSidebar || <SidebarRight />}
                </div>
            )}
            
            <BottomNav />
        </div>
    );
};

export default DashboardLayout;
