import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import * as categoriesService from "../api/categories.service";

/**
 * Hook to fetch full category tree
 */
export const useCategoryTree = () => {
  return useQuery({
    queryKey: ["categories", "tree"],
    queryFn: () => categoriesService.getCategoryTree(),
  });
};

/**
 * Hook to fetch root categories
 */
export const useRootCategories = () => {
  return useQuery({
    queryKey: ["categories", "root"],
    queryFn: () => categoriesService.getRootCategories(),
  });
};

/**
 * Hook to fetch child categories of a specific branch
 */
export const useChildCategories = (categoryId) => {
  return useQuery({
    queryKey: ["categories", categoryId, "children"],
    queryFn: () => categoriesService.getChildCategories(categoryId),
    enabled: !!categoryId,
  });
};

/**
 * Hook to fetch category details (node info + formulas)
 * Used to determine category_level and configure calculation leaf.
 */
export const useCategoryDetails = (categoryId) => {
  return useQuery({
    queryKey: ["category", categoryId, "details"],
    queryFn: () => categoriesService.getCategoryDetails(categoryId),
    enabled: !!categoryId,
  });
};

/**
 * Hook to run stateless calculation
 */
export const useCalculate = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data) => categoriesService.calculateEngine(data),
    onError: (error) => {
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate results.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to save leaf results to estimation
 */
export const useSaveLeafResult = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => categoriesService.saveLeafResult(data),
    onSuccess: (data, variables) => {
      // Invalidate project estimation to refresh totals
      if (variables.project_id) {
        queryClient.invalidateQueries({ queryKey: ["project-estimation", variables.project_id] });
      }
      
      toast({
        title: "Success",
        description: "Calculation results saved successfully to your estimation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Error",
        description: error.message || "Failed to save calculation.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to remove a leaf calculation
 */
export const useRemoveLeaf = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data) => categoriesService.removeLeaf(data.project_details_id),
    onSuccess: (data, variables) => {
      if (variables.project_id) {
        queryClient.invalidateQueries({ queryKey: ["project-estimation", variables.project_id] });
      }
      
      toast({
        title: "Removed",
        description: "Calculation step removed from estimation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Removal Error",
        description: error.message || "Failed to remove calculation.",
        variant: "destructive",
      });
    },
  });
};
