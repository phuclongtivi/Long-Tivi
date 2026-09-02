import type { StickerDef } from "./gifting";

/** Cấp 1: mỗi sticker = 1 điểm. File WebP nền trong suốt. */
export const TIER1_STICKERS: StickerDef[] = [
  { id: "t1_01", name: "Hộp quà đỏ xanh", imageUrl: "/stickers/tier1/t1_01_gift-red-blue.webp", points: 1 },
  { id: "t1_02", name: "Hộp quà tím hồng", imageUrl: "/stickers/tier1/t1_02_gift-purple-pink.webp", points: 1 },
  { id: "t1_03", name: "Tim đỏ", imageUrl: "/stickers/tier1/t1_03_heart-red.webp", points: 1 },
  { id: "t1_04", name: "Hộp quà teal", imageUrl: "/stickers/tier1/t1_04_gift-teal-blue.webp", points: 1 },
  { id: "t1_05", name: "Hộp quà nắp đỏ", imageUrl: "/stickers/tier1/t1_05_gift-red-blue-lid.webp", points: 1 },
  { id: "t1_06", name: "Hộp quà navy hồng", imageUrl: "/stickers/tier1/t1_06_gift-navy-pink.webp", points: 1 },
  { id: "t1_07", name: "Hộp quà navy gold", imageUrl: "/stickers/tier1/t1_07_gift-navy-gold.webp", points: 1 },
  { id: "t1_08", name: "Hộp quà lilac", imageUrl: "/stickers/tier1/t1_08_gift-lilac.webp", points: 1 },
];

export const TIER1_POINT = 1;
export const TIER1_GRANT_COUNT = 3;
