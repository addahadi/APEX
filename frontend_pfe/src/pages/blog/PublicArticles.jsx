import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePublishedArticles, useTags } from "@/hooks/useBlog";
import { Heart, Search, X, BookOpen, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

gsap.registerPlugin(ScrollTrigger);

// ── Constants ─────────────────────────────────────────────────────────────────
const ARTICLES_PER_PAGE = 9;
const DEBOUNCE_MS = 400;

// ── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <Card className="overflow-hidden shadow-sm flex flex-col h-full rounded-[24px]">
    <Skeleton className="h-48 w-full rounded-none" />
    <CardContent className="p-6 flex flex-col gap-4 flex-1">
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2 mt-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

// ── Component ─────────────────────────────────────────────────────────────────
const PublicArticles = () => {
  const container = useRef();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialTag = searchParams.get("tag") || "";
  const initialSearch = searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTag]);

  // Sync URL params
  useEffect(() => {
    const params = {};
    if (debouncedSearch) params.q = debouncedSearch;
    if (activeTag) params.tag = activeTag;
    if (currentPage > 1) params.page = currentPage;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, activeTag, currentPage, setSearchParams]);

  // Data fetching
  const { data: articlesData, isLoading, isFetching } = usePublishedArticles({
    page: currentPage,
    search: debouncedSearch,
    tagId: activeTag,
  });

  const { data: tags = [] } = useTags();

  const articles = articlesData?.data ?? [];
  const pagination = articlesData?.pagination ?? { total: 0, page: 1, limit: ARTICLES_PER_PAGE, total_pages: 1 };

  const handleSearch = (e) => setSearch(e.target.value);
  const handleTagClick = (tagId) => setActiveTag((prev) => (prev === tagId ? "" : tagId));
  const handlePage = (page) => {
    if (page >= 1 && page <= pagination.total_pages) setCurrentPage(page);
  };
  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setActiveTag("");
    setCurrentPage(1);
  };

  const fmtDate = (iso) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getPageRange = () => {
    const total = pagination.total_pages;
    const current = currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = [];
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  const activeTagName = tags.find((t) => t.tag_id === activeTag)?.name || "";

  // Animations
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
    tl.from(".blog-hero-tag", { y: 20, opacity: 0, delay: 0.1 })
      .from(".blog-hero-title", { y: 40, opacity: 0 }, "-=0.8")
      .from(".blog-hero-desc", { y: 20, opacity: 0 }, "-=0.8");

    gsap.from(".sidebar-anim", {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: "power2.out", delay: 0.4
    });
  }, { scope: container });

  // Separate effect for articles so they animate when data changes
  useGSAP(() => {
    if (articles.length > 0 && !isFetching) {
      gsap.fromTo(".article-card", 
        { y: 50, opacity: 0 }, 
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.1, 
          duration: 0.8, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".articles-grid",
            start: "top 85%",
          }
        }
      );
    }
  }, { scope: container, dependencies: [articles, isFetching] });

  return (
    <div ref={container} className="min-h-screen bg-slate-50 overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 bg-white border-b border-slate-100">
        <div className="absolute inset-0 z-0 opacity-40 dot-grid pointer-events-none"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="blog-hero-tag inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-primary uppercase bg-primary/10 rounded-full">
              Knowledge Hub
            </span>
            <h1 className="blog-hero-title text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Insights & Updates
            </h1>
            <p className="blog-hero-desc text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
              Stay informed with the latest trends in sustainable construction,
              quantity surveying, and digital transformation in the industry.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Article Grid */}
            <div className="flex-1 min-w-0 order-2 lg:order-1 relative">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-[32px] border border-slate-100 shadow-sm">
                  {debouncedSearch || activeTag ? (
                    <>
                      <Search className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-xl font-bold text-slate-700 mb-2 tracking-tight">No articles found</p>
                      <Button variant="outline" onClick={clearFilters} className="mt-4 rounded-xl">
                        Clear all filters
                      </Button>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-20 h-20 mb-6 opacity-20" />
                      <p className="text-2xl font-black text-slate-800 mb-2 tracking-tight">No Published Articles Yet</p>
                      <p className="text-base text-slate-500 font-medium max-w-sm text-center">
                        Check back later for new insights and updates.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Loading overlay for refetch */}
                  {isFetching && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-start justify-center rounded-[32px] pt-20">
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        <span className="text-sm font-bold text-slate-700">Updating...</span>
                      </div>
                    </div>
                  )}

                  <div className="articles-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {articles.map((article) => (
                      <Card 
                        key={article.article_id}
                        className="article-card overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-primary/20 transition-all duration-500 flex flex-col group rounded-[24px]"
                      >
                        <Link to={`/articles/${article.slug}`} className="relative overflow-hidden h-52 block">
                          <img
                            src={article.cover_img}
                            alt={article.title}
                            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          {article.type && (
                            <Badge className="absolute top-4 left-4 bg-primary text-white font-bold uppercase tracking-wider px-3 py-1 shadow-md border-none">
                              {article.type}
                            </Badge>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </Link>

                        <CardContent className="p-6 flex flex-col flex-1 bg-white">
                          <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold mb-4 uppercase tracking-wider">
                            <span>{fmtDate(article.published_at || article.created_at)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-1.5">
                              <Heart className="w-3.5 h-3.5" />
                              {article.likes_count}
                            </span>
                          </div>

                          <Link to={`/articles/${article.slug}`}>
                            <h2 className="text-xl font-bold text-slate-900 leading-snug mb-3 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
                              {article.title}
                            </h2>
                          </Link>

                          <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 line-clamp-3 font-medium">
                            {article.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {(article.tags || []).slice(0, 3).map((tag) => (
                              <Badge
                                key={`${article.article_id}-${tag.tag_id}`}
                                variant={activeTag === tag.tag_id ? "default" : "secondary"}
                                className={`cursor-pointer hover:bg-primary/90 transition-colors ${activeTag !== tag.tag_id && "hover:text-white"}`}
                                onClick={() => handleTagClick(tag.tag_id)}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                            {(article.tags || []).length > 3 && (
                              <Badge variant="outline" className="text-slate-400 border-slate-200">
                                +{article.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.total_pages > 1 && (
                    <div className="mt-16 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePage(currentPage - 1)}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {getPageRange().map((page, idx) => (
                            <PaginationItem key={idx}>
                              {page === "..." ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() => handlePage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => handlePage(currentPage + 1)}
                              className={currentPage === pagination.total_pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-8 order-1 lg:order-2">
              {/* Search */}
              <div className="sidebar-anim bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Search
                </h3>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={handleSearch}
                    className="pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary h-11"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Active filter indicator */}
              {(activeTag || debouncedSearch) && (
                <div className="sidebar-anim bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-primary/60 mb-0.5">Active Filter</p>
                    <p className="text-sm text-blue-900 font-bold truncate">
                      {activeTag ? activeTagName : `"${debouncedSearch}"`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFilters} className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full h-8 w-8 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Tags */}
              <div className="sidebar-anim bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.tag_id}
                      variant={activeTag === tag.tag_id ? "default" : "secondary"}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-semibold transition-all ${
                        activeTag !== tag.tag_id ? "bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary" : ""
                      }`}
                      onClick={() => handleTagClick(tag.tag_id)}
                    >
                      {tag.name}
                      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${
                        activeTag === tag.tag_id ? "bg-white/20 text-white" : "bg-white text-slate-500 shadow-sm"
                      }`}>
                        {tag.articles_count}
                      </span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Results count */}
              {!isLoading && pagination.total > 0 && (
                <div className="sidebar-anim bg-slate-900 rounded-3xl shadow-xl p-6 text-white">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Metrics</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black">{pagination.total}</span>
                    <span className="text-sm text-slate-400 font-medium pb-1.5">articles total</span>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicArticles;