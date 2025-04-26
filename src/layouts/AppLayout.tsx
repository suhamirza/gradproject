import React from 'react';
import { Outlet } from 'react-router-dom';
import { RiSettings5Fill } from "react-icons/ri";
import { FaBell } from "react-icons/fa6";
import { IoAnalyticsSharp } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import logo from '../assets/logo/whiteLogo.png'; // adjust path if needed

const AppLayout = () => (
  <div className="flex flex-col h-screen">
    {/* Navbar */}
    <nav className="flex items-center justify-between bg-[#180620] h-20 px-8 border-b-2 border-[#d6c6dd]">
      <div className="flex items-center">
        {/* Logo */}
        <img src={logo} alt="Taskify Logo" className="h-16" />
      </div>
      <div>
        {/* Notification bell */}
        <button className="text-white text-2xl focus:outline-none">
          <FaBell className="w-7 h-7" />
        </button>
      </div>
    </nav>
    <div className="flex flex-1 bg-white">
      {/* Sidebar */}
      <aside className="bg-[#25113a] w-56 flex flex-col py-8 px-4 text-white min-h-0">
        {/* Profile section */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#b38fff] rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-2">
            <span role="img" aria-label="avatar">👤</span>
          </div>
          <span className="font-extrabold bg-[#dea5f824] px-6 py-2 rounded-lg text-2xl text-center">Suha Mirza</span>
        </div>
        {/* Navigation links */}
        <nav className="flex flex-col gap-3">
          <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#3b2355] transition text-xl font-bold">
            <GoHomeFill className="w-6 h-6 mr-2" /> Workplaces
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#3b2355] transition text-xl font-bold">
            <IoAnalyticsSharp className="w-6 h-6 mr-2" /> Analytics
          </a>
          <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#3b2355] transition text-xl font-bold">
            <RiSettings5Fill className="w-6 h-6 mr-2" /> Settings
          </a>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 container-main p-12 pl-16">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AppLayout;