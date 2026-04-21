import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as api from "@/api/admin.api";
import { handleApiError } from "@/api/handelApiError";

export const ADMIN_KEYS = {
  stats: ["admin", "stats"],
  subscribers: (filters) => ["admin", "subscribers", filters],
  usersRoot: ["admin", "users"],
  users: (filters) => ["admin", "users", "list", filters],
  user: (userId) => ["admin", "users", "detail", userId],
};

export function useDashboardStats() {
  return useQuery({
    queryKey: ADMIN_KEYS.stats,
    queryFn: api.getDashboardStats,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

export function useSubscribers(filters) {
  return useQuery({
    queryKey: ADMIN_KEYS.subscribers(filters),
    queryFn: () => api.getSubscribers(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useAdminUsers(filters) {
  return useQuery({
    queryKey: ADMIN_KEYS.users(filters),
    queryFn: () => api.getUsers(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useAdminUserDetails(userId, options = {}) {
  return useQuery({
    queryKey: ADMIN_KEYS.user(userId),
    queryFn: () => api.getUserDetails(userId),
    enabled: !!userId,
    staleTime: 30_000,
    ...options,
  });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }) => api.updateUserStatus(userId, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.usersRoot });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.user(variables.userId) });
      toast.success("User status updated.");
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message || "Failed to update user status.");
      return handled;
    },
  });
}
