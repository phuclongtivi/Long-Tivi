# Long — Phúc Long Center

Ứng dụng livestream · sự kiện · thương mại **superBUY™** · chat công khai.

| | |
|--|--|
| **App Store / Play** | Long |
| **Website** | https://phuclongtivi.com/ |
| **Địa chỉ** | Phường Việt Yên, Tỉnh Hưng Yên, Việt Nam |
| **Liên hệ** | Zalo 0966717808 · phuclongtivi@gmail.com |
| **GitHub** | https://github.com/phuclongtivi/long |

## Stack

Next.js 14 · TypeScript · Tailwind · NextAuth · Prisma · PostgreSQL · DeepSeek (chatbot **Phúc**) · Capacitor (iOS/Android)

## Tính năng chính

- Livestream / sự kiện — **Boss duyệt** mới hiện trên app (+ email Boss)
- superBUY™ — lưới Amazon, giỏ Shopee-style, **chia sẻ SP + mã refer**
- Chat công khai trang chủ (phong cách Twitter cổ)
- Chatbot **Phúc** (4 câu/ngày, gia hạn gói, Boss duyệt)
- Auth: OAuth · biometric · OTP email máy mới · idle 60’
- Username theo hạng: Admin đỏ đậm · Nghệ sĩ gradient · Phóng viên xanh lục
- Dashboard: CCCD, NH VN, ví ETH L1, hướng dẫn Shopee/TikTok/FB

## Cài đặt

```bash
git clone https://github.com/phuclongtivi/long.git
cd long
cp .env.example .env
# Điền DATABASE_URL, NEXTAUTH_SECRET, BOSS_EMAIL, OAuth, DEEPSEEK_API_KEY
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Biến môi trường quan trọng

```env
DATABASE_URL=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
BOSS_EMAIL=
DEEPSEEK_API_KEY=
AI_DAILY_REPLY_LIMIT=4
RESEND_API_KEY=          # email production (tuỳ chọn)
EMAIL_FROM=Long App <noreply@phuclongtivi.com>
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

**Không commit file `.env`.**

## Push GitHub

```bash
git add .
git status   # kiểm tra không có .env
git commit -m "Long app — Phúc Long Center"
git branch -M main
git remote add origin https://github.com/phuclongtivi/long.git   # nếu chưa có
git push -u origin main
```

## Schema

Sau khi clone / đổi schema:

```bash
npx prisma db push
npx prisma generate
```

## Logo

`public/logo-phuc-long.png` — không chỉnh sửa.

© Phúc Long Center · SINCE 2019
