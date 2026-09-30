import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../shared/components/ui/Card';
import { 
    ChartBarIcon, 
    UserGroupIcon, 
    ArrowPathIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    ArrowTopRightOnSquareIcon,
    ShieldCheckIcon,
    EyeIcon,
    XMarkIcon,
    ClockIcon,
    UserIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

interface AuthLogItem {
    id: number;
    event: string;
    channel: string;
    identifier: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    cityName: string;
    userName: string;
    adminRole?: string;
}

interface AnalyticsData {
    summary: {
        totalPageViews: number;
        totalLogins: number;
        dau: number;
        wau: number;
        mau: number;
    };
    topFrontendPages?: Array<{
        path: string;
        count: number;
    }>;
    topAdminPages?: Array<{
        path: string;
        count: number;
    }>;
    topPages: Array<{
        path: string;
        count: number;
    }>;
    devices: Array<{
        device: string;
        count: number;
    }>;
    memberLogs?: AuthLogItem[];
    adminLogs?: AuthLogItem[];
    recentLogs: AuthLogItem[];
}

interface PageVisitor {
    id: number;
    userType: 'member' | 'admin' | 'guest';
    userName: string;
    identifier: string;
    deviceType: string;
    ipAddress: string | null;
    referrer: string | null;
    durationSeconds: number;
    createdAt: string;
    cityName: string;
}

interface PageDetailsResponse {
    path: string;
    totalCount: number;
    visitors: PageVisitor[];
}

interface CityOption {
    id: number;
    name: string;
}

function formatRelativeTime(dateString: string): string {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const SuperAdminAnalytics: React.FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [cities, setCities] = useState<CityOption[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [selectedDays, setSelectedDays] = useState<number>(30);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Active tabs
    const [pagesTab, setPagesTab] = useState<'frontend' | 'admin'>('frontend');
    const [logsTab, setLogsTab] = useState<'member' | 'admin'>('member');

    // Page Details Modal State
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [pageDetails, setPageDetails] = useState<PageDetailsResponse | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Fetch cities for filtering
    useEffect(() => {
        api.get('/cities')
            .then(res => setCities(res.data || []))
            .catch(err => console.error('Failed to load cities:', err));
    }, []);

    // Fetch analytics overview
    const fetchAnalytics = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const params: any = { days: selectedDays };
            if (selectedCityId) {
                params.cityId = selectedCityId;
            }
            const res = await api.get('/superadmin/analytics/overview', { params });
            setData(res.data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [selectedCityId, selectedDays]);

    // Fetch details for a specific page (latest 50 visitors & logs)
    const handleOpenPageDetails = async (path: string) => {
        setSelectedPath(path);
        setLoadingDetails(true);
        setPageDetails(null);

        try {
            const params: any = { path };
            if (selectedCityId) {
                params.cityId = selectedCityId;
            }
            const res = await api.get('/superadmin/analytics/page-details', { params });
            setPageDetails(res.data);
        } catch (error) {
            console.error('Failed to fetch page details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedPath(null);
        setPageDetails(null);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Aggregating platform analytics...</p>
                </div>
            </div>
        );
    }

    const summary = data?.summary || { totalPageViews: 0, totalLogins: 0, dau: 0, wau: 0, mau: 0 };
    const topFrontendPages = data?.topFrontendPages || (data?.topPages || []).filter(p => !p.path.startsWith('/admin') && !p.path.startsWith('/superadmin'));
    const topAdminPages = data?.topAdminPages || (data?.topPages || []).filter(p => p.path.startsWith('/admin') || p.path.startsWith('/superadmin'));
    const activePagesList = pagesTab === 'frontend' ? topFrontendPages : topAdminPages;
    const devices = data?.devices || [];

    const memberLogs = data?.memberLogs || (data?.recentLogs || []).filter(l => !l.adminRole && l.channel !== 'PASSWORD');
    const adminLogs = data?.adminLogs || (data?.recentLogs || []).filter(l => Boolean(l.adminRole) || l.channel === 'PASSWORD');
    const activeLogsList = logsTab === 'member' ? memberLogs : adminLogs;

    const getEventBadge = (event: string) => {
        switch (event) {
            case 'LOGIN_SUCCESS':
            case 'TOKEN_LOGIN':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'LOGIN_FAILED':
                return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'OTP_SENT':
                return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
        }
    };

    return (
        <div className="space-y-10 py-6 overflow-y-auto pr-2">
            {/* Header with Filters */}
            <div className="flex flex-wrap gap-6 justify-between items-center border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Platform Analytics
                        <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 bg-violet-600/20 text-violet-400 rounded-full border border-violet-500/20">
                            Super Admin Only
                        </span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Real-time user engagement, session traffic, and separated member & admin audit logs.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* City Selector */}
                    <select
                        value={selectedCityId}
                        onChange={(e) => setSelectedCityId(e.target.value)}
                        className="bg-[#12121c] border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    >
                        <option value="">All Cities</option>
                        {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Time Window */}
                    <div className="flex bg-[#12121c] p-1 rounded-xl border border-white/10 text-xs font-semibold">
                        {[
                            { label: '7 Days', value: 7 },
                            { label: '30 Days', value: 30 },
                            { label: '90 Days', value: 90 }
                        ].map(t => (
                            <button
                                key={t.value}
                                onClick={() => setSelectedDays(t.value)}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    selectedDays === t.value 
                                        ? 'bg-violet-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={() => fetchAnalytics(true)}
                        disabled={refreshing}
                        className="p-2.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Refresh metrics"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-[#0f0f18] border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Daily Active (DAU)</p>
                            <h3 className="text-3xl font-black text-white">{summary.dau}</h3>
                            <p className="text-[11px] text-violet-400 font-bold mt-1">Unique members past 24h</p>
                        </div>
                        <div className="p-3 bg-violet-600/10 rounded-xl border border-violet-500/20 text-violet-400">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#0f0f18] border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Weekly Active (WAU)</p>
                            <h3 className="text-3xl font-black text-white">{summary.wau}</h3>
                            <p className="text-[11px] text-indigo-400 font-bold mt-1">Unique members past 7d</p>
                        </div>
                        <div className="p-3 bg-indigo-600/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#0f0f18] border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Monthly Active (MAU)</p>
                            <h3 className="text-3xl font-black text-white">{summary.mau}</h3>
                            <p className="text-[11px] text-sky-400 font-bold mt-1">Past {selectedDays} days</p>
                        </div>
                        <div className="p-3 bg-sky-600/10 rounded-xl border border-sky-500/20 text-sky-400">
                            <UserGroupIcon className="h-6 w-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#0f0f18] border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Successful Logins</p>
                            <h3 className="text-3xl font-black text-emerald-400">{summary.totalLogins}</h3>
                            <p className="text-[11px] text-slate-400 font-bold mt-1">Total authentications</p>
                        </div>
                        <div className="p-3 bg-emerald-600/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                            <ShieldCheckIcon className="h-6 w-6" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#0f0f18] border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">Total Page Views</p>
                            <h3 className="text-3xl font-black text-violet-300">{summary.totalPageViews}</h3>
                            <p className="text-[11px] text-slate-400 font-bold mt-1">Platform hits</p>
                        </div>
                        <div className="p-3 bg-violet-600/10 rounded-xl border border-violet-500/20 text-violet-400">
                            <ChartBarIcon className="h-6 w-6" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Top Visited Pages & Device Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Most Visited Pages - Separated by Frontend vs Admin */}
                <div className="lg:col-span-2">
                    <Card className="bg-[#0f0f18] border-white/5 rounded-2xl p-6">
                        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Most Visited Pages & Content</h3>
                                <p className="text-xs text-slate-400">Routes with highest interactions in selected timeframe</p>
                            </div>

                            {/* Separation Tabs: Frontend Pages vs Admin Pages */}
                            <div className="flex bg-[#12121c] p-1 rounded-xl border border-white/10 text-xs font-semibold">
                                <button
                                    onClick={() => setPagesTab('frontend')}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                                        pagesTab === 'frontend'
                                            ? 'bg-violet-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <GlobeAltIcon className="h-4 w-4" />
                                    Frontend Pages
                                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                        {topFrontendPages.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setPagesTab('admin')}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                                        pagesTab === 'admin'
                                            ? 'bg-violet-600 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Admin Pages
                                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                        {topAdminPages.length}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {activePagesList.length === 0 ? (
                            <p className="text-xs text-slate-500 text-center py-8 italic">
                                No {pagesTab === 'frontend' ? 'frontend' : 'admin'} page views recorded yet
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {activePagesList.map((p, idx) => (
                                    <div 
                                        key={p.path} 
                                        className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="w-6 text-center text-xs font-black text-slate-500">#{idx + 1}</span>
                                            <span className="text-xs font-mono text-slate-200 truncate font-semibold">
                                                {p.path}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                                            <span className="text-xs font-bold text-violet-400 bg-violet-600/20 px-2.5 py-1 rounded-lg">
                                                {p.count} views
                                            </span>

                                            {/* Button to view details: Latest 50 users who visited that page & time log */}
                                            <button 
                                                onClick={() => handleOpenPageDetails(p.path)}
                                                className="flex items-center gap-1.5 px-3 py-1 bg-violet-600/10 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/20 hover:border-violet-500 rounded-lg text-xs font-bold transition-all shadow-sm"
                                                title="View latest 50 visitors & time logs for this page"
                                            >
                                                <EyeIcon className="h-3.5 w-3.5" />
                                                <span>View Details</span>
                                            </button>

                                            {/* Secondary direct preview link */}
                                            <a 
                                                href={p.path} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                                                title="Open page in new browser tab"
                                            >
                                                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Device Type Distribution */}
                <div>
                    <Card className="bg-[#0f0f18] border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white tracking-tight mb-1">Device Breakdown</h3>
                        <p className="text-xs text-slate-400 mb-6">Audience client device classifications</p>

                        <div className="space-y-4">
                            {devices.map(d => {
                                const total = devices.reduce((acc, curr) => acc + curr.count, 0);
                                const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
                                return (
                                    <div key={d.device} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {d.device === 'mobile' ? (
                                                    <DevicePhoneMobileIcon className="h-4 w-4 text-violet-400" />
                                                ) : (
                                                    <ComputerDesktopIcon className="h-4 w-4 text-indigo-400" />
                                                )}
                                                <span className="text-xs font-bold text-white capitalize">{d.device}</span>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400">{d.count} ({pct}%)</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-gradient-to-r from-violet-600 to-indigo-600 h-full rounded-full transition-all duration-500" 
                                                style={{ width: `${pct}%` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {devices.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-6 italic">No device metrics yet</p>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Separated Authentication & Login Logs */}
            <Card className="bg-[#0f0f18] border-white/5 rounded-2xl p-6">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white tracking-tight">Authentication & Login Logs</h3>
                        <p className="text-xs text-slate-400">Separated audit trails for platform members and administrator consoles</p>
                    </div>

                    {/* Logs Separation Tabs: Member Logs vs Admin Logs */}
                    <div className="flex bg-[#12121c] p-1 rounded-xl border border-white/10 text-xs font-semibold">
                        <button
                            onClick={() => setLogsTab('member')}
                            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                                logsTab === 'member'
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <UserIcon className="h-4 w-4" />
                            Member Logins & OTPs
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                {memberLogs.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setLogsTab('admin')}
                            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
                                logsTab === 'admin'
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <ShieldCheckIcon className="h-4 w-4" />
                            Admin & Super Admin Logins
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                                {adminLogs.length}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                <th className="pb-3 px-3">{logsTab === 'member' ? 'Member User' : 'Admin User'}</th>
                                <th className="pb-3 px-3">Event</th>
                                <th className="pb-3 px-3">Channel / Role</th>
                                <th className="pb-3 px-3">City</th>
                                <th className="pb-3 px-3">IP & Client</th>
                                <th className="pb-3 px-3 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02] text-xs">
                            {activeLogsList.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                                    <td className="py-3 px-3">
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {log.userName}
                                            {log.adminRole && (
                                                <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                                                    {log.adminRole}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono">{log.identifier || '—'}</div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getEventBadge(log.event)}`}>
                                            {log.event.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 font-semibold text-slate-300">
                                        {log.channel || '—'}
                                    </td>
                                    <td className="py-3 px-3 text-slate-400 font-medium">
                                        {log.cityName}
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="font-mono text-slate-400 text-[11px]">{log.ipAddress || '—'}</div>
                                        <div className="text-[10px] text-slate-600 truncate max-w-[200px]" title={log.userAgent}>
                                            {log.userAgent || '—'}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                                        <div>
                                            {new Date(log.createdAt).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </div>
                                        <div className="text-[10px] text-slate-600">
                                            {formatRelativeTime(log.createdAt)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {activeLogsList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                                        No recent {logsTab === 'member' ? 'member' : 'admin'} logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal: Latest 50 Page Visitors & Time Logs */}
            {selectedPath && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0e0e18] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-4 bg-[#121220]">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <EyeIcon className="h-5 w-5 text-violet-400 flex-shrink-0" />
                                    <h2 className="text-lg font-black text-white tracking-tight truncate">
                                        Page Visitor Details & Time Logs
                                    </h2>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-xs font-mono text-violet-300 bg-violet-950/60 border border-violet-800/40 px-2.5 py-1 rounded-md">
                                        {selectedPath}
                                    </span>
                                    {pageDetails && (
                                        <span className="text-xs text-slate-400 font-semibold">
                                            Total Recorded Hits: <strong className="text-white">{pageDetails.totalCount}</strong>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                <a
                                    href={selectedPath}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Open page in new tab"
                                >
                                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                </a>
                                <button
                                    onClick={() => handleOpenPageDetails(selectedPath)}
                                    disabled={loadingDetails}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Reload latest visitors"
                                >
                                    <ArrowPathIcon className={`h-4 w-4 ${loadingDetails ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Close dialog"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingDetails ? (
                                <div className="py-16 text-center">
                                    <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                        Retrieving latest 50 visitors for {selectedPath}...
                                    </p>
                                </div>
                            ) : pageDetails && pageDetails.visitors.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs text-slate-400 px-1">
                                        <span>Showing latest <strong>{pageDetails.visitors.length}</strong> visitor entries</span>
                                        <span className="flex items-center gap-1.5 font-medium text-violet-400">
                                            <ClockIcon className="h-3.5 w-3.5" />
                                            Ordered by most recent interaction
                                        </span>
                                    </div>

                                    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] font-black uppercase tracking-wider text-slate-400">
                                                    <th className="py-3 px-3.5">#</th>
                                                    <th className="py-3 px-3.5">Visitor Identity</th>
                                                    <th className="py-3 px-3.5">User Type</th>
                                                    <th className="py-3 px-3.5">Device</th>
                                                    <th className="py-3 px-3.5">City / Location</th>
                                                    <th className="py-3 px-3.5 text-right">Time Log</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/[0.02] text-xs">
                                                {pageDetails.visitors.map((v, i) => (
                                                    <tr key={v.id || i} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                                                            {i + 1}
                                                        </td>
                                                        <td className="py-3 px-3.5">
                                                            <div className="font-bold text-white flex items-center gap-2">
                                                                {v.userName}
                                                            </div>
                                                            <div className="text-[11px] text-slate-400 font-mono">
                                                                {v.identifier}
                                                            </div>
                                                            {v.referrer && (
                                                                <div className="text-[10px] text-slate-600 truncate max-w-[220px]" title={v.referrer}>
                                                                    Ref: {v.referrer}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-3.5">
                                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                v.userType === 'member'
                                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                    : v.userType === 'admin'
                                                                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                                                                    : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                            }`}>
                                                                {v.userType}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3.5 font-medium text-slate-300">
                                                            <div className="flex items-center gap-1.5 capitalize">
                                                                {v.deviceType === 'mobile' ? (
                                                                    <DevicePhoneMobileIcon className="h-3.5 w-3.5 text-violet-400" />
                                                                ) : (
                                                                    <ComputerDesktopIcon className="h-3.5 w-3.5 text-indigo-400" />
                                                                )}
                                                                <span>{v.deviceType}</span>
                                                            </div>
                                                            {v.ipAddress && (
                                                                <div className="text-[10px] text-slate-500 font-mono">
                                                                    {v.ipAddress}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-3.5 text-slate-400 font-medium">
                                                            {v.cityName}
                                                        </td>
                                                        <td className="py-3 px-3.5 text-right font-mono whitespace-nowrap">
                                                            <div className="text-white font-medium">
                                                                {new Date(v.createdAt).toLocaleString('en-GB', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                    second: '2-digit'
                                                                })}
                                                            </div>
                                                            <div className="text-[10px] text-violet-400 font-semibold">
                                                                {formatRelativeTime(v.createdAt)}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-16 text-center text-slate-500">
                                    <p className="italic text-sm">No visitor records found for this route yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-white/10 bg-[#121220] flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminAnalytics;

