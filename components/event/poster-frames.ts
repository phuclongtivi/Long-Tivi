import type { AiGender } from "./ai-companion";

export type PosterFrame = {
  id: string;
  name: string;
  gender: AiGender;
  bg: string;
  bg2: string;
  ink: string;
  accent: string;
  label: string;
};

export const POSTER_FRAMES: PosterFrame[] = [
  { id: "f01", name: "Hồng ngọc", gender: "female", bg: "#2A1520", bg2: "#5A2A3A", ink: "#FFF6F8", accent: "#F4A6B8", label: "Nữ" },
  { id: "f02", name: "Trà sữa", gender: "female", bg: "#3A2A22", bg2: "#6B4A38", ink: "#FFF8F0", accent: "#E8C4A8", label: "Nữ" },
  { id: "f03", name: "Lavender", gender: "female", bg: "#1E1630", bg2: "#4A3870", ink: "#F6F0FF", accent: "#C4B0F0", label: "Nữ" },
  { id: "f04", name: "Champagne", gender: "female", bg: "#2C2418", bg2: "#5A4A30", ink: "#FFF8E8", accent: "#E8D5A0", label: "Nữ" },
  { id: "f05", name: "Coral", gender: "female", bg: "#2A1814", bg2: "#7A3A30", ink: "#FFF4F0", accent: "#F08A70", label: "Nữ" },
  { id: "f06", name: "Mint hồng", gender: "female", bg: "#142428", bg2: "#3A5858", ink: "#F0FFFB", accent: "#8FD4C8", label: "Nữ" },
  { id: "f07", name: "Pearl", gender: "female", bg: "#1A1C22", bg2: "#4A4E58", ink: "#F7F8FB", accent: "#D8DCE8", label: "Nữ" },
  { id: "m01", name: "Navy", gender: "male", bg: "#0B1A2E", bg2: "#163A66", ink: "#F4F8FF", accent: "#7EB0E8", label: "Nam" },
  { id: "m02", name: "Graphite", gender: "male", bg: "#141518", bg2: "#2E3238", ink: "#F2F3F5", accent: "#A8B0B8", label: "Nam" },
  { id: "m03", name: "Forest", gender: "male", bg: "#0E1C14", bg2: "#1E4A30", ink: "#F0FFF4", accent: "#7BC49A", label: "Nam" },
  { id: "m04", name: "Teal", gender: "male", bg: "#062028", bg2: "#0E4A58", ink: "#E8FBFF", accent: "#5AD0E0", label: "Nam" },
  { id: "m05", name: "Burgundy", gender: "male", bg: "#1A1014", bg2: "#5A2030", ink: "#FFF4F6", accent: "#D06070", label: "Nam" },
  { id: "m06", name: "Slate gold", gender: "male", bg: "#161410", bg2: "#3A3428", ink: "#FFF8E8", accent: "#C9A24A", label: "Nam" },
  { id: "m07", name: "Indigo", gender: "male", bg: "#101428", bg2: "#2A3470", ink: "#F0F2FF", accent: "#8A96F0", label: "Nam" },
  { id: "n01", name: "Midnight gold", gender: "neutral", bg: "#0B1220", bg2: "#1A2840", ink: "#F4F7FB", accent: "#E8C872", label: "Trung tính" },
  { id: "n02", name: "Ivory ink", gender: "neutral", bg: "#1C1814", bg2: "#3A3228", ink: "#FFF8EE", accent: "#E8DCC8", label: "Trung tính" },
  { id: "n03", name: "Studio red", gender: "neutral", bg: "#1A0C10", bg2: "#5A1420", ink: "#FFF5F6", accent: "#E11D48", label: "Trung tính" },
  { id: "n04", name: "Ice", gender: "neutral", bg: "#101820", bg2: "#2A4050", ink: "#F2FBFF", accent: "#A8D4E8", label: "Trung tính" },
  { id: "n05", name: "Orchid", gender: "neutral", bg: "#181022", bg2: "#402858", ink: "#FBF4FF", accent: "#C090E0", label: "Trung tính" },
  { id: "n06", name: "Sandline", gender: "neutral", bg: "#201810", bg2: "#4A3820", ink: "#FFF6E8", accent: "#D4B080", label: "Trung tính" },
];

export function framesForGender(g: AiGender | undefined): PosterFrame[] {
  const want = g || "neutral";
  const own = POSTER_FRAMES.filter((f) => f.gender === want);
  const extra = POSTER_FRAMES.filter((f) => f.gender === "neutral");
  return [...own, ...extra].slice(0, 12);
}

export function pickFrame(g: AiGender | undefined, index = 0): PosterFrame {
  const list = framesForGender(g);
  return list[index % list.length] || POSTER_FRAMES[14];
}

export function frameById(id?: string): PosterFrame {
  return POSTER_FRAMES.find((f) => f.id === id) || POSTER_FRAMES[14];
}
