import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1500);

    // Remove loading screen after fade animation completes
    const removeTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-6">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin" style={{ animationDuration: '3s' }}></div>
            
            {/* Inner pulsing circle */}
            <div className="relative w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <Brain className="w-12 h-12 text-white" />
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">
            Al-Nahiyan Khushbu
          </h2>
          <p className="text-emerald-100 text-sm font-medium">
            Loading portfolio...
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}