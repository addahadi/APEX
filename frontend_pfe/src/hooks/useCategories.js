import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import * as categoriesService from "../services/categories.service";
import { handleApiError } from "@/api/handleApiError";

export const useCategoryTree = () => {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => categoriesService.getCategoryTree(),
  });
};

export const useRootCategories = () => {
  return useQuery({
    queryKey: ["categories", "root"],
    queryFn: () => categoriesService.getRootCategories(),
  });
};

export const useChildCategories = (categoryId) => {
  return useQuery({
    queryKey: ["categories", categoryId, "children"],
    queryFn: () => categoriesService.getChildCategories(categoryId),
    enabled: !!categoryId,
  });
};

export const useCategoryDetails = (categoryId) => {
  return useQuery({
    queryKey: ["category", categoryId, "details"],
    queryFn: () => categoriesService.getCategoryDetails(categoryId),
    enabled: !!categoryId,
  });
};

export const useCalculate = () => {
  const { t } = useTranslation("common");
  return useMutation({
    mutationFn: (data) => categoriesService.calculateEngine(data),
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message || t("error"));
    },
  });
};

export const useSaveLeafResult = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (data) => categoriesService.saveLeafResult(data),
    onSuccess: (data, variables) => {
      if (variables.project_id) {
        queryClient.invalidateQueries({ queryKey: ["project-estimation", variables.project_id] });
      }
      toast.success(t("save"));
    },
    onError: (err) => {
      const handled = handleApiError(err);
      const isCalcLimit =
        err?.code === "LIMIT_REACHED" ||
        (err?.details && err.details[0]?.featureKey === "leaf_calculations_limit");
      if (isCalcLimit) {
        toast.error(t("toast.calculationLimitReached"), { duration: 6000 });
      } else {
        toast.error(handled.message || t("error"));
      }
    },
  });
};

export const useRemoveLeaf = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (data) => categoriesService.removeLeaf(data.project_details_id),
    onSuccess: (data, variables) => {
      if (variables.project_id) {
        queryClient.invalidateQueries({ queryKey: ["project-estimation", variables.project_id] });
      }
      toast.success(t("save"));
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message || t("error"));
    },
  });
};
