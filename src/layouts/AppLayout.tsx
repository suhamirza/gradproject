import { Outlet, useNavigate } from 'react-router-dom';
import { RiSettings5Fill } from "react-icons/ri";
import { IoAnalyticsSharp } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { useUser } from '../context/UserContext';
import Notifications from '../components/Notifications/Notifications';

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleSignOut = async () => {
    await logout();
    navigate('/signin');
  };  const getUserDisplayName = () => {
    if (user?.username) {
      return user.username;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'User';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between bg-[#180620] h-20 px-8 border-b-2 border-[#d6c6dd] relative z-10">
        <div className="flex text-white text-4xl font-bold items-center">
          {/* Logo */}
          TASK<span className="text-[#9759b3]">IFY.</span>
        </div>
        <div className="relative">
          {/* Notifications component */}
          <Notifications />
        </div>
      </nav>
      <div className="flex flex-1 bg-white">
        {/* Sidebar */}
        <aside className="bg-[#25113a] w-56 flex flex-col py-8 px-4 text-white min-h-0">          {/* Profile section */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#b38fff] rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-2">
              <span role="img" aria-label="avatar">👤</span>
            </div>
            <span className="font-extrabold bg-[#dea5f824] px-6 py-2 rounded-lg text-2xl text-center">
              {getUserDisplayName()}
            </span>
          </div>
          {/* Navigation links */}
          <nav className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/app/workspaces')}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-[#3b2355] transition text-xl font-bold w-full text-left"
            >
              <div className="w-6 h-6 mr-2">
                <GoHomeFill size={24} />
              </div>
              Workspaces
            </button>
            <a href="#" className="flex items-center px-3 py-2 rounded-lg hover:bg-[#3b2355] transition text-xl font-bold">
              <div className="w-6 h-6 mr-2">
                <IoAnalyticsSharp size={24} />
              </div>
              Analytics
            </a>            <button
              onClick={() => navigate('/app/settings')}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-[#3b2355] transition text-xl font-bold w-full text-left"
            >
              <div className="w-6 h-6 mr-2">
                <RiSettings5Fill size={24} />
              </div>
              Settings
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-3 py-2 rounded-lg hover:bg-red-600 transition text-xl font-bold w-full text-left mt-4 text-red-300 hover:text-white"
            >
              <div className="w-6 h-6 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </div>
              Sign Out
            </button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 overflow-auto pr-16 pt-8 pl-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;