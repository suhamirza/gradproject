import React, { useState, ChangeEvent } from "react";
import FadeContent from "../ReactBits/FadeContent";
import SplitText from '../ReactBits/SplitText';


const AuthWelcome: React.FC = () => {
  const [name, setName] = useState<string>("");

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  return (
    <div className="flex flex-col items-center">
      <FadeContent duration={900} delay={200}>
        <SplitText
          text="WELCOME!"
          animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
          animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
          delay={20}
          textAlign="center"
          className="text-4xl font-bold text-white mb-12 text-center tracking-widest"
        />
      </FadeContent>
      <form className="flex flex-col items-center w-full gap-8">
        <div className="w-full flex flex-col items-center mt-4">
          <FadeContent duration={900} delay={200}>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-white mb-3 tracking-wider text-center"
          >
            PLEASE ENTER YOUR NAME
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-72 max-w-full rounded-lg px-4 py-3 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition text-lg text-center"
            placeholder="Your Name"
            autoComplete="off"
          />
          </FadeContent>
        </div>
        <div className="w-full flex flex-col items-center mt-4">
          <FadeContent duration={900} delay={200}>
          <span className="block text-sm font-semibold text-white mb-4 tracking-wider text-center">
            PICK A PROFILE PICTURE
          </span>
          </FadeContent>
          {/* Profile Picture Placeholder (SVG) */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 shadow-inner">
          <FadeContent duration={900} delay={200}>
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
            </svg>
            </FadeContent>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuthWelcome;