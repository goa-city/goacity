import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { SuperAdminAuthProvider } from './context/SuperAdminAuthContext';
import { Capacitor } from '@capacitor/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';

// ─── Loading Component ────────────────────────────────────────────────────────
const LoadingScreen = () => (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-black uppercase text-[10px] tracking-[0.2em] animate-pulse">Initializing Interface...</p>
    </div>
);

// ─── Page Imports (Lazy) ──────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Home = lazy(() => import('./pages/Home'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminMembers = lazy(() => import('./pages/admin/AdminMembers'));
const AdminRegistrations = lazy(() => import('./pages/admin/AdminRegistrations'));
const AdminMemberDetail = lazy(() => import('./pages/admin/AdminMemberDetail'));
const AdminStreams = lazy(() => import('./pages/admin/AdminStreams'));
const AdminForms = lazy(() => import('./pages/admin/AdminForms'));
const AdminFormEditor = lazy(() => import('./pages/admin/AdminFormEditor'));
const AdminMemberCreate = lazy(() => import('./pages/admin/AdminMemberCreate'));
const AdminMeetings = lazy(() => import('./pages/admin/AdminMeetings'));
const AdminMeetingEditor = lazy(() => import('./pages/admin/AdminMeetingEditor'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'));
const AdminJobs = lazy(() => import('./pages/admin/AdminJobs'));
const AdminJobEditor = lazy(() => import('./pages/admin/AdminJobEditor'));
const AdminResources = lazy(() => import('./pages/admin/AdminResources'));
const AdminResourceEditor = lazy(() => import('./pages/admin/AdminResourceEditor'));
const AdminAdmins = lazy(() => import('./pages/admin/AdminAdmins'));
const AdminNews = lazy(() => import('./pages/admin/AdminNews'));
const AdminPages = lazy(() => import('./pages/admin/AdminPages'));
const AdminPageEditor = lazy(() => import('./pages/admin/AdminPageEditor'));
const AdminEmailTemplates = lazy(() => import('./pages/admin/AdminEmailTemplates'));
const AdminEmailTemplateEditor = lazy(() => import('./pages/admin/AdminEmailTemplateEditor'));
const AdminCities = lazy(() => import('./pages/admin/AdminCities'));
const AdminWhatsAppStatus = lazy(() => import('./pages/admin/AdminWhatsAppStatus'));
const AdminWhatsAppBroadcasts = lazy(() => import('./pages/admin/AdminWhatsAppBroadcasts'));
const AdminWhatsAppTemplates = lazy(() => import('./pages/admin/AdminWhatsAppTemplates'));
const AdminWhatsAppTemplateEditor = lazy(() => import('./pages/admin/AdminWhatsAppTemplateEditor'));
const AdminWhatsAppLogs = lazy(() => import('./pages/admin/AdminWhatsAppLogs'));
const AdminWhatsAppBroadcastDetails = lazy(() => import('./pages/admin/AdminWhatsAppBroadcastDetails'));
const PageView = lazy(() => import('./pages/PageView'));
const SuperAdminLogin = lazy(() => import('./pages/superadmin/SuperAdminLogin'));

const Dashboard = lazy(() => import('./pages/Dashboard'));
const News = lazy(() => import('./pages/News'));
const Profile = lazy(() => import('./pages/Profile'));
const Resources = lazy(() => import('./pages/Resources'));
const ResourceEditor = lazy(() => import('./pages/ResourceEditor'));
const Jobs = lazy(() => import('./pages/Jobs'));
const JobView = lazy(() => import('./pages/JobView'));
const JobEditor = lazy(() => import('./pages/JobEditor'));
const DebugStreams = lazy(() => import('./pages/DebugStreams'));
const StewardshipDashboard = lazy(() => import('./pages/StewardshipDashboard'));
const AdminStewardship = lazy(() => import('./pages/admin/AdminStewardship'));
const AdminMentorship = lazy(() => import('./pages/admin/AdminMentorship'));
const AdminIncubator = lazy(() => import('./pages/admin/AdminIncubator'));
const Mentors = lazy(() => import('./pages/Mentors'));
const MentorshipWorkspace = lazy(() => import('./pages/MentorshipWorkspace'));
const IncubatorSubmit = lazy(() => import('./pages/IncubatorSubmit'));
const IncubatorExplore = lazy(() => import('./pages/IncubatorExplore'));
const MyPeople = lazy(() => import('./pages/MyPeople'));
const PublicProfile = lazy(() => import('./pages/PublicProfile'));
const AdminCollabs = lazy(() => import('./pages/admin/AdminCollabs'));
const MeetingView = lazy(() => import('./pages/MeetingView'));
const MemberMeetings = lazy(() => import('./pages/MemberMeetings'));

// ─── Guards ────────────────────────────────────────────────────────────────────
const AdminProtectedRoute = () => {
    const { adminUser, loading } = useAdminAuth() as any;
    if (loading) return <LoadingScreen />;
    if (!adminUser) return <Navigate to="/admin/login" replace />;
    return <Outlet />;
};

const MemberProtectedRoute = () => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (!user) return <Navigate to="/" replace />;
    return <Outlet />;
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
});

const Register = lazy(() => import('./features/auth/components/RegisterView'));

const App: React.FC = () => {
    const isNative = Capacitor.isNativePlatform();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthProvider>
                    <AdminAuthProvider>
                        <SuperAdminAuthProvider>
                        <Router>
                            <Suspense fallback={<LoadingScreen />}>
                                <Routes>
                                    {/* ── Public ─────────────────────────── */}
                                    <Route path="/" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/home" element={<Home />} />
                                    <Route path="/form/:formId" element={<Onboarding />} />
                                    <Route path="/onboarding/form/:formId" element={<Onboarding />} />
                                    {!isNative && <Route path="/admin/login" element={<AdminLogin />} />}
                                    {isNative && <Route path="/admin/login" element={<Navigate to="/" replace />} />}

                                    {/* ── Super Admin ── */}
                                    {!isNative && (
                                        <>
                                            <Route path="/superadmin/login" element={<SuperAdminLogin />} />
                                            <Route path="/superadmin" element={<SuperAdminLayout />}>
                                                <Route index element={<Navigate to="/superadmin/cities" replace />} />
                                                <Route path="cities" element={<AdminCities />} />
                                            </Route>
                                        </>
                                    )}

                                    {/* ── Regular Admin ── */}
                                    {!isNative && (
                                        <Route element={<AdminProtectedRoute />}>
                                            <Route element={<AdminLayout />}>
                                                <Route path="/admin" element={<AdminDashboard />} />
                                                <Route path="/admin/members" element={<AdminMembers />} />
                                                <Route path="/admin/registrations" element={<AdminRegistrations />} />
                                                <Route path="/admin/members/create" element={<AdminMemberCreate />} />
                                                <Route path="/admin/members/:id" element={<AdminMemberDetail />} />
                                                <Route path="/admin/meetings" element={<AdminMeetings />} />
                                                <Route path="/admin/meetings/create" element={<AdminMeetingEditor />} />
                                                <Route path="/admin/meetings/:id" element={<AdminMeetingEditor />} />
                                                <Route path="/admin/streams" element={<AdminStreams />} />
                                                <Route path="/admin/forms" element={<AdminForms />} />
                                                <Route path="/admin/forms/:id" element={<AdminFormEditor />} />
                                                <Route path="/admin/stewardship" element={<AdminStewardship />} />
                                                <Route path="/admin/mentorship" element={<AdminMentorship />} />
                                                <Route path="/admin/incubator" element={<AdminIncubator />} />
                                                <Route path="/admin/collabs" element={<AdminCollabs />} />
                                                <Route path="/admin/jobs" element={<AdminJobs />} />
                                                <Route path="/admin/jobs/:id" element={<AdminJobEditor />} />
                                                <Route path="/admin/resources" element={<AdminResources />} />
                                                <Route path="/admin/resources/:id" element={<AdminResourceEditor />} />
                                                <Route path="/admin/news" element={<AdminNews />} />
                                                <Route path="/admin/pages" element={<AdminPages />} />
                                                <Route path="/admin/pages/:id" element={<AdminPageEditor />} />
                                                <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
                                                <Route path="/admin/email-templates/create" element={<AdminEmailTemplateEditor />} />
                                                <Route path="/admin/email-templates/:id" element={<AdminEmailTemplateEditor />} />
                                                <Route path="/admin/admins" element={<AdminAdmins />} />
                                                <Route path="/admin/whatsapp/status" element={<AdminWhatsAppStatus />} />
                                                <Route path="/admin/whatsapp/broadcasts" element={<AdminWhatsAppBroadcasts />} />
                                                <Route path="/admin/whatsapp/templates" element={<AdminWhatsAppTemplates />} />
                                                <Route path="/admin/whatsapp/templates/create" element={<AdminWhatsAppTemplateEditor />} />
                                                <Route path="/admin/whatsapp/templates/:id" element={<AdminWhatsAppTemplateEditor />} />
                                                <Route path="/admin/whatsapp/logs" element={<AdminWhatsAppLogs />} />
                                                <Route path="/admin/whatsapp/logs/:id" element={<AdminWhatsAppBroadcastDetails />} />
                                            </Route>
                                        </Route>
                                    )}

                                    {/* ── Member Area ── */}
                                    <Route element={<MemberProtectedRoute />}>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route path="/news" element={<News />} />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/resources" element={<Resources />} />
                                        <Route path="/resources/add" element={<ResourceEditor />} />
                                        <Route path="/jobs" element={<Jobs />} />
                                        <Route path="/jobs/:slug" element={<JobView />} />
                                        <Route path="/jobs/post" element={<JobEditor />} />
                                        <Route path="/stewardship" element={<StewardshipDashboard />} />
                                        <Route path="/mentors" element={<Mentors />} />
                                        <Route path="/dashboard/mentorship/:id" element={<MentorshipWorkspace />} />
                                        <Route path="/my-people" element={<MyPeople />} />
                                        <Route path="/profile/:slug" element={<PublicProfile />} />
                                        <Route path="/meetings" element={<MemberMeetings />} />
                                        <Route path="/meetings/:slug" element={<MeetingView />} />
                                        <Route path="/incubator/submit" element={<IncubatorSubmit />} />
                                        <Route path="/incubator/explore" element={<IncubatorExplore />} />
                                        <Route path="/onboarding" element={<Onboarding />} />
                                        <Route path="/debug-streams" element={<DebugStreams />} />
                                        <Route path="/onboarding/form/:formId" element={<Onboarding />} />
                                        <Route path="/pages/:slug" element={<PageView />} />
                                    </Route>
                                </Routes>
                            </Suspense>
                        </Router>
                    </SuperAdminAuthProvider>
                </AdminAuthProvider>
            </AuthProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
