import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogApi } from "@/api/blogApi";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { isAdmin } from "@/utils/auth";
import { Calendar, ArrowRight, Github, Facebook, Instagram, Linkedin, Mail } from "lucide-react";
import { format } from "date-fns";

export default function Home() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };
    checkTheme();
    const interval = setInterval(checkTheme, 100);
    return () => clearInterval(interval);
  }, []);

  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882';
  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const shadowLight = isDarkMode ? '#2a5370' : '#ffffff';
  const shadowDark = isDarkMode ? '#0d1f2a' : '#d9cec4';
  const borderColor = isDarkMode ? '#2a5370' : '#D2C1B6';

  const { data: posts = [] } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.listPosts('-published_date'),
    initialData: [],
  });

  // Get posts using EXACTLY the same filtering logic as Posts page when filter is "all"
  // This ensures featured posts match what appears in Posts page
  const availablePosts = posts.filter(post => {
    // Only show published posts to non-admin users (same as Posts page)
    if (!isAdmin() && !post.published) return false;
    // For "all" filter, show all published posts (non-admin) or all posts (admin)
    // This matches Posts.jsx filter logic when filterPublished === "all"
    return true; // matchesFilter would be true for "all"
  });
  
  // Sort by published_date (newest first) and take the 3 most recent
  const featuredPosts = [...availablePosts]
    .sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
      return dateB - dateA; // Newest first
    })
    .slice(0, 3);

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold" style={{ color: textColor }}>
          Welcome to Kayane Blog
        </h1>
        
        <div className="space-y-4" style={{ color: textColor }}>
          <p className="text-lg leading-relaxed">
            Welcome to my blog! I'm Nam Khanh Nguyen, but most people call me Kayane or Kayn. 
            I'm a Computer Science undergraduate at the University of Illinois Chicago, and I work as a DevOps/Platform/Cloud engineer.
          </p>
          <p className="text-lg leading-relaxed">
            This blog is where I document what I'm learning in DevOps, SRE, and life. 
            I write about technology, programming, cloud computing, automation, and other things I find interesting. 
            However, most of the content will be about technology, programming, and DevOps/Platform development.
          </p>
          <p className="text-lg leading-relaxed">
            I hope you enjoy reading my blog and find it helpful!
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-2">
          <p className="font-semibold" style={{ color: textColor }}>Social Links:</p>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="neumorphic-shadow rounded-lg p-2 neumorphic-hover"
                title={social.label}
                style={{ color: subtleTextColor }}
              >
                {typeof social.icon === 'function' ? <social.icon /> : <social.icon className="w-5 h-5" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="h-px" style={{ backgroundColor: borderColor }} />

      {/* Featured Posts Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold" style={{ color: textColor }}>
          Featured
        </h2>
        
        {featuredPosts.length > 0 ? (
          <div className="space-y-6">
            {featuredPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`${createPageUrl("ViewPost")}?id=${post.id}`)}
                className="neumorphic-shadow rounded-2xl p-6 cursor-pointer neumorphic-hover transition-all duration-300"
                style={{ backgroundColor: bgColor }}
              >
                <h3 
                  className="text-xl font-bold mb-2 hover:opacity-80 transition-opacity"
                  style={{ color: textColor }}
                >
                  {post.title}
                </h3>
                
                {post.published_date && (
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" style={{ color: subtleTextColor }} />
                    <span className="text-sm" style={{ color: subtleTextColor }}>
                      {format(new Date(post.published_date), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                )}
                
                {post.excerpt && (
                  <p className="leading-relaxed" style={{ color: subtleTextColor }}>
                    {post.excerpt}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="neumorphic-shadow rounded-2xl p-8 text-center">
            <p style={{ color: subtleTextColor }}>No featured posts yet.</p>
          </div>
        )}

        {/* All Posts Link */}
        <div className="text-center pt-4">
          <button
            onClick={() => navigate(createPageUrl("Posts"))}
            className="neumorphic-shadow rounded-xl px-6 py-3 neumorphic-hover inline-flex items-center gap-2"
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            <span className="font-medium">All Posts</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
