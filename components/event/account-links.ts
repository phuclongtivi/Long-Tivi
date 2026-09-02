import type { CccdProfile } from "./gift-unlock";
import { isCccdComplete } from "./gift-unlock";

const KEY = "plc-account-bundle";
const SESSION = "plc-account-session";

export type LoginMethod = "email" | "phone" | "google" | "facebook" | "zalo";

export type LinkedMethod = {
  method: LoginMethod;
  handle: string;
  linkedAt: string;
};

export type AccountBundle = {
  id: string;
  createdAt: string;
  displayName: string;
  email?: string;
  phone?: string;
  passHash?: string;
  cccd?: CccdProfile | null;
  methods: LinkedMethod[];
};

/** Trường cố định — không sửa dù đang Edit */
export const LOCKED_FIELDS = ["id", "createdAt", "cccd.idNumber", "cccd.fullName"] as const;

function loadAll(): AccountBundle[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function saveAll(list: AccountBundle[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function sessionAccount(): AccountBundle | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(SESSION);
  if (!id) return null;
  return loadAll().find((a) => a.id === id) || null;
}

export function phoneOk(phone: string): boolean {
  const d = phone.replace(/\D/g, "");
  return d.length >= 9 && d.length <= 11;
}

export function needsCccd(a?: AccountBundle | null): boolean {
  return !!a && !isCccdComplete(a.cccd);
}

export function upsertAccount(partial: Partial<AccountBundle> & { method: LoginMethod; handle: string }): AccountBundle {
  const list = loadAll();
  const handle = partial.handle.trim();
  let acc =
    list.find((a) => a.methods.some((m) => m.method === partial.method && m.handle === handle)) ||
    list.find((a) => (partial.email && a.email === partial.email) || (partial.phone && a.phone === partial.phone));
  if (!acc) {
    acc = {
      id: "acc-" + Date.now(),
      createdAt: new Date().toISOString(),
      displayName: partial.displayName || handle,
      email: partial.email,
      phone: partial.phone,
      passHash: partial.passHash,
      cccd: partial.cccd ?? null,
      methods: [],
    };
    list.push(acc);
  }
  if (!acc.methods.some((m) => m.method === partial.method && m.handle === handle)) {
    acc.methods.push({ method: partial.method, handle, linkedAt: new Date().toISOString() });
  }
  if (partial.email && !acc.email) acc.email = partial.email;
  if (partial.phone && !acc.phone) acc.phone = partial.phone;
  if (partial.passHash) acc.passHash = partial.passHash;
  saveAll(list.map((a) => (a.id === acc!.id ? acc! : a)));
  localStorage.setItem(SESSION, acc.id);
  return acc;
}

export function saveCccdOnAccount(cccd: CccdProfile): { ok: boolean; error?: string; acc?: AccountBundle } {
  if (!isCccdComplete(cccd)) return { ok: false, error: "Nhập đúng họ tên và số CCCD (9 hoặc 12 số)." };
  const cur = sessionAccount();
  if (!cur) return { ok: false, error: "Chưa đăng nhập." };
  if (isCccdComplete(cur.cccd)) return { ok: false, error: "CCCD đã khóa, không sửa." };
  const next = { ...cur, cccd };
  saveAll(loadAll().map((a) => (a.id === cur.id ? next : a)));
  return { ok: true, acc: next };
}

export function updateEditableAccount(patch: { displayName?: string; email?: string; phone?: string }): AccountBundle | null {
  const cur = sessionAccount();
  if (!cur) return null;
  const next = {
    ...cur,
    displayName: patch.displayName ?? cur.displayName,
    email: patch.email ?? cur.email,
    phone: patch.phone ?? cur.phone,
  };
  saveAll(loadAll().map((a) => (a.id === cur.id ? next : a)));
  return next;
}
