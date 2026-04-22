import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getLoginSchema } from "@/schemas/auth.schema";
import { useLogin } from "@/hooks/useAuth";
import { handleApiError } from "@/api/handleApiError";

const Login = () => {
  const { t } = useTranslation("auth");
  const location = useLocation();
  const loginMutation = useLogin();

  // Where to go after login?
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search}${from.hash}` : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const loginSchema = getLoginSchema(t);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    loginMutation.mutate({ email, password, redirectTo }, {
      onError: (err) => {
        const handled = handleApiError(err);
        if (handled.type === "field") {
          setErrors(handled.fieldErrors);
        } else {
          setServerError(handled.message);
        }
      },
    });
  };

  const handleChange = (field, setter) => (e) => {
    setter(e.target.value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setServerError("");
  };

  return (
    <div className="w-full max-w-sm">
      {/* Mobile logo */}
      <div className="mb-10 flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <span className="text-sm font-bold text-white">B</span>
        </div>
        <span className="text-lg font-bold text-slate-900">BuildEst</span>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
          {t("login.title")}
        </h1>
        <p className="text-sm text-slate-500">
          {t("login.subtitle")}
        </p>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
            {t("login.email")}
          </label>
          <div className="relative">
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={handleChange("email", setEmail)}
              placeholder={t("login.emailPlaceholder")}
              className={`w-full rounded-lg border bg-slate-50 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
              {t("login.password")}
            </label>
            <Link to="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
              {t("login.forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handleChange("password", setPassword)}
              placeholder="••••••••"
              className={`w-full rounded-lg border bg-slate-50 py-3 pl-4 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                  : "border-slate-200 focus:border-primary focus:ring-primary/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5">
          <input
            id="login-remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-primary"
          />
          <label htmlFor="login-remember" className="text-sm text-slate-600">
            {t("login.rememberMe")}
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {t("login.loggingIn")}
            </>
          ) : (
            <>{t("login.submit")} <span>→</span></>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-1 border-t border-slate-200" />
          <span className="mx-4 text-xs text-slate-400">{t("login.or")}</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500">
          {t("login.noAccount")}{" "}
          <Link to="/auth/register" className="font-semibold text-primary hover:underline">
            {t("login.createAccount")}
          </Link>
        </p>
      </form>

      {/* Policy links */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <Link to="#" className="text-xs text-slate-400 hover:text-slate-600">{t("login.privacyPolicy")}</Link>
        <span className="text-slate-300">•</span>
        <Link to="#" className="text-xs text-slate-400 hover:text-slate-600">{t("login.termsOfService")}</Link>
      </div>
    </div>
  );
};

export default Login;