import sql from '../config/database.js';
import { NotFoundError } from '../utils/AppError.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildArticle(row) {
  return {
    article_id:  row.article_id,
    slug:        row.slug,
    title:       row.title_en,
    excerpt:     row.excerpt_en,
    cover_img:   row.cover_img,
    status:      row.status,
    type:        row.article_type ?? null,
    published_at: row.published_at,
    created_at:  row.created_at,
    likes_count: Number(row.likes_count ?? 0),
    tags:        row.tags ?? [],          // array of { tag_id, name }
    related:     row.related ?? [],       // only present on single-article fetch
  };
}

function buildTag(row) {
  return {
    tag_id:        row.tag_id,
    name:          row.name_en,
    articles_count: Number(row.articles_count ?? 0),
  };
}

// ─── Public: List published articles ──────────────────────────────────────────

export async function getPublishedArticles({ search = '', tagId = null, page = 1, limit = 9 }) {
  const offset = (page - 1) * limit;

  const conditions = [sql`a.status = 'PUBLISHED'`];

  if (search) {
    const like = `%${search}%`;
    conditions.push(sql`(a.title_en ILIKE ${like} OR a.excerpt_en ILIKE ${like})`);
  }

  if (tagId) {
    conditions.push(sql`EXISTS (
      SELECT 1 FROM article_tags at2
      WHERE at2.article_id = a.article_id
        AND at2.tag_id = ${tagId}
    )`);
  }

  const whereClause = sql`WHERE ${conditions.reduce((l, r) => sql`${l} AND ${r}`)}`;

  const [rows, countResult] = await Promise.all([
    sql`
      SELECT
        a.article_id,
        a.slug,
        a.title_en,
        a.excerpt_en,
        a.cover_img,
        a.status,
        a.published_at,
        a.created_at,
        at2.name_en AS article_type,
        (
          SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id
        ) AS likes_count,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
            ORDER BY t.name_en
          ) FILTER (WHERE t.tag_id IS NOT NULL),
          '[]'
        ) AS tags
      FROM articles a
      LEFT JOIN article_types at2 ON at2.article_type_id = a.article_type_id
      LEFT JOIN article_tags agt ON agt.article_id = a.article_id
      LEFT JOIN tags t ON t.tag_id = agt.tag_id
      ${whereClause}
      GROUP BY a.article_id, at2.name_en
      ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(DISTINCT a.article_id)::int AS total
      FROM articles a
      LEFT JOIN article_tags agt ON agt.article_id = a.article_id
      ${whereClause}
    `,
  ]);

  const total = countResult[0]?.total ?? 0;

  return {
    data: rows.map(buildArticle),
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// ─── Public: Single article by slug ───────────────────────────────────────────

export async function getArticleBySlug(slug) {
  const rows = await sql`
    SELECT
      a.article_id,
      a.slug,
      a.title_en,
      a.excerpt_en,
      a.content_en,
      a.cover_img,
      a.status,
      a.published_at,
      a.created_at,
      at2.name_en AS article_type,
      (
        SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id
      ) AS likes_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
          ORDER BY t.name_en
        ) FILTER (WHERE t.tag_id IS NOT NULL),
        '[]'
      ) AS tags
    FROM articles a
    LEFT JOIN article_types at2 ON at2.article_type_id = a.article_type_id
    LEFT JOIN article_tags agt ON agt.article_id = a.article_id
    LEFT JOIN tags t ON t.tag_id = agt.tag_id
    WHERE a.slug = ${slug}
      AND a.status = 'PUBLISHED'
    GROUP BY a.article_id, at2.name_en
    LIMIT 1
  `;

  if (!rows.length) throw new NotFoundError('Article not found');

  const article = rows[0];
  const tagIds  = article.tags.map((t) => t.tag_id).filter(Boolean);

  // Fetch related articles (same tags, exclude self, max 3)
  const related = await getRelatedArticles(article.article_id, tagIds, 3);

  return {
    ...buildArticle(article),
    content: article.content_en,
    related,
  };
}

// ─── Related articles (tag overlap) ───────────────────────────────────────────

export async function getRelatedArticles(articleId, tagIds, limit = 3) {
  if (!tagIds.length) {
    // Fallback: recent articles
    const fallback = await sql`
      SELECT
        a.article_id,
        a.slug,
        a.title_en,
        a.excerpt_en,
        a.cover_img,
        a.published_at,
        a.created_at,
        (SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id) AS likes_count,
        '[]'::json AS tags
      FROM articles a
      WHERE a.status = 'PUBLISHED'
        AND a.article_id != ${articleId}
      ORDER BY a.published_at DESC NULLS LAST, a.created_at DESC
      LIMIT ${limit}
    `;
    return fallback.map(buildArticle);
  }

  const rows = await sql`
    SELECT
      a.article_id,
      a.slug,
      a.title_en,
      a.excerpt_en,
      a.cover_img,
      a.published_at,
      a.created_at,
      (SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id) AS likes_count,
      COUNT(agt.tag_id)::int AS shared_tags_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
          ORDER BY t.name_en
        ) FILTER (WHERE t.tag_id IS NOT NULL),
        '[]'
      ) AS tags
    FROM articles a
    JOIN article_tags agt ON agt.article_id = a.article_id
                          AND agt.tag_id = ANY(${tagIds}::uuid[])
    LEFT JOIN article_tags all_tags ON all_tags.article_id = a.article_id
    LEFT JOIN tags t ON t.tag_id = all_tags.tag_id
    WHERE a.status = 'PUBLISHED'
      AND a.article_id != ${articleId}
    GROUP BY a.article_id
    ORDER BY shared_tags_count DESC, a.published_at DESC NULLS LAST
    LIMIT ${limit}
  `;

  return rows.map((r) => ({
    ...buildArticle(r),
    shared_tags_count: r.shared_tags_count,
  }));
}

// ─── Toggle Like ──────────────────────────────────────────────────────────────

export async function toggleLike(userId, articleId) {
  // Verify article exists
  const article = await sql`
    SELECT article_id FROM articles WHERE article_id = ${articleId} AND status = 'PUBLISHED' LIMIT 1
  `;
  if (!article.length) throw new NotFoundError('Article not found');

  const existing = await sql`
    SELECT like_id FROM likes WHERE user_id = ${userId} AND article_id = ${articleId} LIMIT 1
  `;

  let liked;
  if (existing.length) {
    await sql`DELETE FROM likes WHERE user_id = ${userId} AND article_id = ${articleId}`;
    liked = false;
  } else {
    await sql`INSERT INTO likes (user_id, article_id) VALUES (${userId}, ${articleId})`;
    liked = true;
  }

  const [countRow] = await sql`
    SELECT COUNT(*)::int AS count FROM likes WHERE article_id = ${articleId}
  `;

  return { liked, likes_count: countRow.count };
}

// ─── Toggle Save ──────────────────────────────────────────────────────────────

export async function toggleSave(userId, articleId) {
  // Verify article exists
  const article = await sql`
    SELECT article_id FROM articles WHERE article_id = ${articleId} AND status = 'PUBLISHED' LIMIT 1
  `;
  if (!article.length) throw new NotFoundError('Article not found');

  const existing = await sql`
    SELECT save_id FROM saves WHERE user_id = ${userId} AND article_id = ${articleId} LIMIT 1
  `;

  let saved;
  if (existing.length) {
    await sql`DELETE FROM saves WHERE user_id = ${userId} AND article_id = ${articleId}`;
    saved = false;
  } else {
    await sql`INSERT INTO saves (user_id, article_id) VALUES (${userId}, ${articleId})`;
    saved = true;
  }

  return { saved };
}

// ─── Auth status: is article liked/saved by user ─────────────────────────────

export async function getArticleUserStatus(userId, articleId) {
  const [liked, saved] = await Promise.all([
    sql`SELECT 1 FROM likes WHERE user_id = ${userId} AND article_id = ${articleId} LIMIT 1`,
    sql`SELECT 1 FROM saves WHERE user_id = ${userId} AND article_id = ${articleId} LIMIT 1`,
  ]);
  return { liked: liked.length > 0, saved: saved.length > 0 };
}

// ─── User: liked articles ─────────────────────────────────────────────────────

export async function getUserLikedArticles(userId) {
  const rows = await sql`
    SELECT
      a.article_id,
      a.slug,
      a.title_en,
      a.excerpt_en,
      a.cover_img,
      a.published_at,
      a.created_at,
      l.created_at AS liked_at,
      (SELECT COUNT(*)::int FROM likes l2 WHERE l2.article_id = a.article_id) AS likes_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
          ORDER BY t.name_en
        ) FILTER (WHERE t.tag_id IS NOT NULL),
        '[]'
      ) AS tags
    FROM likes l
    JOIN articles a ON a.article_id = l.article_id
    LEFT JOIN article_tags agt ON agt.article_id = a.article_id
    LEFT JOIN tags t ON t.tag_id = agt.tag_id
    WHERE l.user_id = ${userId}
      AND a.status = 'PUBLISHED'
    GROUP BY a.article_id, l.created_at
    ORDER BY l.created_at DESC
  `;

  return rows.map((r) => ({ ...buildArticle(r), liked_at: r.liked_at }));
}

// ─── User: saved articles ─────────────────────────────────────────────────────

export async function getUserSavedArticles(userId) {
  const rows = await sql`
    SELECT
      a.article_id,
      a.slug,
      a.title_en,
      a.excerpt_en,
      a.cover_img,
      a.published_at,
      a.created_at,
      s.created_at AS saved_at,
      (SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id) AS likes_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
          ORDER BY t.name_en
        ) FILTER (WHERE t.tag_id IS NOT NULL),
        '[]'
      ) AS tags
    FROM saves s
    JOIN articles a ON a.article_id = s.article_id
    LEFT JOIN article_tags agt ON agt.article_id = a.article_id
    LEFT JOIN tags t ON t.tag_id = agt.tag_id
    WHERE s.user_id = ${userId}
      AND a.status = 'PUBLISHED'
    GROUP BY a.article_id, s.created_at
    ORDER BY s.created_at DESC
  `;

  return rows.map((r) => ({ ...buildArticle(r), saved_at: r.saved_at }));
}

// ─── Public: All tags with article counts ────────────────────────────────────

export async function getTags() {
  const rows = await sql`
    SELECT
      t.tag_id,
      t.name_en,
      COUNT(agt.article_id)::int AS articles_count
    FROM tags t
    LEFT JOIN article_tags agt ON agt.tag_id = t.tag_id
    LEFT JOIN articles a ON a.article_id = agt.article_id AND a.status = 'PUBLISHED'
    GROUP BY t.tag_id
    ORDER BY articles_count DESC, t.name_en ASC
  `;

  return rows.map(buildTag);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: Article CRUD
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAllArticlesAdmin({ search = '', status = null, type = null, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;

  const conditions = [sql`TRUE`];

  if (search) {
    const like = `%${search}%`;
    conditions.push(sql`(a.title_en ILIKE ${like} OR a.excerpt_en ILIKE ${like})`);
  }

  if (status) {
    conditions.push(sql`a.status = ${status}`);
  }

  if (type) {
    conditions.push(sql`at2.name_en = ${type}`);
  }

  const whereClause = sql`WHERE ${conditions.reduce((l, r) => sql`${l} AND ${r}`)}`;

  const [rows, countResult] = await Promise.all([
    sql`
      SELECT
        a.article_id,
        a.slug,
        a.title_en,
        a.excerpt_en,
        a.content_en,
        a.cover_img,
        a.status,
        a.published_at,
        a.created_at,
        a.updated_at,
        a.article_type_id,
        at2.name_en AS article_type,
        (SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id) AS likes_count,
        (SELECT COUNT(*)::int FROM saves s WHERE s.article_id = a.article_id) AS saves_count,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
            ORDER BY t.name_en
          ) FILTER (WHERE t.tag_id IS NOT NULL),
          '[]'
        ) AS tags
      FROM articles a
      LEFT JOIN article_types at2 ON at2.article_type_id = a.article_type_id
      LEFT JOIN article_tags agt ON agt.article_id = a.article_id
      LEFT JOIN tags t ON t.tag_id = agt.tag_id
      ${whereClause}
      GROUP BY a.article_id, at2.name_en
      ORDER BY a.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `,
    sql`
      SELECT COUNT(DISTINCT a.article_id)::int AS total
      FROM articles a
      LEFT JOIN article_types at2 ON at2.article_type_id = a.article_type_id
      ${whereClause}
    `,
  ]);

  const total = countResult[0]?.total ?? 0;

  return {
    data: rows.map((r) => ({
      article_id:    r.article_id,
      slug:          r.slug,
      title:         r.title_en,
      excerpt:       r.excerpt_en,
      content:       r.content_en,
      cover_img:     r.cover_img,
      status:        r.status,
      type:          r.article_type ?? null,
      article_type_id: r.article_type_id,
      published_at:  r.published_at,
      created_at:    r.created_at,
      updated_at:    r.updated_at,
      likes_count:   Number(r.likes_count ?? 0),
      saves_count:   Number(r.saves_count ?? 0),
      tags:          r.tags ?? [],
    })),
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getArticleByIdAdmin(articleId) {
  const rows = await sql`
    SELECT
      a.article_id,
      a.slug,
      a.title_en,
      a.excerpt_en,
      a.content_en,
      a.cover_img,
      a.status,
      a.published_at,
      a.created_at,
      a.updated_at,
      a.article_type_id,
      at2.name_en AS article_type,
      (SELECT COUNT(*)::int FROM likes l WHERE l.article_id = a.article_id) AS likes_count,
      (SELECT COUNT(*)::int FROM saves s WHERE s.article_id = a.article_id) AS saves_count,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT('tag_id', t.tag_id, 'name', t.name_en)
          ORDER BY t.name_en
        ) FILTER (WHERE t.tag_id IS NOT NULL),
        '[]'
      ) AS tags
    FROM articles a
    LEFT JOIN article_types at2 ON at2.article_type_id = a.article_type_id
    LEFT JOIN article_tags agt ON agt.article_id = a.article_id
    LEFT JOIN tags t ON t.tag_id = agt.tag_id
    WHERE a.article_id = ${articleId}
    GROUP BY a.article_id, at2.name_en
    LIMIT 1
  `;

  if (!rows.length) throw new NotFoundError('Article not found');

  const r = rows[0];
  return {
    article_id:    r.article_id,
    slug:          r.slug,
    title:         r.title_en,
    excerpt:       r.excerpt_en,
    content:       r.content_en,
    cover_img:     r.cover_img,
    status:        r.status,
    type:          r.article_type ?? null,
    article_type_id: r.article_type_id,
    published_at:  r.published_at,
    created_at:    r.created_at,
    updated_at:    r.updated_at,
    likes_count:   Number(r.likes_count ?? 0),
    saves_count:   Number(r.saves_count ?? 0),
    tags:          r.tags ?? [],
  };
}

export async function createArticleAdmin({ title, slug, excerpt, content, cover_img, status, article_type_id, tags: tagIds = [] }) {
  // Create the article
  const [article] = await sql`
    INSERT INTO articles (title_en, slug, excerpt_en, content_en, cover_img, status, article_type_id, published_at)
    VALUES (
      ${title},
      ${slug},
      ${excerpt || ''},
      ${content || ''},
      ${cover_img || ''},
      ${status || 'DRAFT'},
      ${article_type_id || null},
      ${status === 'PUBLISHED' ? sql`NOW()` : null}
    )
    RETURNING article_id
  `;

  // Insert tag associations
  if (tagIds.length > 0) {
    const values = tagIds.map((tagId) => ({ article_id: article.article_id, tag_id: tagId }));
    await sql`INSERT INTO article_tags ${sql(values, 'article_id', 'tag_id')}`;
  }

  return getArticleByIdAdmin(article.article_id);
}

export async function updateArticleAdmin(articleId, { title, slug, excerpt, content, cover_img, status, article_type_id, tags: tagIds }) {
  // Verify article exists
  const existing = await sql`SELECT article_id, status FROM articles WHERE article_id = ${articleId} LIMIT 1`;
  if (!existing.length) throw new NotFoundError('Article not found');

  const wasPublished = existing[0].status === 'PUBLISHED';
  const isNowPublished = status === 'PUBLISHED';

  // Build update fields
  const updates = {};
  if (title !== undefined) updates.title_en = title;
  if (slug !== undefined)  updates.slug = slug;
  if (excerpt !== undefined) updates.excerpt_en = excerpt;
  if (content !== undefined) updates.content_en = content;
  if (cover_img !== undefined) updates.cover_img = cover_img;
  if (status !== undefined)   updates.status = status;
  if (article_type_id !== undefined) updates.article_type_id = article_type_id;

  // Set published_at when first publishing
  if (!wasPublished && isNowPublished) {
    updates.published_at = new Date();
  }
  updates.updated_at = new Date();

  await sql`UPDATE articles SET ${sql(updates)} WHERE article_id = ${articleId}`;

  // Replace tags if provided
  if (tagIds !== undefined) {
    await sql`DELETE FROM article_tags WHERE article_id = ${articleId}`;
    if (tagIds.length > 0) {
      const values = tagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId }));
      await sql`INSERT INTO article_tags ${sql(values, 'article_id', 'tag_id')}`;
    }
  }

  return getArticleByIdAdmin(articleId);
}

export async function deleteArticleAdmin(articleId) {
  const existing = await sql`SELECT article_id FROM articles WHERE article_id = ${articleId} LIMIT 1`;
  if (!existing.length) throw new NotFoundError('Article not found');

  // Cascading delete: tags, likes, saves, then article
  await sql`DELETE FROM article_tags WHERE article_id = ${articleId}`;
  await sql`DELETE FROM likes WHERE article_id = ${articleId}`;
  await sql`DELETE FROM saves WHERE article_id = ${articleId}`;
  await sql`DELETE FROM articles WHERE article_id = ${articleId}`;

  return { deleted: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: Tag CRUD
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAdminTags() {
  const rows = await sql`
    SELECT
      t.tag_id,
      t.name_en,
      COUNT(agt.article_id)::int AS articles_count
    FROM tags t
    LEFT JOIN article_tags agt ON agt.tag_id = t.tag_id
    GROUP BY t.tag_id
    ORDER BY t.name_en ASC
  `;

  return rows.map((r) => ({
    tag_id:         r.tag_id,
    name:           r.name_en,
    articles_count: Number(r.articles_count ?? 0),
  }));
}

export async function createTagAdmin(name) {
  const existing = await sql`SELECT tag_id FROM tags WHERE LOWER(name_en) = LOWER(${name}) LIMIT 1`;
  if (existing.length) {
    const err = new Error('Tag already exists');
    err.statusCode = 409;
    throw err;
  }

  const [tag] = await sql`
    INSERT INTO tags (name_en)
    VALUES (${name})
    RETURNING tag_id, name_en
  `;

  return { tag_id: tag.tag_id, name: tag.name_en, articles_count: 0 };
}

export async function deleteTagAdmin(tagId) {
  // Check if tag is used
  const [usage] = await sql`
    SELECT COUNT(*)::int AS count FROM article_tags WHERE tag_id = ${tagId}
  `;

  if (usage.count > 0) {
    const err = new Error(`Tag is used in ${usage.count} article(s). Remove it from those articles first.`);
    err.statusCode = 409;
    throw err;
  }

  const existing = await sql`SELECT tag_id FROM tags WHERE tag_id = ${tagId} LIMIT 1`;
  if (!existing.length) throw new NotFoundError('Tag not found');

  await sql`DELETE FROM tags WHERE tag_id = ${tagId}`;

  return { deleted: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: Article Types
// ═══════════════════════════════════════════════════════════════════════════════

export async function getArticleTypes() {
  const rows = await sql`
    SELECT article_type_id, name_en
    FROM article_types
    ORDER BY name_en ASC
  `;

  return rows.map((r) => ({
    article_type_id: r.article_type_id,
    name: r.name_en,
  }));
}
