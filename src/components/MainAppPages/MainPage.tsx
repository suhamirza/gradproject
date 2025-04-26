import React from 'react';
import mainpagepic from '../../assets/mainpagepic.png';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
        Welcome to{' '}
        <span style={{ color: '#5C346E' }}>Taskify</span>!
      </h1>
      <p className="text-lg md:text-2xl text-center mb-6 text-black/80 font-bold">
        please choose an option to get started
      </p>
      <img src={mainpagepic} alt="Team working" className="w-60 md:w-80 mb-8" />
      <div className="flex gap-8">
        <button
          className="bg-[#180620] text-white text-lg font-bold px-8 py-4 rounded-xl shadow transition hover:bg-[#2a0a3c] focus:outline-none"
          style={{ border: 'none' }}
          onClick={() => navigate('/app/join-workplace')}
        >
          join an existing workplace
        </button>
        <button
          className="bg-white text-[#180620] text-lg font-bold px-8 py-4 rounded-xl shadow border-2 border-[#180620] transition hover:bg-[#f4f0f8] focus:outline-none"
          onClick={() => navigate('/app/create-workplace')}
        >
          Create a new workplace
        </button>
      </div>
    </div>
  );
};

export default MainPage;