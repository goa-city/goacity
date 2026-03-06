import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import { Bars3Icon } from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isDashboard = location.pathname === '/dashboard';

    return (
        <div className="min-h-screen bg-[#FDFBF9]">
            <SidebarLeft mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
            
            {/* Mobile Header */}
            <div className="lg:hidden bg-white p-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-200">
                <span className="text-xl font-bold text-gray-900">Goa.City</span>
                <button 
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 -mr-2 text-gray-600 hover:text-gray-900 rounded-md"
                >
                    <Bars3Icon className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content Area */}
            <div className={`lg:ml-64 ${isDashboard ? 'xl:mr-80' : ''} min-h-screen transition-all duration-300`}>
                <div className="max-w-7xl mx-auto p-4 sm:p-8">
                    {children}
                </div>
            </div>

            {/* Fixed right sidebar on desktop only */}
            {isDashboard && (
                <div className="hidden xl:block">
                    <SidebarRight />
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
