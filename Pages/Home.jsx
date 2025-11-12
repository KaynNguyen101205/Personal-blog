import React, { useState, useEffect } from "react";
import { blogApi } from "@/api/blogApi";
import { useQuery } from "@tanstack/react-query";
import BlogPostCard from "@/Components/blog/BlogPostCard";
import { X } from "lucide-react";

export default function Home() {
  const [filterPublished, setFilterPublished] = useState("published");
  const [selectedTag, setSelectedTag] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882'; // Light in dark mode

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await blogApi.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };
    loadUser();

    // Check for tag in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tagParam = urlParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, []);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.listPosts('-published_date'),
    initialData: [],
  });

  const filteredPosts = posts.filter(post => {
    // Only show published posts to non-admin users
    if (currentUser?.role !== 'admin' && !post.published) return false;
    
    const matchesFilter = filterPublished === "all" || 
                         (filterPublished === "published" && post.published) ||
                         (filterPublished === "draft" && !post.published);
    
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    
    return matchesFilter && matchesTag;
  });

  return (
    <div className="space-y-8">
      {/* Filter Section - Only show to admin */}
      {currentUser?.role === 'admin' && (
        <div className="neumorphic-shadow rounded-3xl p-6">
          <div className="flex gap-2 neumorphic-inset rounded-2xl p-2">
            {["all", "published", "draft"].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterPublished(filter)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 capitalize font-medium text-sm ${
                  filterPublished === filter ? 'neumorphic-pressed' : ''
                }`}
                style={{ 
                  color: textColor
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      )}

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
            {selectedTag 
              ? `No posts found with tag "${selectedTag}"` 
              : "No posts yet. Create your first one!"}
          </p>
        </div>
      )}
    </div>
  );
}