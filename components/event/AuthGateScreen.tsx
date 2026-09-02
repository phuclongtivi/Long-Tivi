"use client";

import { useState } from "react";
import { TermsGate } from "./TermsGate";
import { emailOk, passOk } from "./email-auth";
import {
  needsCccd,
  phoneOk,
  saveCccdOnAccount,
  sessionAccount,
  upsertAccount,
  type AccountBundle,
  type LoginMethod,
} from "./account-links";
import { isCccdComplete } from "./gift-unlock";

const TAB_BTN: { id: "quick" | "email" | "phone"; label: string }[] = [
  { id: "quick", label: "Nhanh" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Số điện thoại" },
];

export function AuthGateScreen({ onReady }: { onReady?: (acc: AccountBundle) => void }) {
  const [tab, setTab] = useState<"phone" | "email" | "quick">("quick");
  const [mode, setMode] = useState<"login" | "register" | "cccd">("register");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [fullName, setFullName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [err, setErr] = useState("");
  const [acc, setAcc] = useState<AccountBundle | null>(() => sessionAccount());

  async function finish(a: AccountBundle) {
    setAcc(a);
    if (needsCccd(a)) setMode("cccd");
    else onReady?.(a);
  }

  async function submitPhoneEmail() {
    setErr("");
    if (mode === "register" && pass !== pass2) {
      setErr("Mật khẩu nhập lại không khớp.");
      return;
    }
    if (!passOk(pass)) {
      setErr("Mật khẩu tối thiểu 8 ký tự.");
      return;
    }
    if (tab === "phone") {
      if (!phoneOk(phone)) {
        setErr("Số điện thoại không hợp lệ.");
        return;
      }
      const a = upsertAccount({
        method: "phone",
        handle: phone.replace(/\D/g, ""),
        phone: phone.replace(/\D/g, ""),
        passHash: pass,
      });
      await finish(a);
      return;
    }
    if (!emailOk(email)) {
      setErr("Email không hợp lệ.");
      return;
    }
    const a = upsertAccount({
      method: "email",
      handle: email.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      passHash: pass,
    });
    await finish(a);
  }

  function quick(method: LoginMethod) {
    const handle = method + "-" + Date.now();
    const a = upsertAccount({ method, handle, displayName: method });
    void finish(a);
  }

  function submitCccd() {
    const r = saveCccdOnAccount({ fullName, idNumber });
    if (!r.ok || !r.acc) {
      setErr(r.error || "CCCD chưa đủ.");
      return;
    }
    setAcc(r.acc);
    onReady?.(r.acc);
  }

  if (acc && mode === "cccd") {
    return (
      <div className="ev-form pl-auth-form" style={{ padding: 16 }}>
        <h2>Cập nhật căn cước</h2>
        {err ? <p className="pl-auth-err">{err}</p> : null}
        <label>
          Họ tên trên CCCD
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </label>
        <label>
          Số CCCD
          <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} inputMode="numeric" />
        </label>
        <button type="button" className="ev-publish" onClick={submitCccd}>
          Lưu CCCD
        </button>
        {isCccdComplete(acc.cccd) && <TermsGate onAccept={() => onReady?.(acc)} />}
      </div>
    );
  }

  return (
    <div className="ev-form pl-auth-form" style={{ padding: 16 }}>
      <h2>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
      <div className="pl-auth-tabs">
        {TAB_BTN.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "pl-auth-tab on" : "pl-auth-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {err ? <p className="pl-auth-err">{err}</p> : null}
      {tab !== "quick" && (
        <>
          {tab === "phone" ? (
            <label>
              Số điện thoại
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                placeholder="09…"
              />
            </label>
          ) : (
            <label>
              Email
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </label>
          )}
          <label>
            Mật khẩu
            <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" />
          </label>
          {mode === "register" && (
            <label>
              Nhập lại mật khẩu
              <input value={pass2} onChange={(e) => setPass2(e.target.value)} type="password" />
            </label>
          )}
          <button type="button" className="ev-publish" onClick={() => void submitPhoneEmail()}>
            {mode === "register" ? "Đăng ký" : "Đăng nhập"}
          </button>
        </>
      )}
      {tab === "quick" && (
        <div className="pl-auth-quick">
          <p className="pl-auth-quick-title">Đăng nhập nhanh bằng tài khoản mạng</p>
          <button type="button" className="pl-auth-social" onClick={() => quick("google")}>
            Google
          </button>
          <button type="button" className="pl-auth-social" onClick={() => quick("facebook")}>
            Facebook
          </button>
          <button type="button" className="pl-auth-social" onClick={() => quick("zalo")}>
            Zalo
          </button>
        </div>
      )}
      <p className="pl-auth-switch">
        {mode === "register" ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
        <button
          type="button"
          className="pl-auth-link"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
        >
          {mode === "register" ? "Đăng nhập" : "Đăng ký"}
        </button>
      </p>
    </div>
  );
}
