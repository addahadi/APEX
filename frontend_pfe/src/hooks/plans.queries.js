import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/plans.api";

const PLANS_KEY      = ["plans-admin"];
const PLANTYPES_KEY  = ["plan-types"];

// ── Plans ─────────────────────────────────────────────────────────────────────

export function usePlansAdmin() {
  return useQuery({ queryKey: PLANS_KEY, queryFn: api.getPlansAdmin, staleTime: 30_000 });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePlan(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deletePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  });
}

// ── Plan Types ────────────────────────────────────────────────────────────────

export function usePlanTypes() {
  return useQuery({ queryKey: PLANTYPES_KEY, queryFn: api.getPlanTypes, staleTime: 60_000 });
}

export function useCreatePlanType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPlanType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLANTYPES_KEY });
      qc.invalidateQueries({ queryKey: PLANS_KEY }); // plan cards show type name
    },
  });
}

export function useUpdatePlanType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updatePlanType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLANTYPES_KEY });
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

export function useDeletePlanType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deletePlanType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PLANTYPES_KEY });
      qc.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}
