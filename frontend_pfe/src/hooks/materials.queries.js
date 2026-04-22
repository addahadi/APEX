import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/materials.api";

const MAT_KEY    = (f) => ["materials", f];
const MFML_KEY   = ["material-formulas"];

export function useMaterials(filters = {}) {
  return useQuery({
    queryKey: MAT_KEY(filters),
    queryFn:  () => api.getMaterials(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// MATERIAL-type formulas for the dropdown (category auto-derived)
export function useMaterialFormulas() {
  return useQuery({
    queryKey: MFML_KEY,
    queryFn:  api.getMaterialFormulas,
    staleTime: 60_000,
  });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createMaterial,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateMaterial(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteMaterial,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["materials"] }),
  });
}
