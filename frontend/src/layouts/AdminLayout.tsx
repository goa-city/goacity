import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import httpClient from '../shared/api/httpClient';
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
    GlobeAltIcon,
    MoonIcon,
    SunIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    ClockIcon,
    LinkIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { logout, adminUser, activeCity, citiesList, changeCity } = useAdminAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [openGroup, setOpenGroup] = useState<any>(null);
    const [showCityMenu, setShowCityMenu] = useState(false);

    // Determine active tab and parent group based on path
    const getActiveState = (path) => {
        let tab = 'overview';
        let group = null;

        if (path === '/admin') {
            tab = 'overview';
        } else if (path.includes('/admin/members') || path.includes('/admin/registrations') || path.includes('/admin/streams') || path.includes('/admin/admins')) {
            group = 'controls';
            if (path.includes('/admin/members')) tab = 'members';
            if (path.includes('/admin/registrations')) tab = 'registrations';
            if (path.includes('/admin/streams')) tab = 'streams';
            if (path.includes('/admin/admins')) tab = 'admins';
        } else if (path.includes('/admin/meetings') || path.includes('/admin/forms') || path.includes('/admin/email-templates')) {
            group = 'communications';
            if (path.includes('/admin/meetings')) tab = 'meetings';
            if (path.includes('/admin/forms')) tab = 'forms';
            if (path.includes('/admin/email-templates')) tab = 'email-templates';
        } else if (path.includes('/admin/whatsapp')) {
            group = 'whatsapp';
            if (path.includes('/admin/whatsapp/status')) tab = 'whatsapp-status';
            if (path.includes('/admin/whatsapp/broadcasts')) tab = 'whatsapp-broadcasts';
            if (path.includes('/admin/whatsapp/templates')) tab = 'whatsapp-templates';
            if (path.includes('/admin/whatsapp/logs')) tab = 'whatsapp-logs';
        } else if (path.includes('/admin/stewardship') || path.includes('/admin/mentorship') || path.includes('/admin/incubator') || path.includes('/admin/collabs') || path.includes('/admin/jobs') || path.includes('/admin/news')) {
            group = 'community';
            if (path.includes('/admin/stewardship')) tab = 'stewardship';
            if (path.includes('/admin/mentorship')) tab = 'mentorship';
            if (path.includes('/admin/incubator')) tab = 'incubator';
            if (path.includes('/admin/collabs')) tab = 'collabs';
            if (path.includes('/admin/jobs')) tab = 'jobs';
            if (path.includes('/admin/news')) tab = 'news';
        } else if (path.includes('/admin/resources') || path.includes('/admin/pages')) {
            group = 'content';
            if (path.includes('/admin/resources')) tab = 'resources';
            if (path.includes('/admin/pages')) tab = 'pages';
        } else if (path.includes('/superadmin/cities') || path.includes('/superadmin')) {
            tab = 'super-cities';
        }

        return { tab, group };
    };

    const { tab: activeTab, group: activeGroup } = getActiveState(location.pathname);

    const toggleGroup = (groupId) => {
        setOpenGroup(prev => prev === groupId ? null : groupId);
    };

    // Sync openGroup with activeGroup on route change
    useEffect(() => {
        if (activeGroup) {
            setOpenGroup(activeGroup);
        }
    }, [activeGroup]);

    const navigation = [
        { name: 'Overview', icon: HomeIcon, id: 'overview', path: '/admin' },
              {
            name: 'Controls',
            id: 'controls',
            icon: InboxStackIcon,
            subItems: [
                { name: 'Members', icon: UsersIcon, id: 'members', path: '/admin/members' },
                { name: 'Registrations', icon: UserGroupIcon, id: 'registrations', path: '/admin/registrations' },
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
            name: 'WhatsApp',
            id: 'whatsapp',
            icon: ChatBubbleLeftRightIcon,
            subItems: [
                { name: 'Connectivity', icon: LinkIcon, id: 'whatsapp-status', path: '/admin/whatsapp/status' },
                { name: 'Broadcasts', icon: PaperAirplaneIcon, id: 'whatsapp-broadcasts', path: '/admin/whatsapp/broadcasts' },
                { name: 'Message Templates', icon: DocumentTextIcon, id: 'whatsapp-templates', path: '/admin/whatsapp/templates' },
                { name: 'History Logs', icon: ClockIcon, id: 'whatsapp-logs', path: '/admin/whatsapp/logs' },
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

    // Build sidebar menu
    const sidebarGroups = [...navigation];

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-zinc-950 font-sans overflow-hidden transition-colors duration-300">
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
                        onClick={toggleTheme}
                        className="flex w-full items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all duration-300 font-bold text-[10px] uppercase tracking-widest mb-3"
                    >
                        {theme === 'dark' ? (
                            <>
                                <SunIcon className="h-4 w-4" />
                                Light Mode
                            </>
                        ) : (
                            <>
                                <MoonIcon className="h-4 w-4" />
                                Dark Mode
                            </>
                        )}
                    </button>

                    <button
                        onClick={logout}
                        className="flex w-full items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 hover:bg-rose-950/10 transition-all duration-300 font-bold text-[10px] uppercase tracking-widest"
                    >
                        <PowerIcon className="h-4 w-4" />
                        Logout  
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8 bg-[#F8FAFC] dark:bg-zinc-950 relative transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">
                        {children || <Outlet />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
