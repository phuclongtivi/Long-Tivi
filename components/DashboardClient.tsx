'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NotificationToggle } from './NotificationToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import MoneyLedgerPanel from './MoneyLedgerPanel';
import BankAccountForm from './BankAccountForm';
import MarketplaceGuidePanel from './MarketplaceGuidePanel';
import { BossVaultDashboard } from '@/components/event/BossVaultDashboard';
import { UserIdentityPanel } from '@/components/event/UserIdentityPanel';
import { CccdAwakenAi } from '@/components/event/CccdAwakenAi';
import { notepadIdLine, NOTEPAD_FONT } from '@/components/event/user-identity';
import type { AiCompanion } from '@/components/event/ai-companion';
import BottomNav from '@/components/BottomNav';
import MixerPresetMenuCard from '@/components/MixerPresetMenuCard';
import { ThemeToggle } from '@/components/event/ThemeToggle';
import { AiCreditBar } from '@/components/event/AiCreditBar';
import { GiftVault } from '@/components/event/GiftVault';
import { defaultCredit } from '@/components/event/ai-sticker-quota';
import { AppCopyright } from '@/components/event/AppCopyright';
import { LegalDocsBar } from '@/components/event/LegalDocModal';
import { TermsGate } from '@/components/event/TermsGate';
import type { AppRole } from '@/components/event/roles';
import { MenuAccordion } from '@/components/event/MenuAccordion';
import { DashboardRulesCard } from '@/components/event/DashboardRulesCard';
import { useLanguage } from './LanguageProvider';
import PersonalAgentPanel from '@/components/PersonalAgentPanel';
import BossCommandCenter from '@/components/BossCommandCenter';
import DeviceConnectPanel from '@/components/DeviceConnectPanel';
import LongStudioApps from '@/components/LongStudioApps';

type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
  rank: string;
  trustLevel: number;
  canOrganizeLive: boolean;
  idCardVerified: boolean;
  fullName: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  ethWalletAddress?: string | null;
  ethWalletLabel?: string | null;
  attendedLives: number;
  organizedLives: number;
  highViewLives: number;
};

type LiveInfo = {
  id: string;
  title: string | null;
  viewerCount: number;
  isPublic: boolean;
  requireIdCard: boolean;
  startedAt: string;
  endedAt: string | null;
};

function ShippingAddressForm() {
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setMsg('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        // Reverse geocode qua Nominatim (OpenStreetMap) – miễn phí, giống map
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'vi' } }
          );
          const data = await res.json();
          const display = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setAddress(display);
          setMsg('Đã lấy vị trí. Bấm Lưu để ghi địa chỉ giao hàng.');
        } catch {
          setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          setMsg('Đã lấy tọa độ. Bạn có thể sửa địa chỉ rồi Lưu.');
        }
        setLocating(false);
      },
      () => {
        setMsg('Không lấy được vị trí. Hãy cho phép quyền định vị.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const save = async () => {
    if (!address.trim()) {
      setMsg('Vui lòng nhập hoặc định vị địa chỉ.');
      return;
    }
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingAddress: address.trim(),
        shippingLat: lat ?? undefined,
        shippingLng: lng ?? undefined,
      }),
    });
    const data = await res.json();
    setMsg(data.message || data.error || 'Đã lưu địa chỉ giao hàng.');
  };

  const mapUrl =
    lat != null && lng != null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`
      : null;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
          style={{ backgroundColor: '#8B4513', color: 'var(--pl-surface)' }}
        >
          {locating ? 'Đang định vị...' : '📍 Dùng vị trí hiện tại'}
        </button>
        {lat != null && lng != null && (
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 rounded-lg text-xs font-bold"
            style={{ background: 'var(--pl-cta)', color: 'var(--pl-bg)' }}
          >
            Mở Google Maps
          </a>
        )}
      </div>
      <textarea
        rows={3}
        placeholder="Địa chỉ giao hàng đầy đủ..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        style={{ borderColor: '#D4C9B5', color: '#1A1A1A', backgroundColor: 'var(--pl-bg)' }}
      />
      {mapUrl && (
        <iframe
          title="Bản đồ vị trí giao hàng"
          src={mapUrl}
          className="w-full h-48 rounded-lg border"
          style={{ borderColor: '#D4C9B5' }}
        />
      )}
      <button
        type="button"
        onClick={save}
        className="px-4 py-2 rounded-lg text-sm font-bold"
        style={{ background: 'var(--pl-cta)', color: 'var(--pl-bg)' }}
      >
        Lưu địa chỉ giao hàng
      </button>
      {msg && <p className="text-xs font-semibold">{msg}</p>}
    </div>
  );
}

function ProfileForm({
  initialName,
  initialId,
  hasQr,
}: {
  initialName: string;
  initialId: string;
  hasQr: boolean;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [idNumber, setIdNumber] = useState(initialId);
  const [social, setSocial] = useState({
    facebook: '',
    tiktok: '',
    instagram: '',
    youtube: '',
    zalo: '',
  });
  const [qr, setQr] = useState('');
  const [msg, setMsg] = useState('');
  const [awakened, setAwakened] = useState(false);
  const [spawned, setSpawned] = useState<AiCompanion | null>(null);

  const save = async () => {
    if (!fullName.trim() || !idNumber.trim()) {
      setMsg('Vui lòng nhập Họ tên và Số CCCD (2 trường bắt buộc).');
      return;
    }
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fullName.trim(),
        idNumber: idNumber.trim(),
        socialFacebook: social.facebook || undefined,
        socialTiktok: social.tiktok || undefined,
        socialInstagram: social.instagram || undefined,
        socialYoutube: social.youtube || undefined,
        socialZalo: social.zalo || undefined,
      }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    if (data.user?.qrCodeData) setQr(data.user.qrCodeData);
    if (res.ok) setAwakened(true);
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          placeholder="Họ tên đầy đủ *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border rounded-lg px-3 py-2"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
        <input
          placeholder="Số căn cước công dân *"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="border rounded-lg px-3 py-2"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
      </div>
      <p className="text-xs font-semibold" style={{ color: 'var(--pl-text)' }}>Tài khoản liên kết (tuỳ chọn):</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {(['facebook', 'tiktok', 'instagram', 'youtube', 'zalo'] as const).map((k) => (
          <input
            key={k}
            placeholder={k.charAt(0).toUpperCase() + k.slice(1) + ' (URL hoặc username)'}
            value={social[k]}
            onChange={(e) => setSocial({ ...social, [k]: e.target.value })}
            className="border rounded-lg px-3 py-2 text-xs"
            style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
          />
        ))}
      </div>
      <button type="button" onClick={save} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--pl-cta)', color: 'var(--pl-bg)' }}>
        Lưu & tạo mã QR
      </button>
      {(qr || hasQr) && (
        <div className="text-xs p-3 rounded-lg" style={{ background: 'var(--pl-surface)' }}>
          <p className="font-bold mb-1">Mã QR cá nhân (tặng quà + hoa hồng):</p>
          <p className="break-all font-mono">{qr || 'Đã có QR trên hệ thống'}</p>
        </div>
      )}
      {msg && <p className="text-xs font-semibold">{msg}</p>}
      <CccdAwakenAi
        userName={fullName}
        justCompleted={awakened}
        companion={spawned}
        onSpawn={setSpawned}
      />
    </div>
  );
}

function RelationsForm() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [relationType, setRelationType] = useState<'family' | 'friend'>('friend');
  const [label, setLabel] = useState('');
  const [extName, setExtName] = useState('');
  const [extPlatform, setExtPlatform] = useState('facebook');
  const [msg, setMsg] = useState('');

  const search = async () => {
    if (!q.trim()) return;
    const res = await fetch(`/api/relations?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data.results || []);
  };

  const addFromApp = async (relatedUserId: string) => {
    const res = await fetch('/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relatedUserId, relationType, relationLabel: label || undefined }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };

  const addExternal = async () => {
    if (!extName.trim()) return;
    const res = await fetch('/api/relations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relationType,
        relationLabel: label || undefined,
        externalName: extName,
        externalPlatform: extPlatform,
      }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="flex gap-2 flex-wrap">
        <select
          value={relationType}
          onChange={(e) => setRelationType(e.target.value as any)}
          className="border rounded-lg px-2 py-1.5"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
        >
          <option value="family">Họ hàng</option>
          <option value="friend">Bạn bè</option>
        </select>
        <input
          placeholder="Ghi chú (anh, chị, bạn thân...)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="border rounded-lg px-2 py-1.5 flex-1 min-w-[120px]"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
      </div>
      <div className="flex gap-2">
        <input
          placeholder="Tìm user trên Phúc Long..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border rounded-lg px-2 py-1.5 flex-1"
          style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
        />
        <button type="button" onClick={search} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--pl-cta)', color: 'var(--pl-bg)' }}>
          Tìm
        </button>
      </div>
      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((u) => (
            <li key={u.id} className="flex justify-between items-center text-xs p-2 rounded" style={{ background: 'var(--pl-surface)' }}>
              <span>{u.fullName || u.name || u.email}</span>
              <button type="button" onClick={() => addFromApp(u.id)} className="px-2 py-1 rounded font-semibold" style={{ backgroundColor: '#8B4513', color: 'var(--pl-surface)' }}>
                Thêm
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t pt-3" style={{ borderColor: '#D4C9B5' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--pl-text)' }}>Hoặc lưu liên hệ ngoài app (nếu chưa có tài khoản Long):</p>
        <div className="flex flex-wrap gap-2">
          <select
            value={extPlatform}
            onChange={(e) => setExtPlatform(e.target.value)}
            className="border rounded-lg px-2 py-1.5 text-xs"
            style={{ borderColor: '#D4C9B5' }}
          >
            <option value="facebook">Facebook</option>
            <option value="tiktok">TikTok</option>
          </select>
          <input
            placeholder="Tên liên hệ"
            value={extName}
            onChange={(e) => setExtName(e.target.value)}
            className="border rounded-lg px-2 py-1.5 flex-1 text-xs"
            style={{ borderColor: '#D4C9B5', color: '#1A1A1A' }}
          />
          <button type="button" onClick={addExternal} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: 'var(--pl-cta)', color: 'var(--pl-bg)' }}>
            Lưu
          </button>
        </div>
      </div>
      {msg && <p className="text-xs font-semibold">{msg}</p>}
    </div>
  );
}

export default function DashboardClient({
  user,
  recentLives,
}: {
  user: UserInfo;
  recentLives: LiveInfo[];
}) {
  const { t } = useLanguage();
  const [selectedLiveId, setSelectedLiveId] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const rankLabel =
    user.rank === 'artist'
      ? 'Nghệ sĩ'
      : user.rank === 'reporter' || user.rank === 'pro'
        ? 'Phóng viên'
        : 'User';

  // Host tick điểm danh → gửi yêu cầu cho AI Admin
  const requestAttendance = async (liveSessionId: string) => {
    setRequesting(true);
    try {
      const res = await fetch('/api/attendance/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liveSessionId }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Lỗi gửi yêu cầu điểm danh');
    } finally {
      setRequesting(false);
    }
  };

  // Lấy báo cáo điểm danh do AI Admin tổng hợp
  const loadAttendanceReport = async (liveSessionId: string) => {
    setSelectedLiveId(liveSessionId);
    setLoadingReport(true);
    setReport(null);
    try {
      const res = await fetch(`/api/attendance/report?liveSessionId=${liveSessionId}`);
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setReport(data);
      }
    } catch (err) {
      alert('Lỗi tải báo cáo');
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="pl-menu-page pl-future-shell min-h-screen p-4 md:p-8" style={{ background: 'transparent', color: 'var(--pl-text)', fontFamily: 'var(--font-x)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="pl-menu-hero flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className="pl-future-kicker">{t('personal_vault')}</span>
            <h1 className="text-2xl font-bold">{t('menu')}</h1>
            <p className="text-black/70">
              {user.name || user.fullName || user.email}
              <span
                className="ml-2 px-2 py-0.5 text-xs font-bold"
                style={{
                  border: "1.5px solid #FFD166",
                  borderRadius: 8,
                  boxShadow: "0 0 8px rgba(255,209,102,.35)",
                  color: "#FFD166",
                }}
              >
                {rankLabel}
              </span>
            </p>
            <p style={{ margin: '4px 0 0', color: 'rgba(0,0,0,.42)', fontFamily: NOTEPAD_FONT, fontSize: 13 }}>
              {notepadIdLine(user.fullName || '', '')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LegalDocsBar />
            <ThemeToggle />
            <LanguageSwitcher compact />
            <Link href="/?pane=create" className="pl-holo-button px-4 py-2 rounded-lg text-sm font-medium">
              {t('start_live')}
            </Link>
          </div>
        </div>

        <TermsGate afterCccd={!!user.idCardVerified} />
        <MenuAccordion title={t('menu_identity')} hint={t('menu_identity_hint')}>
          <UserIdentityPanel
            displayName={user.name || user.fullName || ''}
            legalFullName={user.fullName || ''}
            idNumber=""
            onSave={() => { /* nối API PATCH /api/me */ }}
          />
        </MenuAccordion>

        <MenuAccordion title={t('menu_ai_points_vault')}>
          <AiCreditBar credit={defaultCredit()} role={(user.rank as string) || "user"} />
          <GiftVault role={(user.rank as AppRole) || 'user'} />
        </MenuAccordion>

        <MenuAccordion title="AI của tôi" hint="Agent cá nhân hoá mức 2">
          <PersonalAgentPanel />
        </MenuAccordion>

        <MenuAccordion title="Long Studio Apps" hint="FlashFlow · QRFlow · 1986 - human">
          <LongStudioApps />
        </MenuAccordion>

        <MenuAccordion title="Thiết bị & hiển thị" hint="Tivi · AR/VR/MR">
          <DeviceConnectPanel />
        </MenuAccordion>

        <MenuAccordion title={t('menu_live_notifications')}>
          <NotificationToggle />
        </MenuAccordion>

        <MenuAccordion title={t('menu_mixer')} hint={t('menu_mixer_hint')}>
          <MixerPresetMenuCard />
        </MenuAccordion>

        <MenuAccordion title={t('menu_shortcuts')} hint={t('menu_shortcuts_hint')}>
        <div className="pl-menu-shortcuts">
          <Link
            href="/cart"
            className="pl-menu-shortcut"
          >
            {t('cart')}
          </Link>
          <Link
            href="/orders"
            className="pl-menu-shortcut"
          >
            {t('my_orders')}
          </Link>
          <Link
            href="/store"
            className="pl-menu-shortcut pl-menu-shortcut-hot"
          >
            {t('superbuy')} · Sticker Level 1-3
          </Link>
          {(user.rank === 'artist' || user.canOrganizeLive) && (
            <Link
              href="/dashboard/seller"
              className="pl-menu-shortcut"
            >
              {t('seller_channel')}
            </Link>
          )}
          <Link
            href="/dashboard/gifts"
            className="pl-menu-shortcut"
          >
            {t('gift_inventory')}
          </Link>
          {user.rank === 'artist' && recentLives[0] && (
            <Link
              href={`/live/${recentLives[0].id}/vote`}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white shadow-sm"
            >
              {t('vote_live_approval')}
            </Link>
          )}
        </div>
        </MenuAccordion>
        {(user.rank === 'boss' ||
          user.rank === 'admin' ||
          (user.email || '').toLowerCase() === 'phuclongtivi@gmail.com') && (
          <MenuAccordion title="Boss Menu" hint="Điều hành app · Boss AI · 2FA">
            <BossCommandCenter />
            <BossVaultDashboard />
          </MenuAccordion>
        )}

        <MenuAccordion title={t('money_ledger')}>
          <MoneyLedgerPanel />
        </MenuAccordion>

        {/* Thống kê */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">{t('attended')}</p>
            <p className="text-xl font-bold">{user.attendedLives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">{t('organized')}</p>
            <p className="text-xl font-bold">{user.organizedLives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">Live ≥1000 view</p>
            <p className="text-xl font-bold">{user.highViewLives}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <p className="text-xs text-gray-500">CCCD</p>
            <p className="text-sm font-medium">
              {user.idCardVerified ? `✓ ${t('verified')}` : t('not_verified')}
            </p>
          </div>
        </div>

        <MenuAccordion title="Bảng điều khiển livestream" hint={user.canOrganizeLive ? "Điểm danh" : "Chưa bật"}>
        {user.canOrganizeLive ? (
          <div className="rounded-xl p-2" style={{ border: "1px solid var(--pl-border)" }}>
            <h2 className="font-semibold text-lg mb-1">Bảng điều khiển phiên Livestream</h2>
            <p className="text-xs text-gray-500 mb-4">
              Bạn đã được Admin cấp quyền tổ chức livestream.
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                Chọn một phiên live gần đây để điểm danh hoặc xem báo cáo:
              </p>

              {recentLives.length === 0 ? (
                <p className="text-sm text-gray-400">Chưa có phiên livestream nào.</p>
              ) : (
                <ul className="space-y-2">
                  {recentLives.map((live) => (
                    <li
                      key={live.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {live.title || 'Livestream không tiêu đề'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(live.startedAt).toLocaleString('vi-VN')} · {live.viewerCount} người xem
                          {live.requireIdCard && (
                            <span className="ml-2 text-green-600">· Đã yêu cầu điểm danh</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => requestAttendance(live.id)}
                          disabled={requesting}
                          className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg disabled:opacity-50"
                        >
                          {requesting ? 'Đang gửi...' : 'Tick điểm danh (AI Admin làm hộ)'}
                        </button>
                        <button
                          onClick={() => loadAttendanceReport(live.id)}
                          className="px-3 py-1.5 text-xs bg-gray-700 text-white rounded-lg"
                        >
                          Xem báo cáo điểm danh
                        </button>
                        <Link
                          href={`/live/${live.id}/vote`}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg"
                        >
                          Bình chọn duyệt
                        </Link>
                        <Link
                          href={`/dashboard/gifts?live=${live.id}`}
                          className="px-3 py-1.5 text-xs border border-black/20 rounded-lg"
                        >
                          Tặng quà
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            <strong>Bảng điều khiển chưa được bật.</strong>
            <br />
            Bạn sẽ thấy bảng điều khiển phiên livestream khi được Admin cấp quyền tổ chức.
          </div>
        )}
        </MenuAccordion>

        {/* Báo cáo điểm danh do AI Admin tổng hợp */}
        {selectedLiveId && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-lg mb-3">
              Báo cáo điểm danh (AI Admin tổng hợp)
            </h2>
            {loadingReport ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : report ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Tổng số người tham gia: <strong>{report.totalParticipants}</strong> · 
                  Tạo bởi: {report.generatedBy} · {new Date(report.generatedAt).toLocaleString('vi-VN')}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 pr-3">Họ tên</th>
                        <th className="py-2 pr-3">Số CCCD</th>
                        <th className="py-2 pr-3">Ngày sinh</th>
                        <th className="py-2 pr-3">Địa chỉ</th>
                        <th className="py-2">Xác minh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.participants.map((p: any) => (
                        <tr key={p.userId} className="border-b border-gray-100">
                          <td className="py-2 pr-3">{p.fullName || '—'}</td>
                          <td className="py-2 pr-3 font-mono text-xs">{p.idNumber || '—'}</td>
                          <td className="py-2 pr-3">{p.dateOfBirth || '—'}</td>
                          <td className="py-2 pr-3 max-w-[200px] truncate">{p.address || '—'}</td>
                          <td className="py-2">
                            {p.idCardVerified ? (
                              <span className="text-green-600">✓</span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Không có dữ liệu.</p>
            )}
          </div>
        )}


        <MenuAccordion title="Thông tin bắt buộc & mã QR" hint="Họ tên · CCCD">
        <div style={{ color: 'var(--pl-text)' }}>
          <h2 className="font-semibold mb-1">Thông tin bắt buộc & mã QR</h2>
          <p className="text-xs mb-3" style={{ color: '#333' }}>
            Chỉ cần <strong>Họ tên đầy đủ</strong> và <strong>Số căn cước công dân</strong> (nhập tay, không bắt buộc ảnh) để hoàn tất khởi tạo user và nhận mã QR (tặng quà + hoa hồng). Các thông tin khác có thể nhập sau. Dữ liệu lưu mãi cho đến khi bạn xoá tài khoản.
          </p>
          <ProfileForm
            initialName={user.fullName || ''}
            initialId={''}
            hasQr={false}
          />
        </div>
        </MenuAccordion>

        <MenuAccordion title="Quan hệ họ hàng & bạn bè">
        <div style={{ color: 'var(--pl-text)' }}>
          <h2 className="font-semibold mb-2">Quan hệ họ hàng & bạn bè</h2>
          <p className="text-xs mb-3" style={{ color: '#333' }}>
            Khai báo người thân / bạn bè là user trên Phúc Long Center. Tìm user trong app hoặc lưu liên hệ nếu họ chưa có tài khoản.
          </p>
          <RelationsForm />
        </div>
        </MenuAccordion>

        <MenuAccordion title="Địa chỉ giao hàng">
        <div style={{ color: 'var(--pl-text)' }}>
          <h2 className="font-semibold mb-1">Địa chỉ giao hàng (cư trú)</h2>
          <p className="text-xs mb-3" style={{ color: '#333' }}>
            Nhập bằng định vị trên bản đồ hoặc gõ tay.
          </p>
          <ShippingAddressForm />
        </div>
        </MenuAccordion>

        <MenuAccordion title="Ngân hàng nhận thưởng">
        <div style={{ color: 'var(--pl-text)' }}>
          <h2 className="font-semibold mb-2">
            Thông tin nhận thưởng (ngân hàng)
          </h2>
          {user.bankAccountNumber && (
            <p className="text-sm mb-3">
              Hiện tại: <strong>{user.bankName}</strong> · {user.bankAccountNumber}
            </p>
          )}
          <BankAccountForm
            initialBankName={user.bankName}
            initialAccountNumber={user.bankAccountNumber}
          />
        </div>
        </MenuAccordion>

        <MenuAccordion title="Nội quy phòng live" hint="AI admin đọc bản này">
          <DashboardRulesCard />
        </MenuAccordion>

        <MenuAccordion title="Hướng dẫn Shopee / TikTok / Facebook">
          <MarketplaceGuidePanel />
        </MenuAccordion>

        <AppCopyright />
      </div>
      <div className="h-24" aria-hidden />
      <BottomNav activeHref="/dashboard" />
    </div>
  );
}
