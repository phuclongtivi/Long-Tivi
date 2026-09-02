"use client";

import { useEffect, useState } from "react";
import { TERMS_CHECK, TERMS_TEXT, detectLegalLang } from "./legal-docs";
import { LegalDocModal } from "./LegalDocModal";

const KEY = "pl-terms-ok";

export function termsAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

/** Hiện sau khi user xong CCCD, chặn tiếp tục đến khi tick + Đồng ý. */
export function TermsGate({
  afterCccd,
  children,
}: {
  afterCccd: boolean;
  children?: React.ReactNode;
}) {
  const L = detectLegalLang();
  const [need, setNeed] = useState(false);
  const [tick, setTick] = useState(false);
  const [err, setErr] = useState("");
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (afterCccd && !termsAccepted()) setNeed(true);
  }, [afterCccd]);

  if (!need) return <>{children}</>;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        background: "rgba(0,0,0,.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--pl-surface,#101826)",
          color: "var(--pl-text,#fff)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>{TERMS_TEXT[L].title}</h2>
        <p style={{ fontSize: 13, opacity: 0.85 }}>
          {TERMS_TEXT[L].sections[0].b}
        </p>
        <button type="button" onClick={() => setRead(true)}>
          {L === "zh" ? "阅读全文" : L === "en" ? "Read full terms" : "Đọc toàn văn"}
        </button>
        {read && <LegalDocModal kind="terms" lang={L} onClose={() => setRead(false)} />}
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, fontSize: 13 }}>
          <input type="checkbox" checked={tick} onChange={(e) => setTick(e.target.checked)} />
          <span>{TERMS_CHECK[L].box}</span>
        </label>
        {err && <p style={{ color: "#f87171", fontSize: 12 }}>{err}</p>}
        <button
          type="button"
          className="ev-publish"
          style={{ marginTop: 12, width: "100%" }}
          onClick={() => {
            if (!tick) {
              setErr(TERMS_CHECK[L].must);
              return;
            }
            localStorage.setItem(KEY, "1");
            setNeed(false);
          }}
        >
          {TERMS_CHECK[L].btn}
        </button>
      </div>
    </div>
  );
}
