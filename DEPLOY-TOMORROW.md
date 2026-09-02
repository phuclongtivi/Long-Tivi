# Long — Hướng dẫn deploy ngày mai

## Bước 1: Cập nhật code trên máy

1. Tải `Long-PhucLongCenter-ready-tomorrow.zip`
2. Giải nén **đè** vào `D:\phuclong`
3. **Giữ nguyên** file `.env` (DATABASE_URL Neon)

```bash
cd /d/phuclong
npm install
npx prisma generate
npx prisma db push
```

## Bước 2: Push GitHub

```bash
git add -A
git status
git commit -m "Vercel-safe APIs + live fullscreen quality player"
git push origin main
```

## Bước 3: Vercel

1. Settings → Environment Variables (Production):
   - DATABASE_URL = chuỗi Neon (không có dấu " bao quanh)
   - NEXTAUTH_SECRET = chuỗi bí mật
   - BOSS_EMAIL = email Boss
   - NEXTAUTH_URL = https://xxx.vercel.app (tạm)
2. Deployments → Create Deployment → `main` → Deploy to Production
3. Chờ **Ready**

## Bước 4: Kiểm tra

- Mở URL `*.vercel.app`
- Thử `/live/<id>` (player full màn hình + chọn độ phân giải)
- Chatbot Phúc, gian hàng superBUY

## Nếu vẫn Error

Gửi **path** cuối Build Logs (vd. `/api/...`) — hầu hết API GET đã harden; path còn lại sửa nhanh.
