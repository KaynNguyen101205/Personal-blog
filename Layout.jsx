import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isAdmin, logout, getUserMode } from "@/utils/auth";
import { FileText, Archive, Search, Sun, Moon, Github, Facebook, Instagram, Linkedin, Mail, LogOut, User } from "lucide-react";
import AuthModal from "@/Components/AuthModal";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userMode, setUserMode] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    setUserMode(getUserMode());
  }, [location]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    setUserMode(null);
    navigate(createPageUrl("Home"));
    window.location.reload(); // Reload to show auth modal again
  };

  const handleShowAdminLogin = () => {
    setShowAuthModal(true);
  };

  const handleAuthSelect = (mode) => {
    setUserMode(mode);
    setShowAuthModal(false);
    window.location.reload(); // Reload to update UI
  };

  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882'; // Light in dark mode for all text
  const copyrightColor = isDarkMode ? '#456882' : '#456882'; // Darker color only for copyright
  const accentColor = isDarkMode ? '#456882' : '#456882';
  const shadowLight = isDarkMode ? '#2a5370' : '#ffffff';
  const shadowDark = isDarkMode ? '#0d1f2a' : '#d9cec4';

  const navItems = [
    { name: "Posts", path: createPageUrl("Home") },
    { name: "Tags", path: createPageUrl("Tags") },
    { name: "About", path: createPageUrl("About") }
  ];

  const socialLinks = [
    { icon: Github, url: "https://github.com/KaynNguyen101205", label: "GitHub" },
    { icon: Facebook, url: "https://www.facebook.com/itisnamkhanh/", label: "Facebook" },
    { icon: Instagram, url: "https://www.instagram.com/capheout/", label: "Instagram" },
    { icon: Linkedin, url: "https://www.linkedin.com/in/nam-khanh-kayane-nguyen-789902271/", label: "LinkedIn" },
    { icon: Mail, url: "mailto:nguyenkayn5@gmail.com", label: "Email" },
    { 
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ), 
      url: "https://x.com/Iamnamkhanh", 
      label: "X" 
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: bgColor, transition: 'background-color 0.3s' }}>
      <style>{`
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        html, body {
          overflow-x: hidden;
          width: 100%;
        }
        
        .neumorphic-shadow {
          box-shadow: 8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight};
        }
        
        .neumorphic-inset {
          box-shadow: inset 6px 6px 12px ${shadowDark}, inset -6px -6px 12px ${shadowLight};
        }
        
        .neumorphic-pressed {
          box-shadow: inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight};
        }
        
        .neumorphic-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .neumorphic-hover:hover {
          box-shadow: 4px 4px 8px ${shadowDark}, -4px -4px 8px ${shadowLight};
        }
        
        .neumorphic-hover:active {
          box-shadow: inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight};
        }
      `}</style>

      {/* Header Navigation */}
      <header className="py-4 sm:py-6 px-4 sm:px-6" style={{ backgroundColor: bgColor }}>
        <div className="max-w-6xl mx-auto">
          <nav className="neumorphic-shadow rounded-2xl px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
              {/* Left: Blog Title */}
              <Link
                to={createPageUrl("Home")}
                className="text-xl sm:text-2xl font-bold transition-all duration-300 hover:opacity-80"
                style={{ color: textColor }}
              >
                Kayane Blog
              </Link>

              {/* Right: Navigation Links and Action Icons */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* Navigation Links */}
                <div className="flex items-center gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                        isActive(item.path) ? 'neumorphic-pressed' : ''
                      }`}
                      style={{ 
                        color: textColor
                      }}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin() && (
                  <Link
                    to={createPageUrl("CreatePost")}
                    className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                    title="Create Post"
                  >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                  </Link>
                )}
                
                <Link
                  to={createPageUrl("Archive")}
                  className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                  title="Archive"
                >
                  <Archive className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                </Link>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                  title="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                </button>

                <button
                  onClick={toggleTheme}
                  className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                  title="Toggle Theme"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                  )}
                </button>

                {isAdmin() ? (
                  <button
                    onClick={handleLogout}
                    className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                  </button>
                ) : userMode === "guest" && (
                  <button
                    onClick={handleShowAdminLogin}
                    className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                    title="Login as Admin"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: subtleTextColor }} />
                  </button>
                )}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            {isSearchOpen && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: isDarkMode ? '#2a5370' : '#D2C1B6' }}>
                <input
                  type="text"
                  placeholder="Search posts..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl neumorphic-inset transition-all duration-300 focus:outline-none font-medium"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    border: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsSearchOpen(false);
                  }}
                />
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 pb-12 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 sm:px-6 mt-auto w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="neumorphic-shadow rounded-2xl px-4 sm:px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div style={{ color: copyrightColor }} className="text-xs sm:text-sm text-center md:text-left">
                Copyright © 2025 | All rights reserved.
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neumorphic-shadow rounded-lg p-2 neumorphic-hover"
                    title={social.label}
                    style={{ color: textColor }}
                  >
                    {typeof social.icon === 'function' ? <social.icon /> : <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal for Guest to Admin Login */}
      {showAuthModal && (
        <AuthModal onSelect={handleAuthSelect} adminOnly={true} />
      )}
    </div>
  );
}