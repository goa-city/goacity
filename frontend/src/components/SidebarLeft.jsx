import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HomeIcon, 
    NewspaperIcon, 
    VideoCameraIcon, 
    BookOpenIcon, 
    BriefcaseIcon, 
    MegaphoneIcon, 
    StarIcon,
    XMarkIcon,
    ArrowLeftOnRectangleIcon,
    SparklesIcon,
    UsersIcon,
    LightBulbIcon,
    HeartIcon,
    CalendarDaysIcon
} from '@heroicons/react/24/outline'; // Using outline icons for a clean look

const SidebarLeft = ({ mobileOpen, setMobileOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const getInitials = (name) => {
        if (!name) return 'M';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const profileImage = user?.profile_photo;
    const initials = getInitials(`${user?.first_name || ''} ${user?.last_name || ''}`);
    
    // Use latest stream color (first in the returned list due to sm.id DESC)
    const latestStreamColor = user?.streams?.[0]?.color || '#4F46E5'; 

    const navigation = [
        { name: 'City', href: '/dashboard', icon: HomeIcon },
        { name: 'News', href: '/news', icon: NewspaperIcon },
        { name: 'My People', href: '/my-people', icon: UsersIcon },
        { name: 'Mentorship', href: '/mentors', icon: HeartIcon },
        { name: 'Meetings', href: '/meetings', icon: CalendarDaysIcon },
        { name: 'Stewardship', href: '/stewardship', icon: SparklesIcon },
        { name: 'Resources', href: '/resources', icon: BookOpenIcon },
        { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
        { name: 'Idea Lab', href: '/incubator/explore', icon: LightBulbIcon },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                ></div>
            )}

            <div className={`
                fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-100 z-50 overflow-y-auto transition-transform duration-300
                lg:translate-x-0
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo Area */}
                <div className="p-6 flex justify-between items-center">
                     <span className="text-2xl font-bold text-gray-900">Goa.City</span>
                     <button 
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-900"
                     >
                         <XMarkIcon className="w-6 h-6" />
                     </button>
                </div>

                {/* Profile Section */}
                <div className="flex flex-col items-center px-6 mb-8 text-center text-gray-900">
                    <div className="relative">
                        {profileImage ? (
                            <img 
                                src={profileImage} 
                                alt="Profile" 
                                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
                            />
                        ) : (
                            <div 
                                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-sm"
                                style={{ backgroundColor: latestStreamColor }}
                            >
                                {initials}
                            </div>
                        )}
                     </div>
                    <h2 className="mt-4 text-lg font-bold text-gray-900">{(user?.first_name || user?.last_name) ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim() : 'Member'}</h2>
                    <p className="text-sm text-gray-600">{user?.email}</p>
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
                                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                                    active 
                                        ? 'text-gray-900 bg-gray-50' 
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 mr-3 ${active ? 'text-gray-900' : 'text-gray-400'}`} />
                                {item.name}
                            </button>
                        )
                    })}
                    
                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <button
                            onClick={() => {
                                logout();
                                setMobileOpen(false);
                                navigate('/');
                            }}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors text-gray-500 hover:text-red-600 hover:bg-red-50"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </nav>

                 {/* Footer / Copyright if needed */}
                 <div className="p-6 text-xs text-gray-400">
                    &copy; 2026 Goa.City
                    <div className="flex gap-3 mt-2 font-medium">
                        <button onClick={() => navigate('/pages/credits')} className="hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px]">Credits</button>
                        <button onClick={() => navigate('/pages/terms')} className="hover:text-gray-900 transition-colors uppercase tracking-widest text-[10px]">Terms & Conditions</button>
                    </div>
                 </div>
            </div>
        </>
    );
};
export default SidebarLeft;
