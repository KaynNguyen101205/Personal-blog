const PAGE_ROUTES = {
  Home: '/',
  Posts: '/posts',
  Tags: '/tags',
  About: '/about',
  Archive: '/archive',
  CreatePost: '/create-post',
  ViewPost: '/view-post'
};

export const createPageUrl = (pageName) => PAGE_ROUTES[pageName] || '/';

export const getPageNameFromPath = (path) => {
  const matched = Object.entries(PAGE_ROUTES).find(([, route]) => route === path);
  return matched ? matched[0] : null;
};

export const pageRoutes = { ...PAGE_ROUTES };

