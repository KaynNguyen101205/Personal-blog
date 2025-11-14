import postsSeed from "@src/data/posts.json";
import commentsSeed from "@src/data/comments.json";
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
import { db, storage, isFirebaseEnabled } from "@/lib/firebase";

const POSTS_STORAGE_KEY = "personal_blog.posts";
const USER_STORAGE_KEY = "personal_blog.current_user";
const COMMENTS_STORAGE_KEY = "personal_blog.comments";

const POSTS_COLLECTION = "posts";
const COMMENTS_COLLECTION = "comments";

const FALLBACK_USER = {
  id: "owner",
  name: "Site Owner",
  role: "admin"
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const isBrowser = typeof window !== "undefined";
const useFirestore = isFirebaseEnabled && !!db;

const clonePosts = () =>
  postsSeed.map((post) => ({
    ...post,
    tags: Array.isArray(post.tags) ? [...post.tags] : []
  }));

const cloneComments = () =>
  commentsSeed.map((comment) => ({
    ...comment
  }));

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const ensureLocalSeedData = () => {
  if (!isBrowser) return;

  const storedPosts = window.localStorage.getItem(POSTS_STORAGE_KEY);
  if (!storedPosts) {
    window.localStorage.setItem(
      POSTS_STORAGE_KEY,
      JSON.stringify(clonePosts())
    );
  }

  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) {
    window.localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(FALLBACK_USER)
    );
  }

  const storedComments = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
  if (!storedComments) {
    window.localStorage.setItem(
      COMMENTS_STORAGE_KEY,
      JSON.stringify(cloneComments())
    );
  }
};

const readPostsLocal = () => {
  if (!isBrowser) return clonePosts();
  ensureLocalSeedData();
  return safeParse(window.localStorage.getItem(POSTS_STORAGE_KEY), clonePosts());
};

const writePostsLocal = (posts) => {
  if (!isBrowser) return;
  try {
    const jsonData = JSON.stringify(posts);
    const sizeInMB = new Blob([jsonData]).size / (1024 * 1024);

    if (sizeInMB > 4) {
      console.warn(
        `Warning: Posts data is ${sizeInMB.toFixed(
          2
        )}MB. localStorage quota is ~5-10MB.`
      );
    }

    window.localStorage.setItem(POSTS_STORAGE_KEY, jsonData);
  } catch (error) {
    if (error.name === "QuotaExceededError") {
      console.error(
        "localStorage quota exceeded. Consider removing old posts or images."
      );
      throw new Error(
        "Storage quota exceeded. Please remove some old posts or images, or use smaller images."
      );
    }
    throw error;
  }
};

const readUserLocal = () => {
  if (!isBrowser) return { ...FALLBACK_USER };
  ensureLocalSeedData();
  return safeParse(window.localStorage.getItem(USER_STORAGE_KEY), FALLBACK_USER);
};

const readCommentsLocal = () => {
  if (!isBrowser) return cloneComments();
  ensureLocalSeedData();
  return safeParse(
    window.localStorage.getItem(COMMENTS_STORAGE_KEY),
    cloneComments()
  );
};

const writeCommentsLocal = (comments) => {
  if (!isBrowser) return;
  window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
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

const compressImage = (file, maxWidth = 1200, maxHeight = 800, quality = 0.7) =>
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
  if (!isBrowser) return;
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

let firestoreSeeded = false;
const ensureFirestoreSeed = async () => {
  if (!useFirestore || firestoreSeeded) return;

  const postsRef = collection(db, POSTS_COLLECTION);
  const postsSnapshot = await getDocs(postsRef);
  if (postsSnapshot.empty && postsSeed.length > 0) {
    await Promise.all(
      postsSeed.map((post) =>
        setDoc(doc(db, POSTS_COLLECTION, post.id), {
          ...post,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      )
    );
  }

  const commentsRef = collection(db, COMMENTS_COLLECTION);
  const commentsSnapshot = await getDocs(commentsRef);
  if (commentsSnapshot.empty && commentsSeed.length > 0) {
    await Promise.all(
      commentsSeed.map((comment) =>
        setDoc(doc(db, COMMENTS_COLLECTION, comment.id), comment)
      )
    );
  }

  firestoreSeeded = true;
};

const listPostsRemote = async (order) => {
  await ensureFirestoreSeed();
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
  await ensureFirestoreSeed();
  const docRef = doc(db, POSTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const createPostRemote = async (post) => {
  await ensureFirestoreSeed();
  const docRef = doc(db, POSTS_COLLECTION, post.id);
  await setDoc(docRef, post);
  return post;
};

const updatePostRemote = async (id, data) => {
  await ensureFirestoreSeed();
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
  await ensureFirestoreSeed();
  const docRef = doc(db, POSTS_COLLECTION, id);
  await deleteDoc(docRef);
};

const listCommentsRemote = async (postId) => {
  await ensureFirestoreSeed();
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
  await ensureFirestoreSeed();
  const docRef = doc(db, COMMENTS_COLLECTION, comment.id);
  await setDoc(docRef, comment);
  return comment;
};

const deleteCommentRemote = async (commentId) => {
  await ensureFirestoreSeed();
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await deleteDoc(docRef);
};

const uploadImageRemote = async (file, dataUrl) => {
  if (!storage) {
    throw new Error("Firebase storage not configured");
  }
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
    return useFirestore ? { ...FALLBACK_USER } : readUserLocal();
  },

  async listPosts(order = "-published_date") {
    await delay();
    if (useFirestore) {
      try {
        const posts = await listPostsRemote(order);
        // If Firestore is empty we fall back to local seed so UI is not blank.
        return posts.length > 0 ? posts : sortPosts(readPostsLocal(), order);
      } catch (error) {
        console.error("Failed to load posts from Firestore, using local data.", error);
        return sortPosts(readPostsLocal(), order);
      }
    }
    return sortPosts(readPostsLocal(), order);
  },

  async getPostById(id) {
    await delay();
    if (useFirestore) {
      try {
        const post = await getPostRemote(id);
        if (post) {
          return post;
        }
      } catch (error) {
        console.error("Failed to read post from Firestore, using local data.", error);
      }
      return readPostsLocal().find((post) => post.id === id) || null;
    }
    return readPostsLocal().find((post) => post.id === id) || null;
  },

  async createPost(data) {
    await delay();
    const id = data.id || nextId();
    const nowDate = new Date().toISOString();
    const publishedDate =
      data.published_date || nowDate.split("T")[0];
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

    if (useFirestore) {
      return createPostRemote(newPost);
    }

    const posts = readPostsLocal();
    posts.push(newPost);
    writePostsLocal(posts);
    return newPost;
  },

  async updatePost(id, data) {
    await delay();
    if (useFirestore) {
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
    }

    const posts = readPostsLocal();
    const index = posts.findIndex((post) => post.id === id);
    if (index === -1) {
      throw new Error("Post not found");
    }
    const updatedPost = {
      ...posts[index],
      ...data,
      id,
      cover_image:
        data.cover_image !== undefined
          ? data.cover_image
          : posts[index].cover_image,
      reading_time: data.content
        ? computeReadingTime(data.content)
        : posts[index].reading_time,
      updated_at: new Date().toISOString()
    };
    posts[index] = updatedPost;
    writePostsLocal(posts);
    return updatedPost;
  },

  async deletePost(id) {
    await delay();
    if (useFirestore) {
      return deletePostRemote(id);
    }
    const posts = readPostsLocal().filter((post) => post.id !== id);
    writePostsLocal(posts);
  },

  async uploadImage(file) {
    if (!file) return { file_url: "" };
    const dataUrl = await readFileAsDataUrl(file);

    if (useFirestore) {
      const firebaseUrl = await uploadImageRemote(file, dataUrl);
      return { file_url: firebaseUrl };
    }

    return { file_url: dataUrl };
  },

  async getComments(postId) {
    await delay();
    if (useFirestore) {
      try {
        const comments = await listCommentsRemote(postId);
        if (comments.length > 0) {
          return comments;
        }
      } catch (error) {
        console.error("Failed to load comments from Firestore, using local data.", error);
      }
    }
    return readCommentsLocal()
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

    if (useFirestore) {
      return addCommentRemote(newComment);
    }

    const comments = readCommentsLocal();
    comments.push(newComment);
    writeCommentsLocal(comments);
    return newComment;
  },

  async deleteComment(commentId) {
    await delay();
    if (useFirestore) {
      return deleteCommentRemote(commentId);
    }
    const comments = readCommentsLocal().filter(
      (comment) => comment.id !== commentId
    );
    writeCommentsLocal(comments);
  },

  async exportPostsToFile() {
    const posts = useFirestore
      ? await listPostsRemote("-published_date")
      : readPostsLocal();
    downloadJson(posts, "posts.json");
  },

  async exportCommentsToFile() {
    const comments = useFirestore
      ? await getDocs(collection(db, COMMENTS_COLLECTION)).then((snapshot) =>
          snapshot.docs.map((docSnap) => docSnap.data())
        )
      : readCommentsLocal();
    downloadJson(comments, "comments.json");
  }
};

