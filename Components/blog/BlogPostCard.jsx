import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { useTheme } from "@src/hooks/useTheme";

export default function BlogPostCard({ post }) {
  const navigate = useNavigate();
  const { palette } = useTheme();
  const bgColor = palette.surfaceBackground;
  const textColor = palette.textPrimary;
  const subtleTextColor = palette.textSecondary;
  const chipColor = palette.chipBackground;

  const handleClick = () => {
    navigate(`${createPageUrl("ViewPost")}?id=${post.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="neumorphic-shadow rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      style={{ backgroundColor: bgColor }}
    >
      {post.cover_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.8) contrast(0.9)' }}
          />
        </div>
      )}
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <h3 
            className="text-xl font-bold line-clamp-2"
            style={{ color: textColor }}
          >
            {post.title}
          </h3>
          
          {post.excerpt && (
            <p 
              className="text-sm line-clamp-3"
              style={{ color: subtleTextColor }}
            >
              {post.excerpt}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-xs" style={{ color: subtleTextColor }}>
          {post.published_date && (
            <div
              className="flex items-center gap-1 neumorphic-inset rounded-xl px-3 py-2"
              style={{ backgroundColor: chipColor }}
            >
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(post.published_date), "MMM d, yyyy")}</span>
            </div>
          )}
          
          {post.reading_time && (
            <div
              className="flex items-center gap-1 neumorphic-inset rounded-xl px-3 py-2"
              style={{ backgroundColor: chipColor }}
            >
              <Clock className="w-3 h-3" />
              <span>{post.reading_time} min read</span>
            </div>
          )}
          
          {!post.published && (
            <div
              className="neumorphic-inset rounded-xl px-3 py-2 font-medium"
              style={{ backgroundColor: chipColor }}
            >
              Draft
            </div>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-1 neumorphic-inset rounded-xl px-3 py-1 text-xs"
                style={{ color: subtleTextColor, backgroundColor: chipColor }}
              >
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}