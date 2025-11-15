import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { isAdmin } from "@/utils/auth";

const POSTS_COLLECTION = "posts";
const COMMENTS_COLLECTION = "comments";

const FALLBACK_USER = {
  id: "owner",
  name: "Site Owner",
  role: "admin"
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureFirestore = () => {
  if (!db) {
    throw new Error(
      "Firebase is not configured. Please set the VITE_FIREBASE_* environment variables."
    );
  }
};

// Removed Firebase Storage - using Imgur instead

const nextId = () =>
  `post-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
const nextCommentId = () =>
  `comment-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const computeReadingTime = (content = "") => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const sortPosts = (posts, order) => {
  if (order === "-published_date") {
    return [...posts].sort((a, b) => {
      const dateA = a.published_date
        ? new Date(a.published_date).getTime()
        : 0;
      const dateB = b.published_date
        ? new Date(b.published_date).getTime()
        : 0;
      return dateB - dateA;
    });
  }
  if (order === "published_date") {
    return [...posts].sort((a, b) => {
      const dateA = a.published_date
        ? new Date(a.published_date).getTime()
        : 0;
      const dateB = b.published_date
        ? new Date(b.published_date).getTime()
        : 0;
      return dateA - dateB;
    });
  }
  return [...posts];
};

const compressImage = (
  file,
  maxWidth = 1200,
  maxHeight = 800,
  quality = 0.7
) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const blobReader = new FileReader();
              blobReader.onload = () => resolve(blobReader.result);
              blobReader.onerror = () =>
                reject(new Error("Failed to compress image"));
              blobReader.readAsDataURL(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

const readFileAsDataUrl = async (file) => {
  console.log("Reading file as data URL...");
  
  // Always compress images larger than 200KB to ensure they fit in Firestore
  // Firestore has 1MB document limit, and base64 increases size by ~33%
  if (file.size > 200 * 1024 && file.type.startsWith("image/")) {
    try {
      console.log("Compressing image to fit in Firestore (this may take a moment)...");
      // More aggressive compression for Firestore storage
      return await compressImage(file, 1000, 700, 0.6);
    } catch (error) {
      console.warn("Image compression failed, trying original:", error);
      // If compression fails, try reading original (might be small enough)
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      console.log("File read successfully");
      resolve(reader.result);
    };
    reader.onerror = () => {
      console.error("FileReader error");
      reject(new Error("Failed to read file"));
    };
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        console.log(`Reading file: ${percent.toFixed(1)}%`);
      }
    };
    reader.readAsDataURL(file);
  });
};

const downloadJson = (data, filename) => {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const listPostsRemote = async (order) => {
  ensureFirestore();
  const baseRef = collection(db, POSTS_COLLECTION);
  let queryRef = baseRef;

  try {
    console.log("Fetching posts from Firestore with order:", order);
    if (order === "-published_date") {
      queryRef = query(baseRef, orderBy("published_date", "desc"));
    } else if (order === "published_date") {
      queryRef = query(baseRef, orderBy("published_date", "asc"));
    }

    const snapshot = await getDocs(queryRef);
    const posts = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      console.log("Post from Firestore:", data.id, data.title, "Published:", data.published);
      return data;
    });
    console.log(`Fetched ${posts.length} posts from Firestore`);
    
    if (posts.length === 0) {
      console.warn("WARNING: No posts found in Firestore! Check if posts exist in Firebase Console.");
    }
    
    return sortPosts(posts, order);
  } catch (error) {
    console.error("Error fetching posts from Firestore:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // If orderBy fails (missing index), try without ordering
    if (error.code === "failed-precondition" || error.message?.includes("index")) {
      console.warn("OrderBy index missing, fetching without order");
      try {
        const snapshot = await getDocs(baseRef);
        const posts = snapshot.docs.map((docSnap) => docSnap.data());
        console.log(`Fetched ${posts.length} posts from Firestore (without order)`);
        return sortPosts(posts, order);
      } catch (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        throw fallbackError;
      }
    }
    
    // If permission denied, provide helpful message
    if (error.code === "permission-denied") {
      console.error("PERMISSION DENIED: Check Firestore security rules!");
      throw new Error("Permission denied. Please check Firestore security rules allow reads.");
    }
    
    throw error;
  }
};

const getPostRemote = async (id) => {
  ensureFirestore();
  const docRef = doc(db, POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const createPostRemote = async (post) => {
  ensureFirestore();
  try {
    console.log("Creating post in Firestore:", post.id, post.title);
    await setDoc(doc(db, POSTS_COLLECTION, post.id), post);
    console.log("Post created successfully in Firestore:", post.id);
    
    // Verify the post was saved
    const docRef = doc(db, POSTS_COLLECTION, post.id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("WARNING: Post was not saved to Firestore!");
      throw new Error("Post was not saved. Please check Firestore rules.");
    }
    console.log("Post verified in Firestore:", post.id);
    return post;
  } catch (error) {
    console.error("Error creating post in Firestore:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

const updatePostRemote = async (id, data) => {
  ensureFirestore();
  try {
    console.log("Updating post in Firestore:", id);
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.error("Post not found in Firestore:", id);
      throw new Error("Post not found");
    }
    const updatedPost = { ...docSnap.data(), ...data };
    await setDoc(docRef, updatedPost);
    console.log("Post updated successfully in Firestore:", id);
    return updatedPost;
  } catch (error) {
    console.error("Error updating post in Firestore:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

const deletePostRemote = async (id) => {
  ensureFirestore();
  await deleteDoc(doc(db, POSTS_COLLECTION, id));
};

const listCommentsRemote = async (postId) => {
  ensureFirestore();
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const q = query(
    commentsRef,
    where("postId", "==", postId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => docSnap.data());
};

const addCommentRemote = async (comment) => {
  ensureFirestore();
  await setDoc(doc(db, COMMENTS_COLLECTION, comment.id), comment);
  return comment;
};

const deleteCommentRemote = async (commentId) => {
  ensureFirestore();
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
};

// Helper function to convert data URL to Blob for Imgur upload
const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Upload image using base64 data URL directly (stores in Firestore as data URL)
// This works without any external service but has size limitations
const uploadImageRemote = async (file, dataUrl) => {
  // Validate file type
  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error("File must be an image. Please select an image file.");
  }
  
  // Validate file size (500KB limit for base64 in Firestore to stay safe)
  // Firestore documents have 1MB limit, and base64 increases size by ~33%
  const maxSize = 500 * 1024; // 500KB (safe limit for Firestore)
  if (file.size > maxSize) {
    throw new Error("Image size must be less than 500KB for direct storage. The image will be compressed automatically.");
  }
  
  console.log("Storing image as base64 data URL...");
  console.log("File size:", file.size, "bytes");
  console.log("File type:", file.type);
  
  try {
    // Check if data URL is too large (Firestore 1MB document limit)
    // Base64 encoding increases size by ~33%, so we check the data URL size
    const dataUrlSize = new Blob([dataUrl]).size;
    const maxDataUrlSize = 700 * 1024; // 700KB to stay under 1MB limit
    
    if (dataUrlSize > maxDataUrlSize) {
      console.warn("Image is too large even after compression, trying to compress more...");
      // Try compressing with lower quality
      const compressed = await compressImage(file, 800, 600, 0.5);
      const compressedSize = new Blob([compressed]).size;
      
      if (compressedSize > maxDataUrlSize) {
        throw new Error("Image is too large to store directly. Please use a smaller image (under 300KB original size).");
      }
      
      console.log("Using more compressed version");
      return compressed;
    }
    
    console.log("Image stored successfully as data URL");
    return dataUrl;
  } catch (error) {
    console.error("Image storage error:", error);
    throw error;
  }
};

export const blogApi = {
  async getCurrentUser() {
    await delay();
    return { ...FALLBACK_USER };
  },

  async listPosts(order = "-published_date") {
    await delay();
    try {
      const posts = await listPostsRemote(order);
      console.log(`[blogApi] listPosts returned ${posts.length} posts`);
      if (posts.length === 0) {
        console.warn("[blogApi] WARNING: No posts found! Check Firebase Console to verify posts exist.");
      }
      return posts;
    } catch (error) {
      console.error("[blogApi] Error in listPosts:", error);
      throw error;
    }
  },

  async getPostById(id) {
    await delay();
    return getPostRemote(id);
  },

  async createPost(data) {
    await delay();
    const id = data.id || nextId();
    const nowDate = new Date().toISOString();
    const publishedDate = data.published_date || nowDate.split("T")[0];
    const newPost = {
      ...data,
      id,
      published: Boolean(data.published),
      cover_image: data.cover_image || "",
      published_date: publishedDate,
      reading_time: data.reading_time || computeReadingTime(data.content),
      created_at: nowDate,
      updated_at: nowDate
    };

    return createPostRemote(newPost);
  },

  async updatePost(id, data) {
    await delay();
    const nowDate = new Date().toISOString();
    const updatedData = {
      ...data,
      id,
      updated_at: nowDate
    };

    if (data.cover_image !== undefined) {
      updatedData.cover_image = data.cover_image;
    }

    if (data.content) {
      updatedData.reading_time = computeReadingTime(data.content);
    }

    return updatePostRemote(id, updatedData);
  },

  async deletePost(id) {
    await delay();
    return deletePostRemote(id);
  },

  async uploadImage(file) {
    if (!file) return { file_url: "" };
    
    // Check if user is admin before allowing upload
    if (!isAdmin()) {
      throw new Error("Only admin users can upload images. Please log in as admin.");
    }
    
    console.log("Starting image upload process...");
    console.log("File size:", (file.size / 1024 / 1024).toFixed(2), "MB");
    
    // Add timeout for large file processing (60 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Upload timeout: File processing took too long. Please try a smaller image or check your connection.")), 60000);
    });
    
    try {
      console.log("Reading and processing file...");
      const dataUrl = await Promise.race([
        readFileAsDataUrl(file),
        timeoutPromise
      ]);
      console.log("File processed, starting Firebase upload...");
      
      const firebaseUrl = await Promise.race([
        uploadImageRemote(file, dataUrl),
        timeoutPromise
      ]);
      
      console.log("Upload completed successfully");
      return { file_url: firebaseUrl };
    } catch (error) {
      if (error.message.includes("timeout")) {
        throw error;
      }
      throw error;
    }
  },

  async getComments(postId) {
    await delay();
    return listCommentsRemote(postId);
  },

  async addComment(postId, author, content, email) {
    await delay();
    const newComment = {
      id: nextCommentId(),
      postId,
      author: author || email || "Anonymous",
      content,
      email: email || null,
      createdAt: new Date().toISOString()
    };

    return addCommentRemote(newComment);
  },

  async deleteComment(commentId) {
    await delay();
    return deleteCommentRemote(commentId);
  },

  async exportCommentsToFile() {
    ensureFirestore();
    const snapshot = await getDocs(collection(db, COMMENTS_COLLECTION));
    const comments = snapshot.docs.map((docSnap) => docSnap.data());
    downloadJson(comments, "comments.json");
  }
};


