import type { StickerDef } from "./gifting";

/** Cấp 3: mỗi sticker = 5 điểm. Mở khoá 5 sticker ngẫu nhiên. */
export const TIER3_STICKERS: StickerDef[] = [
  { id: "t3_01", name: "Paris", imageUrl: "/stickers/tier3/t3_01_paris.webp", points: 5 },
  { id: "t3_02", name: "London", imageUrl: "/stickers/tier3/t3_02_london.webp", points: 5 },
  { id: "t3_03", name: "New York", imageUrl: "/stickers/tier3/t3_03_newyork.webp", points: 5 },
  { id: "t3_04", name: "Tokyo", imageUrl: "/stickers/tier3/t3_04_tokyo.webp", points: 5 },
  { id: "t3_05", name: "Rome", imageUrl: "/stickers/tier3/t3_05_rome.webp", points: 5 },
  { id: "t3_06", name: "Sydney", imageUrl: "/stickers/tier3/t3_06_sydney.webp", points: 5 },
  { id: "t3_07", name: "Dubai", imageUrl: "/stickers/tier3/t3_07_dubai.webp", points: 5 },
  { id: "t3_08", name: "Shanghai", imageUrl: "/stickers/tier3/t3_08_shanghai.webp", points: 5 },
  { id: "t3_09", name: "Beijing", imageUrl: "/stickers/tier3/t3_09_beijing.webp", points: 5 },
  { id: "t3_10", name: "Hong Kong", imageUrl: "/stickers/tier3/t3_10_hongkong.webp", points: 5 },
];

export const TIER3_POINT = 5;
export const TIER3_GRANT_COUNT = 5;
