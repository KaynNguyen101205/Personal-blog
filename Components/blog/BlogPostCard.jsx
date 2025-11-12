import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, Clock, Tag } from "lucide-react";
import { format } from "date-fns";

export default function BlogPostCard({ post }) {
  const navigate = useNavigate();
  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882'; // Light in dark mode

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
            <div className="flex items-center gap-1 neumorphic-inset rounded-xl px-3 py-2">
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(post.published_date), "MMM d, yyyy")}</span>
            </div>
          )}
          
          {post.reading_time && (
            <div className="flex items-center gap-1 neumorphic-inset rounded-xl px-3 py-2">
              <Clock className="w-3 h-3" />
              <span>{post.reading_time} min read</span>
            </div>
          )}
          
          {!post.published && (
            <div className="neumorphic-inset rounded-xl px-3 py-2 font-medium">
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
                style={{ color: subtleTextColor }}
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