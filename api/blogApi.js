const POSTS_STORAGE_KEY = 'personal_blog.posts';
const USER_STORAGE_KEY = 'personal_blog.current_user';

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
    const posts = readPosts();
    const id = data.id || nextId();
    const now = new Date().toISOString().split('T')[0];
    const newPost = {
      ...data,
      id,
      published_date: data.published ? data.published_date || now : data.published_date || now,
      reading_time: data.reading_time || computeReadingTime(data.content)
    };
    posts.push(newPost);
    writePosts(posts);
    return newPost;
  },

  async updatePost(id, data) {
    await delay();
    const posts = readPosts();
    const index = posts.findIndex((post) => post.id === id);
    if (index === -1) {
      throw new Error('Post not found');
    }
    const updatedPost = {
      ...posts[index],
      ...data,
      id,
      reading_time: data.content ? computeReadingTime(data.content) : posts[index].reading_time
    };
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
  }
};

