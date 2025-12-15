import React, { useState, useEffect, useRef } from 'react';
import { Github, Mail, Download, ChevronDown, Menu, X, Search, Sun, Moon } from 'lucide-react';

export default function PortfolioHero({ darkMode, toggleDarkMode }) {
  const [scrollY, setScrollY] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const researchTopics = [
    {
      title: "HybridTransMedFormer",
      subtitle: "3D MRI for Early Parkinson's Detection",
      href: "#research",
      keywords: ["parkinson", "3d", "mri", "medical", "hybrid"]
    },
    {
      title: "Hybrid CNN-Transformer",
      subtitle: "2D Parkinson's Disease Recognition (Best Paper)",
      href: "#research",
      keywords: ["parkinson", "2d", "cnn", "transformer", "best paper"]
    },
    {
      title: "MultimodalTransformerNet",
      subtitle: "Emotion Recognition (99.7% Accuracy)",
      href: "#projects",
      keywords: ["emotion", "multimodal", "recognition", "audio", "image"]
    },
    {
      title: "GlobalFaceNet",
      subtitle: "Facial Expression Recognition",
      href: "#projects",
      keywords: ["face", "expression", "emotion", "recognition"]
    },
    {
      title: "Bird Species Identification",
      subtitle: "Bachelor's Thesis",
      href: "#projects",
      keywords: ["bird", "species", "classification", "thesis"]
    },
    {
      title: "COVID-19 Mask Detection",
      subtitle: "Real-time Detection System",
      href: "#projects",
      keywords: ["covid", "mask", "detection", "real-time"]
    }
  ];

  const filteredTopics = researchTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.keywords.some(keyword => keyword.includes(searchQuery.toLowerCase()))
  );

  const handleNavClick = (href) => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900' 
        : 'bg-gradient-to-br from-gray-50 via-gray-100 to-emerald-50'
    }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#065f46" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 lg:px-12 transition-all duration-300 ${
        scrollY > 50 
          ? darkMode 
            ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800' 
            : 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`text-2xl font-bold cursor-pointer transition-colors ${
              darkMode ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-900 hover:text-emerald-700'
            }`}
          >
            AN<span className="text-emerald-600">.</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#research" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-700'
            }`}>Research</a>
            <a href="#publications" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-700'
            }`}>Publications</a>
            <a href="#projects" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-700'
            }`}>Projects</a>
            <a href="#contact" className={`font-medium transition-colors ${
              darkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-700 hover:text-emerald-700'
            }`}>Contact</a>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Dark Mode Toggle - Mobile */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden mt-4 py-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}>
            <div className="flex flex-col space-y-2 px-4">
              <a 
                href="#research" 
                onClick={() => handleNavClick('#research')}
                className={`py-3 px-4 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Research
              </a>
              <a 
                href="#publications" 
                onClick={() => handleNavClick('#publications')}
                className={`py-3 px-4 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Publications
              </a>
              <a 
                href="#projects" 
                onClick={() => handleNavClick('#projects')}
                className={`py-3 px-4 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Projects
              </a>
              <a 
                href="#contact" 
                onClick={() => handleNavClick('#contact')}
                className={`py-3 px-4 rounded-lg transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400' 
                    : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
                }`}
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-6 lg:px-12 pt-32 lg:pt-40 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              {/* Award Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium animate-fade-in ${
                darkMode 
                  ? 'bg-emerald-900/50 border border-emerald-700 text-emerald-300' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Best Paper Award Winner @ IARCE 2024
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className={`text-5xl lg:text-7xl font-bold leading-tight ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Al-Nahiyan
                  <span className={`block ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>Khushbu</span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
              </div>

              {/* Subtitle */}
              <p className={`text-xl lg:text-2xl leading-relaxed font-light ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Medical AI Researcher specializing in 
                <span className={`font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}> Hybrid CNN-Transformer Architectures</span> for early disease detection
              </p>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="space-y-1">
                  <div className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>92.34%</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Parkinson's Detection Accuracy</div>
                </div>
                <div className="space-y-1">
                  <div className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>99.7%</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Emotion Recognition Accuracy</div>
                </div>
                <div className="space-y-1">
                  <div className={`text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>2+</div>
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>IEEE Publications</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {/* View Research Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`px-8 py-4 font-semibold rounded-lg transition-all hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 ${
                      darkMode 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    }`}
                  >
                    View Research
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu with Search */}
                  {isDropdownOpen && (
                    <div className={`absolute top-full left-0 mt-2 w-80 rounded-xl shadow-2xl border py-2 z-50 animate-fade-in ${
                      darkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}>
                      {/* Search Box */}
                      <div className="px-4 py-2 border-b border-gray-700">
                        <div className="relative">
                          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                          <input
                            type="text"
                            placeholder="Search research..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-all ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500' 
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Topics List */}
                      <div className="max-h-96 overflow-y-auto">
                        {filteredTopics.length > 0 ? (
                          filteredTopics.map((topic, index) => (
                            <a
                              key={index}
                              href={topic.href}
                              onClick={() => {
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className={`block px-4 py-3 transition-colors ${
                                darkMode 
                                  ? 'hover:bg-gray-700' 
                                  : 'hover:bg-emerald-50'
                              }`}
                            >
                              <div className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{topic.title}</div>
                              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{topic.subtitle}</div>
                            </a>
                          ))
                        ) : (
                          <div className={`px-4 py-8 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            No results found for "{searchQuery}"
                          </div>
                        )}
                      </div>

                      <div className={`px-4 py-2 border-t mt-1 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <a 
                          href="#projects"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className={`text-xs font-semibold ${
                            darkMode 
                              ? 'text-emerald-400 hover:text-emerald-300' 
                              : 'text-emerald-700 hover:text-emerald-800'
                          }`}
                        >
                          View All Projects →
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <a
                  href="https://raw.githubusercontent.com/docAlnahiyan/Profile-Al-Nahiyan/main/cvNahiyan.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Al-Nahiyan-Khushbu-CV.pdf"
                  className={`px-8 py-4 font-semibold rounded-lg border-2 transition-all flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-transparent text-emerald-400 border-emerald-400 hover:bg-emerald-400 hover:text-gray-900' 
                      : 'bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </a>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <a 
                  href="https://github.com/docAlnahiyan" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-lg border transition-all group ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' 
                      : 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <Github className={`w-5 h-5 transition-colors ${
                    darkMode 
                      ? 'text-gray-300 group-hover:text-emerald-400' 
                      : 'text-gray-700 group-hover:text-emerald-700'
                  }`} />
                </a>
                <a 
                  href="mailto:al-nahiyan@outlook.com"
                  className={`p-3 rounded-lg border transition-all group ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 hover:border-emerald-500' 
                      : 'bg-white border-gray-200 hover:border-emerald-500 hover:shadow-md'
                  }`}
                >
                  <Mail className={`w-5 h-5 transition-colors ${
                    darkMode 
                      ? 'text-gray-300 group-hover:text-emerald-400' 
                      : 'text-gray-700 group-hover:text-emerald-700'
                  }`} />
                </a>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="relative">
              {/* Animated Circle Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className={`w-96 h-96 rounded-full blur-3xl opacity-60 animate-pulse ${
                    darkMode 
                      ? 'bg-gradient-to-br from-emerald-900 to-emerald-800' 
                      : 'bg-gradient-to-br from-emerald-200 to-emerald-100'
                  }`}
                  style={{ animationDuration: '4s' }}
                ></div>
              </div>

              {/* Main Visual Card */}
              <div className={`relative rounded-2xl shadow-2xl p-8 border ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                      AN
                    </div>
                    <div>
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Research Focus</div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Medical AI & Computer Vision</div>
                    </div>
                  </div>

                  <div className={`h-px bg-gradient-to-r ${
                    darkMode 
                      ? 'from-emerald-700 via-emerald-600 to-transparent' 
                      : 'from-emerald-200 via-emerald-300 to-transparent'
                  }`}></div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                      <div>
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Master of Science</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Southwest Jiaotong University</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Computer Science & Technology</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                      <div>
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Novel Architectures</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>HybridTransMedFormer, GlobalFaceNet</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>CNN-Transformer Hybrids</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                      <div>
                        <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Current Position</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Software Requirements Research</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>SoftFlames Ventures LLC</div>
                      </div>
                    </div>
                  </div>

                  {/* Tech Tags */}
                  <div className="flex flex-wrap gap-2 pt-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      darkMode 
                        ? 'bg-emerald-900/50 text-emerald-300' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>PyTorch</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      darkMode 
                        ? 'bg-emerald-900/50 text-emerald-300' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>TensorFlow</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      darkMode 
                        ? 'bg-emerald-900/50 text-emerald-300' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>Medical Imaging</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      darkMode 
                        ? 'bg-emerald-900/50 text-emerald-300' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>3D MRI</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      darkMode 
                        ? 'bg-emerald-900/50 text-emerald-300' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>Computer Vision</span>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-20 animate-bounce ${
                darkMode ? 'bg-emerald-600' : 'bg-emerald-400'
              }`} style={{ animationDuration: '3s' }}></div>
              <div className={`absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-20 animate-bounce ${
                darkMode ? 'bg-emerald-700' : 'bg-emerald-300'
              }`} style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className={darkMode ? 'w-6 h-6 text-emerald-400' : 'w-6 h-6 text-emerald-700'} />
      </div>
    </div>
  );
}