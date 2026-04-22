import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { getPlans, createSubscription, getMySubscription, getMyUsage, requestSwitchPlan, confirmSwitchPlan } from "@/api/subscription.service";
import { handleApiError } from "@/api/handleApiError";

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
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (planId) => createSubscription(planId),
    onSuccess: () => {
      // Invalidate subscription & usage caches so they refetch
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["my-usage"] });
      toast.success(t("toast.subscriptionActivated"), {
        description: t("toast.subscriptionActivatedDescription"),
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

export function useMySubscription(options = {}) {
  return useQuery({
    queryKey: ["my-subscription"],
    queryFn: getMySubscription,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
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
  });
}

// ── useRequestSwitch ─────────────────────────────────────────────────────────

export function useRequestSwitch() {
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (newPlanId) => requestSwitchPlan(newPlanId),
    onSuccess: (data) => {
      toast.success(t("toast.confirmationRequired"), {
        description: data?.message || t("toast.confirmationDescription"),
      });
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message);
      return handled;
    },
  });
}

// ── useConfirmSwitch ─────────────────────────────────────────────────────────

export function useConfirmSwitch() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (token) => confirmSwitchPlan(token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["my-usage"] });

      toast.success(t("toast.planSwitchedSuccess"), {
        description: data?.message || t("toast.planSwitchedDescription"),
      });
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message || t("toast.unexpectedError"));
      return handled;
    },
  });
}
