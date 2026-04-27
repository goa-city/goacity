import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import BottomNav from '../components/mobile/BottomNav';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Capacitor } from '@capacitor/core';

interface DashboardLayoutProps {
    children: React.ReactNode;
    rightSidebar?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, rightSidebar }) => {
    const isNative = Capacitor.isNativePlatform();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';
    const hasRightSidebar = isDashboard || !!rightSidebar;

    return (
        <div className={`min-h-screen bg-[#FDFBF9] dark:bg-zinc-950 ${isNative ? 'pt-safe pb-safe pl-safe pr-safe' : ''}`}>
            <SidebarLeft mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
            
            {/* Mobile Header (Hidden on Native Mobile where Bottom Nav is used) */}
            {!isNative && (
                <div className="lg:hidden bg-white/80 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100 dark:bg-zinc-900/80 dark:border-zinc-800">
                    <span className="text-lg font-black tracking-widest uppercase text-zinc-900 dark:text-white">Goa.City</span>
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 rounded-md transition-colors"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            {/* If native, add bottom padding (pb-20) to prevent content being hidden under BottomNav */}
            <div className={`lg:ml-64 ${hasRightSidebar ? 'xl:mr-80' : ''} min-h-screen transition-all duration-300 ${isNative ? 'pb-20' : ''}`}>
                <div className="max-w-full mx-auto p-4 sm:p-8">
                    {children}
                </div>
            </div>

            {/* Fixed right sidebar on desktop only */}
            {hasRightSidebar && (
                <div className="hidden xl:block">
                    {rightSidebar || <SidebarRight />}
                </div>
            )}
            
            <BottomNav />
        </div>
    );
};

export default DashboardLayout;
