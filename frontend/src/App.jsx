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
    
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/" />;
    
    return <MemberOnboardingCheck>{children}</MemberOnboardingCheck>;
};

// Extracted inner component to use the useLocation hook
const MemberOnboardingCheck = ({ children }) => {
    return children;
};

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
    const { adminUser, loading } = useAdminAuth();
    
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!adminUser) return <Navigate to="/admin/login" />;
    
    return children;
};

// Super Admin Protected Route
const SuperAdminProtectedRoute = ({ children }) => {
    const { adminUser, loading } = useAdminAuth();
    
    if (loading) return <div className="min-h-screen flex items-center justify-center font-black animate-pulse uppercase tracking-[0.3em] text-slate-400">Authenticating...</div>;
    
    // Check if user is logged in and is a super admin
    // Adding secondary check for specific email as a failsafe
    const isSuper = adminUser?.isSuperAdmin || (adminUser?.email === 'admin@goa.city');

    if (!adminUser || !isSuper) {
        console.warn("[AUTH] SuperAdmin access denied for:", adminUser?.email);
        return <Navigate to="/admin" />;
    }
    
    return children;
};

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <Routes>
            {/* Public/Shared Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Area */}
            <Route element={<AdminProtectedRoute><AdminLayout><Outlet /></AdminLayout></AdminProtectedRoute>}>
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
            </Route>

            {/* Super Admin Area (Top Level) */}
            <Route element={<SuperAdminProtectedRoute><AdminLayout><Outlet /></AdminLayout></SuperAdminProtectedRoute>}>
              <Route path="/superadmin" element={<AdminCities />} />
              <Route path="/superadmin/cities" element={<AdminCities />} />
            </Route>

            {/* Super Admin Area (Secondary mirror under /admin for server routing compatibility) */}
            <Route element={<SuperAdminProtectedRoute><AdminLayout><Outlet /></AdminLayout></SuperAdminProtectedRoute>}>
              <Route path="/admin/superadmin" element={<AdminCities />} />
              <Route path="/admin/superadmin/cities" element={<AdminCities />} />
            </Route>

            {/* Member Protected Routes */}
            <Route path="/dashboard" element={<MemberProtectedRoute><Dashboard /></MemberProtectedRoute>} />
            <Route path="/news" element={<MemberProtectedRoute><News /></MemberProtectedRoute>} />
            <Route path="/profile" element={<MemberProtectedRoute><Profile /></MemberProtectedRoute>} />
            <Route path="/resources" element={<MemberProtectedRoute><Resources /></MemberProtectedRoute>} />
            <Route path="/resources/add" element={<MemberProtectedRoute><ResourceEditor /></MemberProtectedRoute>} />
            <Route path="/jobs" element={<MemberProtectedRoute><Jobs /></MemberProtectedRoute>} />
            <Route path="/jobs/post" element={<MemberProtectedRoute><JobEditor /></MemberProtectedRoute>} />
            <Route path="/stewardship" element={<MemberProtectedRoute><StewardshipDashboard /></MemberProtectedRoute>} />
            <Route path="/mentors" element={<MemberProtectedRoute><Mentors /></MemberProtectedRoute>} />
            <Route path="/dashboard/mentorship/:id" element={<MemberProtectedRoute><MentorshipWorkspace /></MemberProtectedRoute>} />
            <Route path="/my-people" element={<MemberProtectedRoute><MyPeople /></MemberProtectedRoute>} />
            <Route path="/profile/:id" element={<MemberProtectedRoute><PublicProfile /></MemberProtectedRoute>} />
            <Route path="/meetings" element={<MemberProtectedRoute><MemberMeetings /></MemberProtectedRoute>} />
            <Route path="/meetings/:id" element={<MemberProtectedRoute><MeetingView /></MemberProtectedRoute>} />
            <Route path="/incubator/submit" element={<MemberProtectedRoute><IncubatorSubmit /></MemberProtectedRoute>} />
            <Route path="/incubator/explore" element={<MemberProtectedRoute><IncubatorExplore /></MemberProtectedRoute>} />
            <Route path="/onboarding" element={<MemberProtectedRoute><Onboarding /></MemberProtectedRoute>} />
            <Route path="/debug-streams" element={<MemberProtectedRoute><DebugStreams /></MemberProtectedRoute>} />
            <Route path="/onboarding/form/:formId" element={<MemberProtectedRoute><Onboarding /></MemberProtectedRoute>} />
            <Route path="/pages/:slug" element={<MemberProtectedRoute><PageView /></MemberProtectedRoute>} />
          </Routes>
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
