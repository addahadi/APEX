import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2, LayoutDashboard, ShieldCheck, BookOpen } from "lucide-react";
import { useArticle, useToggleLike, useToggleSave } from "@/hooks/useBlog";
import { useAuthContext } from "@/contexts/AuthContext";
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ImageNode } from "@/lexical/ImageNode";
import { isLexicalJson } from "@/utils/blog.utils";
import { Hero, TagList, RelatedArticles, PopularTags, ShareSection } from "@/components/Blog";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// ── Hook: converts raw content (JSON or HTML) → HTML string ─────────────────
const useRenderedContent = (rawContent) => {
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!rawContent) return;

    if (!isLexicalJson(rawContent)) {
      const id = setTimeout(() => setHtml(rawContent), 0);
      return () => clearTimeout(id);
    }

    const editor = createEditor({
      nodes: [
        HeadingNode, QuoteNode,
        ListNode, ListItemNode,
        CodeNode, CodeHighlightNode,
        AutoLinkNode, LinkNode,
        ImageNode,
      ],
    });

    const parsed = editor.parseEditorState(rawContent);
    editor.setEditorState(parsed);

    let html = "";
    editor.read(() => {
      html = $generateHtmlFromNodes(editor, null);
    });

    const id = setTimeout(() => setHtml(html), 0);
    return () => clearTimeout(id);
  }, [rawContent]);

  return html;
};

// ── Article Content Sub Component ───────────────────────────────────────────
const ArticleContent = ({ article }) => {
  const content = typeof article.content === "object"
    ? JSON.stringify(article.content)
    : article.content;
  const html = useRenderedContent(content);

  return (
    <div className="prose max-w-none">
      <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-12 border-l-4 border-primary pl-6 py-2 bg-slate-50 rounded-r-2xl">
        {article.excerpt}
      </p>
      
      <Separator className="mb-12" />

      <div
        className="text-slate-800 leading-relaxed text-base md:text-lg
          [&_h1]:text-4xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:tracking-tight
          [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:tracking-tight
          [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-8 [&_h3]:mb-4
          [&_h4]:text-xl [&_h4]:font-bold [&_h4]:text-slate-800 [&_h4]:mt-6 [&_h4]:mb-3
          [&_p]:mb-6 [&_p]:leading-loose
          [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:text-slate-700
          [&_ol]:list-decimal [&_ol]:pl-8 [&_ol]:mb-6 [&_ol]:space-y-2 [&_ol]:text-slate-700
          [&_li]:leading-relaxed
          [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-6 [&_blockquote]:py-1
          [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:my-8 [&_blockquote]:bg-slate-50 [&_blockquote]:rounded-r-xl
          [&_code]:bg-slate-100 [&_code]:text-primary [&_code]:px-1.5 [&_code]:py-0.5
          [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
          [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-6 [&_pre]:rounded-2xl
          [&_pre]:overflow-x-auto [&_pre]:my-8 [&_pre]:text-sm
          [&_a]:text-primary [&_a]:underline [&_a]:hover:text-blue-700 [&_a]:font-medium
          [&_strong]:font-black [&_strong]:text-slate-900
          [&_em]:italic
          [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:my-10 [&_img]:block [&_img]:shadow-xl [&_img]:border [&_img]:border-slate-100"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────

const ArticleView = () => {
  const container = useRef();
  const { id: slug } = useParams();
  const { isAuthenticated, user } = useAuthContext();
  const navigate = useNavigate();

  const isAdmin = user?.role === "ADMIN";
  const dashboardPath = isAdmin ? "/admin" : "/dashboard";

  const handleBack = () => {
    // Go back in history if there's a previous page, otherwise fall back to /articles
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/articles");
    }
  };

  const { data: article, isLoading, isError } = useArticle(slug);
  const likeMutation = useToggleLike();
  const saveMutation = useToggleSave();

  useGSAP(() => {
    if (!isLoading && article) {
      gsap.from(".article-content-anim", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.2
      });

      gsap.from(".sidebar-widget", {
        scrollTrigger: {
          trigger: ".sidebar-widget",
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, { scope: container, dependencies: [isLoading, article] });

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like articles");
      return;
    }
    if (!article) return;
    likeMutation.mutate(article.article_id);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to save articles");
      return;
    }
    if (!article) return;
    saveMutation.mutate(article.article_id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[32px] shadow-sm border border-slate-100 max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">404</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Article Not Found</h2>
          <p className="text-slate-500 mb-8 font-medium">The article you're looking for doesn't exist or has been removed.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg"
            >
              <ChevronLeft size={18} className="mr-2" />
              Go Back
            </button>
            {isAuthenticated && (
              <Link
                to={dashboardPath}
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg"
              >
                {isAdmin ? <ShieldCheck size={18} className="mr-2" /> : <LayoutDashboard size={18} className="mr-2" />}
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={container} className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ─── Context-Aware Navigation Bar ─── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors group"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all">
              <ChevronLeft size={16} />
            </span>
            <span>Back</span>
          </button>

          {isAuthenticated && (
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-700 hover:border-primary/30 hover:text-primary hover:shadow-md transition-all"
            >
              {isAdmin
                ? <><ShieldCheck size={15} className="text-primary" /> Admin Panel</>
                : <><LayoutDashboard size={15} className="text-primary" /> Dashboard</>
              }
            </Link>
          )}
        </div>
        <Hero
          article={article}
          likesCount={article.likes_count}
          isLiked={article.is_liked}
          isSaved={article.is_saved}
          onLike={handleLike}
          onSave={handleSave}
          isAuthenticated={isAuthenticated}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 article-content-anim">
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-12 xl:p-16">
              <ArticleContent article={article} />
              <TagList tags={article.tags || []} />
              <ShareSection title={article.title} />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-10 space-y-8">
              <div className="sidebar-widget">
                <RelatedArticles articles={article.related || []} />
              </div>
              <div className="sidebar-widget">
                <PopularTags />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;