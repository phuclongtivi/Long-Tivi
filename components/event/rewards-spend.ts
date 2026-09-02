import type { GiftWarehouse } from "./gifting";
import type { UserPoints } from "./points";

/** 1 điểm = ? VND — BTC/người bán nhập số tiền trừ, hệ thống đối chiếu điểm. */
export const DEFAULT_POINT_TO_VND = 1000;

export type RewardSpendKind = "shop-discount" | "ticket-discount" | "peer-transfer";

export type RewardOffer = {
  enabled: boolean;
  /** Số tiền VND được trừ (người tổ chức / người bán nhập) */
  discountVnd: number;
  /** Điểm cần trừ (ceil theo tỷ lệ, hoặc nhập tay) */
  pointsCost: number;
};

export function pointsForVnd(vnd: number, rate = DEFAULT_POINT_TO_VND): number {
  if (vnd <= 0) return 0;
  return Math.ceil(vnd / rate);
}

export function vndForPoints(points: number, rate = DEFAULT_POINT_TO_VND): number {
  return Math.max(0, points) * rate;
}

export function canSpend(points: UserPoints, cost: number): boolean {
  return cost > 0 && points.balance >= cost;
}

/**
 * Dùng điểm như voucher.
 * - Trừ điểm user
 * - Gỡ quà tương ứng khỏi kho người gửi
 * - Đưa quà đó vào kho người nhận (shop/BTC/user)
 */
export function spendRewards(opts: {
  spenderPoints: UserPoints;
  spenderWh: GiftWarehouse;
  receiverWh: GiftWarehouse;
  offer: RewardOffer;
  kind: RewardSpendKind;
}): {
  spenderPoints: UserPoints;
  spenderWh: GiftWarehouse;
  receiverWh: GiftWarehouse;
  movedStickerIds: string[];
} {
  if (!opts.offer.enabled) {
    return {
      spenderPoints: opts.spenderPoints,
      spenderWh: opts.spenderWh,
      receiverWh: opts.receiverWh,
      movedStickerIds: [],
    };
  }
  const cost = opts.offer.pointsCost;
  if (!canSpend(opts.spenderPoints, cost)) {
    throw new Error("Không đủ điểm thưởng.");
  }

  const moved: string[] = [];
  let remain = cost;
  const nextStickers = { ...opts.spenderWh.stickers };
  const recvStickers = { ...opts.receiverWh.stickers };

  const entries = Object.entries(nextStickers).sort((a, b) => b[1].points - a[1].points);
  for (const [id, row] of entries) {
    if (remain <= 0) break;
    const unit = row.qty > 0 ? Math.max(1, Math.floor(row.points / row.qty)) : row.points;
    let take = 0;
    while (take < row.qty && remain > 0) {
      take += 1;
      remain -= unit;
      moved.push(id);
    }
    const leftQty = row.qty - take;
    if (leftQty <= 0) delete nextStickers[id];
    else nextStickers[id] = { qty: leftQty, points: Math.max(0, row.points - unit * take) };

    if (take > 0) {
      const cur = recvStickers[id] ?? { qty: 0, points: 0 };
      recvStickers[id] = { qty: cur.qty + take, points: cur.points + unit * take };
    }
  }

  const nextPts: UserPoints = {
    ...opts.spenderPoints,
    balance: opts.spenderPoints.balance - cost,
    spent: opts.spenderPoints.spent + cost,
    ledger: [
      {
        id: `PT-SPEND-${Date.now()}`,
        userId: opts.spenderPoints.userId,
        delta: -cost,
        reason: "redeem",
        createdAt: new Date().toISOString(),
      },
      ...opts.spenderPoints.ledger,
    ],
  };

  return {
    spenderPoints: nextPts,
    spenderWh: {
      ...opts.spenderWh,
      stickers: nextStickers,
      totalPoints: Math.max(0, opts.spenderWh.totalPoints - cost),
    },
    receiverWh: {
      ...opts.receiverWh,
      stickers: recvStickers,
      totalPoints: opts.receiverWh.totalPoints + (cost - Math.max(0, remain)),
    },
    movedStickerIds: moved,
  };
}
