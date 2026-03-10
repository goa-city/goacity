import { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
    HomeIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    DocumentTextIcon, 
    ArrowRightOnRectangleIcon,
    BriefcaseIcon,
    BookOpenIcon,
    InboxStackIcon,
    PowerIcon,
    SparklesIcon,
    HeartIcon,
    LightBulbIcon,
    HandRaisedIcon,
    UserGroupIcon,
    NewspaperIcon,
    EnvelopeIcon,
    ChevronDownIcon,
    WindowIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

const AdminLayout = () => {
    const { logout, adminUser, activeCity, citiesList, changeCity } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [openGroup, setOpenGroup] = useState('communications');
    const [showCityMenu, setShowCityMenu] = useState(false);

    const toggleGroup = (groupId) => {
        setOpenGroup(prev => prev === groupId ? null : groupId);
    };

    // Determine active tab based on path
    const getActiveTab = (path) => {
        if (path === '/admin') return 'overview';
        if (path.includes('/admin/members')) return 'members';
        if (path.includes('/admin/forms')) return 'forms';
        if (path.includes('/admin/meetings')) return 'meetings';
        if (path.includes('/admin/jobs')) return 'jobs';
        if (path.includes('/admin/resources')) return 'resources';
        if (path.includes('/admin/news')) return 'news';
        if (path.includes('/admin/pages')) return 'pages';
        if (path.includes('/admin/email-templates')) return 'email-templates';
        if (path.includes('/admin/streams')) return 'streams';
        if (path.includes('/admin/stewardship')) return 'stewardship';
        if (path.includes('/admin/admins')) return 'admins';
        if (path.includes('/admin/mentorship')) return 'mentorship';
        if (path.includes('/admin/incubator')) return 'incubator';
        if (path.includes('/admin/collabs')) return 'collabs';
        if (path.includes('/superadmin/cities') || path.includes('/superadmin')) return 'super-cities';
        return 'overview';
    };

    const activeTab = getActiveTab(location.pathname);

    const navigation = [
        { name: 'Overview', icon: HomeIcon, id: 'overview', path: '/admin' },
              {
            name: 'Controls',
            id: 'controls',
            icon: InboxStackIcon,
            subItems: [
                { name: 'Members', icon: UsersIcon, id: 'members', path: '/admin/members' },
                { name: 'Streams', icon: InboxStackIcon, id: 'streams', path: '/admin/streams' },
                { name: 'Admin Users', icon: UserGroupIcon, id: 'admins', path: '/admin/admins' },
            ]
        },
         {
            name: 'Communications',
            id: 'communications',
            icon: EnvelopeIcon,
            subItems: [
                { name: 'Meetings', icon: CalendarDaysIcon, id: 'meetings', path: '/admin/meetings' },
                { name: 'Forms', icon: DocumentTextIcon, id: 'forms', path: '/admin/forms' },
                { name: 'Email Templates', icon: EnvelopeIcon, id: 'email-templates', path: '/admin/email-templates' },
            ]
        },
        {
            name: 'Community',
            id: 'community',
            icon: UsersIcon,
            subItems: [
                { name: 'Stewardship', icon: SparklesIcon, id: 'stewardship', path: '/admin/stewardship' },
                { name: 'Mentorship', icon: HeartIcon, id: 'mentorship', path: '/admin/mentorship' },
                { name: 'Incubator', icon: LightBulbIcon, id: 'incubator', path: '/admin/incubator' },
                { name: 'Collab Desk', icon: HandRaisedIcon, id: 'collabs', path: '/admin/collabs' },
                { name: 'Job Board', icon: BriefcaseIcon, id: 'jobs', path: '/admin/jobs' },
                { name: 'News Feed', icon: NewspaperIcon, id: 'news', path: '/admin/news' },
            ]
        },
         {
            name: 'Content',
            id: 'content',
            icon: WindowIcon,
            subItems: [
                { name: 'Resources', icon: BookOpenIcon, id: 'resources', path: '/admin/resources' },
                { name: 'Custom Pages', icon: DocumentTextIcon, id: 'pages', path: '/admin/pages' },
            ]
        } 
     ];

    // Build sidebar menu with conditional Super Admin section
    const sidebarGroups = [...navigation];
    if (adminUser?.isSuperAdmin) {
        sidebarGroups.unshift({
            name: 'Super Admin Dashboard',
            id: 'super-admin',
            icon: GlobeAltIcon,
            subItems: [
                { name: 'Cities Management', icon: GlobeAltIcon, id: 'super-cities', path: '/admin/superadmin/cities' },
            ]
        });
    }

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-72 bg-slate-950 text-white flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.1)] relative z-20">
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-2 relative">
                        <div 
                            className="bg-sky-500 rounded-lg flex items-center justify-center font-black text-white text-lg tracking-tighter italic cursor-pointer group px-2 py-1 min-w-[32px] h-8 transition-all hover:bg-sky-600"
                            onClick={() => setShowCityMenu(!showCityMenu)}
                        >
                            { (activeCity?.name || 'G')[0].toUpperCase() }
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-black tracking-widest text-white uppercase italic truncate">
                                {(activeCity?.name || 'GOA')}.CITY
                            </h1>
                        </div>

                        {showCityMenu && citiesList.length > 1 && (
                            <div className="absolute top-10 left-0 w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                                <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase px-2 py-1">Switch City</p>
                                {citiesList.map(city => (
                                    <button
                                        key={city.id}
                                        onClick={() => { changeCity(city); setShowCityMenu(false); }}
                                        className={`flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-slate-800 ${city.id === activeCity?.id ? 'text-sky-400 bg-sky-500/5' : 'text-slate-300'}`}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                                        {city.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] ml-11">Admin Console</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                    {sidebarGroups.map((group) => (
                        <div key={group.id} className="space-y-1">
                            {group.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative text-slate-400 hover:text-white hover:bg-slate-900"
                                    >
                                        <div className="flex items-center gap-3">
                                            <group.icon className={`h-5 w-5 text-slate-600 group-hover:text-slate-200`} />
                                            <span className="text-sm font-bold tracking-tight">{group.name}</span>
                                        </div>
                                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${openGroup === group.id ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {openGroup === group.id && (
                                        <div className="space-y-1 mt-1">
                                            {group.subItems.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => navigate(item.path)}
                                                    className={`flex w-full items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-200 group relative ${
                                                        activeTab === item.id 
                                                            ? 'bg-sky-500/10 text-sky-400 font-bold' 
                                                            : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                                                    }`}
                                                >
                                                    {activeTab === item.id && (
                                                        <div className="absolute left-0 w-0.5 h-4 bg-sky-500 rounded-r-full"></div>
                                                    )}
                                                    <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                                                    <span className="text-sm tracking-tight">{item.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    key={group.id}
                                    onClick={() => navigate(group.path)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                        activeTab === group.id 
                                            ? 'bg-sky-500/10 text-sky-400 font-bold' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-900'
                                    }`}
                                >
                                    {activeTab === group.id && (
                                        <div className="absolute left-0 w-0.5 h-6 bg-sky-500 rounded-r-full"></div>
                                    )}
                                    <group.icon className={`h-5 w-5 ${activeTab === group.id ? 'text-sky-400' : 'text-slate-600 group-hover:text-slate-200'}`} />
                                    <span className="text-sm font-bold tracking-tight">{group.name}</span>
                                </button>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-900 bg-slate-1000/50">
                    <div className="flex items-center gap-4 px-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-500 font-bold">
                            {(adminUser?.full_name || 'A')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-slate-600 font-black uppercase tracking-widest">Administrator</p>
                            <p className="text-sm font-bold text-slate-200 truncate">{adminUser?.full_name || adminUser?.email || 'System Admin'}</p>
                        </div>
                    </div>
                    
                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/10 transition-all duration-300 font-bold text-xs uppercase tracking-widest"
                    >
                        <PowerIcon className="h-4 w-4" />
                        Logout  
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 bg-slate-50 relative">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
