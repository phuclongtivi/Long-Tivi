/**
 * Livestream push notifications
 *
 * Gửi 2 lần (chỉ khi user.notificationsEnabled = true):
 *  1. before_5m  — khoảng 5 phút trước giờ bắt đầu (scheduledStartAt)
 *  2. after_10m  — 10 phút sau khi phiên đã bắt đầu (startedAt)
 *
 * Web: Web Push API (VAPID)
 * Native (Capacitor/App Store): endpoint có thể là FCM/APNs token
 */

import { prisma } from './prisma';

export type NotifyKind = 'before_5m' | 'after_10m';

export function buildLiveNotificationPayload(
  kind: NotifyKind,
  live: { id: string; title?: string | null; scheduledStartAt?: Date | null; startedAt?: Date | null }
) {
  const title =
    kind === 'before_5m'
      ? 'Phúc Long Center · Sắp livestream'
      : 'Phúc Long Center · Đang livestream';

  const body =
    kind === 'before_5m'
      ? `「${live.title || 'Livestream'}」bắt đầu sau khoảng 5 phút. Mở app để không bỏ lỡ!`
      : `「${live.title || 'Livestream'}」đã diễn ra 10 phút. Vào xem ngay!`;

  return {
    title,
    body,
    data: {
      type: 'live_notification',
      kind,
      liveSessionId: live.id,
      url: `/live?session=${live.id}`,
    },
  };
}

/**
 * Gửi 1 payload tới mọi subscription của user (web push / FCM placeholder).
 * Production: gắn web-push package + VAPID keys, hoặc FCM admin SDK.
 */
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; data?: Record<string, string> }
): Promise<{ sent: number; failed: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsEnabled: true },
  });

  // Tắt thông báo → không gửi
  if (!user || !user.notificationsEnabled) {
    return { sent: 0, failed: 0 };
  }

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      // PLACEHOLDER: thay bằng web-push / FCM thực tế
      // await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh!, auth: sub.auth! } }, JSON.stringify(payload));
      console.log('[push]', userId, sub.platform, payload.title, payload.body);
      sent += 1;
    } catch (e: any) {
      failed += 1;
      // Endpoint chết → xóa subscription
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => null);
      }
    }
  }

  return { sent, failed };
}

/**
 * Quét các phiên cần gửi before_5m / after_10m.
 * Gọi từ cron mỗi phút: GET/POST /api/cron/live-notifications
 */
export async function processLiveNotificationJobs(now = new Date()) {
  const results = { before5: 0, after10: 0 };

  // --- 1) Trước 5 phút (cửa sổ 4–6 phút trước scheduledStartAt) ---
  const windowStart = new Date(now.getTime() + 4 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 6 * 60 * 1000);

  const upcoming = await prisma.liveSession.findMany({
    where: {
      scheduledStartAt: { gte: windowStart, lte: windowEnd },
      endedAt: null,
      notifyBefore5Sent: false,
    },
    take: 50,
  });

  for (const live of upcoming) {
    await notifyAllEligibleUsers(live, 'before_5m');
    await prisma.liveSession.update({
      where: { id: live.id },
      data: { notifyBefore5Sent: true },
    });
    results.before5 += 1;
  }

  // --- 2) Sau khi live 10 phút (cửa sổ startedAt 9–11 phút trước) ---
  const afterStart = new Date(now.getTime() - 11 * 60 * 1000);
  const afterEnd = new Date(now.getTime() - 9 * 60 * 1000);

  const ongoing = await prisma.liveSession.findMany({
    where: {
      startedAt: { gte: afterStart, lte: afterEnd },
      endedAt: null,
      notifyAfter10Sent: false,
    },
    take: 50,
  });

  for (const live of ongoing) {
    await notifyAllEligibleUsers(live, 'after_10m');
    await prisma.liveSession.update({
      where: { id: live.id },
      data: { notifyAfter10Sent: true },
    });
    results.after10 += 1;
  }

  return results;
}

async function notifyAllEligibleUsers(
  live: { id: string; title?: string | null; scheduledStartAt?: Date | null; startedAt?: Date | null },
  kind: NotifyKind
) {
  const payload = buildLiveNotificationPayload(kind, live);

  // User bật thông báo + có subscription
  const users = await prisma.user.findMany({
    where: {
      notificationsEnabled: true,
      pushSubscriptions: { some: {} },
    },
    select: { id: true },
    take: 5000,
  });

  for (const u of users) {
    // Không gửi trùng
    const existed = await prisma.liveNotificationLog.findUnique({
      where: {
        userId_liveSessionId_kind: {
          userId: u.id,
          liveSessionId: live.id,
          kind,
        },
      },
    });
    if (existed) continue;

    const { sent, failed } = await sendPushToUser(u.id, payload);

    await prisma.liveNotificationLog.create({
      data: {
        userId: u.id,
        liveSessionId: live.id,
        kind,
        success: sent > 0,
        error: failed > 0 && sent === 0 ? 'all_failed' : null,
      },
    });
  }
}
