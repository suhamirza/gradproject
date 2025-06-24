import { Routes, Route } from 'react-router-dom';
import SignIn from '../components/Auth/SignIn';
import SignUp from '../components/Auth/SignUp';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import HeroSection from '../components/HeroSection';
import VerificationCode from '../components/Auth/VerificationCode';
import AuthWelcome from '../components/Auth/AuthWelcome';
import Overview from '../components/MainAppPages/Overview';
import MainPage from '../components/MainAppPages/MainPage';
import MainAppPageLayout from '../layouts/MainAppPageLayout';
import Lists from '../components/MainAppPages/Lists';
import Chats from '../components/MainAppPages/Chats';
import ListDetails from '../components/MainAppPages/ListDetails';
import NotificationsPage from '../components/MainAppPages/NotificationsPage';
import Settings from '../components/MainAppPages/Settings';
import Workspaces from '../components/MainAppPages/Workspaces';
import { TitleProvider } from '../context/TitleContext';
import { UserProvider } from '../context/UserContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';

const AppRoutes = () => (
  <UserProvider>
    <Routes>
      {/* Landing Page Layout */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={<HeroSection />} />
      </Route>      {/* Auth Layout */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verification" element={<VerificationCode />} />
        <Route path="/verify" element={<VerificationCode />} />
        <Route path="/welcome" element={<AuthWelcome />} />
      </Route>      {/* Main App Layout (for after login) - Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/app" element={<MainPage />} />
        <Route path="/app/workspaces" element={
          <TitleProvider>
            <Workspaces />
          </TitleProvider>
        } />
        <Route path="/app/join-workplace" element={<div>Join Workplace Coming Soon</div>} />        <Route path="/app/overview" element={
          <TitleProvider>
            <WorkspaceProvider>
              <MainAppPageLayout>
                <Overview />
              </MainAppPageLayout>
            </WorkspaceProvider>
          </TitleProvider>
        } />
        <Route path="/app/lists" element={
          <TitleProvider>
            <WorkspaceProvider>
              <MainAppPageLayout>
                <Lists />
              </MainAppPageLayout>
            </WorkspaceProvider>
          </TitleProvider>
        } />
        
        <Route path="/app/lists/:projectId/:listName" element={
          <TitleProvider>
            <WorkspaceProvider>
              <MainAppPageLayout>
                <ListDetails />
              </MainAppPageLayout>
            </WorkspaceProvider>
          </TitleProvider>
        } />
        <Route path="/app/chats" element={
          <TitleProvider>
            <WorkspaceProvider>
              <MainAppPageLayout>
                <Chats />
              </MainAppPageLayout>
            </WorkspaceProvider>
          </TitleProvider>
        } /><Route path="/app/notifications" element={
          <TitleProvider>
            <NotificationsPage />
          </TitleProvider>
        } />
        <Route path="/app/settings" element={
          <TitleProvider>
            <Settings />
          </TitleProvider>
        } />
      </Route>
    </Routes>
  </UserProvider>
);

export default AppRoutes;
