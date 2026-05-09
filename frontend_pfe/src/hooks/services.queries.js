import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/api/services.api";

const SVC_KEY  = (f) => ["services", f];
const SFML_KEY = ["service-formulas"];

export function useServices(filters = {}) {
  return useQuery({
    queryKey: SVC_KEY(filters),
    queryFn:  () => api.getServices(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// SERVICE + MATERIAL formulas for the dropdown
export function useServiceFormulas() {
  return useQuery({
    queryKey: SFML_KEY,
    queryFn:  api.getServiceFormulas,
    staleTime: 60_000,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateService(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteService,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["services"] }),
  });
}
