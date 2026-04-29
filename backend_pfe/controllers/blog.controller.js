import { ok, handleError } from '../utils/http.js';
import * as svc from '../services/blog.service.js';

// ─── Public ───────────────────────────────────────────────────────────────────

export async function listArticles(req, res) {
  try {
    const { search = '', tag = null, page = 1, limit = 9 } = req.query;
    ok(
      res,
      await svc.getPublishedArticles({
        search: String(search).trim(),
        tagId: tag || null,
        page: Math.max(1, parseInt(page) || 1),
        limit: Math.min(50, parseInt(limit) || 9),
      })
    );
  } catch (e) {
    handleError(res, e);
  }
}

export async function getArticle(req, res) {
  try {
    const article = await svc.getArticleBySlug(req.params.slug);

    // If user is authenticated, attach their like/save status
    if (req.user) {
      const status = await svc.getArticleUserStatus(req.user.userId, article.article_id);
      article.is_liked = status.liked;
      article.is_saved = status.saved;
    } else {
      article.is_liked = false;
      article.is_saved = false;
    }

    ok(res, article);
  } catch (e) {
    handleError(res, e);
  }
}

export async function listTags(req, res) {
  try {
    ok(res, await svc.getTags());
  } catch (e) {
    handleError(res, e);
  }
}

// ─── Authenticated ────────────────────────────────────────────────────────────

export async function likeArticle(req, res) {
  try {
    ok(res, await svc.toggleLike(req.user.userId, req.params.id));
  } catch (e) {
    handleError(res, e);
  }
}

export async function saveArticle(req, res) {
  try {
    ok(res, await svc.toggleSave(req.user.userId, req.params.id));
  } catch (e) {
    handleError(res, e);
  }
}

export async function getMyLiked(req, res) {
  try {
    ok(res, await svc.getUserLikedArticles(req.user.userId));
  } catch (e) {
    handleError(res, e);
  }
}

export async function getMySaved(req, res) {
  try {
    ok(res, await svc.getUserSavedArticles(req.user.userId));
  } catch (e) {
    handleError(res, e);
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function adminListArticles(req, res) {
  try {
    const { search = '', status = null, type = null, page = 1, limit = 20 } = req.query;
    ok(
      res,
      await svc.getAllArticlesAdmin({
        search: String(search).trim(),
        status: status || null,
        type: type || null,
        page: Math.max(1, parseInt(page) || 1),
        limit: Math.min(100, parseInt(limit) || 20),
      })
    );
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminGetArticle(req, res) {
  try {
    ok(res, await svc.getArticleByIdAdmin(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminCreateArticle(req, res) {
  try {
    ok(res, await svc.createArticleAdmin(req.body), 201);
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminUpdateArticle(req, res) {
  try {
    ok(res, await svc.updateArticleAdmin(req.params.id, req.body));
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminDeleteArticle(req, res) {
  try {
    ok(res, await svc.deleteArticleAdmin(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminListTags(req, res) {
  try {
    ok(res, await svc.getAdminTags());
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminCreateTag(req, res) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Tag name is required' });
    ok(res, await svc.createTagAdmin(name.trim()), 201);
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminDeleteTag(req, res) {
  try {
    ok(res, await svc.deleteTagAdmin(req.params.id));
  } catch (e) {
    handleError(res, e);
  }
}

export async function adminListArticleTypes(req, res) {
  try {
    ok(res, await svc.getArticleTypes());
  } catch (e) {
    handleError(res, e);
  }
}
