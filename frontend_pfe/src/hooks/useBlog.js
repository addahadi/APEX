import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchArticles,
  fetchArticle,
  fetchTags,
  toggleLikeApi,
  toggleSaveApi,
  fetchMyLiked,
  fetchMySaved,
  fetchAdminArticles,
  fetchAdminArticle,
  createArticleApi,
  updateArticleApi,
  deleteArticleApi,
  fetchAdminTags,
  createTagApi,
  deleteTagApi,
  fetchArticleTypes,
} from '@/api/blog.api';

// ─── Keys ─────────────────────────────────────────────────────────────────────

const KEYS = {
  articles: (filters) => ['blog', 'articles', filters],
  article:  (slug)    => ['blog', 'article', slug],
  tags:     ()        => ['blog', 'tags'],
  myLiked:  ()        => ['blog', 'me', 'liked'],
  mySaved:  ()        => ['blog', 'me', 'saved'],
  // Admin
  adminArticles: (filters) => ['blog', 'admin', 'articles', filters],
  adminArticle:  (id)      => ['blog', 'admin', 'article', id],
  adminTags:     ()        => ['blog', 'admin', 'tags'],
  articleTypes:  ()        => ['blog', 'admin', 'article-types'],
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function usePublishedArticles({ page = 1, search = '', tagId = '' } = {}) {
  return useQuery({
    queryKey: KEYS.articles({ page, search, tagId }),
    queryFn: () => fetchArticles({ page, search, tag: tagId }),
    keepPreviousData: true,
    staleTime: 30_000,
  });
}

export function useArticle(slug) {
  return useQuery({
    queryKey: KEYS.article(slug),
    queryFn: () => fetchArticle(slug),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: KEYS.tags(),
    queryFn: fetchTags,
    staleTime: 60_000,
  });
}

export function useMyLiked(options = {}) {
  return useQuery({
    queryKey: KEYS.myLiked(),
    queryFn: fetchMyLiked,
    staleTime: 30_000,
    ...options,
  });
}

export function useMySaved(options = {}) {
  return useQuery({
    queryKey: KEYS.mySaved(),
    queryFn: fetchMySaved,
    staleTime: 30_000,
    ...options,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleLikeApi,
    onSuccess: (_data, articleId) => {
      // Invalidate the single article + lists
      qc.invalidateQueries({ queryKey: ['blog', 'article'] });
      qc.invalidateQueries({ queryKey: ['blog', 'articles'] });
      qc.invalidateQueries({ queryKey: KEYS.myLiked() });
    },
  });
}

export function useToggleSave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleSaveApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', 'article'] });
      qc.invalidateQueries({ queryKey: KEYS.mySaved() });
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Admin Hooks
// ═══════════════════════════════════════════════════════════════════════════════

export function useAdminArticles({ page = 1, search = '', status = '', type = '' } = {}) {
  return useQuery({
    queryKey: KEYS.adminArticles({ page, search, status, type }),
    queryFn: () => fetchAdminArticles({ page, search, status, type }),
    keepPreviousData: true,
    staleTime: 15_000,
  });
}

export function useAdminArticle(id) {
  return useQuery({
    queryKey: KEYS.adminArticle(id),
    queryFn: () => fetchAdminArticle(id),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createArticleApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', 'admin', 'articles'] });
      qc.invalidateQueries({ queryKey: ['blog', 'articles'] });
    },
  });
}

export function useUpdateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateArticleApi(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['blog', 'admin', 'articles'] });
      qc.invalidateQueries({ queryKey: ['blog', 'admin', 'article', variables.id] });
      qc.invalidateQueries({ queryKey: ['blog', 'articles'] });
      qc.invalidateQueries({ queryKey: ['blog', 'article'] });
    },
  });
}

export function useDeleteArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteArticleApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', 'admin', 'articles'] });
      qc.invalidateQueries({ queryKey: ['blog', 'articles'] });
    },
  });
}

export function useAdminTags() {
  return useQuery({
    queryKey: KEYS.adminTags(),
    queryFn: fetchAdminTags,
    staleTime: 30_000,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTagApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', 'admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['blog', 'tags'] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTagApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blog', 'admin', 'tags'] });
      qc.invalidateQueries({ queryKey: ['blog', 'tags'] });
    },
  });
}

export function useArticleTypes() {
  return useQuery({
    queryKey: KEYS.articleTypes(),
    queryFn: fetchArticleTypes,
    staleTime: 120_000,
  });
}
