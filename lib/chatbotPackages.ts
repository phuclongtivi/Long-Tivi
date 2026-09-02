/**
 * Gói gia hạn chatbot Phúc (hiển thị superBUY + duyệt Boss)
 */

export type ChatbotPackage = {
  sku: string;
  name: string;
  price: number;
  dailyQuota: number;
  description: string;
};

export const CHATBOT_PACKAGES: ChatbotPackage[] = [
  {
    sku: 'chatbot_10',
    name: 'Chatbot 10.000 đồng/tháng',
    price: 10000,
    dailyQuota: 10,
    description: 'Trả lời 10 câu hỏi mỗi ngày (gia hạn Phúc)',
  },
  {
    sku: 'chatbot_20',
    name: 'Chatbot 20.000 đồng/tháng',
    price: 20000,
    dailyQuota: 20,
    description: 'Trả lời 20 câu hỏi mỗi ngày (gia hạn Phúc)',
  },
  {
    sku: 'chatbot_50',
    name: 'Chatbot 50.000 đồng/tháng',
    price: 50000,
    dailyQuota: 50,
    description: 'Trả lời 50 câu hỏi mỗi ngày (gia hạn Phúc)',
  },
];

export function packageBySku(sku?: string | null) {
  if (!sku) return null;
  return CHATBOT_PACKAGES.find((p) => p.sku === sku) || null;
}

/** Store filter / deep link */
export const CHATBOT_STORE_PATH = '/store?filter=chatbot&pin=chatbot';
