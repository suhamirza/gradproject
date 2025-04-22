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
    {/* Content */}
    <div className="relative z-10 flex flex-col items-center w-full min-h-screen pt-1">
      <img src={logo} alt="Taskify Logo" className="w-40 mb-6" />
      <div className="bg-white/10 border-2 border-white/60 rounded-2xl p-8 md:px-20 md:py-8 w-full max-w-lg shadow-lg backdrop-blur-xs">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
