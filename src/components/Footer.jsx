import React from 'react';
import { Github, Mail, Heart, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          
          {/* About */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">
              Al-Nahiyan Khushbu
            </h3>
            <p className="text-gray-400 mb-4">
              Medical AI Researcher specializing in Hybrid CNN-Transformer Architectures for early disease detection. 
              Passionate about advancing healthcare through artificial intelligence.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>using React & Tailwind CSS</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#research" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Research
                </a>
              </li>
              <li>
                <a href="#publications" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Publications
                </a>
              </li>
              <li>
                <a href="#projects" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Connect</h4>
            <div className="space-y-3">
              <a
                href="https://github.com/docAlnahiyan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
                GitHub
              </a>
              <a
                href="mailto:al-nahiyan@outlook.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-5 h-5" />
                Email
              </a>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} Al-Nahiyan Khushbu. All rights reserved.
            </div>

            {/* Achievements */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>🏆 Best Paper Award - IARCE 2024</span>
              <span>📄 2 Publications</span>
              <span>🎓 MSc Computer Science</span>
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600 transition-all text-sm font-semibold"
            >
              <ArrowUp className="w-4 h-4" />
              Back to Top
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}