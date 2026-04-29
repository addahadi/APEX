import React, { useState } from "react";
import { useAdminArticles, useDeleteArticle, useUpdateArticle } from "@/hooks/useBlog";
import { ConfirmDialog, TypeBadge, StatusBadge } from "../../components/Blog";
import { toast } from "sonner";
import ArticleEditor from "./ArticleEditor";
import { AlertTriangle, Loader2, Search, Edit2, Archive, Trash2, Globe, Heart, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

// shadcn/ui components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const PAGE_SIZE = 8;

const AdminArticles = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [forceEditorValidation, setForceEditorValidation] = useState(false);

  const { data: articlesData, isLoading, isFetching } = useAdminArticles({
    search,
    status: statusFilter === "ALL" ? "" : statusFilter,
    type: typeFilter === "ALL" ? "" : typeFilter,
    page,
    limit: PAGE_SIZE,
  });

  const deleteMutation = useDeleteArticle();
  const updateMutation = useUpdateArticle();

  const articles = articlesData?.data ?? [];
  const pagination = articlesData?.pagination ?? { total: 0, page: 1, limit: PAGE_SIZE, total_pages: 1 };

  const handleDeleteConfirmed = () => {
    deleteMutation.mutate(confirmTarget.article_id, {
      onSuccess: () => {
        setConfirmTarget(null);
        toast.success("Article deleted successfully");
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Failed to delete article");
      }
    });
  };

  const handleToggleStatus = (article) => {
    const newStatus = article.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    updateMutation.mutate({ id: article.article_id, data: { status: newStatus } }, {
      onSuccess: () => {
        toast.success(`Article ${newStatus === "PUBLISHED" ? "published" : "unpublished"} successfully`);
      },
      onError: (err) => {
        toast.error(err?.response?.data?.error || "Failed to update article status");
      }
    });
  };

  const isArticleComplete = (article) => {
    const hasContent = article.content &&
      article.content !== "" &&
      article.content !== "{}" &&
      article.content !== "null" &&
      article.content !== "undefined";

    const hasExcerpt = (article.excerpt && article.excerpt.trim() !== "");
    const hasCoverImage = article.cover_img && article.cover_img !== "";

    return { hasContent, hasExcerpt, hasCoverImage, isComplete: hasContent && hasExcerpt && hasCoverImage };
  };

  const handlePublishFromList = (article) => {
    const checks = isArticleComplete(article);
    if (!checks.isComplete) {
      setForceEditorValidation(true);
      setEditingArticle(article);
    } else {
      handleToggleStatus(article);
    }
  };

  const handleEdit = (article) => {
    setForceEditorValidation(false);
    setEditingArticle(article);
  };

  const handleEditorClose = () => {
    setEditingArticle(null);
    setForceEditorValidation(false);
  };

  if (editingArticle) {
    return (
      <ArticleEditor
        articleToEdit={editingArticle}
        onClose={handleEditorClose}
        forceValidation={forceEditorValidation}
      />
    );
  }

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatus = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleType = (value) => {
    setTypeFilter(value);
    setPage(1);
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full flex-col">
      <div className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Confirm Dialog */}
        {confirmTarget && (
          <ConfirmDialog
            article={confirmTarget}
            onConfirm={handleDeleteConfirmed}
            onCancel={() => setConfirmTarget(null)}
          />
        )}



        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search title..."
              className="pl-9 bg-background"
            />
          </div>

          <Select value={typeFilter} onValueChange={handleType}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="BLOG">BLOG</SelectItem>
              <SelectItem value="ACTUALITE">ACTUALITE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={handleStatus}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden border-none shadow-sm">
          <CardContent className="p-0 relative">
            {isFetching && !isLoading && (
              <div className="absolute top-2 right-4 z-10">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {["Title", "Type", "Status", "Tags", "Engagement", "Actions"].map((header) => (
                    <TableHead key={header} className="text-xs font-semibold uppercase tracking-wider h-10">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading articles...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No articles match your current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => {
                    const checks = isArticleComplete(article);
                    const isIncomplete = !checks.isComplete && article.status === "DRAFT";

                    return (
                      <TableRow key={article.article_id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground truncate max-w-[250px] flex items-center gap-2">
                            {article.title}
                            {isIncomplete && (
                              <span title="Missing required fields for publishing">
                                <AlertTriangle className="text-amber-500 h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[250px] mt-0.5">
                            {article.excerpt || "No excerpt"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <TypeBadge type={article.type} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={article.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {(article.tags || []).slice(0, 2).map((tag) => (
                              <Badge key={tag.tag_id} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {tag.name}
                              </Badge>
                            ))}
                            {(article.tags || []).length > 2 && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                +{article.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                              <Heart className="h-3.5 w-3.5" /> {article.likes_count}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                              <Bookmark className="h-3.5 w-3.5" /> {article.saves_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[11px] px-2.5"
                              onClick={() => handleEdit(article)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" /> Edit
                            </Button>

                            {article.status === "PUBLISHED" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px] px-2.5"
                                onClick={() => handleToggleStatus(article)}
                              >
                                <Archive className="h-3 w-3 mr-1" /> Archive
                              </Button>
                            ) : (
                              <Button
                                variant={checks.isComplete ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-7 text-[11px] px-2.5", 
                                  !checks.isComplete && "text-amber-600 border-amber-500/30 bg-amber-50 hover:bg-amber-100"
                                )}
                                onClick={() => handlePublishFromList(article)}
                                title={checks.isComplete ? "Publish now" : "Complete required fields to publish"}
                              >
                                <Globe className="h-3 w-3 mr-1" /> {checks.isComplete ? "Publish" : "Complete"}
                              </Button>
                            )}

                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setConfirmTarget(article)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 px-2">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{((page - 1) * PAGE_SIZE) + 1}</span> to{" "}
              <span className="font-medium">{Math.min(page * PAGE_SIZE, pagination.total)}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> articles
            </p>
            <Pagination className="justify-end w-auto mx-0">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="h-8 px-2 lg:px-3"
                  >
                    Previous
                  </Button>
                </PaginationItem>

                {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, i, pages) => {
                    if (i > 0 && p - pages[i - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) => (
                    <PaginationItem key={i}>
                      {p === "..." ? (
                        <PaginationEllipsis />
                      ) : (
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      )}
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                    disabled={page >= pagination.total_pages}
                    className="h-8 px-2 lg:px-3"
                  >
                    Next
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticles;