import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTitle } from '../context/TitleContext';

interface MainAppPageLayoutProps {
  children: React.ReactNode;
}

const navButtons = [
  { label: 'Overview', key: 'overview', route: '/app/overview' },
  { label: 'Lists', key: 'lists', route: '/app/lists' },
  { label: 'Chats', key: 'chats', route: '/app/chats' },
];

const MainAppPageLayout: React.FC<MainAppPageLayoutProps> = ({ children }) => {
  const { title, setTitle } = useTitle();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleSpanRef = useRef<HTMLSpanElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-grow title input width
  useEffect(() => {
    if (titleInputRef.current && titleSpanRef.current) {
      const input = titleInputRef.current;
      const span = titleSpanRef.current;
      const computed = window.getComputedStyle(input);
      span.style.font = computed.font;
      span.style.fontWeight = computed.fontWeight;
      span.style.fontSize = computed.fontSize;
      span.style.fontFamily = computed.fontFamily;
      span.style.letterSpacing = computed.letterSpacing;
      span.style.textTransform = computed.textTransform;
      input.style.width = (span.offsetWidth + 12) + 'px'; // 12px = 16px left padding - 4px right offset
    }
  }, [title]);

  return (
    <div className="flex flex-col items-start w-full">
      {/* Title Input */}
      <div className="inline-block mb-6 align-top">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-[2.75rem] font-extrabold bg-transparent border-none outline-none placeholder:text-gray-400 transition-colors duration-150 hover:bg-[#f7f0ff] rounded-xl box-content pl-4 pr-1"
          ref={titleInputRef}
          style={{ width: 'auto', margin: 0 }}
        />
        <span
          ref={titleSpanRef}
          className="absolute left-[-9999px] top-0 select-none whitespace-pre font-extrabold text-[2.75rem] pl-4 pr-1"
          aria-hidden="true"
        >
          {title || 'Title'}
        </span>
      </div>
      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-12">
        {navButtons.map(btn => (
          <button
            key={btn.key}
            className={`px-9 py-3 rounded-xl border-2 hover:bg-[#f7f0ff] ${location.pathname.includes(btn.route) ? 'border-[#8e44ec] bg-[#f7f0ff] text-[#8e44ec] font-extrabold' : 'border-gray-300 bg-white text-gray-900 font-bold'} text-[1.375rem] transition`}
            onClick={() => navigate(btn.route)}
          >
            {btn.label}
          </button>
        ))}
      </div>
      {/* Divider */}
      <hr className="w-full border-t-1 border-[#180620] mb-8" />
      {/* Page Content */}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default MainAppPageLayout;
