import { useState } from "react";
import FadeContent from "../ReactBits/FadeContent";
import SplitText from '../ReactBits/SplitText';

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // TODO: Add signup logic here
    console.log('Signup form data:', formData);
  };

  return (
    <>
      <FadeContent duration={900} delay={200}>
        <div className="flex w-full justify-center leading-[1.2] mr-2">
          <SplitText
            text="SIGN UP"
            animationFrom={{ opacity: 0, transform: 'translate3d(0,20px,0)' }}
            animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
            delay={20}
            textAlign="center"
            className="text-4xl font-bold text-white mb-12 text-center tracking-widest leading-[1.2] mr-2"
          />
        </div>
      </FadeContent>
      <form className="flex flex-col gap-5" autoComplete="off" onSubmit={handleSubmit}>
        {/* First Name & Last Name Row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <FadeContent duration={900} delay={200}>
              <label className="block text-xs font-bold text-white mb-1 tracking-widest">
                FIRST NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-2 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  placeholder=""
                  required
                  maxLength={50}
                />
                <span className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <svg height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </div>
            </FadeContent>
          </div>
          <div className="flex-1">
            <FadeContent duration={900} delay={250}>
              <label className="block text-xs font-bold text-white mb-1 tracking-widest">
                LAST NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-2 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                  placeholder=""
                  required
                  maxLength={50}
                />
                <span className="absolute top-1/2 right-4 transform -translate-y-1/2">
                  <svg height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </div>
            </FadeContent>
          </div>
        </div>

        {/* Username */}
        <div>
          <FadeContent duration={900} delay={300}>
            <label className="block text-xs font-bold text-white mb-1 tracking-widest">
              USERNAME
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full rounded-lg px-4 py-2 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                placeholder=""
                required
                maxLength={50}
              />
              <span className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <svg height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <path d="M20 8v6M23 11h-6"></path>
                </svg>
              </span>
            </div>
          </FadeContent>
        </div>

        {/* Email */}
        <div>
          <FadeContent duration={900} delay={350}>
            <label className="block text-xs font-bold text-white mb-1 tracking-widest">
              EMAIL
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg px-4 py-2 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                placeholder=""
                required
                maxLength={100}
              />
              <span className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <svg height="18" width="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2"/>
                  <polyline points="3 7 12 13 21 7"/>
                </svg>
              </span>
            </div>
          </FadeContent>
        </div>

        {/* Password */}
        <div>
          <FadeContent duration={900} delay={400}>
            <label className="block text-xs font-bold text-white mb-1 tracking-widest">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full rounded-lg px-4 py-2 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                placeholder=""
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white focus:outline-none"
                onClick={() => setShowPassword((prev: boolean) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 17q8 4 16 0" />
                    <path d="M4 17l-2 3" />
                    <path d="M12 21v3" />
                    <path d="M20 17l2 3" />
                  </svg>
                )}
              </button>
            </div>
          </FadeContent>
        </div>

        {/* Confirm Password */}
        <div>
          <FadeContent duration={900} delay={450}>
            <label className="block text-xs font-bold text-white mb-1 tracking-widest">
              CONFIRM PASSWORD
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full rounded-lg px-4 py-2 bg-transparent text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                placeholder=""
                required
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white focus:outline-none"
                onClick={() => setShowConfirmPassword((prev: boolean) => !prev)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 17q8 4 16 0" />
                    <path d="M4 17l-2 3" />
                    <path d="M12 21v3" />
                    <path d="M20 17l2 3" />
                  </svg>
                )}
              </button>
            </div>
          </FadeContent>
        </div>

        {/* Already have account link */}
        <div className="flex flex-col gap-1">
          <FadeContent duration={900} delay={200}>
            <span className="text-xs font-bold text-white tracking-widest">
              ALREADY HAVE AN ACCOUNT? <a href="/signin" className="text-violet-400 hover:text-violet-600 transition">SIGN IN</a>
            </span>
          </FadeContent>
        </div>

        {/* Sign Up Button */}
        <button
          type="submit"
          className="mt-2 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 rounded-lg shadow transition"
        >
          SIGN UP
        </button>

        {/* OR Divider */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-bold text-white tracking-widest">OR</span>
        </div>

        {/* Google Sign Up */}
        <button
          type="button"
          className="border border-white/30 bg-transparent hover:bg-white/10 transition text-white/80 font-bold py-2 rounded-lg shadow flex justify-center items-center gap-2"
        >
          <span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 48 48"
              fill="none"
              className="text-white/80"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="48" height="48" rx="24" fill="currentColor" fillOpacity="0.08" />
              <path d="M24 9.5c3.54 0 6.72 1.23 9.22 3.25l6.88-6.88C35.34 2.14 29.97 0 24 0 14.82 0 6.75 5.48 2.69 13.44l8.08 6.28C13.07 13.45 18.06 9.5 24 9.5z" fill="currentColor"/>
              <path d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.37c-.53 2.87-2.1 5.29-4.44 6.93l7.01 5.45C43.93 37.02 46.1 31.29 46.1 24.55z" fill="currentColor"/>
              <path d="M10.77 28.27c-.49-1.47-.77-3.03-.77-4.77s.28-3.3.77-4.77l-8.08-6.28C1.01 15.2 0 19.45 0 23.5c0 4.05 1.01 8.3 2.69 12.05l8.08-6.28z" fill="currentColor"/>
              <path d="M24 48c6.48 0 11.92-2.15 15.89-5.85l-7.01-5.45c-1.95 1.32-4.45 2.1-8.88 2.1-5.94 0-10.93-3.95-13.23-9.22l-8.08 6.28C6.75 42.52 14.82 48 24 48z" fill="currentColor"/>
            </svg>
          </span>
          SIGN UP USING GOOGLE
        </button>
      </form>
    </>
  );
};

export default SignUp;
