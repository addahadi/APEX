import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

import { loginUser, registerUser, forgotPassword, getMe, logoutUser } from "@/api/auth.service";
import { handleApiError } from "@/api/handleApiError";
import { setTokens, clearTokens, getRefreshToken } from "@/utils/token";

// ── useLogin ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: (variables) => loginUser(variables),
    onSuccess: (data, variables) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(["me"], data.user);
      const role = String(data?.user?.role || "").toUpperCase();

      // If a specific redirect path was requested (e.g. from RequireAuth state)
      if (variables.redirectTo) {
        toast.success(t("toast.loginSuccess"), {
          description: t("toast.loginDescription"),
        });
        navigate(variables.redirectTo, { replace: true });
        return;
      }

      // Admins should always land on admin dashboard.
      if (role === "ADMIN") {
        toast.success(t("toast.loginSuccess"), {
          description: t("toast.loginDescription"),
        });
        navigate("/admin", { replace: true });
        return;
      }

      // Backend now returns subscription snapshot with login.
      // If null → user hasn't subscribed yet → send to choose-plan.
      if (data.subscription) {
        queryClient.setQueryData(["my-subscription"], data.subscription);
        toast.success(t("toast.loginSuccess"), {
          description: t("toast.loginDescription"),
        });
        navigate("/dashboard", { replace: true });
      } else {
        toast.success(t("toast.loginSuccess"), {
          description: t("toast.loginNoPlan"),
        });
        navigate("/choose-plan", { replace: true });
      }
    },
    onError: (err) => {
      const handled = handleApiError(err);
      if (handled.type !== "field") {
        toast.error(handled.message);
      }
      return handled;
    },
  });
}

// ── useRegister ──────────────────────────────────────────────────────────────

export function useRegister() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(["me"], data.user);
      // New user always has subscription: null → go to choose-plan
      toast.success(t("toast.accountCreated"), {
        description: t("toast.accountCreatedDescription"),
      });
      navigate("/choose-plan", { replace: true });
    },
    onError: (err) => {
      const handled = handleApiError(err);
      if (handled.type !== "field") {
        toast.error(handled.message);
      }
      return handled;
    },
  });
}

// ── useForgotPassword ────────────────────────────────────────────────────────

export function useForgotPassword() {
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      // data.message is already localised by the backend
      toast.success(t("toast.checkYourEmail"), {
        description: data.message || t("toast.resetLinkSent"),
      });
    },
    onError: (err) => {
      const handled = handleApiError(err);
      toast.error(handled.message);
      return handled;
    },
  });
}

// ── useMe ────────────────────────────────────────────────────────────────────

export function useMe(options = {}) {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// ── useLogout ────────────────────────────────────────────────────────────────

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation("common");

  return useMutation({
    mutationFn: () => {
      const refreshToken = getRefreshToken();
      return logoutUser(refreshToken);
    },
    onSettled: () => {
      // Always clear tokens and redirect regardless of success/failure
      clearTokens();
      queryClient.clear();
      navigate("/auth/login", { replace: true });
      toast.success(t("toast.logoutSuccess"));
    },
  });
}
