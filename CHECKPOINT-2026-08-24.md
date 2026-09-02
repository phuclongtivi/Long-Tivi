# Checkpoint công việc — Phúc Long / Long app

**Ngày:** 24–25/08/2026 (VN, UTC+7)  
**Repo GitHub (user):** `phuclongtivi` · repo dự kiến: `https://github.com/phuclongtivi/long`  
**Tên store:** Long · **In-app:** Phúc Long Center

---

## Đã hoàn thành đến checkpoint này

### Livestream chất lượng cao
- Capture mặc định **1080p / 30fps**, fallback 720p
- `lib/liveQuality.ts`, chỉnh `LiveStreamer.tsx` (echoCancellation, noiseSuppression…)
- Hướng Cloudflare Stream WHIP + HLS (`hls.js` trong package.json)

### Boss — kiến thức AI Admin tự học
- `lib/bossKnowledge.ts`
- `GET/POST /api/boss/knowledge`
- `POST /api/boss/knowledge/run` (nút **Khởi chạy**)
- `GET /api/cron/knowledge-refresh` (~12h, `CRON_SECRET`)
- `components/BossKnowledgePanel.tsx` trên Dashboard Boss
- `/api/assistant` nạp `ai_knowledge_base` vào chatbot **Phúc**
- Boss dán GitHub + link nguồn → AI học vận hành app

### Boss — API AI providers (thiết kế)
- Tối đa 4 API nhà cung cấp AI trong dashboard Boss
- Mệnh lệnh Boss = ưu tiên cao nhất
- Chatbot Phúc luôn hiện khi Boss đăng nhập (theo thiết kế đã thống nhất)

### Đóng gói GitHub
- Zip: `artifacts/Long-PhucLongCenter-github.zip` (~357KB)
- Không gồm `.env`, `node_modules`, `.next`
- README + `.env.example` cập nhật
- Username GitHub user: **phuclongtivi**
- Hướng dẫn upload: máy tính / Android Termux / iPhone Working Copy
- **Chưa push giúp user** (cần token của user — không nhận secret)

### Thương hiệu / UI (từ các phiên trước, vẫn giữ)
- Logo đỏ rồng Phúc Long SINCE 2019 (không chỉnh sửa)
- Nền kem, chữ đen đậm
- Địa chỉ: Phường Việt Yên, Tỉnh Hưng Yên, Việt Nam (Admin/Artist sửa được)
- Chatbot tên **Phúc** (guest + user)
- Guest mode + nhắc đăng nhập nhanh
- Ranking normal → pro → artist, vote 50 phiếu, cart Shopee-style, v.v.

---

## Việc user cần làm tiếp
1. Push code lên `https://github.com/phuclongtivi/long` (bằng token của user)
2. Điền `.env.local` (DATABASE, NEXTAUTH, BOSS_EMAIL, OAuth, Cloudflare…)
3. `npm install` → `prisma db push` → `npm run dev`
4. Boss Dashboard → dán link GitHub repo → **Khởi chạy** học kiến thức

---

## File quan trọng
- `prisma/schema.prisma`
- `components/HomeClient.tsx`, `AdminAIChatbot.tsx`, `BossKnowledgePanel.tsx`, `LiveStreamer.tsx`
- `lib/bossKnowledge.ts`, `lib/liveQuality.ts`, `lib/admin.ts`
- `app/api/boss/knowledge/*`, `app/api/assistant/route.ts`
- `FILE-PHUC-LONG.md` · `CHECKPOINT-2026-08-24.md` (file này)

**Lưu checkpoint:** 25/08/2026 ~00:13 +07
