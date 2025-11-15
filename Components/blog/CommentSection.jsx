import React, { useState, useEffect } from "react";
import { blogApi } from "@/api/blogApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAdmin, isGmailLoggedIn, getGmailEmail, logoutGmail, onGmailAuthStateChange } from "@/utils/auth";
import { MessageCircle, Send, Trash2, LogOut, Download } from "lucide-react";
import { format } from "date-fns";
import GmailLoginModal from "@/Components/GmailLoginModal";
import { useTheme } from "@src/hooks/useTheme";

export default function CommentSection({ postId }) {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [showGmailLogin, setShowGmailLogin] = useState(false);
  const [currentEmail, setCurrentEmail] = useState(() => getGmailEmail() || "");
  const queryClient = useQueryClient();
  const { palette } = useTheme();
  const bgColor = palette.surfaceBackground;
  const textColor = palette.textPrimary;
  const subtleTextColor = palette.textSecondary;
  const shadowLight = palette.shadowLight;
  const shadowDark = palette.shadowDark;
  const borderColor = palette.border;

  useEffect(() => {
    setCurrentEmail(getGmailEmail() || "");
    const unsubscribe = onGmailAuthStateChange((user) => {
      setCurrentEmail(user?.email || getGmailEmail() || "");
    });
    return unsubscribe;
  }, []);

  const isLoggedIn = isGmailLoggedIn();
  const effectiveEmail = currentEmail || getGmailEmail() || "";
  const normalizedEmail = effectiveEmail ? effectiveEmail.toLowerCase() : "";
  const canDeleteComment = (commentEmail = "") => {
    const normalizedCommentEmail = commentEmail.toLowerCase();
    if (isAdmin()) {
      return true;
    }
    if (!normalizedEmail) {
      return false;
    }
    return normalizedCommentEmail === normalizedEmail;
  };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => blogApi.getComments(postId),
  });

  const addCommentMutation = useMutation({
    mutationFn: () => blogApi.addComment(postId, author.trim() || effectiveEmail || "Anonymous", content.trim(), effectiveEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setContent("");
      setAuthor(effectiveEmail || "");
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
    if (!isLoggedIn) {
      setShowGmailLogin(true);
      return;
    }
    if (content.trim()) {
      addCommentMutation.mutate();
    }
  };

  const handleGmailLoginSuccess = () => {
    setShowGmailLogin(false);
    const email = getGmailEmail() || "";
    setAuthor(email);
    setCurrentEmail(email);
  };

  useEffect(() => {
    if (isLoggedIn && !author) {
      setAuthor(effectiveEmail || "");
    }
  }, [isLoggedIn, effectiveEmail, author]);

  return (
    <div className="neumorphic-shadow rounded-3xl p-6 md:p-8 space-y-6" style={{ backgroundColor: bgColor }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6" style={{ color: textColor }} />
          <h2 className="text-2xl font-bold" style={{ color: textColor }}>
            Comments ({comments.length})
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin() && (
            <button
              onClick={async () => {
                await blogApi.exportCommentsToFile();
                alert("comments.json downloaded. Replace src/data/comments.json and commit so comments stay after redeploy.");
              }}
              className="neumorphic-shadow rounded-lg p-2 neumorphic-hover"
              title="Download comments data"
            >
              <Download className="w-4 h-4" style={{ color: subtleTextColor }} />
            </button>
          )}
        {isLoggedIn && (
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: subtleTextColor }}>
              {effectiveEmail}
              </span>
              <button
                onClick={() => {
                logoutGmail().finally(() => {
                  setAuthor("");
                  setCurrentEmail("");
                });
                  queryClient.invalidateQueries({ queryKey: ["comments", postId] });
                }}
                className="neumorphic-shadow rounded-lg p-2 neumorphic-hover"
                title="Logout"
              >
                <LogOut className="w-4 h-4" style={{ color: subtleTextColor }} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment Form */}
      {!isLoggedIn && (
        <div className="neumorphic-inset rounded-2xl p-4 text-center">
          <p style={{ color: subtleTextColor, marginBottom: "1rem" }}>
            Please login with your Gmail account to comment
          </p>
          <button
            onClick={() => setShowGmailLogin(true)}
            className="neumorphic-shadow rounded-xl px-6 py-3 neumorphic-hover"
            style={{
              backgroundColor: bgColor,
              color: textColor,
            }}
          >
            Login with Gmail
          </button>
        </div>
      )}
      {isLoggedIn && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={`Your name (logged in as ${effectiveEmail})`}
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
      )}

      {/* Gmail Login Modal */}
      {showGmailLogin && (
        <GmailLoginModal
          onSuccess={handleGmailLoginSuccess}
          onCancel={() => setShowGmailLogin(false)}
        />
      )}

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
                {canDeleteComment(comment.email || "") && (
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

