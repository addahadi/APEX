import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { getPlans, createSubscription, getMySubscription, getMyUsage } from "@/api/subscription.service";
import { handleApiError } from "@/api/handelApiError";

// ── usePlans ─────────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes — plans rarely change
  });
}

// ── useSubscribe ─────────────────────────────────────────────────────────────

export function useSubscribe() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId) => createSubscription(planId),
    onSuccess: () => {
      // Invalidate subscription & usage caches so they refetch
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["my-usage"] });
      toast.success("Subscription activated!", {
        description: "You can now start creating projects.",
      });
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message);
      return handled;
    },
  });
}

// ── useMySubscription ────────────────────────────────────────────────────────

export function useMySubscription() {
  return useQuery({
    queryKey: ["my-subscription"],
    queryFn: getMySubscription,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ── useUsage ─────────────────────────────────────────────────────────────────
// Returns { subscription_id, plan_ends_at, usage: { projects, ai, estimations } }
// Each usage entry: { used, limit, unlimited, percentage }

export function useUsage() {
  return useQuery({
    queryKey: ["my-usage"],
    queryFn: getMyUsage,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds — polled frequently for progress bars
    refetchInterval: 30 * 1000, // auto-refetch every 30 seconds
  });
}
