"use client";

import { useMemo, useState } from "react";
import type { GiftWarehouse } from "./gifting";
import type { UserPoints } from "./points";
import { DEFAULT_POINT_TO_VND, pointsForVnd, spendRewards, type RewardSpendKind } from "./rewards-spend";

type Props = {
  points: UserPoints;
  warehouse: GiftWarehouse;
  receiverWarehouse: GiftWarehouse;
  receiverLabel: string;
  kind?: RewardSpendKind;
  onDone?: (next: ReturnType<typeof spendRewards>) => void;
};

export function UseRewardsPanel({
  points, warehouse, receiverWarehouse, receiverLabel, kind = "peer-transfer", onDone,
}: Props) {
  const [vnd, setVnd] = useState("");
  const [err, setErr] = useState("");
  const cost = useMemo(() => pointsForVnd(Number(vnd.replace(/\D/g, "")) || 0), [vnd]);

  function apply() {
    setErr("");
    try {
      const res = spendRewards({
        spenderPoints: points,
        spenderWh: warehouse,
        receiverWh: receiverWarehouse,
        offer: { enabled: true, discountVnd: Number(vnd.replace(/\D/g, "")) || 0, pointsCost: cost },
        kind,
      });
      onDone?.(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Không dùng được điểm");
    }
  }

  return (
    <section className="ev-form">
      <h3 style={{ margin: 0 }}>Dùng điểm / quà tặng</h3>
      <p style={{ fontSize: 12, color: "var(--pl-muted,#C5D0E8)" }}>
        Ngoài livestream. Điểm như voucher: nhập số tiền trừ → hệ thống trừ điểm + chuyển quà tương ứng sang {receiverLabel}.
        Tỷ lệ mặc định 1 điểm = {DEFAULT_POINT_TO_VND.toLocaleString("vi-VN")}đ.
      </p>
      <p style={{ fontSize: 13 }}>Số dư: <b>{points.balance}</b> điểm</p>
      <label>Số tiền được trừ (VND)
        <input inputMode="numeric" value={vnd} onChange={(e) => setVnd(e.target.value)} />
      </label>
      <p style={{ fontSize: 13 }}>Điểm sẽ trừ: <b>{cost}</b></p>
      <button className="ev-publish" type="button" onClick={apply} disabled={cost <= 0}>
        Dùng điểm & chuyển quà
      </button>
      {err && <p style={{ color: "#b71c1c", fontSize: 13 }}>{err}</p>}
    </section>
  );
}
