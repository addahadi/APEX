import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  getProjects,
  getProject,
  createProject,
  getProjectEstimation,
  exportProjectReport
} from "@/api/projects.service";
import { handleApiError } from "@/api/handleApiError";

// ── useProjects ─────────────────────────────────────────────────────────────

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ── useProject ──────────────────────────────────────────────────────────────

export function useProject(projectId) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── useProjectEstimation ────────────────────────────────────────────────────

export function useProjectEstimation(projectId) {
  return useQuery({
    queryKey: ["project-estimation", projectId],
    queryFn: () => getProjectEstimation(projectId),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── useCreateProject ────────────────────────────────────────────────────────

export function useCreateProject() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("user");

  return useMutation({
    mutationFn: (data) => createProject(data),
    onSuccess: () => {
      // Invalidate projects cache
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t("toast.projectCreated"));
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message);
      return handled;
    },
  });
}

// ── useExportProject ────────────────────────────────────────────────────────

export function useExportProject() {
  const { t } = useTranslation("user");

  return useMutation({
    mutationFn: (projectId) => exportProjectReport(projectId),
    onSuccess: (data) => {
      // data may already be a Blob (transformResponse) or wrapped in axios response
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Estimation_Report.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("toast.reportDownloaded"));
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message || t("toast.reportDownloadFailed"));
    },
  });
} 
