import React from "react";
import { blogApi } from "@/api/blogApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isAdmin } from "@/utils/auth";
import { ArrowLeft, Calendar, Clock, Tag, Edit } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import CommentSection from "@/Components/blog/CommentSection";
import { useTheme } from "@src/hooks/useTheme";

export default function ViewPost() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');

  const { palette } = useTheme();
  const textColor = palette.textPrimary;
  const subtleTextColor = palette.textSecondary;
  const surfaceColor = palette.surfaceBackground;
  const chipColor = palette.chipBackground;
  const borderColor = palette.border;

  const { data: post, isLoading } = useQuery({
    queryKey: ['blogPost', postId],
    queryFn: () => blogApi.getPostById(postId),
    enabled: !!postId
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="neumorphic-shadow rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="neumorphic-shadow rounded-3xl p-12 text-center">
          <p className="text-lg" style={{ color: subtleTextColor }}>Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(createPageUrl("Posts"))}
          className="neumorphic-shadow rounded-2xl p-4 neumorphic-hover"
          style={{ backgroundColor: surfaceColor, color: subtleTextColor }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {isAdmin() && (
          <button
            onClick={() => navigate(`${createPageUrl("CreatePost")}?id=${post.id}`)}
            className="neumorphic-shadow rounded-2xl p-4 neumorphic-hover flex items-center gap-2"
            style={{ backgroundColor: surfaceColor, color: subtleTextColor }}
          >
            <Edit className="w-5 h-5" />
            <span className="font-medium">Edit</span>
          </button>
        )}
      </div>

      {/* Main Content */}
      <article
        className="neumorphic-shadow rounded-3xl overflow-hidden"
        style={{ backgroundColor: surfaceColor }}
      >
        {post.cover_image && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover"
              style={{ filter: 'saturate(0.8) contrast(0.9)' }}
            />
          </div>
        )}

        <div className="p-8 md:p-12 space-y-6">
          {/* Title */}
          <h1 
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={{ color: textColor }}
          >
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3 text-sm">
            {post.published_date && (
              <div
                className="flex items-center gap-2 neumorphic-inset rounded-xl px-4 py-2"
                style={{ backgroundColor: chipColor }}
              >
                <Calendar className="w-4 h-4" style={{ color: subtleTextColor }} />
                <span style={{ color: subtleTextColor }}>
                  {format(new Date(post.published_date), "MMMM d, yyyy")}
                </span>
              </div>
            )}
            
            {post.reading_time && (
              <div
                className="flex items-center gap-2 neumorphic-inset rounded-xl px-4 py-2"
                style={{ backgroundColor: chipColor }}
              >
                <Clock className="w-4 h-4" style={{ color: subtleTextColor }} />
                <span style={{ color: subtleTextColor }}>
                  {post.reading_time} min read
                </span>
              </div>
            )}

            {!post.published && (
              <div
                className="neumorphic-inset rounded-xl px-4 py-2 font-medium"
                style={{ backgroundColor: chipColor }}
              >
                <span style={{ color: '#c66' }}>Draft</span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <div
              className="neumorphic-inset rounded-2xl p-6"
              style={{ backgroundColor: surfaceColor }}
            >
              <p 
                className="text-lg leading-relaxed italic"
                style={{ color: subtleTextColor }}
              >
                {post.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none leading-relaxed"
            style={{ color: textColor }}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 leading-relaxed" style={{ color: textColor }}>{children}</p>,
                h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4" style={{ color: textColor }}>{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3" style={{ color: textColor }}>{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2" style={{ color: textColor }}>{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2" style={{ color: textColor }}>{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2" style={{ color: textColor }}>{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote
                    className="neumorphic-inset rounded-2xl p-4 my-4 italic"
                    style={{ color: subtleTextColor, backgroundColor: chipColor }}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children }) => 
                  inline ? (
                    <code
                      className="neumorphic-inset rounded px-2 py-1 text-sm"
                      style={{ color: subtleTextColor, backgroundColor: chipColor }}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre
                      className="neumorphic-inset rounded-2xl p-4 overflow-x-auto my-4"
                      style={{ backgroundColor: surfaceColor }}
                    >
                      <code style={{ color: subtleTextColor }}>{children}</code>
                    </pre>
                  ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t-2" style={{ borderColor }}>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 neumorphic-inset rounded-xl px-4 py-2"
                    style={{ backgroundColor: chipColor }}
                  >
                    <Tag className="w-4 h-4" style={{ color: subtleTextColor }} />
                    <span style={{ color: subtleTextColor }}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Comments Section */}
      {post.published && <CommentSection postId={post.id} />}
    </div>
  );
}