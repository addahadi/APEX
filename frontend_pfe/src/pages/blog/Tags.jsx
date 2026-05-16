import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, AlertTriangle, Loader2, Tag } from 'lucide-react';
import { useAdminTags, useCreateTag, useDeleteTag } from '@/hooks/useBlog';
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ═══════════════════════════════════════════════════════════════════════════════
// Confirm Dialog
// ═══════════════════════════════════════════════════════════════════════════════
const ConfirmDialog = ({ title, message, subMessage, confirmText, cancelText, onConfirm, onCancel, isDanger = true }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-background border rounded-lg shadow-lg p-6 w-full max-w-sm mx-4 animate-in zoom-in-95 duration-200">
      <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${isDanger ? 'bg-destructive/10' : 'bg-amber-500/10'}`}>
        {isDanger ? (
          <Trash2 size={22} className="text-destructive" />
        ) : (
          <AlertTriangle size={22} className="text-amber-500" />
        )}
      </div>
      <h3 className="text-center font-bold text-lg mb-2">{title}</h3>
      <p className="text-center text-muted-foreground text-sm mb-2">{message}</p>
      {subMessage && (
        <p className="text-center font-semibold text-sm mb-5 px-2 truncate">
          "{subMessage}"
        </p>
      )}
      {isDanger && (
        <p className="text-center text-xs mb-6 text-destructive font-medium">
          This action cannot be undone.
        </p>
      )}
      <div className="flex gap-3 mt-6">
        {cancelText && (
          <Button onClick={onCancel} variant="outline" className="flex-1">
            {cancelText}
          </Button>
        )}
        <Button
          onClick={onConfirm}
          variant={isDanger ? "destructive" : "default"}
          className="flex-1"
        >
          {confirmText || 'Confirm'}
        </Button>
      </div>
    </div>
  </div>
);


// ═══════════════════════════════════════════════════════════════════════════════
// Main Tags Component
// ═══════════════════════════════════════════════════════════════════════════════
const Tags = () => {
  const { t } = useTranslation("admin");
  const [newTagName, setNewTagName] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  const { data: tags = [], isLoading, isFetching } = useAdminTags();
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();

  const isProcessing = createMutation.isPending || deleteMutation.isPending;

  const closeDialog = useCallback(() => setConfirmDialog(null), []);

  const handleDeleteClick = useCallback((tag) => {
    if (tag.articles_count > 0) {
      setConfirmDialog({
        type: 'warning',
        tag,
        title: t("blog.tags.dialog.tagInUse"),
        message: t("blog.tags.dialog.tagInUseMsg", { name: tag.name, count: tag.articles_count }),
        subMessage: null,
        confirmText: t("blog.tags.dialog.ok"),
        cancelText: null,
        isDanger: false,
        onConfirm: closeDialog,
      });
    } else {
      setConfirmDialog({
        type: 'delete',
        tag,
        title: t("blog.tags.dialog.deleteTitle"),
        message: t("blog.tags.dialog.deleteMsg"),
        subMessage: tag.name,
        confirmText: t("blog.tags.dialog.confirmDelete"),
        cancelText: t("blog.tags.dialog.cancel"),
        isDanger: true,
      });
    }
  }, [closeDialog]);

  const handleConfirmDelete = useCallback(() => {
    if (!confirmDialog?.tag) return;
    deleteMutation.mutate(confirmDialog.tag.tag_id, {
      onSuccess: () => {
        setConfirmDialog(null);
        toast.success(t("blog.tags.toast.deleted"));
      },
      onError: (err) => {
        console.error('Error deleting tag:', err);
        setConfirmDialog(null);
        toast.error(t("blog.tags.toast.deleteFailed"));
      },
    });
  }, [confirmDialog, deleteMutation]);

  const handleAddTag = useCallback(() => {
    const trimmed = newTagName.trim();
    if (!trimmed) return;

    const exists = tags.some(t => t.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setConfirmDialog({
        type: 'warning',
        title: t("blog.tags.dialog.alreadyExists"),
        message: t("blog.tags.dialog.alreadyExistsMsg", { name: trimmed }),
        subMessage: null,
        confirmText: t("blog.tags.dialog.ok"),
        cancelText: null,
        isDanger: false,
        onConfirm: closeDialog,
      });
      return;
    }

    createMutation.mutate(trimmed, {
      onSuccess: () => {
        setNewTagName("");
        toast.success(t("blog.tags.toast.added"));
      },
      onError: (err) => {
        console.error('Error adding tag:', err);
        toast.error(err?.response?.data?.error || t("blog.tags.toast.addFailed"));
      },
    });
  }, [newTagName, tags, closeDialog, createMutation]);

  return (
    <div className="flex-1 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-full">
        {confirmDialog && (
          <ConfirmDialog
            {...confirmDialog}
            onConfirm={confirmDialog.onConfirm || (confirmDialog.type === 'delete' ? handleConfirmDelete : closeDialog)}
            onCancel={closeDialog}
          />
        )}


        {/* ── Input ── */}
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-4 flex gap-3 sm:items-center flex-col sm:flex-row">
            <Input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder={t("blog.tags.newPlaceholder")}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={handleAddTag}
              disabled={isProcessing || !newTagName.trim()}
              className="gap-2 shrink-0 w-full sm:w-auto"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("blog.tags.addTag")}
            </Button>
          </CardContent>
        </Card>

        {/* ── Table ── */}
        <Card className="shadow-sm border-none overflow-hidden relative">
          <CardContent className="p-0">
            {/* Loading overlay */}
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-background/60 z-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold h-10 uppercase text-xs tracking-wider">{t("blog.tags.columns.tagName")}</TableHead>
                  <TableHead className="font-semibold h-10 uppercase text-xs tracking-wider text-center w-32">{t("blog.tags.columns.id")}</TableHead>
                  <TableHead className="font-semibold h-10 uppercase text-xs tracking-wider text-center w-32">{t("blog.tags.columns.usedIn")}</TableHead>
                  <TableHead className="font-semibold h-10 uppercase text-xs tracking-wider text-center w-32">{t("blog.tags.columns.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.tag_id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground font-mono text-xs">
                      {tag.tag_id?.slice(0, 8)}…
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={tag.articles_count > 0 ? "default" : "secondary"}>
                        {tag.articles_count} {tag.articles_count === 1 ? t("blog.tags.article") : t("blog.tags.articles")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant={tag.articles_count > 0 ? "outline" : "destructive"}
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleDeleteClick(tag)}
                        className={tag.articles_count > 0 ? "text-amber-600 border-amber-500/30 bg-amber-50 hover:bg-amber-100 hover:text-amber-700" : ""}
                        title={tag.articles_count > 0 ? "Cannot delete tags that are in use" : "Delete this tag"}
                      >
                        {tag.articles_count > 0 ? <AlertTriangle className="h-3.5 w-3.5 mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                        {tag.articles_count > 0 ? t("blog.tags.inUse") : t("blog.tags.delete")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {!isLoading && tags.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center">
                          <Tag className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium">{t("blog.tags.noTags")}</p>
                        <p className="text-xs">{t("blog.tags.noTagsDesc")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Legend ── */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{t("blog.tags.legendInUse")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span>{t("blog.tags.legendDelete")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tags;