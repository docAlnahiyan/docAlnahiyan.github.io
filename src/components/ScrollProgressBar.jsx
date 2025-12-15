import React, { useState, useEffect } from 'react';

export default function ScrollProgressBar({ darkMode }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-1">
      <div 
        className={`h-full transition-all duration-100 ${
          darkMode 
            ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' 
            : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700'
        }`}
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}