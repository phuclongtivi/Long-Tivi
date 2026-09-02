"use client";

import { useState } from "react";
import { sessionAccount, updateEditableAccount, type AccountBundle } from "./account-links";

export function LinkedAccountsPanel({ initial }: { initial?: AccountBundle | null }) {
  const [acc, setAcc] = useState<AccountBundle | null>(initial ?? sessionAccount());
  const [edit, setEdit] = useState(false);
  const [displayName, setDisplayName] = useState(acc?.displayName || "");
  const [email, setEmail] = useState(acc?.email || "");
  const [phone, setPhone] = useState(acc?.phone || "");

  if (!acc) return null;

  function save() {
    const next = updateEditableAccount({ displayName, email, phone });
    if (next) setAcc(next);
    setEdit(false);
  }

  const dim: React.CSSProperties = { opacity: 0.45, pointerEvents: "none" };

  return (
    <section style={{ background: "var(--pl-surface)", borderRadius: 16, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Đăng nhập đã lưu</h3>
        {!edit ? (
          <button type="button" onClick={() => setEdit(true)}>
            Edit
          </button>
        ) : (
          <button type="button" onClick={save}>
            Lưu
          </button>
        )}
      </div>
      <p style={{ fontSize: 12, color: "#666" }}>Mờ = lần đăng nhập trước. Không Edit thì không sửa được. CCCD đã khóa.</p>

      <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13 }}>
        Tên hiển thị
        <input value={displayName} disabled={!edit} onChange={(e) => setDisplayName(e.target.value)} style={!edit ? dim : undefined} />
      </label>
      <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13 }}>
        Email đã liên kết
        <input value={email} disabled={!edit} onChange={(e) => setEmail(e.target.value)} style={!edit ? dim : undefined} />
      </label>
      <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13 }}>
        SĐT đã liên kết
        <input value={phone} disabled={!edit} onChange={(e) => setPhone(e.target.value)} style={!edit ? dim : undefined} />
      </label>
      <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13 }}>
        Họ tên CCCD (không sửa)
        <input value={acc.cccd?.fullName || ""} disabled style={dim} />
      </label>
      <label style={{ display: "grid", gap: 4, marginTop: 8, fontSize: 13 }}>
        Số CCCD (không sửa)
        <input value={acc.cccd?.idNumber || ""} disabled style={dim} />
      </label>
      <p style={{ fontSize: 12, marginTop: 10 }}>Phương thức:</p>
      <ul style={{ fontSize: 13, opacity: 0.7 }}>
        {acc.methods.map((m) => (
          <li key={m.method + m.handle}>
            {m.method}: {m.handle}
          </li>
        ))}
      </ul>
    </section>
  );
}
