import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { getEmailFromJwt, getRoleFromJwt } from "@/lib/api";

export default function GoogleAuthCallback() {
  const { login } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Đang xử lý đăng nhập Google...");

  useEffect(() => {
    console.log("[GoogleAuthCallback] useEffect mounted. Search:", window.location.search);
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const email = searchParams.get("email");

    if (token) {
      const decodedEmail =
        getEmailFromJwt(token) || email || "google-user@manto.local";
      const userRole = getRoleFromJwt(token);
      console.log("[GoogleAuthCallback] Found token. userRole:", userRole, "decodedEmail:", decodedEmail);

      console.log("[GoogleAuthCallback] Calling login()...");
      login(decodedEmail, token);
      setStatus("success");
      setMessage("Đăng nhập Google thành công. Đang chuyển hướng...");

      console.log("[GoogleAuthCallback] Scheduling redirect timer in 800ms...");
      const redirectTimer = window.setTimeout(() => {
        const lowerRole = userRole?.toLowerCase() || "";
        const targetHash =
          lowerRole === "manager"
            ? "#/roles/manager"
            : lowerRole === "customer"
            ? "#/orders"
            : lowerRole === "superadmin"
            ? "#/super"
            : "#/admin";
        console.log("[GoogleAuthCallback] Timer fired! Redirecting via history API to:", targetHash);
        
        // Use HTML5 History API to change pathname to / and set the hash, removing the token query param
        window.history.replaceState(null, "", "/" + targetHash);
        
        // Dispatch events to trigger AppRouter's state updates
        window.dispatchEvent(new Event("popstate"));
        window.dispatchEvent(new Event("hashchange"));
      }, 800);

      return () => {
        console.log("[GoogleAuthCallback] Cleaning up redirect timer:", redirectTimer);
        window.clearTimeout(redirectTimer);
      };
    }

    console.log("[GoogleAuthCallback] No token. Error:", error);
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
      const redirectUrl = window.location.origin + "/#/login";
      console.log("[GoogleAuthCallback] Error Timer fired! Redirecting to:", redirectUrl);
      window.location.href = redirectUrl;
    }, 2200);

    return () => {
      console.log("[GoogleAuthCallback] Cleaning up error redirect timer:", redirectTimer);
      window.clearTimeout(redirectTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
