import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isAdmin, logout, getUserMode } from "@/utils/auth";
import { FileText, Archive, Search, Sun, Moon, Github, Facebook, Instagram, Linkedin, Mail, LogOut, User } from "lucide-react";
import AuthModal from "@/Components/AuthModal";
import { useTheme } from "@src/hooks/useTheme";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMode, setUserMode] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isDarkMode, palette, toggleTheme } = useTheme();

  useEffect(() => {
    setUserMode(getUserMode());
    // Load search query from localStorage
    const savedQuery = localStorage.getItem('blog_search_query');
    if (savedQuery) {
      setSearchQuery(savedQuery);
    }
  }, [location]);

  const handleLogout = () => {
    logout();
    setUserMode(null);
        navigate(createPageUrl("Posts"));
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

  const pageBackground = palette.pageBackground;
  const surfaceBackground = palette.surfaceBackground;
  const textColor = palette.textPrimary;
  const subtleTextColor = palette.textSecondary;
  const copyrightColor = palette.copyright;
  const shadowLight = palette.shadowLight;
  const shadowDark = palette.shadowDark;

  const navItems = [
    { name: "Posts", path: createPageUrl("Posts") },
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
    <div className="min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: pageBackground, transition: 'background-color 0.3s' }}>
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
      <header className="py-4 sm:py-6 px-4 sm:px-6" style={{ backgroundColor: pageBackground }}>
        <div className="max-w-6xl mx-auto">
          <nav
            className="neumorphic-shadow rounded-2xl px-3 sm:px-6 py-3 sm:py-4"
            style={{ backgroundColor: surfaceBackground }}
          >
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
                        color: textColor,
                        backgroundColor: surfaceBackground
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
                    style={{ color: subtleTextColor, backgroundColor: surfaceBackground }}
                  >
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                )}
                
                <Link
                  to={createPageUrl("Archive")}
                  className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                  title="Archive"
                  style={{ color: subtleTextColor, backgroundColor: surfaceBackground }}
                >
                  <Archive className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                  title="Search"
                  style={{ color: subtleTextColor, backgroundColor: surfaceBackground }}
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={toggleTheme}
                  className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                  title="Toggle Theme"
                  style={{ color: subtleTextColor, backgroundColor: surfaceBackground }}
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {isAdmin() ? (
                  <button
                    onClick={handleLogout}
                    className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                    title="Logout"
                    style={{ color: subtleTextColor, backgroundColor: surfaceBackground }}
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                ) : userMode === "guest" && (
                  <button
                    onClick={handleShowAdminLogin}
                    className="neumorphic-shadow rounded-xl p-2 neumorphic-hover"
                    title="Login as Admin"
                    style={{ color: subtleTextColor, backgroundColor: surfaceBackground }}
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                </div>
              </div>
            </div>

            {/* Search Bar */}
            {isSearchOpen && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: palette.border }}>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    localStorage.setItem('blog_search_query', e.target.value);
                    // Trigger search update in Home component
                    window.dispatchEvent(new Event('blogSearchUpdate'));
                  }}
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl neumorphic-inset transition-all duration-300 focus:outline-none font-medium"
                  style={{
                    backgroundColor: surfaceBackground,
                    color: textColor,
                    border: 'none'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                      localStorage.removeItem('blog_search_query');
                      window.dispatchEvent(new Event('blogSearchUpdate'));
                    }
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
          <div
            className="neumorphic-shadow rounded-2xl px-4 sm:px-6 py-4"
            style={{ backgroundColor: surfaceBackground }}
          >
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
                    style={{ color: textColor, backgroundColor: surfaceBackground }}
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