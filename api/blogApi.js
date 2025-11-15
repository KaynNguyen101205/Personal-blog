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
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

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

const ensureStorage = () => {
  if (!storage) {
    throw new Error("Firebase storage is not configured.");
  }
};

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
  if (file.size > 500 * 1024 && file.type.startsWith("image/")) {
    try {
      return await compressImage(file);
    } catch (error) {
      console.warn("Image compression failed, using original:", error);
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
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

  if (order === "-published_date") {
    queryRef = query(baseRef, orderBy("published_date", "desc"));
  } else if (order === "published_date") {
    queryRef = query(baseRef, orderBy("published_date", "asc"));
  }

  const snapshot = await getDocs(queryRef);
  const posts = snapshot.docs.map((docSnap) => docSnap.data());
  return sortPosts(posts, order);
};

const getPostRemote = async (id) => {
  ensureFirestore();
  const docRef = doc(db, POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const createPostRemote = async (post) => {
  ensureFirestore();
  await setDoc(doc(db, POSTS_COLLECTION, post.id), post);
  return post;
};

const updatePostRemote = async (id, data) => {
  ensureFirestore();
  const docRef = doc(db, POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("Post not found");
  }
  const updatedPost = { ...docSnap.data(), ...data };
  await setDoc(docRef, updatedPost);
  return updatedPost;
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

const uploadImageRemote = async (file, dataUrl) => {
  ensureStorage();
  const ext = file.name?.split(".").pop() || "jpg";
  const path = `uploads/${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, "data_url");
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};

export const blogApi = {
  async getCurrentUser() {
    await delay();
    return { ...FALLBACK_USER };
  },

  async listPosts(order = "-published_date") {
    await delay();
    return listPostsRemote(order);
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
    const dataUrl = await readFileAsDataUrl(file);
    const firebaseUrl = await uploadImageRemote(file, dataUrl);
    return { file_url: firebaseUrl };
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


