/**
 * Phân quyền tab & tính năng theo hạng
 * Khách: xem như user — không chặn tab; nhắc đăng nhập khi chuyển màn (GuestNavLink soft)
 */

import { normalizeRank, permissionsForRank, type AppRank } from '@/lib/rank';

export type TabId = 'home' | 'events' | 'store' | 'favorites' | 'account';

export function canAccessTab(
  _tab: TabId,
  _opts: { loggedIn: boolean; rank?: string | null }
): { allowed: boolean; reason?: string } {
  // Không chặn khách — mọi tab đều xem được
  return { allowed: true };
}

export function canStartLivestream(rank?: string | null, loggedIn?: boolean) {
  // Guest không được tạo live; mọi tài khoản đã đăng nhập đều được
  if (loggedIn === false) return false;
  return permissionsForRank(rank).canLivestream;
}

export function canOrganizeOnHome(rank?: string | null) {
  return permissionsForRank(rank).canShowLiveOnHome;
}

export function rankBadge(rank?: string | null, loggedIn?: boolean): string {
  if (!loggedIn) return 'Khách';
  const r = normalizeRank(rank);
  if (r === 'artist') return 'Nghệ sĩ';
  if (r === 'reporter') return 'Phóng viên';
  return 'User';
}

export type { AppRank };
