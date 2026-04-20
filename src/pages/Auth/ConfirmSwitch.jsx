import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useConfirmSwitch } from "@/hooks/useSubscription";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const ConfirmSwitch = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const confirmSwitchMutation = useConfirmSwitch();
  
  // Prevent double-mounting executing twice
  const executed = useRef(false);

  useEffect(() => {
    if (!token) {
      navigate("/dashboard");
      return;
    }

    if (!executed.current) {
      executed.current = true;
      confirmSwitchMutation.mutate(token);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  if (confirmSwitchMutation.isError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
            Switch Failed
          </h2>
          <p className="text-slate-500 mb-6">
            {confirmSwitchMutation.error?.response?.data?.message || "We couldn't confirm your subscription switch. The link may have expired."}
          </p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-md">
        <div className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
           <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Processing Switch...</h2>
          <p className="text-slate-500">Please wait while we confirm your new subscription plan and allocate your resources.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSwitch;
