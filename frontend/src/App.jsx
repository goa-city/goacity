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
    if (!adminUser || !adminUser.isSuperAdmin) {
        return <Navigate to="/admin" />;
    }
    
    return children;
};

function App() {
  return (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} /> {/* Optional: Keep Home accessible if needed, or remove completely if intended ONLY as landing. User said "When accessed https://goa.city/ it should show the login page." */}
                {/* Admin Routes */}
                <Route path="/admin/*" element={
                    <AdminAuthProvider>
                        <Routes>
                            <Route path="login" element={<AdminLogin />} />
                            
                            {/* Admin Area */}
                            <Route element={<AdminProtectedRoute><AdminLayout><Outlet /></AdminLayout></AdminProtectedRoute>}>
                                <Route path="/" element={<AdminDashboard />} />
                                <Route path="members" element={<AdminMembers />} />
                                <Route path="members/create" element={<AdminMemberCreate />} />
                                <Route path="members/:id" element={<AdminMemberDetail />} />
                                <Route path="meetings" element={<AdminMeetings />} />
                                <Route path="meetings/create" element={<AdminMeetingEditor />} />
                                <Route path="meetings/:id" element={<AdminMeetingEditor />} />
                                <Route path="streams" element={<AdminStreams />} />
                                <Route path="forms" element={<AdminForms />} />
                                <Route path="forms/:id" element={<AdminFormEditor />} />
                                <Route path="stewardship" element={<AdminStewardship />} />
                                <Route path="mentorship" element={<AdminMentorship />} />
                                <Route path="incubator" element={<AdminIncubator />} />
                                <Route path="collabs" element={<AdminCollabs />} />
                                <Route path="jobs" element={<AdminJobs />} />
                                <Route path="jobs/:id" element={<AdminJobEditor />} />
                                <Route path="resources" element={<AdminResources />} />
                                <Route path="resources/:id" element={<AdminResourceEditor />} />
                                <Route path="news" element={<AdminNews />} />
                                <Route path="pages" element={<AdminPages />} />
                                <Route path="pages/:id" element={<AdminPageEditor />} />
                                <Route path="email-templates" element={<AdminEmailTemplates />} />
                                <Route path="email-templates/create" element={<AdminEmailTemplateEditor />} />
                                <Route path="email-templates/:id" element={<AdminEmailTemplateEditor />} />
                                <Route path="admins" element={<AdminAdmins />} />
                            </Route>
                        </Routes>
                    </AdminAuthProvider>
                } />

                {/* Super Admin Routes (Directly under /superadmin as requested) */}
                <Route path="/superadmin/*" element={
                    <AdminAuthProvider>
                        <Routes>
                            <Route element={<SuperAdminProtectedRoute><AdminLayout><Outlet /></AdminLayout></SuperAdminProtectedRoute>}>
                                <Route path="/" element={<AdminCities />} />
                                <Route path="cities" element={<AdminCities />} />
                                {/* Potentially other global controls can go here */}
                            </Route>
                        </Routes>
                    </AdminAuthProvider>
                } />

                <Route 
                    path="/dashboard" 
                    element={
                        <MemberProtectedRoute>
                            <Dashboard />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/news" 
                    element={
                        <MemberProtectedRoute>
                            <News />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <MemberProtectedRoute>
                            <Profile />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/resources" 
                    element={
                        <MemberProtectedRoute>
                            <Resources />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/resources/add" 
                    element={
                        <MemberProtectedRoute>
                            <ResourceEditor />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/jobs" 
                    element={
                        <MemberProtectedRoute>
                            <Jobs />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/jobs/post" 
                    element={
                        <MemberProtectedRoute>
                            <JobEditor />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/stewardship" 
                    element={
                        <MemberProtectedRoute>
                            <StewardshipDashboard />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/mentors" 
                    element={
                        <MemberProtectedRoute>
                            <Mentors />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/dashboard/mentorship/:id" 
                    element={
                        <MemberProtectedRoute>
                            <MentorshipWorkspace />
                        </MemberProtectedRoute>
                    } 
                />
                <Route
                    path="/my-people"
                    element={
                        <MemberProtectedRoute>
                            <MyPeople />
                        </MemberProtectedRoute>
                    }
                />
                <Route 
                    path="/profile/:id" 
                    element={
                        <MemberProtectedRoute>
                            <PublicProfile />
                        </MemberProtectedRoute>
                    } 
                />
                <Route
                    path="/meetings"
                    element={
                        <MemberProtectedRoute>
                            <MemberMeetings />
                        </MemberProtectedRoute>
                    }
                />
                <Route
                    path="/meetings/:id"
                    element={
                        <MemberProtectedRoute>
                            <MeetingView />
                        </MemberProtectedRoute>
                    }
                />
                <Route 
                    path="/incubator/submit" 
                    element={
                        <MemberProtectedRoute>
                            <IncubatorSubmit />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/incubator/explore" 
                    element={
                        <MemberProtectedRoute>
                            <IncubatorExplore />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/onboarding" 
                    element={
                        <MemberProtectedRoute>
                            <Onboarding />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/debug-streams" 
                    element={
                        <MemberProtectedRoute>
                            <DebugStreams />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/onboarding/form/:formId" 
                    element={
                        <MemberProtectedRoute>
                            <Onboarding />
                        </MemberProtectedRoute>
                    } 
                />
                <Route 
                    path="/pages/:slug" 
                    element={
                        <MemberProtectedRoute>
                            <PageView />
                        </MemberProtectedRoute>
                    } 
                />
            </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
