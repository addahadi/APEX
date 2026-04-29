import { useEffect, useState, useCallback, useRef } from "react";

import { Link } from "react-router-dom";

// lexical
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

import {
  CheckCircle2,
  X,
  Calendar,
  Clock,
  Heart,
  Bookmark,
  Share2,
  ChevronLeft,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  BookOpen,
  Tag,
  ArrowRight,
  LogIn,
} from "lucide-react";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// hooks
import { useTags } from "@/hooks/useBlog";

// utils
import { estimateReadTime, fmtDate } from "../utils/blog.utils";

// shadcn
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// ═══════════════════════════════════════════════════════════════════════════════
// Confirm Delete Dialog popup for admin article page
// ═══════════════════════════════════════════════════════════════════════════════
export const ConfirmDialog = ({ article, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-[popIn_0.2s_ease-out]">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 className="text-center text-gray-900 font-bold text-base mb-1">Delete Article?</h3>
        <p className="text-center text-gray-500 text-sm mb-1">You are about to delete:</p>
        <p className="text-center text-gray-800 font-semibold text-sm mb-5 px-2 truncate">"{article.title}"</p>
        <p className="text-center text-red-500 text-xs mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors">Yes, Delete</button>
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};




// ═══════════════════════════════════════════════════════════════════════════════
// Badges
// ═══════════════════════════════════════════════════════════════════════════════
export const TypeBadge = ({ type }) => {
  const isBlog = type === "BLOG";
  return (
    <Badge 
      variant={isBlog ? "default" : "secondary"}
      className={isBlog ? "bg-blue-500 hover:bg-blue-600" : "bg-amber-500 hover:bg-amber-600 text-white"}
    >
      {type}
    </Badge>
  );
};
export const StatusBadge = ({ status }) => {
  const isPublished = status === "PUBLISHED";
  return (
    <Badge 
      variant={isPublished ? "default" : "secondary"}
      className={isPublished ? "bg-green-500 hover:bg-green-600" : "bg-muted-foreground/30 hover:bg-muted-foreground/40 text-foreground"}
    >
      {status}
    </Badge>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// Toast Notification
// ═══════════════════════════════════════════════════════════════════════════════
export const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: "bg-green-500",
    draft: "bg-blue-500",
    error: "bg-red-500"  // ← REQUIRED for error messages
  };

  // Use different icons for different types
  const getIcon = () => {
    if (type === 'error') {
      return <X size={18} className="flex-shrink-0" />; // X icon for errors
    }
    return <CheckCircle2 size={18} className="flex-shrink-0" />; // Check for success/draft
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5
                  rounded-2xl shadow-2xl text-white text-sm font-medium
                  ${styles[type] || styles.success}`}  // ← Fallback to success if type unknown
      style={{ animation: "slideUp 0.3s ease-out" }}
    >
      {getIcon()}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <X size={15} />
      </button>
      <div className="absolute bottom-0 left-0 h-1 rounded-b-2xl bg-white/30 w-full overflow-hidden">
        <div className="h-full bg-white/60 rounded-b-2xl" style={{ animation: "shrink 3.5s linear forwards" }} />
      </div>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shrink  { from { width:100%; } to { width:0%; } }
      `}</style>
    </div>
  );
};
// ═══════════════════════════════════════════════════════════════════════════════
// Character Count
// ═══════════════════════════════════════════════════════════════════════════════
export function CharacterCountDisplay({ limit = 10000 }) {
  const [editor] = useLexicalComposerContext();
  const [count, setCount] = useState(0);
  useEffect(() => editor.registerUpdateListener(({ editorState }) => { editorState.read(() => { setCount($getRoot().getTextContent().length); }); }), [editor]);
  const pct = Math.min((count / limit) * 100, 100);
  const color = pct > 90 ? "text-red-500" : pct > 70 ? "text-yellow-500" : "text-gray-400";
  return (
    <div className={`flex items-center gap-1.5 text-xs ${color} select-none`}>
      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-400" : pct > 70 ? "bg-yellow-400" : "bg-blue-400"}`} style={{ width: `${pct}%` }} />
      </div>
      {count} / {limit.toLocaleString()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// tagselector
// ═══════════════════════════════════════════════════════════════════════════════

export const TagSelector = ({ options, selected, onChange }) => {
  const toggleTag = useCallback((id) => {
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);
  }, [selected, onChange]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => {
        const active = selected.includes(tag.id);
        return (
          <button key={tag.id} onClick={() => toggleTag(tag.id)}
            className={`px-3 py-1.5 rounded-full text-xs border ${active ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 border-gray-200 text-gray-600"}`}>
            {tag.name}
          </button>
        );
      })}
    </div>
  );
};



// ═══════════════════════════════════════════════════════════════════════════════
// ArticleView Components 
// ═══════════════════════════════════════════════════════════════════════════════ 



export const Hero = ({ article, likesCount, isLiked, isSaved, onLike, onSave, isAuthenticated = false }) => {
  const container = useRef();
  const articleTags = article.tags || [];
  const contentStr = typeof article.content === 'object' ? JSON.stringify(article.content) : article.content;

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
    tl.from(".hero-bg-zoom", { scale: 1.1, duration: 1.5 })
      .from(".hero-content > *", { y: 30, opacity: 0, stagger: 0.1 }, "-=1")
      .from(".hero-actions", { x: 20, opacity: 0 }, "-=0.8");
  }, { scope: container });

  return (
    <div ref={container} className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-[32px] overflow-hidden mb-12 shadow-2xl border-4 border-white">
      <div
        className="hero-bg-zoom absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${article.cover_img})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
      </div>

      <Link
        to="/articles"
        className="absolute top-6 left-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 hover:scale-105 transition-all z-10"
      >
        <ChevronLeft size={20} />
      </Link>

      <div className="absolute top-6 right-6 hero-actions flex items-center gap-3 z-10">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onLike}
                className={`rounded-full h-12 w-12 border-white/20 backdrop-blur-md transition-all hover:scale-105 ${
                  isLiked ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </TooltipTrigger>
            {!isAuthenticated && <TooltipContent>Log in to like</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onSave}
                className={`rounded-full h-12 w-12 border-white/20 backdrop-blur-md transition-all hover:scale-105 ${
                  isSaved ? "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
              </Button>
            </TooltipTrigger>
            {!isAuthenticated && <TooltipContent>Log in to save</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative h-full flex flex-col justify-end p-8 md:p-16 hero-content">
        <div className="flex items-center gap-3 mb-6">
          {article.type && (
            <Badge className="bg-primary text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 border-none shadow-lg">
              {article.type}
            </Badge>
          )}
          {articleTags.length > 1 && (
            <Badge variant="outline" className="text-white border-white/30 backdrop-blur-sm px-3 py-1.5 font-bold">
              +{articleTags.length - 1} more
            </Badge>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white max-w-4xl leading-[1.1] mb-8 tracking-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-white/80 font-medium">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-white/60" />
            <span>{fmtDate(article.published_at || article.created_at)}</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-white/60" />
            <span>{estimateReadTime(contentStr)} min read</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
          <div className="flex items-center gap-2">
            <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : "text-white/60"} />
            <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



export const TagList = ({ tags }) => (
  <div className="flex flex-wrap items-center gap-3 mt-12 pt-8 border-t border-slate-100">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
      Tags
    </span>
    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
    {(tags || []).map((tag) => {
      const tagId = tag.tag_id || tag;
      const tagName = tag.name || tag;
      return (
        <Link key={tagId} to={`/articles?tag=${tagId}`}>
          <Badge variant="secondary" className="px-4 py-1.5 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
            {tagName}
          </Badge>
        </Link>
      );
    })}
  </div>
);

export const PopularTags = () => {
  const { data: allTags = [] } = useTags();
  const topTags = [...allTags].sort((a, b) => b.articles_count - a.articles_count).slice(0, 8);

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-primary rounded-full"></span>
          Popular Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {topTags.map((tag) => (
            <Link key={tag.tag_id} to={`/articles?tag=${tag.tag_id}`}>
              <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold transition-all hover:bg-primary hover:text-white cursor-pointer">
                {tag.name}
                <span className="ml-1.5 opacity-60">({tag.articles_count})</span>
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const ShareSection = ({ title }) => {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const copyLink = () => navigator.clipboard.writeText(shareUrl);

  return (
    <div className="border-t border-slate-100 pt-8 mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 rounded-[24px] p-6 border border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">Share this article</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">Spread the knowledge with your network</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild className="rounded-full bg-white hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200">
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Twitter size={18} />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild className="rounded-full bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">
              <Linkedin size={18} />
            </a>
          </Button>
          <Button variant="outline" size="icon" onClick={copyLink} className="rounded-full bg-white hover:bg-slate-100 hover:text-slate-900">
            <LinkIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const RelatedArticles = ({ articles = [] }) => {
  if (articles.length === 0) return null;

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
            Related Reads
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {articles.map((article) => (
            <Link
              key={article.article_id}
              to={`/articles/${article.slug}`}
              className="group flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200 relative">
                {article.cover_img ? (
                  <img src={article.cover_img} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BookOpen size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-primary transition-colors mb-2 tracking-tight leading-snug">
                  {article.title}
                </h4>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  {article.shared_tags_count > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <Tag size={12} /> {article.shared_tags_count} shared
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {article.likes_count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/articles" className="flex items-center justify-center gap-2 px-6 py-4 text-xs font-bold text-slate-600 hover:text-primary hover:bg-slate-50 transition-colors border-t border-slate-100 uppercase tracking-widest">
          View all <ArrowRight size={14} />
        </Link>
      </CardContent>
    </Card>
  );
};

export default RelatedArticles;

// ═══════════════════════════════════════════════════════════════════════════════
// Icons
// ═══════════════════════════════════════════════════════════════════════════════
export const HeartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export const BookmarkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const ArchiveIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

export const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export const PublishIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 8 12 16" />
    <polyline points="8 12 12 8 16 12" />
  </svg>
);

export const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

