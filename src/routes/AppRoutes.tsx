import { Routes, Route } from 'react-router-dom';
import SignIn from '../components/Auth/SignIn';
import SignUp from '../components/Auth/SignUp';
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
import { TitleProvider } from '../context/TitleContext';

const AppRoutes = () => (
  <Routes>
    {/* Landing Page Layout */}
    <Route element={<LandingLayout />}>
      <Route path="/" element={<HeroSection />} />
    </Route>    {/* Auth Layout */}
    <Route element={<AuthLayout />}>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/verification" element={<VerificationCode />} />
      <Route path="/verify" element={<VerificationCode />} />
      <Route path="/welcome" element={<AuthWelcome />} />
    </Route>
    {/* Main App Layout (for after login) */}
    <Route element={<AppLayout />}>
      <Route path="/app" element={<MainPage />} />
      <Route path="/app/join-workplace" element={<div>Join Workplace Coming Soon</div>} />
      <Route path="/app/overview" element={
        <TitleProvider>
          <MainAppPageLayout>
            <Overview />
          </MainAppPageLayout>
        </TitleProvider>
      } />
      <Route path="/app/lists" element={
        <TitleProvider>
          <MainAppPageLayout>
            <Lists />
          </MainAppPageLayout>        </TitleProvider>
      } />
      
      <Route path="/app/lists/:listName" element={
        <TitleProvider>
          <MainAppPageLayout>
            <ListDetails />
          </MainAppPageLayout>
        </TitleProvider>
      } />
      <Route path="/app/chats" element={
        <TitleProvider>
          <MainAppPageLayout>
            <Chats />
          </MainAppPageLayout>
        </TitleProvider>
      } />
      <Route path="/app/notifications" element={
        <TitleProvider>
          <NotificationsPage />
        </TitleProvider>
      } />
    </Route>
  </Routes>
);

export default AppRoutes;
