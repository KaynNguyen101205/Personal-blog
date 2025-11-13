import React, { useState, useEffect } from "react";
import { blogApi } from "@/api/blogApi";
import { useQuery } from "@tanstack/react-query";
import BlogPostCard from "@/Components/blog/BlogPostCard";
import { isAdmin } from "@/utils/auth";
import { X } from "lucide-react";

export default function Home() {
  const [filterPublished, setFilterPublished] = useState("all");
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update theme state when it changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(localStorage.getItem('theme') === 'dark');
    };
    
    checkTheme();
    
    // Listen for theme changes
    const handleStorageChange = () => {
      checkTheme();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case theme changes in same window
    const interval = setInterval(checkTheme, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882';
  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const shadowLight = isDarkMode ? '#2a5370' : '#ffffff';
  const shadowDark = isDarkMode ? '#0d1f2a' : '#d9cec4';

  useEffect(() => {
    // Check for tag in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
    
    // Load search query from localStorage
    const savedQuery = localStorage.getItem('blog_search_query');
    if (savedQuery) {
      setSearchQuery(savedQuery);
    }
    
    // Listen for search query changes
    const handleSearchUpdate = () => {
      const query = localStorage.getItem('blog_search_query') || '';
      setSearchQuery(query);
    };
    
    // Listen for both storage events (cross-tab) and custom events (same tab)
    window.addEventListener('storage', handleSearchUpdate);
    window.addEventListener('blogSearchUpdate', handleSearchUpdate);
    
    return () => {
      window.removeEventListener('storage', handleSearchUpdate);
      window.removeEventListener('blogSearchUpdate', handleSearchUpdate);
    };
  }, []);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.listPosts('-published_date'),
    initialData: [],
  });

  const filteredPosts = posts.filter(post => {
    // Only show published posts to non-admin users
    if (!isAdmin() && !post.published) return false;
    
    const matchesFilter = filterPublished === "all" || 
                         (filterPublished === "published" && post.published) ||
                         (filterPublished === "draft" && !post.published);
    
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    
    // Search filter - search only in title
    const matchesSearch = !searchQuery || (() => {
      const query = searchQuery.toLowerCase();
      return post.title && post.title.toLowerCase().includes(query);
    })();
    
    return matchesFilter && matchesTag && matchesSearch;
  });

  // Filter options - only show draft for admin, no "published" for clients
  const filterOptions = isAdmin() ? ["all", "draft"] : ["all"];

  return (
    <div className="space-y-8">
      {/* Filter Section */}
      <div 
        className="neumorphic-shadow rounded-3xl p-6"
        style={{
          backgroundColor: bgColor,
          boxShadow: `8px 8px 16px ${shadowDark}, -8px -8px 16px ${shadowLight}`
        }}
      >
        <div 
          className="flex gap-2 neumorphic-inset rounded-2xl p-2"
          style={{
            backgroundColor: bgColor,
            boxShadow: `inset 6px 6px 12px ${shadowDark}, inset -6px -6px 12px ${shadowLight}`
          }}
        >
          {filterOptions.map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterPublished(filter)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 capitalize font-medium text-sm ${
                filterPublished === filter ? 'neumorphic-pressed' : ''
              }`}
              style={{ 
                color: textColor,
                backgroundColor: filterPublished === filter ? bgColor : 'transparent',
                boxShadow: filterPublished === filter 
                  ? `inset 4px 4px 8px ${shadowDark}, inset -4px -4px 8px ${shadowLight}`
                  : 'none'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tag Display */}
      {selectedTag && (
        <div className="neumorphic-shadow rounded-2xl p-4 flex items-center justify-between">
          <span style={{ color: textColor }}>
            Showing posts tagged with: <strong>{selectedTag}</strong>
          </span>
          <button
            onClick={() => {
              setSelectedTag(null);
              window.history.pushState({}, '', window.location.pathname);
            }}
            className="neumorphic-inset rounded-xl p-2 neumorphic-hover"
          >
            <X className="w-4 h-4" style={{ color: textColor }} />
          </button>
        </div>
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="neumorphic-shadow rounded-3xl h-96 animate-pulse" />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="neumorphic-shadow rounded-3xl p-12 text-center">
          <p className="text-lg" style={{ color: textColor }}>
            {searchQuery
              ? `No posts found matching "${searchQuery}"`
              : selectedTag 
                ? `No posts found with tag "${selectedTag}"` 
                : "No posts yet. Create your first one!"}
          </p>
        </div>
      )}
    </div>
  );
}