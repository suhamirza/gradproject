import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from '../components/Auth/SignIn';
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
import { TitleProvider } from '../context/TitleContext';

const AppRoutes = () => (
  <Routes>
    {/* Landing Page Layout */}
    <Route element={<LandingLayout />}>
      <Route path="/" element={<HeroSection />} />
    </Route>
    {/* Auth Layout */}
    <Route element={<AuthLayout />}>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/verify" element={<VerificationCode />} />
      <Route path="/welcome" element={<AuthWelcome />} />
      {/* Future: <Route path="/signup" element={<SignUp />} /> */}
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
    </Route>
  </Routes>
);

export default AppRoutes;
