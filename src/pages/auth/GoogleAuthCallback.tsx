import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getEmailFromJwt } from "@/lib/api";

export default function GoogleAuthCallback() {
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Đang xử lý đăng nhập Google...");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const email = searchParams.get("email");

    if (token) {
      const decodedEmail =
        getEmailFromJwt(token) || email || "google-user@manto.local";

      login(decodedEmail, token);
      setStatus("success");
      setMessage("Đăng nhập Google thành công. Đang chuyển hướng...");

      const redirectTimer = window.setTimeout(() => {
        window.location.hash = "#/admin";
      }, 1200);

      return () => window.clearTimeout(redirectTimer);
    }

    setStatus("error");

    if (error === "not_registered") {
      setMessage("Email Google này chưa được đăng ký trong hệ thống.");
    } else if (error === "google_denied") {
      setMessage("Bạn đã hủy quyền đăng nhập Google.");
    } else if (
      error === "token_failed" ||
      error === "userinfo_failed" ||
      error === "server_error"
    ) {
      setMessage("Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.");
    } else {
      setMessage("Không tìm thấy token đăng nhập Google hợp lệ.");
    }

    const redirectTimer = window.setTimeout(() => {
      window.location.hash = "#/login";
    }, 2200);

    return () => window.clearTimeout(redirectTimer);
  }, [login]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-200/90 text-slate-950">
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : null}
          {status === "success" ? <CheckCircle2 className="h-5 w-5" /> : null}
          {status === "error" ? <TriangleAlert className="h-5 w-5" /> : null}
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Google Authentication
        </h1>
        <p className="mt-2 text-sm text-slate-300">{message}</p>
      </div>
    </main>
  );
}
