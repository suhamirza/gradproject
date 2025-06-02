import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FadeContent from "../ReactBits/FadeContent";
import { authService } from "../../services/authService";

const CODE_LENGTH = 6;

const VerificationCode: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  // Load user data from sessionStorage on component mount
  useEffect(() => {
    console.log('🔍 VerificationCode component mounted, checking for pending verification...');
    const pendingVerification = sessionStorage.getItem('pendingVerification');
    console.log('📦 Found pending verification data:', pendingVerification);
    
    if (pendingVerification) {
      const userData = JSON.parse(pendingVerification);
      console.log('✅ Parsed user data:', userData);
      setUserEmail(userData.email || '');
      setUserId(userData.userId || '');
    } else {
      console.log('❌ No pending verification data found, redirecting to signup');
      // If no pending verification, redirect to signup
      navigate('/signup');
    }
  }, [navigate]);

  // Handle input change for each box
  const handleChange = (value: string, idx: number): void => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow single digit

    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    // Clear errors when user starts typing
    if (error) setError('');

    // Move to next input if filled
    if (value && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (value && idx === CODE_LENGTH - 1) {
      const fullCode = [...newCode];
      const codeString = fullCode.join('');
      if (codeString.length === CODE_LENGTH) {
        handleSubmit(codeString);
      }
    }
  };

  // Handle backspace to move to previous input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number): void => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // Handle verification submission
  const handleSubmit = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    
    if (codeToVerify.length !== CODE_LENGTH) {
      setError('Please enter the complete verification code');
      return;
    }

    if (!userId) {
      setError('User information not found. Please sign up again.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔍 Verifying email with code:', codeToVerify);

      const response = await authService.verifyEmail(userId, codeToVerify);

      if (response.success) {
        setSuccess('Email verified successfully! Redirecting...');
        
        // Clear pending verification data
        sessionStorage.removeItem('pendingVerification');
        
        // Redirect to main app after a delay
        setTimeout(() => {
          navigate('/app');
        }, 2000);
      } else {
        setError(response.message || 'Verification failed. Please check your code.');
        // Clear the input fields on error
        setCode(Array(CODE_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      }

    } catch (error: any) {
      console.error('❌ Verification error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
      // Clear the input fields on error
      setCode(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend code
  const handleResend = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    
    if (!userEmail) {
      setError('Email not found. Please sign up again.');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      console.log('📧 Resending verification code to:', userEmail);

      const response = await authService.resendVerificationCode(userEmail);

      if (response.success) {
        setSuccess('Verification code sent! Please check your email.');
        // Clear the input fields
        setCode(Array(CODE_LENGTH).fill(""));
        inputsRef.current[0]?.focus();
      } else {
        setError(response.message || 'Failed to resend verification code.');
      }

    } catch (error: any) {
      console.error('❌ Resend error:', error);
      setError(error.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };
  return (
    <div className="flex flex-col items-center">
      <FadeContent duration={900} delay={200}>
        <h2 className="text-4xl font-bold text-white mb-3 text-center tracking-widest">SECURITY</h2>
        <p className="text-white text-center mb-8 font-semibold">
          PLEASE ENTER THE VERIFICATION CODE SENT<br />TO YOUR EMAIL
          {userEmail && <span className="block text-violet-300 mt-2">{userEmail}</span>}
        </p>
      </FadeContent>

      {/* Error Message */}
      {error && (
        <FadeContent duration={300}>
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center max-w-md">
            {error}
          </div>
        </FadeContent>
      )}      {/* Success Message */}
      {success && (
        <FadeContent duration={300}>
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm text-center max-w-md">
            {success}
          </div>
        </FadeContent>
      )}

      <form className="flex flex-col items-center w-full gap-6" onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleSubmit(); }}>        <div className="flex gap-2 mb-2 justify-center items-center" style={{ minWidth: '350px' }}>
          <FadeContent duration={900} delay={200}>
            <div className="flex gap-2 flex-nowrap">
              {code.map((digit: string, idx: number): React.ReactNode => (
                <input
                  key={idx}
                  ref={(el: HTMLInputElement | null) => (inputsRef.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(e.target.value, idx)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, idx)}
                  className="w-14 h-14 text-2xl text-center rounded-md border border-white/30 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition disabled:opacity-50"
                  style={{ letterSpacing: "2px" }}
                  autoFocus={idx === 0}
                  disabled={isLoading}
                />
              ))}
            </div>
          </FadeContent>
        </div>

        {/* Manual Submit Button (optional, since auto-submit is enabled) */}
        <FadeContent duration={900} delay={300}>
          <button
            type="submit"
            disabled={isLoading || code.join('').length !== CODE_LENGTH}
            className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg shadow transition"
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY'}
          </button>
        </FadeContent>

        <div className="w-full flex justify-end">
          <FadeContent duration={900} delay={200}>
            <button
              type="button"
              className="text-xs text-white/80 underline hover:text-violet-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleResend}
              disabled={isResending || isLoading}
            >
              {isResending ? 'SENDING...' : 'RESEND THE CODE'}
            </button>
          </FadeContent>
        </div>
      </form>
    </div>
  );
};

export default VerificationCode;