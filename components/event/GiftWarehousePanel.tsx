"use client";

import { STICKERS, type GiftWarehouse } from "./gifting";

export function GiftWarehousePanel({ warehouse }: { warehouse: GiftWarehouse }) {
  const rows = Object.entries(warehouse.stickers);
  return (
    <section className="ev-form">
      <h3 style={{ margin: 0 }}>Kho quà</h3>
      <p style={{ fontSize: 13 }}>Tiền đã nhận: <b>{warehouse.moneyVnd.toLocaleString("vi-VN")}đ</b></p>
      <p style={{ fontSize: 13 }}>Tổng điểm sticker: <b>{warehouse.totalPoints}</b></p>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: "#666" }}>Chưa có sticker.</p>
      ) : (
        rows.map(([id, v]) => {
          const def = STICKERS.find((s) => s.id === id);
          return (
            <div key={id} className="ev-row" style={{ fontSize: 13 }}>
              <span>{def?.name ?? id}</span>
              <span>×{v.qty} · {v.points} điểm</span>
            </div>
          );
        })
      )}
    </section>
  );
}
