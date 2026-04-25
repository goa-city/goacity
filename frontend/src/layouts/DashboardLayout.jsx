import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import BottomNav from '../components/mobile/BottomNav';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { Capacitor } from '@capacitor/core';

const DashboardLayout = ({ children, rightSidebar }) => {
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
                <div className="lg:hidden bg-white p-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-200">
                    <span className="text-xl font-bold text-gray-900">Goa.City</span>
                    <button 
                        onClick={() => setMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-gray-600 hover:text-gray-900 rounded-md"
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
