import { Router } from 'express';
import authenticate from '../middlewares/authenticate.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  listArticles,
  getArticle,
  listTags,
  likeArticle,
  saveArticle,
  getMyLiked,
  getMySaved,
  adminListArticles,
  adminGetArticle,
  adminCreateArticle,
  adminUpdateArticle,
  adminDeleteArticle,
  adminListTags,
  adminCreateTag,
  adminDeleteTag,
  adminListArticleTypes,
} from '../controllers/blog.controller.js';

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.get('/articles', listArticles);
router.get('/tags', listTags);

// Single article: optionally attach auth user for like/save status
router.get('/articles/:slug', (req, res, next) => {
  // Try to authenticate, but don't block if no token
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authenticate(req, res, next);
  }
  next();
}, getArticle);

// ─── Authenticated routes ─────────────────────────────────────────────────────
router.post('/articles/:id/like', authenticate, likeArticle);
router.post('/articles/:id/save', authenticate, saveArticle);

router.get('/me/liked', authenticate, getMyLiked);
router.get('/me/saved', authenticate, getMySaved);

// ─── Admin routes ─────────────────────────────────────────────────────────────
router.get   ('/admin/articles',     authenticate, requireRole('ADMIN'), adminListArticles);
router.get   ('/admin/articles/:id', authenticate, requireRole('ADMIN'), adminGetArticle);
router.post  ('/admin/articles',     authenticate, requireRole('ADMIN'), adminCreateArticle);
router.put   ('/admin/articles/:id', authenticate, requireRole('ADMIN'), adminUpdateArticle);
router.delete('/admin/articles/:id', authenticate, requireRole('ADMIN'), adminDeleteArticle);

router.get   ('/admin/tags',        authenticate, requireRole('ADMIN'), adminListTags);
router.post  ('/admin/tags',        authenticate, requireRole('ADMIN'), adminCreateTag);
router.delete('/admin/tags/:id',    authenticate, requireRole('ADMIN'), adminDeleteTag);

router.get   ('/admin/article-types', authenticate, requireRole('ADMIN'), adminListArticleTypes);

export default router;
