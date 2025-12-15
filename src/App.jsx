import React, { useState, useEffect } from 'react';
import PortfolioHero from './components/PortfolioHero';
import ResearchHighlights from './components/ResearchHighlights';
import Publications from './components/Publications';
import Projects from './components/Projects';
import Contact from './components/Contacts'; // Note: Your file is named "Contacts.jsx" (plural)
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import ScrollProgressBar from './components/ScrollProgressBar';
import BackToTop from './components/BackToTop';
import ScrollAnimation from './components/ScrollAnimation';


import './index.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check for saved dark mode preference or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    } else {
      setDarkMode(prefersDark);
    }
    
    setMounted(true);
  }, []);

  // Save dark mode preference and update document class
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('darkMode', darkMode.toString());
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode, mounted]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (!mounted) {
    return <LoadingScreen />;
  }

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Scroll Progress Bar */}
      <ScrollProgressBar darkMode={darkMode} />

      {/* Main Content */}
      <PortfolioHero darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <ScrollAnimation animation="fade-up">
        <ResearchHighlights darkMode={darkMode} />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up">
        <Publications darkMode={darkMode} />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up">
        <Projects darkMode={darkMode} />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up">
        <Contact darkMode={darkMode} />
      </ScrollAnimation>

      <Footer darkMode={darkMode} />

      {/* Back to Top Button */}
      <BackToTop darkMode={darkMode} />
    </div>
  );
}

export default App;