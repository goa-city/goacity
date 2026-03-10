import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/admin/AdminMembers';
import AdminMemberDetail from './pages/admin/AdminMemberDetail';
import AdminStreams from './pages/admin/AdminStreams';
import AdminForms from './pages/admin/AdminForms';
import AdminFormEditor from './pages/admin/AdminFormEditor';
import AdminMemberCreate from './pages/admin/AdminMemberCreate';
import AdminMeetings from './pages/admin/AdminMeetings';
import AdminMeetingEditor from './pages/admin/AdminMeetingEditor';
import AdminLayout from './layouts/AdminLayout';
import AdminJobs from './pages/admin/AdminJobs';
import AdminJobEditor from './pages/admin/AdminJobEditor';
import AdminResources from './pages/admin/AdminResources';
import AdminResourceEditor from './pages/admin/AdminResourceEditor';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminNews from './pages/admin/AdminNews';
import AdminPages from './pages/admin/AdminPages';
import AdminPageEditor from './pages/admin/AdminPageEditor';
import AdminEmailTemplates from './pages/admin/AdminEmailTemplates';
import AdminEmailTemplateEditor from './pages/admin/AdminEmailTemplateEditor';
import AdminCities from './pages/admin/AdminCities';
import PageView from './pages/PageView';

import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Profile from './pages/Profile';
import Resources from './pages/Resources';
import ResourceEditor from './pages/ResourceEditor';
import Jobs from './pages/Jobs';
import JobEditor from './pages/JobEditor';
import DebugStreams from './pages/DebugStreams';
import StewardshipDashboard from './pages/StewardshipDashboard';
import AdminStewardship from './pages/admin/AdminStewardship';
import AdminMentorship from './pages/admin/AdminMentorship';
import AdminIncubator from './pages/admin/AdminIncubator';
import Mentors from './pages/Mentors';
import MentorshipWorkspace from './pages/MentorshipWorkspace';
import IncubatorSubmit from './pages/IncubatorSubmit';
import IncubatorExplore from './pages/IncubatorExplore';
import MyPeople from './pages/MyPeople';
import PublicProfile from './pages/PublicProfile';
import AdminCollabs from './pages/admin/AdminCollabs';
import MeetingView from './pages/MeetingView';
import MemberMeetings from './pages/MemberMeetings';

// Member Protected Route
const MemberProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest text-slate-400">Loading Session...</div>;
    if (!user) return <Navigate to="/" />;
    return <MemberOnboardingCheck>{children || <Outlet />}</MemberOnboardingCheck>;
};

const MemberOnboardingCheck = ({ children }) => {
    return children;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
    const { adminUser, loading } = useAdminAuth();
    
    if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-widest text-slate-400 font-sans">Authenticating Admin...</div>;
    
    if (!adminUser) {
        console.log("[GUARD] Admin access denied - No user found");
        return <Navigate to="/admin/login" />;
    }
    
    console.log("[GUARD] Admin access granted for:", adminUser.email);
    return children ? children : <Outlet />;
};

// Super Admin Protected Route
const SuperAdminProtectedRoute = ({ children }) => {
    const { adminUser, loading } = useAdminAuth();
    
    if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-[0.3em] text-cyan-400">Verifying Super Privilege...</div>;
    
    const isSuper = adminUser?.isSuperAdmin || (adminUser?.email === 'admin@goa.city');
    console.log("[GUARD] SuperAdmin check:", { email: adminUser?.email, isSuper, isSuperFlag: adminUser?.isSuperAdmin });

    if (!adminUser || !isSuper) {
        console.warn("[GUARD] SuperAdmin access denied for:", adminUser?.email);
        return <Navigate to="/admin" />;
    }
    
    return children ? children : <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* 1. Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* 2. Admin Protected Routes (Shared Sidebar Layout) */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                {/* Regular Admin Pages */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/members" element={<AdminMembers />} />
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

                {/* Super Admin Pages (Deep Access Required) */}
                <Route element={<SuperAdminProtectedRoute />}>
                  <Route path="/admin/superadmin" element={<AdminCities />} />
                  <Route path="/admin/superadmin/cities" element={<AdminCities />} />
                  <Route path="/superadmin" element={<AdminCities />} />
                  <Route path="/superadmin/cities" element={<AdminCities />} />
                </Route>
              </Route>
            </Route>

            {/* 3. Member Protected Routes */}
            <Route element={<MemberProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/news" element={<News />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/resources/add" element={<ResourceEditor />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/post" element={<JobEditor />} />
              <Route path="/stewardship" element={<StewardshipDashboard />} />
              <Route path="/mentors" element={<Mentors />} />
              <Route path="/dashboard/mentorship/:id" element={<MentorshipWorkspace />} />
              <Route path="/my-people" element={<MyPeople />} />
              <Route path="/profile/:id" element={<PublicProfile />} />
              <Route path="/meetings" element={<MemberMeetings />} />
              <Route path="/meetings/:id" element={<MeetingView />} />
              <Route path="/incubator/submit" element={<IncubatorSubmit />} />
              <Route path="/incubator/explore" element={<IncubatorExplore />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/debug-streams" element={<DebugStreams />} />
              <Route path="/onboarding/form/:formId" element={<Onboarding />} />
              <Route path="/pages/:slug" element={<PageView />} />
            </Route>
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
