import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/modules.api";

// ── Query keys ────────────────────────────────────────────────────────────────

export const MODULES_KEYS = {
  tree:  ["modules", "tree"],
  leaf:  (id) => ["modules", "leaf", id],
  units: ["modules", "units"],
  fieldTypes: ["modules", "fieldTypes"],
};

// ── Queries ───────────────────────────────────────────────────────────────────

export function useModulesTree() {
  return useQuery({
    queryKey: MODULES_KEYS.tree,
    queryFn:  api.getAdminTree,
    staleTime: 30_000,
  });
}

export function useLeafDetails(categoryId, options = {}) {
  return useQuery({
    queryKey: MODULES_KEYS.leaf(categoryId),
    queryFn:  () => api.getLeafDetails(categoryId),
    enabled:  !!categoryId,
    staleTime: 10_000,
    ...options,
  });
}

export function useUnits() {
  return useQuery({
    queryKey: MODULES_KEYS.units,
    queryFn:  api.getUnits,
    staleTime: Infinity,
  });
}

export function useFieldTypes() {
  return useQuery({
    queryKey: MODULES_KEYS.fieldTypes,
    queryFn:  api.getFieldTypes,
    staleTime: Infinity,
  });
}

// ── Category mutations ────────────────────────────────────────────────────────

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.tree }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, data }) => api.updateCategory(categoryId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.tree }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCategory,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.tree }),
  });
}

// ── Formula mutations ─────────────────────────────────────────────────────────

export function useCreateFormula(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createFormula(categoryId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useUpdateFormula(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formulaId, data }) => api.updateFormula(formulaId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useDeleteFormula(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFormula,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

// ── Formula Output mutations ──────────────────────────────────────────────────
// FIX: createFormulaOutput now passes formulaId as the first positional arg to
// api.createFormulaOutput(formulaId, data) instead of merging formula_id into
// the body and posting to a non-existent /admin/formula-outputs route.

export function useCreateFormulaOutput(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formulaId, data }) => api.createFormulaOutput(formulaId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useUpdateFormulaOutput(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ outputId, data }) => api.updateFormulaOutput(outputId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useDeleteFormulaOutput(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteFormulaOutput,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

// ── Field mutations ───────────────────────────────────────────────────────────

export function useCreateField(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formulaId, data }) => api.createField(formulaId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useUpdateField(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldId, data }) => api.updateField(fieldId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useDeleteField(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteField,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

// ── Config mutations ──────────────────────────────────────────────────────────

export function useCreateConfig(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createConfig(categoryId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useUpdateConfig(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ configId, data }) => api.updateConfig(configId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useDeleteConfig(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteConfig,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

// ── Coefficient mutations ─────────────────────────────────────────────────────

export function useCreateCoefficient(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.createCoefficient(categoryId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useUpdateCoefficient(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ coefficientId, data }) => api.updateCoefficient(coefficientId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}

export function useDeleteCoefficient(categoryId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCoefficient,
    onSuccess:  () => qc.invalidateQueries({ queryKey: MODULES_KEYS.leaf(categoryId) }),
  });
}
