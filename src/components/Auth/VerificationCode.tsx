import React, { useRef, useState } from "react";
import FadeContent from "../ReactBits/FadeContent";

const CODE_LENGTH = 5;

const VerificationCode: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Handle input change for each box
  const handleChange = (value: string, idx: number): void => {
    if (!/^[0-9a-zA-Z]?$/.test(value)) return; // Only allow single character

    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    // Move to next input if filled
    if (value && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  // Handle backspace to move to previous input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number): void => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // Handle resend code (implement logic as needed)
  const handleResend = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    // TODO: Add resend logic
    alert("Resend code logic goes here!");
  };

  return (
    <div className="flex flex-col items-center">
      <FadeContent duration={900} delay={200}>
      <h2 className="text-4xl font-bold text-white mb-3 text-center tracking-widest">SECURITY</h2>
      <p className="text-white text-center mb-8 font-semibold">
        PLEASE ENTER THE VERIFICATION CODE SENT<br />TO YOUR EMAIL
      </p>
      </FadeContent>
      <form className="flex flex-col items-center w-full gap-6">
        <div className="flex gap-3 mb-2">
          <FadeContent duration={900} delay={200}>
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
              className="w-16 h-16 text-3xl text-center rounded-md border border-white/30 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              style={{ letterSpacing: "2px" }}
              autoFocus={idx === 0}
            />
          ))}
          </FadeContent>
        </div>
        <div className="w-full flex justify-end">
          <FadeContent duration={900} delay={200}>
          <button
            type="button"
            className="text-xs text-white/80 underline hover:text-violet-300 transition"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleResend(e)}
          >
            RESEND THE CODE
          </button>
          </FadeContent>
        </div>
      </form>
    </div>
  );
};

export default VerificationCode;