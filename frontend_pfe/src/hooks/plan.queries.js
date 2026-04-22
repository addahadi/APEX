import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planApi } from "@/api/plan.api";

export const PLANS_KEY = ["plans"];
export const PLAN_TYPES_KEY = ["plan_types"];

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: () => planApi.getAll(),
  });
}


export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => planApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => planApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => planApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  });
}

// --- Plan Types ---

export function usePlanTypes() {
  return useQuery({
    queryKey: PLAN_TYPES_KEY,
    queryFn: () => planApi.getTypes(),
  });
}


export function useCreatePlanType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => planApi.createType(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLAN_TYPES_KEY }),
  });
}

export function useUpdatePlanType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => planApi.updateType(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLAN_TYPES_KEY }),
  });
}

export function useDeletePlanType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => planApi.deleteType(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLAN_TYPES_KEY }),
  });
}
