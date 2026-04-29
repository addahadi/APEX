import api from './api';

// ─── Public ───────────────────────────────────────────────────────────────────

export const fetchArticles = ({ page = 1, limit = 9, search = '', tag = '' }) =>
  api.get('/blog/articles', { params: { page, limit, search, tag: tag || undefined } });

export const fetchArticle = (slug) =>
  api.get(`/blog/articles/${slug}`);

export const fetchTags = () =>
  api.get('/blog/tags');

// ─── Authenticated ────────────────────────────────────────────────────────────

export const toggleLikeApi = (articleId) =>
  api.post(`/blog/articles/${articleId}/like`);

export const toggleSaveApi = (articleId) =>
  api.post(`/blog/articles/${articleId}/save`);

export const fetchMyLiked = () =>
  api.get('/blog/me/liked');

export const fetchMySaved = () =>
  api.get('/blog/me/saved');

// ─── Admin ────────────────────────────────────────────────────────────────────

export const fetchAdminArticles = ({ page = 1, limit = 20, search = '', status = '', type = '' }) =>
  api.get('/blog/admin/articles', { params: { page, limit, search: search || undefined, status: status || undefined, type: type || undefined } });

export const fetchAdminArticle = (id) =>
  api.get(`/blog/admin/articles/${id}`);

export const createArticleApi = (data) =>
  api.post('/blog/admin/articles', data);

export const updateArticleApi = (id, data) =>
  api.put(`/blog/admin/articles/${id}`, data);

export const deleteArticleApi = (id) =>
  api.delete(`/blog/admin/articles/${id}`);

export const fetchAdminTags = () =>
  api.get('/blog/admin/tags');

export const createTagApi = (name) =>
  api.post('/blog/admin/tags', { name });

export const deleteTagApi = (id) =>
  api.delete(`/blog/admin/tags/${id}`);

export const fetchArticleTypes = () =>
  api.get('/blog/admin/article-types');
