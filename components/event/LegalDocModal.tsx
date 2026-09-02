"use client";

import { useMemo, useState } from "react";
import {
  BTN_LABEL,
  GUIDE_TEXT,
  TERMS_TEXT,
  detectLegalLang,
  pdfHref,
  type LegalKind,
  type LegalLang,
} from "./legal-docs";

export function LegalDocModal({
  kind,
  lang,
  onClose,
}: {
  kind: LegalKind;
  lang?: LegalLang;
  onClose: () => void;
}) {
  const L = lang || detectLegalLang();
  const pack = kind === "guide" ? GUIDE_TEXT[L] : TERMS_TEXT[L];
  const [q, setQ] = useState("");
  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pack.sections;
    return pack.sections.filter(
      (x) => x.h.toLowerCase().includes(s) || x.b.toLowerCase().includes(s)
    );
  }, [q, pack]);

  return (
    <div
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "88vh",
          overflow: "auto",
          background: "var(--pl-surface,#101826)",
          color: "var(--pl-text,#F4F7FB)",
          borderRadius: "16px 16px 0 0",
          padding: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <b>{pack.title}</b>
          <button type="button" onClick={onClose}>Đóng</button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={BTN_LABEL[L].search}
          style={{ width: "100%", margin: "10px 0", padding: 8, borderRadius: 8 }}
        />
        {hits.map((s) => (
          <section key={s.h} style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, margin: "0 0 4px" }}>{s.h}</h3>
            <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>{s.b}</p>
          </section>
        ))}
        {!hits.length && <p style={{ fontSize: 13 }}>Không thấy mục khớp.</p>}
        <a href={pdfHref(kind, L)} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
          Tải PDF
        </a>
      </div>
    </div>
  );
}

export function LegalDocsBar() {
  const L = detectLegalLang();
  const [open, setOpen] = useState<LegalKind | null>(null);
  return (
    <>
      <div style={{ display: "flex", gap: 6 }}>
        <button type="button" onClick={() => setOpen("guide")} style={{ fontSize: 12, fontWeight: 800, height: 32, padding: "0 10px", borderRadius: 999 }}>
          {BTN_LABEL[L].guide}
        </button>
        <button type="button" onClick={() => setOpen("terms")} style={{ fontSize: 12, fontWeight: 800, height: 32, padding: "0 10px", borderRadius: 999 }}>
          {BTN_LABEL[L].terms}
        </button>
      </div>
      {open && <LegalDocModal kind={open} lang={L} onClose={() => setOpen(null)} />}
    </>
  );
}
