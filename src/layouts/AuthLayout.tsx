import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/logo/whiteLogo.png';
import signInBg from '../assets/signInBg.jpg';

const AuthLayout = () => (
  <div className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#1a1125] to-[#2a183a]">
    {/* Background Image + Blur */}
    <div className="fixed inset-0 w-full h-full z-0">
      <img
        src={signInBg}
        alt=""
        className="w-full h-full object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
    </div>
    {/* Centered Content */}
    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
      <img
        src={logo}
        alt="Taskify Logo"
        className="w-28 xs:w-32 sm:w-36 md:w-46 mb-4 sm:mb-6 transition-all duration-300"
      />
      <div className="bg-white/10 border-2 border-white/60 rounded-2xl p-4 xs:p-6 sm:p-8 md:px-20 md:py-8 w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg shadow-lg backdrop-blur-xs transition-all duration-300">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
