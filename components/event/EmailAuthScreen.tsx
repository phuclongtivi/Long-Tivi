"use client";

import { useState } from "react";
import { TermsGate } from "./TermsGate";
import {
  emailOk,
  loginEmail,
  passOk,
  registerEmail,
  saveCccdForSession,
  sessionUser,
  type EmailUser,
} from "./email-auth";
import { isCccdComplete } from "./gift-unlock";

type Mode = "login" | "register" | "cccd";

export function EmailAuthScreen({
  onReady,
}: {
  onReady?: (user: EmailUser) => void;
}) {
  const [mode, setMode] = useState<Mode>("register");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [err, setErr] = useState("");
  const [user, setUser] = useState<EmailUser | null>(() => sessionUser());

  async function submitAuth() {
    setErr("");
    if (!emailOk(email)) {
      setErr("Email không hợp lệ.");
      return;
    }
    if (!passOk(pass)) {
      setErr("Mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    if (mode === "register") {
      if (pass !== pass2) {
        setErr("Mật khẩu nhập lại không khớp.");
        return;
      }
      const r = await registerEmail(email, pass);
      if (!r.ok || !r.user) {
        setErr(r.error || "Không đăng ký được.");
        return;
      }
      setUser(r.user);
      setMode("cccd");
      return;
    }
    const r = await loginEmail(email, pass);
    if (!r.ok || !r.user) {
      setErr(r.error || "Không đăng nhập được.");
      return;
    }
    setUser(r.user);
    if (!isCccdComplete(r.user.cccd)) setMode("cccd");
    else onReady?.(r.user);
  }

  function submitCccd() {
    const r = saveCccdForSession({ fullName, idNumber });
    if (!r.ok || !r.user) {
      setErr(r.error || "CCCD chưa đủ.");
      return;
    }
    setUser(r.user);
    onReady?.(r.user);
  }

  if (user && mode === "cccd") {
    return (
      <div className="ev-form" style={{ padding: 16 }}>
        <h2>Cập nhật căn cước</h2>
        <p style={{ fontSize: 13, opacity: 0.75 }}>
          Tài khoản email mới phải điền CCCD giống user mới khác rồi mới dùng app.
        </p>
        <label className="ev-req">
          <span>Họ tên trên CCCD *</span>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label className="ev-req">
          <span>Số CCCD *</span>
          <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} inputMode="numeric" />
        </label>
        {err && <p style={{ color: "#b91c1c", fontWeight: 700 }}>{err}</p>}
        <button type="button" className="ev-publish" onClick={submitCccd}>
          Lưu CCCD
        </button>
        <TermsGate afterCccd={false} />
      </div>
    );
  }

  if (user && isCccdComplete(user.cccd)) {
    return <TermsGate afterCccd />;
  }

  return (
    <form
      className="ev-form"
      style={{ padding: 16 }}
      onSubmit={(e) => {
        e.preventDefault();
        submitAuth();
      }}
    >
      <h2>{mode === "register" ? "Đăng ký tài khoản" : "Đăng nhập"}</h2>
      <p style={{ fontSize: 13, opacity: 0.75 }}>Email + mật khẩu tự tạo. Sau đăng ký phải cập nhật CCCD.</p>
      <label className="ev-req">
        <span>Email *</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className="ev-req">
        <span>Mật khẩu * (tối thiểu 8 ký tự)</span>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} />
      </label>
      {mode === "register" && (
        <label className="ev-req">
          <span>Nhập lại mật khẩu *</span>
          <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} autoComplete="new-password" />
        </label>
      )}
      {err && <p style={{ color: "#b91c1c", fontWeight: 700 }}>{err}</p>}
      <button type="submit" className="ev-publish">
        {mode === "register" ? "Đăng ký" : "Đăng nhập"}
      </button>
      <button
        type="button"
        onClick={() => {
          setErr("");
          setMode(mode === "register" ? "login" : "register");
        }}
      >
        {mode === "register" ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
      </button>
    </form>
  );
}
