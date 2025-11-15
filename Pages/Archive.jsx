import React from "react";
import { blogApi } from "@/api/blogApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { useTheme } from "@src/hooks/useTheme";

export default function Archive() {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const textColor = palette.textPrimary;
  const subtleTextColor = palette.textSecondary;
  const surfaceColor = palette.surfaceBackground;
  
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.listPosts('-published_date'),
    initialData: [],
  });

  // Group posts by year and month
  const groupedPosts = posts
    .filter(post => post.published && post.published_date)
    .reduce((acc, post) => {
      const date = new Date(post.published_date);
      const year = date.getFullYear();
      const month = format(date, 'MMMM');
      
      if (!acc[year]) acc[year] = {};
      if (!acc[year][month]) acc[year][month] = [];
      
      acc[year][month].push(post);
      return acc;
    }, {});

  const years = Object.keys(groupedPosts).sort((a, b) => b - a);

  const handlePostClick = (postId) => {
    navigate(`${createPageUrl("ViewPost")}?id=${postId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div
        className="neumorphic-shadow rounded-3xl p-8"
        style={{ backgroundColor: surfaceColor }}
      >
        <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: textColor }}>
          Archive
        </h1>
        <p className="text-center mb-8" style={{ color: subtleTextColor }}>
          All posts organized by date
        </p>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="neumorphic-inset rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : years.length > 0 ? (
          <div className="space-y-8">
            {years.map((year) => (
              <div key={year} className="space-y-6">
                <h2 className="text-2xl font-bold" style={{ color: textColor }}>
                  {year}
                </h2>
                
                {Object.entries(groupedPosts[year]).map(([month, monthPosts]) => (
                  <div
                    key={month}
                    className="neumorphic-inset rounded-2xl p-6 space-y-3"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
                      {month}
                    </h3>
                    
                    <div className="space-y-2">
                      {monthPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => handlePostClick(post.id)}
                          className="w-full text-left px-4 py-3 rounded-xl neumorphic-hover flex items-start justify-between gap-4"
                          style={{ backgroundColor: surfaceColor }}
                        >
                          <span className="font-medium flex-1" style={{ color: textColor }}>
                            {post.title}
                          </span>
                          <span className="text-sm whitespace-nowrap flex items-center gap-2" style={{ color: subtleTextColor }}>
                            <Calendar className="w-4 h-4" />
                            {format(new Date(post.published_date), 'MMM d')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p style={{ color: subtleTextColor }}>No published posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
}