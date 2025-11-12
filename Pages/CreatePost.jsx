import React, { useState, useEffect } from "react";
import { blogApi } from "@/api/blogApi";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isAdmin } from "@/utils/auth";
import NeumorphicInput from "@/Components/blog/NeumorphicInput";
import NeumorphicButton from "@/Components/blog/NeumorphicButton";
import { Save, Eye, Upload, ArrowLeft, Trash2 } from "lucide-react";

export default function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');
  const [loading, setLoading] = useState(true);

  const isDarkMode = localStorage.getItem('theme') === 'dark';
  const bgColor = isDarkMode ? '#1B3C53' : '#F9F3EF';
  const textColor = isDarkMode ? '#D2C1B6' : '#1B3C53';
  const subtleTextColor = isDarkMode ? '#D2C1B6' : '#456882'; // Light in dark mode

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image: "",
    published: false,
    published_date: new Date().toISOString().split('T')[0],
    reading_time: 5,
    tags: []
  });

  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Only admin can access this page
    if (!isAdmin()) {
      navigate(createPageUrl("Home"));
      return;
    }
    setLoading(false);
  }, [navigate]);

  const { data: existingPost } = useQuery({
    queryKey: ['blogPost', editId],
    queryFn: async () => {
      if (!editId) return null;
      return blogApi.getPostById(editId);
    },
    enabled: !!editId && !loading
  });

  useEffect(() => {
    if (existingPost) {
      setFormData(existingPost);
    }
  }, [existingPost]);

  const createMutation = useMutation({
    mutationFn: (data) => blogApi.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['blogPosts']);
      if (editId) {
        queryClient.invalidateQueries(['blogPost', editId]);
      }
      navigate(createPageUrl("Home"));
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => blogApi.updatePost(editId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['blogPosts']);
      queryClient.invalidateQueries(['blogPost', editId]);
      navigate(createPageUrl("Home"));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => blogApi.deletePost(editId),
    onSuccess: () => {
      queryClient.invalidateQueries(['blogPosts']);
      if (editId) {
        queryClient.invalidateQueries(['blogPost', editId]);
      }
      navigate(createPageUrl("Home"));
    }
  });

  const handleSubmit = (published) => {
    const dataToSave = {
      ...formData,
      published,
      reading_time: Math.ceil(formData.content.split(' ').length / 200)
    };

    if (editId) {
      updateMutation.mutate(dataToSave);
    } else {
      createMutation.mutate(dataToSave);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await blogApi.uploadImage(file);
    setFormData({ ...formData, cover_image: file_url });
    setUploading(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="neumorphic-shadow rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(createPageUrl("Home"))}
          className="neumorphic-shadow rounded-2xl p-4 neumorphic-hover"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: subtleTextColor }} />
        </button>
        
        <h1 className="text-2xl font-bold" style={{ color: textColor }}>
          {editId ? 'Edit Post' : 'Create New Post'}
        </h1>
        
        {editId && (
          <button
            onClick={() => deleteMutation.mutate()}
            className="neumorphic-shadow rounded-2xl p-4 neumorphic-hover"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="w-5 h-5" style={{ color: '#c66' }} />
          </button>
        )}
      </div>

      <div className="neumorphic-shadow rounded-3xl p-8 space-y-6">
        <NeumorphicInput
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter your post title..."
          required
        />

        <NeumorphicInput
          label="Excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="A short summary of your post..."
          multiline
          rows={3}
        />

        <div className="space-y-3">
          <label className="block font-semibold pl-2" style={{ color: subtleTextColor }}>
            Cover Image
          </label>
          
          {formData.cover_image && (
            <div className="neumorphic-inset rounded-2xl p-4">
              <img
                src={formData.cover_image}
                alt="Cover"
                className="w-full h-48 object-cover rounded-xl"
                style={{ filter: 'saturate(0.8) contrast(0.9)' }}
              />
            </div>
          )}
          
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="neumorphic-shadow rounded-2xl p-4 cursor-pointer neumorphic-hover text-center">
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: subtleTextColor }} />
              <span style={{ color: subtleTextColor }}>
                {uploading ? "Uploading..." : "Upload Cover Image"}
              </span>
            </div>
          </label>
        </div>

        <NeumorphicInput
          label="Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your post content..."
          multiline
          rows={15}
          required
        />

        <div className="space-y-3">
          <label className="block font-semibold pl-2" style={{ color: subtleTextColor }}>
            Tags
          </label>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Add a tag..."
              className="flex-1 px-5 py-4 rounded-2xl neumorphic-inset transition-all duration-300 focus:outline-none font-medium"
              style={{
                backgroundColor: bgColor,
                color: textColor,
                border: 'none'
              }}
            />
            <button
              onClick={handleAddTag}
              className="neumorphic-shadow rounded-2xl px-6 neumorphic-hover"
              style={{ color: subtleTextColor }}
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="neumorphic-inset rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <span style={{ color: textColor }}>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{ color: subtleTextColor }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <NeumorphicInput
          label="Publish Date"
          type="date"
          value={formData.published_date}
          onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
        />
      </div>

      <div className="flex gap-4 justify-end">
        <NeumorphicButton
          onClick={() => handleSubmit(false)}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={!formData.title || !formData.content}
          icon={Save}
        >
          Save as Draft
        </NeumorphicButton>
        
        <NeumorphicButton
          variant="primary"
          onClick={() => handleSubmit(true)}
          loading={createMutation.isPending || updateMutation.isPending}
          disabled={!formData.title || !formData.content}
          icon={Eye}
        >
          Publish
        </NeumorphicButton>
      </div>
    </div>
  );
}