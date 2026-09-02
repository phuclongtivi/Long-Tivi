/** Tối đa 4 app xử lý ảnh/tiếng gắn vào phòng BTC. */

export const PROCESSOR_SLOTS = 4;

export type ProcessorKind = "image" | "audio" | "both" | "handheld";

export type ProcessorStatus = "empty" | "need-login" | "connected" | "error";

export type AvProcessor = {
  slot: 1 | 2 | 3 | 4;
  kind: ProcessorKind;
  name: string;
  oauthUrl?: string;
  status: ProcessorStatus;
  accountHint?: string;
  useAsVideo?: boolean;
  useAsAudio?: boolean;
  persistEffect?: boolean;
  lastLoginAt?: string;
};

export function emptySlots(): AvProcessor[] {
  return [
    { slot: 1, kind: "image", name: "", status: "empty" },
    { slot: 2, kind: "audio", name: "", status: "empty" },
    { slot: 3, kind: "both", name: "", status: "empty" },
    { slot: 4, kind: "handheld", name: "Micro và Thiết bị cầm tay", status: "empty" },
  ];
}

const LS = "pl.av-processors.v1";

export function loadSlots(): AvProcessor[] {
  const base = emptySlots();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return base;
    const saved = JSON.parse(raw) as AvProcessor[];
    return base.map((s) => saved.find((x) => x.slot === s.slot) || s);
  } catch {
    return base;
  }
}

export function saveSlots(slots: AvProcessor[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS, JSON.stringify(slots));
}

export type CatalogApp = {
  id: string;
  name: string;
  blurb: string;
  loginUrl: string;
  useAsVideo?: boolean;
  useAsAudio?: boolean;
};

/** 2 app đề xuất khi BTC bấm từng khe 1–3. */
export const SLOT_APPS: Record<1 | 2 | 3, CatalogApp[]> = {
  1: [
    {
      id: "obs",
      name: "OBS Studio",
      blurb: "Camera ảo, cắt khung, lớp chữ — miễn phí.",
      loginUrl: "https://obsproject.com/download",
      useAsVideo: true,
    },
    {
      id: "capcut",
      name: "CapCut",
      blurb: "Làm đẹp, filter, phụ đề nhanh trên điện thoại/máy tính.",
      loginUrl: "https://www.capcut.com/login",
      useAsVideo: true,
    },
  ],
  2: [
    {
      id: "krisp",
      name: "Krisp",
      blurb: "Lọc ồn, tách giọng BTC — micro ảo.",
      loginUrl: "https://krisp.ai/login",
      useAsAudio: true,
    },
    {
      id: "voicemeeter",
      name: "Voicemeeter",
      blurb: "Trộn mic + nhạc + USB trước khi vào phòng live.",
      loginUrl: "https://voicemeeter.com/",
      useAsAudio: true,
    },
  ],
  3: [
    {
      id: "torch",
      name: "Đèn pin máy BTC",
      blurb: "Bật flash/torch có sẵn trên điện thoại — không mua đèn.",
      loginUrl: "",
      useAsVideo: true,
    },
    {
      id: "screen-fill",
      name: "Màn hình làm đèn",
      blurb: "Mở nền trắng + tăng sáng tối đa. Dùng máy đang cầm, không app trả phí.",
      loginUrl: "",
      useAsVideo: true,
    },
  ],
};

/** App miễn phí dự phòng khi không login được 2 app chính. */
export const SLOT_FREE_FALLBACK: Record<1 | 2 | 3, CatalogApp[]> = {
  1: [
    {
      id: "obs-free",
      name: "OBS Studio",
      blurb: "Miễn phí, không bắt buộc tài khoản.",
      loginUrl: "https://obsproject.com/download",
      useAsVideo: true,
    },
    {
      id: "webcamoid",
      name: "Webcamoid",
      blurb: "Camera ảo mã nguồn mở, miễn phí.",
      loginUrl: "https://webcamoid.github.io/",
      useAsVideo: true,
    },
  ],
  2: [
    {
      id: "obs-noise",
      name: "OBS Noise Suppression",
      blurb: "Lọc ồn trong OBS — không cần Krisp.",
      loginUrl: "https://obsproject.com/download",
      useAsAudio: true,
    },
    {
      id: "noisetorch",
      name: "NoiseTorch / RTX Voice",
      blurb: "Lọc ồn miễn phí (PC).",
      loginUrl: "https://github.com/noisetorch/NoiseTorch",
      useAsAudio: true,
    },
  ],
  3: [
    {
      id: "obs-light",
      name: "OBS Color Correction",
      blurb: "Tăng sáng / cân trắng trên hình — miễn phí, không mua đèn.",
      loginUrl: "https://obsproject.com/kb/filters-guide",
      useAsVideo: true,
    },
    {
      id: "capcut-light",
      name: "CapCut chỉnh sáng",
      blurb: "Filter sáng da / exposure trên điện thoại — app miễn phí.",
      loginUrl: "https://www.capcut.com/",
      useAsVideo: true,
    },
  ],
};

export const SLOT_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Hình Ảnh",
  2: "Âm Thanh",
  3: "Chỉnh sáng",
  4: "Micro và Thiết bị cầm tay",
};

export const PROCESSOR_HINT =
  "1 Hình Ảnh · 2 Âm Thanh · 3 Chỉnh sáng (đèn pin máy / màn hình — không mua đèn) · 4 Micro và Thiết bị cầm tay.";

export const PROCESSOR_QUICK_STEPS = [
  "1. Chọn loại: hình / tiếng / cả hai.",
  "2. Gõ tên app (OBS, Krisp, CapCut…).",
  "3. Có link OAuth → Đăng nhập qua Long. App cài máy → bỏ qua OAuth.",
  "4. Khe 3 Chỉnh sáng: bật đèn pin máy hoặc tăng sáng màn hình. Không bắt buộc mua đèn.",
  "5. Khe 4 Micro và Thiết bị cầm tay: cắm USB / Lightning hoặc chọn micro đã ghép trên máy.",
  "6. Preview 5 giây rồi mới lên sóng.",
];
