import { AlertCircle, CheckCircle2, X } from "lucide-react";

type AuthFeedbackProps = {
  variant: "error" | "success";
  title: string;
  message: string;
  onDismiss?: () => void;
};

const AuthFeedback = ({
  variant,
  title,
  message,
  onDismiss,
}: AuthFeedbackProps) => {
  const isError = variant === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
        isError
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-emerald-200 bg-emerald-50 text-emerald-900"
      }`}
    >
      <Icon
        size={18}
        aria-hidden="true"
        className={`mt-0.5 shrink-0 ${
          isError ? "text-red-600" : "text-emerald-600"
        }`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-5 opacity-90">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer le message"
          className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/30"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default AuthFeedback;
