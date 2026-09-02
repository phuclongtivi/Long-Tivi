import { isCccdComplete, type CccdProfile } from "./gift-unlock";

const USERS_KEY = "plc-email-users";
const SESSION_KEY = "plc-email-session";

export type EmailUser = {
  id: string;
  email: string;
  passHash: string;
  createdAt: string;
  cccd?: CccdProfile | null;
};

function loadUsers(): EmailUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(list: EmailUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

async function hashPass(pass: string): Promise<string> {
  const enc = new TextEncoder().encode(pass);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return btoa(pass);
}

export function sessionUser(): EmailUser | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  return loadUsers().find((u) => u.id === id) || null;
}

export function logoutEmail() {
  localStorage.removeItem(SESSION_KEY);
}

export function emailOk(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passOk(pass: string): boolean {
  return pass.length >= 8;
}

export async function registerEmail(email: string, pass: string): Promise<{ ok: boolean; error?: string; user?: EmailUser }> {
  const e = email.trim().toLowerCase();
  if (!emailOk(e)) return { ok: false, error: "Email không hợp lệ." };
  if (!passOk(pass)) return { ok: false, error: "Mật khẩu tối thiểu 8 ký tự." };
  const list = loadUsers();
  if (list.some((u) => u.email === e)) return { ok: false, error: "Email đã được đăng ký." };
  const user: EmailUser = {
    id: "em-" + Date.now(),
    email: e,
    passHash: await hashPass(pass),
    createdAt: new Date().toISOString(),
    cccd: null,
  };
  saveUsers([...list, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user };
}

export async function loginEmail(email: string, pass: string): Promise<{ ok: boolean; error?: string; user?: EmailUser }> {
  const e = email.trim().toLowerCase();
  const list = loadUsers();
  const user = list.find((u) => u.email === e);
  if (!user) return { ok: false, error: "Chưa có tài khoản với email này." };
  if (user.passHash !== (await hashPass(pass))) return { ok: false, error: "Sai mật khẩu." };
  localStorage.setItem(SESSION_KEY, user.id);
  return { ok: true, user };
}

export function saveCccdForSession(cccd: CccdProfile): { ok: boolean; error?: string; user?: EmailUser } {
  if (!isCccdComplete(cccd)) return { ok: false, error: "Nhập đúng họ tên và số CCCD (9 hoặc 12 số)." };
  const cur = sessionUser();
  if (!cur) return { ok: false, error: "Chưa đăng nhập." };
  const next = { ...cur, cccd };
  saveUsers(loadUsers().map((u) => (u.id === cur.id ? next : u)));
  return { ok: true, user: next };
}

export function emailUserNeedsCccd(u?: EmailUser | null): boolean {
  return !!u && !isCccdComplete(u.cccd);
}
