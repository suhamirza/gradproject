import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Outlet } from 'react-router-dom';

const LandingLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer id="contacts" className="mt-16" />
  </>
);

export default LandingLayout;
