import React, { useState } from "react";
import { blogApi } from "@/api/blogApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAdmin } from "@/utils/auth";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function CommentSection({ postId }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const isDarkMode = localStorage.getItem("theme") === "dark";
  const bgColor = isDarkMode ? "#1B3C53" : "#F9F3EF";
  const textColor = isDarkMode ? "#D2C1B6" : "#1B3C53";
  const subtleTextColor = isDarkMode ? "#D2C1B6" : "#456882";
  const shadowLight = isDarkMode ? "#2a5370" : "#ffffff";
  const shadowDark = isDarkMode ? "#0d1f2a" : "#d9cec4";
  const borderColor = isDarkMode ? "#2a5370" : "#D2C1B6";

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => blogApi.getComments(postId),
  });

  const addCommentMutation = useMutation({
    mutationFn: () => blogApi.addComment(postId, author.trim() || "Anonymous", content.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setContent("");
      setAuthor("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => blogApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      addCommentMutation.mutate();
    }
  };

  return (
    <div className="neumorphic-shadow rounded-3xl p-6 md:p-8 space-y-6" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center gap-2">
        <MessageCircle className="w-6 h-6" style={{ color: textColor }} />
        <h2 className="text-2xl font-bold" style={{ color: textColor }}>
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 rounded-xl neumorphic-inset transition-all duration-300 focus:outline-none"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              border: "none",
            }}
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
            required
            className="w-full px-4 py-3 rounded-xl neumorphic-inset transition-all duration-300 focus:outline-none resize-none"
            style={{
              backgroundColor: bgColor,
              color: textColor,
              border: "none",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={addCommentMutation.isPending || !content.trim()}
          className="neumorphic-shadow rounded-xl px-6 py-3 flex items-center gap-2 neumorphic-hover disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: bgColor,
            color: textColor,
          }}
        >
          <Send className="w-5 h-5" />
          <span className="font-medium">
            {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </span>
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t-2" style={{ borderColor }}>
        {isLoading ? (
          <div className="text-center py-8">
            <p style={{ color: subtleTextColor }}>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: subtleTextColor }}>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="neumorphic-inset rounded-2xl p-4 space-y-2"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold" style={{ color: textColor }}>
                      {comment.author}
                    </span>
                    <span className="text-sm" style={{ color: subtleTextColor }}>
                      {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="leading-relaxed" style={{ color: textColor }}>
                    {comment.content}
                  </p>
                </div>
                {isAdmin() && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this comment?")) {
                        deleteCommentMutation.mutate(comment.id);
                      }
                    }}
                    className="neumorphic-shadow rounded-lg p-2 neumorphic-hover ml-2"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" style={{ color: subtleTextColor }} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

