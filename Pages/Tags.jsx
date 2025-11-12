import React from "react";
import { blogApi } from "@/api/blogApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tag } from "lucide-react";

export default function Tags() {
  const navigate = useNavigate();
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882'; // Light in dark mode
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.listPosts('-published_date'),
    initialData: [],
  });

  // Get all tags with post counts
  const tagCounts = posts.reduce((acc, post) => {
    if (post.tags && post.published) {
      post.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
    }
    return acc;
  }, {});

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const handleTagClick = (tag) => {
    navigate(`${createPageUrl("Home")}?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="neumorphic-shadow rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: textColor }}>
          All Tags
        </h1>
        <p className="text-center mb-8" style={{ color: subtleTextColor }}>
          Explore posts by topic
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="neumorphic-shadow rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : sortedTags.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className="neumorphic-shadow rounded-2xl p-6 neumorphic-hover text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Tag className="w-5 h-5" style={{ color: subtleTextColor }} />
                </div>
                <div className="font-semibold mb-1" style={{ color: textColor }}>
                  {tag}
                </div>
                <div className="text-sm" style={{ color: subtleTextColor }}>
                  {count} {count === 1 ? 'post' : 'posts'}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: subtleTextColor }}>No tags found</p>
          </div>
        )}
      </div>
    </div>
  );
}