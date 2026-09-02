/** Micro khán giả + ô hình kiểu Zoom trên bàn BTC. */

export const AUDIENCE_STAGE_KEY = "pl.audience-stage.v1";

export type StageSeat = {
  id: string;
  name: string;
  role: "audience" | "guest";
  micOn: boolean;
  cameraOn: boolean;
};

export type AudienceStage = {
  roomId: string;
  audienceMicMasterOn: boolean;
  seats: StageSeat[];
};

export function emptyStage(roomId: string): AudienceStage {
  return { roomId, audienceMicMasterOn: false, seats: [] };
}

export function loadStage(roomId: string): AudienceStage {
  if (typeof window === "undefined") return emptyStage(roomId);
  try {
    const all = JSON.parse(localStorage.getItem(AUDIENCE_STAGE_KEY) || "{}") as Record<
      string,
      AudienceStage
    >;
    return all[roomId] || emptyStage(roomId);
  } catch {
    return emptyStage(roomId);
  }
}

export function saveStage(s: AudienceStage) {
  if (typeof window === "undefined") return;
  let all: Record<string, AudienceStage> = {};
  try {
    all = JSON.parse(localStorage.getItem(AUDIENCE_STAGE_KEY) || "{}");
  } catch {
    all = {};
  }
  all[s.roomId] = s;
  localStorage.setItem(AUDIENCE_STAGE_KEY, JSON.stringify(all));
}

export function toggleSeatMic(s: AudienceStage, id: string): AudienceStage {
  return {
    ...s,
    seats: s.seats.map((x) => (x.id === id ? { ...x, micOn: !x.micOn } : x)),
  };
}

export function toggleSeatCam(s: AudienceStage, id: string): AudienceStage {
  return {
    ...s,
    seats: s.seats.map((x) => (x.id === id ? { ...x, cameraOn: !x.cameraOn } : x)),
  };
}
