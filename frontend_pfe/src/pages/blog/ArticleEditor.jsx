/* eslint-disable react-hooks/exhaustive-deps */

import React, { useState, useEffect } from "react";
import { useAdminTags, useCreateArticle, useUpdateArticle, useArticleTypes } from "@/hooks/useBlog";
import { Save, Globe, ImageIcon, X, Tag, ArrowLeft, Loader2, Info } from "lucide-react";
import { $getRoot } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { TRANSFORMERS } from "@lexical/markdown";
import { ImageNode } from "../../lexical/ImageNode.jsx";
import ImagePlugin from "../../lexical/ImagePlugin";
import ToolbarPlugin from "../../lexical/ToolbarPlugin";
import PreFillPlugin from "../../lexical/PreFillPlugin";
import { CharacterCountDisplay, TagSelector } from "../../components/Blog";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const editorTheme = {
  heading: { h1: "editor-h1", h2: "editor-h2", h3: "editor-h3" },
  text: {
    bold: "font-bold", italic: "italic", underline: "underline",
    strikethrough: "line-through",
    superscript: "editor-superscript", subscript: "editor-subscript",
  },
  list: {
    ul: "editor-ul", ol: "editor-ol", listitem: "editor-listitem",
    nested: { listitem: "editor-nested-listitem" },
  },
  quote: "editor-quote", code: "editor-code-block",
  link: "editor-link", paragraph: "editor-paragraph",
};

const URL_REGEX = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@"]+(\\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
const AUTO_LINK_MATCHERS = [
  (text) => { const m = URL_REGEX.exec(text); if (!m) return null; const f = m[0]; return { index: m.index, length: f.length, text: f, url: f.startsWith("http") ? f : `https://${f}` }; },
  (text) => { const m = EMAIL_REGEX.exec(text); if (!m) return null; const f = m[0]; return { index: m.index, length: f.length, text: f, url: `mailto:${f}` }; },
];

const ArticleEditor = ({ articleToEdit = null, onClose = null, forceValidation = false }) => {

  const isEditMode = !!articleToEdit;

  // ── API hooks ──
  const { data: availableTagsRaw = [] } = useAdminTags();
  const { data: articleTypesRaw = [] } = useArticleTypes();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  // Transform tags to match the old { id, name } format used by TagSelector
  const availableTags = availableTagsRaw.map((t) => ({
    id: t.tag_id,
    name: t.name,
  }));

  // Article types for the type selector
  const articleTypes = articleTypesRaw;

  const [selectedTags, setSelectedTags] = useState(() => {
    if (!isEditMode) return [];
    // tags come as [{ tag_id, name }, ...]
    const rawTags = articleToEdit.tags ?? [];
    return rawTags.map((t) => t.tag_id).filter(Boolean);
  });

  const [title, setTitle] = useState(isEditMode ? articleToEdit.title : "");
  const [excerpt, setExcerpt] = useState(isEditMode ? (articleToEdit.excerpt ?? "") : "");
  const [type, setType] = useState(() => {
    if (!isEditMode) return articleTypes[0]?.name || "BLOG";
    return articleToEdit.type || "BLOG";
  });
  const [status, setStatus] = useState(isEditMode ? articleToEdit.status : "DRAFT");
  const [coverImage, setCoverImage] = useState(isEditMode ? articleToEdit.cover_img : null);
  const [editorState, setEditorState] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [editorKey,] = useState(0);

  const showToast = (message, toastType = "success") => {
    if (toastType === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const validateForPublish = (showMessages = true) => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required for publishing";
    }

    if (!excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required for publishing";
    }

    if (!coverImage) {
      newErrors.coverImage = "Cover image is required for publishing";
    }

    if (editorState) {
      editorState.read(() => {
        const textContent = $getRoot().getTextContent().trim();
        if (!textContent) {
          newErrors.content = "Content is required for publishing";
        }
      });
    } else {
      if (!articleToEdit?.content || articleToEdit.content === "{}" || articleToEdit.content === "") {
        newErrors.content = "Content is required for publishing";
      }
    }

    setErrors(newErrors);

    if (showMessages && Object.keys(newErrors).length > 0) {
      showToast("Please complete all required fields before publishing", "error");

      setTimeout(() => {
        const errorElements = document.querySelectorAll('.border-destructive, .ring-destructive');
        if (errorElements.length > 0) {
          errorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
          const input = errorElements[0].querySelector('input, textarea') || errorElements[0];
          if (input.focus) input.focus();
        }
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (forceValidation) {
      const timer = setTimeout(() => {
        validateForPublish(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [forceValidation]);

  const slug = title.trim().toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(URL.createObjectURL(file));
      if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: null }));
    }
  };

  const handleEditorChange = (state) => {
    setEditorState(state);
    state.read(() => {
      const words = $getRoot().getTextContent().trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    });
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: null }));
    }
  };

  // Resolve article_type_id from the type name
  const resolveTypeId = (typeName) => {
    const found = articleTypes.find((t) => t.name === typeName);
    return found?.article_type_id ?? null;
  };

  const handleSave = async (publish = false) => {
    setErrors({});

    if (publish && !validateForPublish(true)) {
      return;
    }

    setIsSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug || "untitled",
      excerpt: excerpt.trim(),
      article_type_id: resolveTypeId(type),
      status: publish ? "PUBLISHED" : "DRAFT",
      tags: selectedTags,
      cover_img: coverImage || "",
      content: editorState ? JSON.stringify(editorState.toJSON()) : (articleToEdit?.content || ""),
    };

    try {
      if (isEditMode) {
        await updateMutation.mutateAsync({ id: articleToEdit.article_id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      if (publish) {
        setStatus("PUBLISHED");
        showToast("🎉 Article published successfully!", "success");
      } else {
        const action = isEditMode ? "updated" : "saved";
        showToast(`📝 Draft ${action} successfully!`, "draft");
      }

      // Auto-close after a short delay for create
      if (!isEditMode && onClose) {
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to save article", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const initialConfig = {
    namespace: "ArticleEditor",
    theme: editorTheme,
    onError: (err) => console.error(err),
    nodes: [
      HeadingNode, QuoteNode, ListNode, ListItemNode,
      CodeNode, CodeHighlightNode, AutoLinkNode, LinkNode, ImageNode,
    ],
  };

  return (
    <>
      <style>{`
        .editor-h1 { font-size:2rem; font-weight:700; color:#111827; margin:1rem 0 .5rem; }
        .editor-h2 { font-size:1.5rem; font-weight:700; color:#1f2937; margin:.75rem 0 .4rem; }
        .editor-h3 { font-size:1.25rem; font-weight:600; color:#374151; margin:.6rem 0 .3rem; }
        .editor-paragraph { margin:.25rem 0; min-height:1.4em; }
        .editor-quote { border-left:4px solid #3b82f6; padding-left:1rem; font-style:italic; color:#6b7280; margin:.75rem 0; }
        .editor-code-block { display:block; background:#1e1e2e; color:#cdd6f4; font-family:monospace; font-size:.85rem; padding:1rem 1.25rem; border-radius:.75rem; margin:.75rem 0; white-space:pre; overflow-x:auto; }
        .editor-ul { list-style-type:disc; padding-left:1.5rem; margin:.5rem 0; }
        .editor-ol { list-style-type:decimal; padding-left:1.5rem; margin:.5rem 0; }
        .editor-listitem { margin:.2rem 0; }
        .editor-nested-listitem::before { display:none; }
        .editor-link { color:#2563eb; text-decoration:underline; cursor:pointer; }
        .editor-link:hover { color:#1d4ed8; }
        [contenteditable]:focus { outline:none; }
        .editor-placeholder { position:absolute; top:0; left:0; right:0; pointer-events:none; color:#9ca3af; }
      `}</style>

      <div className="flex-1 overflow-y-auto p-4 sm:p-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-6xl mx-auto">

          {/* Back button & Edit mode banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

            {isEditMode && (
              <Badge variant="secondary" className="px-3 py-1.5 flex items-center gap-2 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors w-fit">
                <span className="font-semibold uppercase tracking-wider text-[10px] opacity-70">Editing</span>
                <span className="truncate max-w-[200px] sm:max-w-[300px]">{articleToEdit.title}</span>
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* LEFT — Editor */}
            <div className="lg:col-span-2 space-y-6">

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                  }}
                  placeholder="Enter your article title…"
                  className={cn("text-lg font-medium py-6", errors.title && "border-destructive focus-visible:ring-destructive")}
                />
                {errors.title && (
                  <p className="text-[13px] font-medium text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> {errors.title}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-muted-foreground flex items-center gap-2">
                  Slug <span className="text-[10px] uppercase tracking-wider bg-muted px-1.5 py-0.5 rounded">Auto-generated</span>
                </label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                  <span className="opacity-50">/articles/</span>
                  <span className="font-mono truncate">{slug || "your-article-title"}</span>
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Excerpt <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    if (errors.excerpt) setErrors(prev => ({ ...prev, excerpt: null }));
                  }}
                  rows={3}
                  maxLength={200}
                  placeholder="Short summary shown in article previews…"
                  className={cn("resize-none", errors.excerpt && "border-destructive focus-visible:ring-destructive")}
                />
                <div className="flex justify-between items-center">
                  {errors.excerpt ? (
                    <p className="text-[13px] font-medium text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> {errors.excerpt}
                    </p>
                  ) : <span />}
                  <p className="text-xs text-muted-foreground">{excerpt.length}/200</p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Content <span className="text-destructive">*</span>
                </label>
                <div className={cn("rounded-md overflow-hidden transition-all", errors.content && "ring-1 ring-destructive ring-offset-1")}>
                  <LexicalComposer initialConfig={initialConfig} key={editorKey}>
                    <div className="border border-input rounded-md overflow-visible bg-background relative flex flex-col">
                      <ToolbarPlugin />
                      <div className="relative flex-1">
                        <RichTextPlugin
                          contentEditable={
                            <ContentEditable className="min-h-[350px] max-h-[650px] overflow-y-auto px-5 py-4 text-sm leading-relaxed outline-none" />
                          }
                          placeholder={
                            <div className="editor-placeholder px-5 py-4 text-sm text-muted-foreground pointer-events-none">
                              Start writing your article… (Markdown shortcuts supported)
                            </div>
                          }
                          ErrorBoundary={LexicalErrorBoundary}
                        />
                        <HistoryPlugin />
                        <AutoFocusPlugin />
                        <ListPlugin />
                        <CheckListPlugin />
                        <LinkPlugin />
                        <AutoLinkPlugin matchers={AUTO_LINK_MATCHERS} />
                        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                        <OnChangePlugin onChange={handleEditorChange} />
                        <ImagePlugin />
                        {isEditMode && articleToEdit?.content && (
                          <PreFillPlugin initialContent={articleToEdit.content} />
                        )}
                      </div>
                      <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-input text-xs text-muted-foreground h-9">
                        <span>{wordCount} words</span>
                        <CharacterCountDisplay limit={10000} />
                      </div>
                    </div>
                  </LexicalComposer>
                </div>
                {errors.content && (
                  <p className="text-[13px] font-medium text-destructive flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> {errors.content}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isEditMode ? "Update Draft" : "Save Draft"}
                </Button>

                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary/5"
                >
                  <Globe className="h-4 w-4" /> 
                  {isEditMode ? "Update & Publish" : "Publish"}
                </Button>

                <Button
                  onClick={() => onClose ? onClose() : window.history.back()}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* RIGHT — Sidebar */}
            <div className="space-y-6">

              <Card className="shadow-none border-border">
                <CardHeader className="p-4 border-b pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {articleTypes.map((at) => (
                        <Badge
                          key={at.article_type_id}
                          variant={type === at.name ? "default" : "secondary"}
                          className={cn("cursor-pointer hover:bg-primary/80", type !== at.name && "hover:bg-muted/80")}
                          onClick={() => setType(at.name)}
                        >
                          {at.name}
                        </Badge>
                      ))}
                      {articleTypes.length === 0 && (
                        <>
                          <Badge variant={type === "BLOG" ? "default" : "secondary"} className="cursor-pointer" onClick={() => setType("BLOG")}>Blog</Badge>
                          <Badge variant={type === "ACTUALITE" ? "default" : "secondary"} className="cursor-pointer" onClick={() => setType("ACTUALITE")}>Actualité</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
                    <div className="flex gap-2">
                      <Badge
                        variant={status === "DRAFT" ? "default" : "secondary"}
                        className={cn("cursor-pointer", status === "DRAFT" ? "bg-amber-500 hover:bg-amber-600" : "hover:bg-muted/80")}
                        onClick={() => setStatus("DRAFT")}
                      >
                        Draft
                      </Badge>
                      <Badge
                        variant={status === "PUBLISHED" ? "default" : "secondary"}
                        className={cn("cursor-pointer", status === "PUBLISHED" ? "bg-green-500 hover:bg-green-600 text-white" : "hover:bg-muted/80")}
                        onClick={() => setStatus("PUBLISHED")}
                      >
                        Published
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {status === "PUBLISHED" ? "Visible to public." : "Hidden from public view."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border">
                <CardHeader className="p-4 border-b pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <TagSelector options={availableTags} selected={selectedTags} onChange={setSelectedTags} />
                </CardContent>
              </Card>

              {/* Cover Image */}
              <Card className="shadow-none border-border">
                <CardHeader className="p-4 border-b pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    Cover Image <span className="text-destructive">*</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="cover-upload"
                    className={cn(
                      "relative group block border-2 border-dashed h-36 rounded-md cursor-pointer overflow-hidden transition-all bg-muted/20",
                      errors.coverImage ? "border-destructive bg-destructive/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/40"
                    )}
                  >
                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                          <ImageIcon className="h-6 w-6 text-foreground" />
                          <span className="text-foreground text-xs font-medium">Change Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <ImageIcon className="h-6 w-6 opacity-50 group-hover:opacity-100" />
                        <span className="text-xs font-medium">Click to upload</span>
                        <span className="text-[10px] opacity-60 uppercase tracking-wider">PNG, JPG, WebP</span>
                      </div>
                    )}
                  </label>
                  {errors.coverImage && (
                    <p className="text-[13px] font-medium text-destructive flex items-center gap-1.5 mt-2 animate-in fade-in slide-in-from-top-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> {errors.coverImage}
                    </p>
                  )}
                  {coverImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        setCoverImage(null);
                        if (errors.coverImage) setErrors(prev => ({ ...prev, coverImage: null }));
                      }}
                    >
                      <X className="mr-2 h-3.5 w-3.5" /> Remove image
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Stats/Info */}
              <Card className="shadow-none border-border bg-muted/20">
                <CardContent className="p-4 space-y-2 text-[13px]">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Words</span>
                    <span className="font-semibold text-foreground">{wordCount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-border/50">
                    <span className="text-muted-foreground">Reading time</span>
                    <span className="font-semibold text-foreground">~{Math.max(1, Math.round(wordCount / 200))} min</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-border/50">
                    <span className="text-muted-foreground">Tags count</span>
                    <span className="font-semibold text-foreground">{selectedTags.length}</span>
                  </div>
                  {isEditMode && (
                    <div className="flex justify-between items-center py-1 border-t border-border/50">
                      <span className="text-muted-foreground">Article ID</span>
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px]">{articleToEdit.article_id}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticleEditor;