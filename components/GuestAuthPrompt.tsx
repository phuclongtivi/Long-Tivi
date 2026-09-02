"use client";

import { AuthGateScreen } from "@/components/event/AuthGateScreen";

export default function GuestAuthPrompt({
  open,
  callbackUrl = "/",
  onClose,
  reason = "create-live",
}: {
  open?: boolean;
  callbackUrl?: string;
  onClose?: () => void;
  reason?: "create-live" | "general";
}) {
  if (open === false) return null;
  const hint =
    reason === "create-live"
      ? "Tạo livestream trên Phúc Long Center cần tài khoản. Đăng nhập hoặc đăng ký bằng số điện thoại, email, hoặc đăng nhập nhanh. Bỏ qua thì vẫn xem phòng live và tường Home — không tạo live, không bán, không tặng quà."
      : "Đăng nhập để dùng đủ chức năng trên Phúc Long Center. Chưa đăng nhập vẫn xem phòng live và tường Home.";
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="pl-auth-panel"
        style={{
          width: "min(420px, 100%)",
          maxHeight: "90vh",
          overflow: "auto",
          background: "var(--pl-bg)",
          color: "var(--pl-text)",
          border: "2px solid var(--pl-frame)",
          boxShadow: "0 0 0 1px var(--pl-frame-soft)",
          borderRadius: 16,
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            border: 0,
            background: "transparent",
            color: "var(--pl-text)",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <p style={{ margin: "40px 16px 8px", fontSize: 14, lineHeight: 1.45, color: "var(--pl-text)" }}>{hint}</p>
        <AuthGateScreen
          onReady={() => {
            if (callbackUrl && callbackUrl !== "/") window.location.href = callbackUrl;
            else window.location.reload();
          }}
        />
        <p style={{ textAlign: "center", padding: "0 16px 16px", fontSize: 13 }}>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: 0, cursor: "pointer", color: "var(--pl-text)" }}
          >
            Để sau — tiếp tục xem
          </button>
        </p>
      </div>
    </div>
  );
}
