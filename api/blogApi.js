const POSTS_STORAGE_KEY = 'personal_blog.posts';
const USER_STORAGE_KEY = 'personal_blog.current_user';
const COMMENTS_STORAGE_KEY = 'personal_blog.comments';

const FALLBACK_USER = {
  id: 'owner',
  name: 'Site Owner',
  role: 'admin'
};

const FALLBACK_POSTS = [
  {
    id: 'welcome-to-my-blog',
    title: 'Welcome to my personal blog',
    excerpt: 'Thanks for stopping by! This space is where I share DevOps lessons, side projects, and things that make me curious.',
    content: `## Hello there 👋

I set up this little corner of the web to track my learning and experiments.

- DevOps tips and hard lessons
- Cloud things that made me go “oh wow”
- Personal notes so future me remembers what current me figured out

If any of that sounds interesting, feel free to hang around.`,
    cover_image: '',
    published: true,
    published_date: '2025-01-10',
    reading_time: 3,
    tags: ['welcome', 'devops']
  },
  {
    id: 'capturing-ideas-quickly',
    title: 'Capturing ideas quickly so they do not drift away',
    excerpt: 'I keep a lightweight workflow that mixes GoodNotes, VS Code, and tiny scripts to move ideas into action.',
    content: `### Why I care

Ideas vanish fast. A friendly system helps me record them without overthinking.

### My simple workflow

1. Brain dump into GoodNotes on the iPad.
2. Promote the solid ideas into a Markdown inbox.
3. Schedule a small review session each Friday.

It is not perfect, but it keeps momentum without a lot of overhead.`,
    cover_image: '',
    published: true,
    published_date: '2025-02-02',
    reading_time: 4,
    tags: ['productivity', 'notes']
  }
];

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));
const isBrowser = typeof window !== 'undefined';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const ensureSeedData = () => {
  if (!isBrowser) {
    return { posts: [...FALLBACK_POSTS], user: { ...FALLBACK_USER } };
  }

  const storedPosts = window.localStorage.getItem(POSTS_STORAGE_KEY);
  if (!storedPosts) {
    window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(FALLBACK_POSTS));
  }

  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(FALLBACK_USER));
  }

  return {
    posts: safeParse(window.localStorage.getItem(POSTS_STORAGE_KEY), FALLBACK_POSTS),
    user: safeParse(window.localStorage.getItem(USER_STORAGE_KEY), FALLBACK_USER)
  };
};

const readPosts = () => {
  if (!isBrowser) return [...FALLBACK_POSTS];
  ensureSeedData();
  return safeParse(window.localStorage.getItem(POSTS_STORAGE_KEY), FALLBACK_POSTS);
};

const writePosts = (posts) => {
  if (!isBrowser) return;
  window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
};

const readUser = () => {
  if (!isBrowser) return { ...FALLBACK_USER };
  ensureSeedData();
  return safeParse(window.localStorage.getItem(USER_STORAGE_KEY), FALLBACK_USER);
};

const nextId = () => `post-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
const nextCommentId = () => `comment-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const computeReadingTime = (content = '') => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const sortPosts = (posts, order) => {
  if (order === '-published_date') {
    return [...posts].sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
      return dateB - dateA;
    });
  }
  if (order === 'published_date') {
    return [...posts].sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0;
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0;
      return dateA - dateB;
    });
  }
  return [...posts];
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

const readComments = () => {
  if (!isBrowser) return [];
  return safeParse(window.localStorage.getItem(COMMENTS_STORAGE_KEY), []);
};

const writeComments = (comments) => {
  if (!isBrowser) return;
  window.localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
};

export const blogApi = {
  async getCurrentUser() {
    await delay();
    return readUser();
  },

  async listPosts(order = '-published_date') {
    await delay();
    const posts = readPosts();
    return sortPosts(posts, order);
  },

  async getPostById(id) {
    await delay();
    const posts = readPosts();
    return posts.find((post) => post.id === id) || null;
  },

  async createPost(data) {
    await delay();
    console.log('createPost received data:', data);
    console.log('createPost cover_image:', data.cover_image);
    const posts = readPosts();
    const id = data.id || nextId();
    const now = new Date().toISOString().split('T')[0];
    const newPost = {
      ...data,
      id,
      cover_image: data.cover_image || '', // Explicitly include cover_image
      published_date: data.published ? data.published_date || now : data.published_date || now,
      reading_time: data.reading_time || computeReadingTime(data.content)
    };
    console.log('Created post with cover_image:', newPost.cover_image);
    posts.push(newPost);
    writePosts(posts);
    return newPost;
  },

  async updatePost(id, data) {
    await delay();
    console.log('updatePost received data:', data);
    console.log('updatePost cover_image:', data.cover_image);
    const posts = readPosts();
    const index = posts.findIndex((post) => post.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    console.log('Existing post cover_image:', posts[index].cover_image);
    const updatedPost = {
      ...posts[index],
      ...data,
      id,
      cover_image: data.cover_image !== undefined ? data.cover_image : posts[index].cover_image, // Preserve if not provided
      reading_time: data.content ? computeReadingTime(data.content) : posts[index].reading_time
    };
    console.log('Updated post with cover_image:', updatedPost.cover_image);
    posts[index] = updatedPost;
    writePosts(posts);
    return updatedPost;
  },

  async deletePost(id) {
    await delay();
    const posts = readPosts().filter((post) => post.id !== id);
    writePosts(posts);
  },

  async uploadImage(file) {
    if (!file) return { file_url: '' };
    try {
      const fileUrl = await readFileAsDataUrl(file);
      return { file_url: fileUrl };
    } catch (error) {
      throw new Error(error.message || 'Could not process the image');
    }
  },

  async getComments(postId) {
    await delay();
    const comments = readComments();
    return comments.filter(comment => comment.postId === postId).sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  },

  async addComment(postId, author, content, email) {
    await delay();
    const comments = readComments();
    const newComment = {
      id: nextCommentId(),
      postId,
      author: author || email || 'Anonymous',
      content,
      email: email || null,
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    writeComments(comments);
    return newComment;
  },

  async deleteComment(commentId) {
    await delay();
    const comments = readComments().filter(comment => comment.id !== commentId);
    writeComments(comments);
  }
};

