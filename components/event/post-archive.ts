import { ARCHIVE_ORIGINALS_MS, HOME_POST_EXTRA_MS } from "./home-feed";

export type ArchiveKind = "event" | "photo-reel";

export type ArchivePost = {
  id: string;
  kind: ArchiveKind;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  /** Ảnh nhỏ lâu dài cho OG + trang permalink. */
  posterUrl: string;
  /** Chỉ dùng khi còn trong 90 ngày. */
  videoUrl?: string;
  originalsPurged?: boolean;
};

const KEY = "pl-post-archive";

export function loadArchive(): ArchivePost[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as ArchivePost[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveArchive(list: ArchivePost[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
}

export function upsertArchive(row: ArchivePost) {
  const rest = loadArchive().filter((x) => x.id !== row.id);
  saveArchive([row, ...rest]);
}

export function getArchive(id: string): ArchivePost | undefined {
  return loadArchive().find((x) => x.id === id);
}

export function archiveHomeEndsAt(createdAt: string): Date {
  return new Date(+new Date(createdAt) + HOME_POST_EXTRA_MS);
}

export function shouldPurgeOriginals(createdAt: string, now = Date.now()): boolean {
  return now > +new Date(createdAt) + ARCHIVE_ORIGINALS_MS;
}

export function viewArchive(id: string, now = Date.now()): ArchivePost | undefined {
  const row = getArchive(id);
  if (!row) return undefined;
  if (row.originalsPurged || shouldPurgeOriginals(row.createdAt, now)) {
    return { ...row, videoUrl: undefined, originalsPurged: true };
  }
  return row;
}

export function permalinkPath(id: string): string {
  return `/p/${id}`;
}

export async function makePoster(src: string, maxW = 640): Promise<string> {
  if (!src || src.indexOf("data:") !== 0) return src || "/icon-512.png";
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("poster"));
      el.src = src;
    });
    const scale = Math.min(1, maxW / (img.width || maxW));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.62);
  } catch {
    return "/icon-512.png";
  }
}

export async function publishArchive(input: {
  id: string;
  kind: ArchiveKind;
  title: string;
  description: string;
  author: string;
  createdAt: string;
  firstImage?: string;
  videoUrl?: string;
}): Promise<ArchivePost> {
  const posterUrl = await makePoster(input.firstImage || "/icon-512.png");
  const row: ArchivePost = {
    id: input.id,
    kind: input.kind,
    title: input.title,
    description: input.description,
    author: input.author,
    createdAt: input.createdAt,
    posterUrl,
    videoUrl: input.videoUrl,
  };
  upsertArchive(row);
  try {
    await fetch("/api/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        kind: row.kind,
        title: row.title,
        description: row.description,
        author: row.author,
        createdAt: row.createdAt,
        posterUrl: row.posterUrl.indexOf("data:") === 0 ? "/icon-512.png" : row.posterUrl,
      }),
    });
  } catch {
    /* client archive vẫn đủ cho permalink trên cùng máy */
  }
  return row;
}
