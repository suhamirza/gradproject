import React from 'react';
import mainpagepic from '../../assets/mainpagepic.png';
import { useNavigate } from 'react-router-dom';
import SplitText from '../ReactBits/SplitText';
import FadeContent from '../ReactBits/FadeContent';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <div className="flex flex-wrap justify-center items-baseline mb-6">
        <SplitText
          text="Welcome to"
          className="text-4xl md:text-6xl font-bold text-center leading-[1.2] mr-2"
          animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          delay={20}
          textAlign="center"
        />
        <SplitText
          text="Taskify!"
          className="text-4xl md:text-6xl font-bold text-center leading-[1.2] text-[#5C346E] align-baseline"
          animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          delay={120}
          textAlign="center"
        />
      </div>
      <SplitText
        text="please choose an option to get started"
        className="text-lg md:text-2xl text-center mb-6 text-black/80 font-bold"
        animationFrom={{ opacity: 0, transform: 'translate3d(0,40px,0)' }}
        animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
        delay={20}
        textAlign="center"
      />
      <FadeContent duration={900} delay={100}>
        <img src={mainpagepic} alt="Team working" className="w-60 md:w-80 mb-8" />
      </FadeContent>
      <div className="flex gap-8">
        <FadeContent duration={900} delay={100}>
          <button
            className="bg-[#180620] text-white text-lg font-bold px-8 py-4 rounded-xl shadow transition hover:bg-[#2a0a3c] focus:outline-none transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
            style={{ border: 'none' }}
            onClick={() => navigate('/app/join-workplace')}
          >
            join an existing workplace
          </button>
        </FadeContent>
        <FadeContent duration={900} delay={200}>
          <button
            className="bg-white text-[#180620] text-lg font-bold px-8 py-4 rounded-xl shadow border-2 border-[#180620] transition hover:bg-[#f4f0f8] focus:outline-none transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
            onClick={() => navigate('/app/create-workplace')}
          >
            Create a new workplace
          </button>
        </FadeContent>
      </div>
    </div>
  );
};

export default MainPage;