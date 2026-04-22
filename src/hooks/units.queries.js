import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/units.api";

const UNITS_KEY = ["units"];

export function useUnits() {
  return useQuery({ queryKey: UNITS_KEY, queryFn: api.getUnits, staleTime: 60_000 });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: UNITS_KEY }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ unitId, data }) => api.updateUnit(unitId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNITS_KEY }),
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteUnit,
    onSuccess: () => qc.invalidateQueries({ queryKey: UNITS_KEY }),
  });
}
