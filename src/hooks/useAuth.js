import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { loginUser, registerUser, forgotPassword, getMe, logoutUser } from "@/api/auth.service";
import { handleApiError } from "@/api/handelApiError";
import { setTokens, clearTokens, getRefreshToken } from "@/utils/token";

// ── useLogin ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(["me"], data.user);

      // Backend now returns subscription snapshot with login.
      // If null → user hasn't subscribed yet → send to choose-plan.
      if (data.subscription) {
        queryClient.setQueryData(["my-subscription"], data.subscription);
        toast.success("Welcome back!", {
          description: "You have been logged in successfully.",
        });
        navigate("/dashboard", { replace: true });
      } else {
        toast.success("Welcome back!", {
          description: "Please choose a plan to continue.",
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

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(["me"], data.user);
      // New user always has subscription: null → go to choose-plan
      toast.success("Account created!", {
        description: "Please choose a plan to get started.",
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
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success("Check your email", {
        description: data.message || "If the email exists, a reset link was sent.",
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
      toast.success("Logged out successfully");
    },
  });
}
