export type ShopStatus = "active" | "paused";

export type Shop = {
  id: string;
  ownerId: string;
  ownerRole: "artist" | "journalist" | "admin" | "boss";
  name: string;
  publishedAt: string;
  status: ShopStatus;
};

export type ProductListing = {
  id: string;
  shopId: string;
  ownerId: string;
  name: string;
  priceVnd: number;
  /** 2 dòng ưu đãi do người niêm yết điền */
  promoLine1: string;
  promoLine2: string;
  coverUrl?: string;
  publishedAt: string;
  pinned?: boolean;
  liveRelated?: boolean;
};
