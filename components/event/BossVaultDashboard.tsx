"use client";

import { useMemo, useState } from "react";
import { STICKERS } from "./gifting";
import { BOSS_STOCK_EACH, bossGiveSticker, seedBossVault, stickersByTier } from "./boss-vault";
import { emptyWarehouse } from "./gifting";

export function BossVaultDashboard() {
  const [wh, setWh] = useState(() => seedBossVault());
  const [userId, setUserId] = useState("");
  const [qty, setQty] = useState("1");
  const [msg, setMsg] = useState("");
  const groups = useMemo(() => stickersByTier(), []);

  function give(id: string) {
    setMsg("");
    if (!userId.trim()) { setMsg("Nhập user nhận."); return; }
    try {
      const res = bossGiveSticker({
        bossWh: wh,
        userWh: emptyWarehouse(userId.trim()),
        stickerId: id,
        qty: Number(qty) || 1,
      });
      setWh(res.bossWh);
      setMsg(`Đã tặng ${qty} × ${id} → ${userId.trim()}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Lỗi");
    }
  }

  return (
    <section className="ev-form">
      <h3 style={{ marginTop: 0 }}>Kho quà Boss</h3>
      <p style={{ fontSize: 12 }}>Mỗi loại {BOSS_STOCK_EACH.toLocaleString("vi-VN")} cái. Tặng bất kỳ user.</p>
      <label>User nhận <input value={userId} onChange={(e) => setUserId(e.target.value)} /></label>
      <label>Số lượng <input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
      {msg && <p style={{ fontSize: 13 }}>{msg}</p>}
      {([["Cấp 1 · 1đ", groups.t1], ["Cấp 2 · 2đ", groups.t2], ["Cấp 3 · 5đ", groups.t3]] as const).map(([title, list]) => (
        <div key={title} style={{ marginTop: 12 }}>
          <b style={{ fontSize: 13 }}>{title} ({list.length})</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginTop: 6 }}>
            {list.map((s) => (
              <button key={s.id} type="button" onClick={() => give(s.id)} style={{
                border: 0, borderRadius: 10, background: "#f3eee6", padding: 4, cursor: "pointer",
              }}>
                <img src={s.imageUrl} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "contain" }} />
                <div style={{ fontSize: 9 }}>×{(wh.stickers[s.id]?.qty ?? 0).toLocaleString("vi-VN")}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
