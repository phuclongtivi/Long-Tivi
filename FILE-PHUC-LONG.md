# DỰ ÁN PHÚC LONG
**Cập nhật lần cuối:** 24/08/2026 – 20:30 (+07)
**Checkpoint:** 24/08/2026 19:50 – Logo + thông tin công ty Phúc Long Center

---

## Tóm tắt công việc ngày 24/08/2026

### Công việc đã hoàn thành hôm nay:

1. **Khởi tạo dự án Phúc Long**  
   - Tạo cấu trúc thư mục và file tổng hợp `FILE-PHUC-LONG.md`
   - Lưu toàn bộ code cơ bản (API Live, LiveStreamer, Auth, Prisma)

2. **Sửa lỗi + hoàn thiện Live Stream cơ bản**
   - Sửa lỗi JSX trong component
   - Thêm chọn thiết bị camera / thiết bị quay
   - Bảo mật API bằng session

3. **Hệ thống đăng nhập đa nền tảng**
   - Google, Facebook, X (Twitter)
   - Chuẩn bị mở rộng TikTok & Zalo

4. **Hệ thống xếp hạng chi tiết**
   - `normal` → `pro`: tham dự 10 buổi livestream
   - `pro` → `artist`: tổ chức ≥ 3 buổi + có ≥ 3 buổi đạt 1000+ người xem
   - Artist được livestream trên màn hình chính
   - Viết logic tự động nâng hạng (`lib/rank.ts`)

5. **Dashboard & Thông tin người dùng**
   - Upload ảnh CCCD / giấy tờ tùy thân
   - AI Admin tự động điền thông tin từ ảnh
   - Thông tin ngân hàng nhận thưởng (không bắt buộc)
   - Ghi chú rõ ràng cho user

6. **Cập nhật Database Schema**
   - Thêm các trường thống kê livestream
   - Thêm thông tin định danh + ngân hàng
   - Thêm model `LiveAttendance`

### File đã tạo / cập nhật hôm nay:
- `FILE-PHUC-LONG.md`
- `app/api/live/create/route.ts`
- `components/LiveStreamer.tsx`
- `lib/auth.ts`
- `lib/rank.ts`
- `prisma/schema.prisma`

---

## 1. Tổng quan dự án

**Phúc Long** là nền tảng livestream + trợ lý AI cá nhân.

### Tính năng chính hiện tại:
- Live Stream từ camera điện thoại / thiết bị quay → Cloudflare Stream (WebRTC WHIP)
- Đăng nhập đa nền tảng: Facebook, Google (Gmail/YouTube), X (Twitter), (TikTok & Zalo đang chuẩn bị)
- Chọn thiết bị camera / thiết bị quay trước khi livestream
- **Hệ thống xếp hạng độ uy tín** (chi tiết bên dưới)
- Trợ lý AI cá nhân của từng user
- AI Admin có quyền giám sát và can thiệp AI của user khi cần
- Dashboard người dùng: xác minh giấy tờ tùy thân + thông tin ngân hàng nhận thưởng
- **Bảng điều khiển phiên livestream** (chỉ hiện khi Admin cấp quyền `canOrganizeLive`)
- Màu chủ đạo: **kem** + chữ **đen đậm**
- Màn hình chính: **6 tab** lưu trữ video tóm tắt theo chủ đề (AI Admin)
- **Chatbox** cho user đã tham gia livestream

---

## 2. Hệ thống xếp hạng (Rank System)

### Các cấp bậc:
| Cấp bậc   | Giá trị `rank` | `trustLevel` | Mô tả                     |
|-----------|----------------|--------------|---------------------------|
| Thường    | `normal`       | 0            | Người dùng mới            |
| Pro       | `pro`          | 1            | Người dùng tích cực       |
| Nghệ sỹ   | `artist`       | 2            | Người dùng xuất sắc       |

### Cách thức nâng hạng (Ghi chú rõ ràng):

**1. Từ `normal` → `pro`:**
- Điều kiện: User đã **tham dự (xem)** đủ **10 buổi livestream**.
- Hệ thống tự động đếm qua bảng `LiveAttendance`.
- Khi đạt 10 buổi → tự động nâng `rank = "pro"` và `trustLevel = 1`.

**2. Từ `pro` → `artist` (Nghệ sỹ):**
- Điều kiện **đồng thời**:
  - Đã **tổ chức** từ **3 buổi livestream** trở lên (`organizedLives ≥ 3`)
  - Có ít nhất **3 buổi livestream** đạt từ **1000 người xem** trở lên (`highViewLives ≥ 3`)
- Khi đủ điều kiện → tự động nâng `rank = "artist"` và `trustLevel = 2`.

**3. Quyền lợi đặc biệt của Artist:**
- Được **tự do tổ chức livestream trên màn hình chính** (featured / main stage).
- Các user `normal` và `pro` chỉ livestream ở khu vực thông thường.

### Ghi chú kỹ thuật:
- Mỗi lần user xem một livestream → tạo record trong `LiveAttendance` và tăng `attendedLives`.
- Mỗi lần user kết thúc livestream → tăng `organizedLives`. Nếu `viewerCount ≥ 1000` thì tăng `highViewLives`.
- Logic kiểm tra và nâng hạng nên chạy sau mỗi sự kiện (xem live / kết thúc live) hoặc qua cron job định kỳ.

---

## 3. Dashboard người dùng & Đăng ký thông tin

### 3.1. Xác minh giấy tờ tùy thân
- User **bắt buộc upload ảnh** Căn cước công dân (CCCD) hoặc giấy tờ tùy thân tương đương (CMND, Passport…).
- **AI Admin** sẽ tự động:
  - Đọc thông tin từ ảnh (OCR + LLM)
  - Điền vào các trường: Họ tên, Ngày sinh, Số giấy tờ, Địa chỉ…
  - Đánh dấu `idCardVerified = true` sau khi kiểm tra.
- Các trường thông tin định danh:
  - `idCardImageUrl`
  - `fullName`
  - `dateOfBirth`
  - `idNumber`
  - `address`
  - `idCardVerified`

### 3.2. Thông tin ngân hàng nhận thưởng (không bắt buộc)
- Ở **phần cuối cùng** của màn hình đăng ký / cập nhật thông tin user, có 2 trường:
  - **Số tài khoản ngân hàng**
  - **Tên ngân hàng** (và tùy chọn tên chủ tài khoản)
- **Ghi chú rõ ràng trên giao diện:**
  > “Vui lòng điền số tài khoản và tên ngân hàng để nhận tiền thưởng khi tham gia các phiên livestream.  
  > Nếu bạn không điền, vẫn có thể hoàn tất tạo tài khoản. Bạn có thể cập nhật sau.”
- User **không bắt buộc** điền vẫn được tạo tài khoản thành công.
- Các trường:
  - `bankAccountNumber`
  - `bankName`
  - `bankAccountName` (tùy chọn)

### 3.3. Bảng điều khiển phiên Livestream (Control Panel)

**Ghi chú quan trọng:**  
User **chỉ được bật tính năng bảng điều khiển** khi được **Admin cấp quyền** (`canOrganizeLive = true`).

Khi được cấp quyền, trên Dashboard của user sẽ xuất hiện **Bảng điều khiển phiên livestream** với các chức năng:

| Chức năng | Mô tả |
|-----------|--------|
| **Chế độ livestream** | Công khai **hoặc** Giới hạn người dùng |
| **Điểm danh theo căn cước** | Host tick → **AI Admin điểm danh hộ** → tổng hợp danh sách gửi về Dashboard host |
| **Điểm danh người tham gia** | Xem báo cáo đầy đủ thông tin CCCD do AI Admin gửi |
| **Tặng quà người tham gia** | Gửi quà / tiền thưởng cho người xem |

#### Quy trình điểm danh theo căn cước (chi tiết):

1. Host (được cấp quyền) **tick ô điểm danh** trên bảng điều khiển.
2. Hệ thống gửi yêu cầu → **AI Admin** thực hiện điểm danh hộ.
3. AI Admin lấy danh sách người đã tham dự + **đầy đủ thông tin theo căn cước** (họ tên, số CCCD, ngày sinh, địa chỉ, trạng thái xác minh…).
4. AI Admin **tổng hợp báo cáo** và gửi vào **Dashboard của host**.
5. Host xem báo cáo ngay trên Dashboard (bảng danh sách đầy đủ).

**API liên quan:**
- `POST /api/attendance/request` – Host tick điểm danh
- `GET /api/attendance/report?liveSessionId=...` – Lấy báo cáo do AI Admin tổng hợp

**Các trường / model liên quan:**
- `isPublic`, `requireIdCard`, `hasReward` (LiveSession)
- Model `LiveGift`
- Model `LiveAttendance` + thông tin CCCD từ User

---

## 4. Công nghệ sử dụng

- **Frontend / Backend:** Next.js (App Router)
- **Auth:** NextAuth.js (Auth.js)
- **Database:** Prisma + PostgreSQL (hoặc SQLite tạm)
- **Live Stream:** Cloudflare Stream + WebRTC WHIP
- **AI:** Sẵn sàng tích hợp LLM (OpenAI / Grok / Claude…) + OCR cho giấy tờ

---

## 5. Cấu trúc thư mục hiện tại

```
Phuc-Long/
├── FILE-PHUC-LONG.md              ← File tổng hợp dự án (file này)
├── app/
│   └── api/
│       └── live/
│           └── create/
│               └── route.ts
├── components/
│   └── LiveStreamer.tsx
├── lib/
│   └── auth.ts
└── prisma/
    └── schema.prisma              ← Đã cập nhật đầy đủ rank + identity + bank
```

---

## 6. Schema Database (đã cập nhật)

`prisma/schema.prisma` hiện tại bao gồm:

- **User**: rank, trustLevel, attendedLives, organizedLives, highViewLives
- Thông tin định danh từ ảnh CCCD (AI điền)
- Thông tin ngân hàng nhận thưởng (không bắt buộc)
- **LiveSession**: có thêm `viewerCount`
- **LiveAttendance**: ghi nhận user đã tham dự livestream nào

---

## 7. Code đã hoàn thiện (các file chính)

### 7.1. API tạo Live Input
`app/api/live/create/route.ts` – đã có kiểm tra session.

### 7.2. Component LiveStreamer
`components/LiveStreamer.tsx` – đã hỗ trợ chọn thiết bị camera.

### 7.3. NextAuth
`lib/auth.ts` – Google, Facebook, X.

### 7.4. Prisma Schema
Đã mở rộng đầy đủ theo yêu cầu mới (xem file `prisma/schema.prisma`).

---

## 8. Việc còn lại (Roadmap)

| Ưu tiên     | Công việc                                              | Trạng thái          |
|-------------|--------------------------------------------------------|---------------------|
| Cao         | Hoàn thiện WHIP client (stream thật)                   | Chưa làm            |
| Cao         | Logic tự động nâng hạng (sau mỗi live / attendance)    | Schema sẵn, cần code|
| Cao         | Form Dashboard: upload ảnh CCCD + AI điền thông tin    | Schema sẵn          |
| Cao         | Form ngân hàng nhận thưởng (không bắt buộc)            | Schema sẵn          |
| Cao         | Bảng điều khiển phiên livestream (khi Admin cấp quyền) | Schema sẵn          |
| Trung bình  | Custom Provider TikTok + Zalo                          | Chưa làm            |
| Trung bình  | Trang Login + hiển thị rank + quyền Artist             | Chưa làm            |
| Trung bình  | Hệ thống AI Chat + Admin giám sát                      | Kiến trúc sẵn       |
| Thấp        | Trang xem Live (playback)                              | Chưa làm            |

---

## 9. Lịch sử cập nhật

- **24/08/2026 15:12** – Tạo dự án Phúc Long chính thức.  
  Sửa lỗi code cũ, thêm chọn thiết bị camera, đăng nhập đa nền tảng, hệ thống rank Pro/Nghệ sỹ, kiến trúc AI cá nhân + Admin giám sát.

- **24/08/2026 15:23** – Cập nhật hệ thống xếp hạng chi tiết:  
  - normal → pro: tham dự 10 buổi livestream  
  - pro → artist: tổ chức ≥ 3 buổi + có ≥ 3 buổi đạt 1000+ người xem  
  - Artist được livestream trên màn hình chính  
  Thêm Dashboard: upload ảnh CCCD (AI Admin tự điền thông tin) + thông tin ngân hàng nhận thưởng (không bắt buộc).

- **24/08/2026 15:26** – Lưu toàn bộ nội dung làm việc trong ngày.  
  Thêm mục “Tóm tắt công việc ngày 24/08/2026” vào đầu file.

- **24/08/2026 15:34** – Bổ sung:
  - Bảng điều khiển phiên livestream (chỉ hiện khi Admin cấp quyền `canOrganizeLive`)
  - Chế độ công khai / giới hạn + điểm danh CCCD + tặng quà
  - Cập nhật schema (LiveSession + LiveGift)
  - Kiểm tra các loại thiết bị có thể kết nối livestream

- **24/08/2026 15:43** – Hoàn thiện bộ code đến bước hiện tại:
  - Điểm danh theo CCCD do **AI Admin làm hộ** → tổng hợp báo cáo đầy đủ thông tin CCCD gửi về Dashboard host
  - Thêm API attendance (request + report)
  - Hoàn thiện cấu trúc Next.js (package.json, layout, page, dashboard, login, live…)
  - Thêm README + .gitignore sẵn sàng đẩy GitHub
  - Ghi chú hướng đưa lên App Store (Capacitor / PWA)

- **24/08/2026 15:47** – **CHECKPOINT: Lưu toàn bộ công việc đến phần này.**
  Dự án sẵn sàng đẩy GitHub. Các tính năng cốt lõi đã hoàn thiện đến bước hiện tại.

- **24/08/2026 15:59** – Bổ sung giao diện & tính năng màn hình chính:
  - Màu nền chủ đạo **kem** (#F5F0E6), chữ **đen đậm** (#1A1A1A)
  - 6 tab lưu trữ video tóm tắt (tối đa 5 video/tab): Âm Nhạc, Phim Ảnh, Sản Phẩm mới, Dịch Vụ mới, Thể Thao, Hành Chính Công
  - AI Admin trích xuất cảnh đẹp → video tóm tắt theo chủ đề
  - Chatbox cho user đã tham gia 1 buổi livestream cụ thể
  - Model ArchiveVideo + LiveChatMessage + API /api/archive, /api/chat

---

## 10. Trạng thái sẵn sàng đưa lên GitHub & App Store

### Đã sẵn sàng GitHub:
- Cấu trúc Next.js App Router đầy đủ
- `package.json`, `tsconfig`, `next.config`, Tailwind
- `.env.example`, `.gitignore`, `README.md`
- Auth, Live API, Attendance API, Dashboard, Rank logic, Prisma schema

### Còn cần trước khi production:
1. Điền đầy đủ biến môi trường (Cloudflare, OAuth, Database)
2. Hoàn thiện WHIP client (stream thật)
3. Kết nối OCR / AI thật cho đọc CCCD
4. Custom provider TikTok & Zalo (nếu cần)
5. Test toàn bộ flow trên mobile

### Hướng App Store / Google Play:
- Hiện tại là **web app**. Để lên store:
  - **Cách nhanh:** dùng **Capacitor** bọc thành app native
  - Hoặc PWA (Add to Home Screen)
  - Hoặc viết lại bằng React Native / Flutter (lâu hơn)

---


- **24/08/2026 16:12** – Cập nhật màn hình chính:
  - Đổi tab Nghệ Thuật → **Phim Ảnh**
  - Chia sẻ video lên Facebook, TikTok, YouTube, Instagram, Zalo, Shopee
  - AI Admin tạo link riêng + mã refer tính hoa hồng cho từng user
  - Chatbox chuyển xuống **phía dưới cùng**
  - Host: treo quà / tuỳ chỉnh quà / tặng quà → cộng vào tài khoản quà tặng người nhận
  - Model ShareLink, GiftWallet; API /api/share, /api/gift


- **24/08/2026 19:23** – **LƯU CUỐI NGÀY (tối).**  
  Nhật ký đầy đủ: `LOG-2026-08-24.md`.  
  Gồm store Amazon, chi tiết SP, Mua+refer, hoa hồng, tìm kiếm, map địa chỉ, v.v.



---

## THÔNG TIN CÔNG TY (chính thức)

**Nguồn:** https://phuclongtivi.com/

| Mục | Nội dung |
|-----|----------|
| **Tên** | Trung Tâm Thương Mại – Hội Nghị – Tiệc Cưới **Phúc Long** (Phúc Long Center) |
| **Thành lập** | **2019** (logo: SINCE 2019) |
| **Địa chỉ** | Đường 206, Thôn Mễ Hạ, Xã Việt Yên, Tỉnh Hưng Yên |
| **Hotline** | **0966 717 808** |
| **Email** | phuclongtivi@gmail.com |
| **Website** | https://phuclongtivi.com |
| **Zalo** | https://zalo.me/0966717808 |

### Logo
- Vòng tròn **đỏ**, đầu **rồng** trắng cách điệu
- Chữ **Phuc Long** script trắng
- Dòng **SINCE 2019**

### Ba thương hiệu con
1. **Phúc Long Palace™** — Tổ chức sự kiện gia đình (cưới, thôi nôi, sinh nhật, mừng thọ…)
2. **Phúc Long superBUY™** — Sự kiện doanh nghiệp + AI tư vấn & bán hàng
3. **Phúc Long Tivi™** — Livestream / truyền phát sự kiện, PR, TVC, booking KOL

### Quy mô
- Hội trường chính **720m²** + sảnh phụ **360m²**
- Phục vụ **63 tỉnh thành**
- Đã tổ chức **hơn 100 sự kiện**

**Lưu ý:** Đây là thương hiệu sự kiện & livestream (Hưng Yên), **không** phải chuỗi trà/cà phê Phúc Long (Since 1968).


**Ghi chú:** File này sẽ được cập nhật cuối mỗi lần hội thoại.


## Cập nhật 24/08/2026 19:55 – Đa ngôn ngữ + Bản đồ người tham gia Live

### 1. Đa ngôn ngữ (VI / EN / ZH)
- `lib/i18n/dictionaries.ts` – từ điển Tiếng Việt, English, 中文
- `components/LanguageProvider.tsx` – context + lưu lựa chọn vào localStorage
- `components/LanguageSwitcher.tsx` – nút VI | EN | 中文 trên header
- Tích hợp vào `Providers`, `HomeClient`, `LiveStreamer`, trang map

### 2. Bản đồ người tham gia livestream
- Schema: `LiveAttendance` thêm `lat`, `lng`, `locationSharedAt`
- API: `GET/POST /api/live/[id]/participants`
- UI: `components/LiveParticipantsMap.tsx` – bản đồ dạng silhouette Việt Nam + pin tên user
- Trang: `/live/[id]/map`
- User bấm **Chia sẻ vị trí** → geolocation → lưu + hiện trên map
- Host / viewer mở link **Xem bản đồ người xem** khi đang live



## Cập nhật 24/08/2026 20:05 – Font X + Auto locale + Push livestream

### Font chữ
- Stack giống X (Twitter): `Chirp, TwitterChirp, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial…`
- Chirp là font độc quyền X → app dùng system fallback tương đương; có thể gắn file Chirp được cấp phép vào `/public/fonts` sau.

### Ngôn ngữ theo nơi cư trú
- `lib/i18n/detectLocale.ts`: detect từ `navigator.languages` + timezone
- Auto VI / EN / ZH khi user **chưa** chọn tay
- Chọn tay trên LanguageSwitcher → lưu manual, không bị ghi đè

### Thông báo livestream (chỉ khi user bật)
1. **Trước ~5 phút** (`before_5m`) — dựa trên `LiveSession.scheduledStartAt`
2. **Sau 10 phút live** (`after_10m`) — dựa trên `startedAt`
3. User `notificationsEnabled = false` → **không gửi**
4. Files:
   - `lib/notifications.ts`
   - `POST/DELETE /api/notifications/subscribe`
   - `GET/PATCH /api/notifications/settings`
   - `GET/POST /api/cron/live-notifications` (cron mỗi phút + `CRON_SECRET`)
   - `public/sw.js` Service Worker
   - `components/NotificationToggle.tsx` trên Dashboard
5. Schema: `notificationsEnabled`, `PushSubscription`, `LiveNotificationLog`, `scheduledStartAt`, `notifyBefore5Sent`, `notifyAfter10Sent`



## Cập nhật 24/08/2026 20:15 – Lịch live + bộ code store

- Form `/live`: tiêu đề, **datetime-local scheduledStartAt**, công khai/CCCD/thưởng
- API `/api/live/create` lưu session + lịch → push before_5m
- README đầy đủ: web, Vercel, Capacitor iOS/Android App Store + Play Store
- capacitor.config.ts appId `com.phuclongcenter.app`
- vercel.json cron mỗi phút
- Zip: `/home/workdir/artifacts/Phuc-Long-complete.zip`


## Cập nhật 24/08/2026 20:20 – Tên store + checkpoint cuối ngày

### Tên ứng dụng trên cửa hàng
- **App Store (iOS) / Google Play:** hiển thị tên **Long**
- **Trong app:** vẫn Phúc Long Center (logo rồng đỏ SINCE 2019, copy, dashboard, live…)
- Capacitor `appName`: `Long`
- Bundle / applicationId: `com.phuclongcenter.app` (không đổi)

### Checkpoint cuối ngày 24/08/2026
Đã hoàn thành trong ngày:
1. Logo + thông tin công ty phuclongtivi.com
2. Mockup App Store logo rồng đỏ
3. i18n VI/EN/ZH + auto theo nơi cư trú
4. Bản đồ người tham gia livestream
5. Font stack kiểu X
6. Push livestream: trước 5 phút + sau 10 phút (tắt thì không gửi)
7. Form live + scheduledStartAt
8. Bộ code zip + hướng dẫn Capacitor lên 2 store
9. Tên store = **Long**

File zip: artifacts/Phuc-Long-complete.zip


## Checkpoint 24/08/2026 20:30

- Logo gốc user gửi lưu tại `public/logo-phuc-long.png` (không chỉnh sửa)
- Tên store: **Long** | Trong app: Phúc Long Center
- Mockup dùng logo gốc: App Store listing, Home, Login
- Đã lưu LOG + zip trước đó; tiếp tục bộ 10 mockup màn hình (có bản đồ người tham gia live)


## Cập nhật 24/08/2026 ~20:50 – Bình chọn live + tặng quà tiền mặt

### 1. Bình chọn duyệt livestream (hạng Nghệ sĩ)
- Nghệ sĩ mở bình chọn cho phiên live của mình: `POST /api/live/vote` action `open`
- User khác bỏ phiếu `cast` (yes/no); **50 phiếu yes** → `approvalStatus = approved` tự động + thông báo
- Admin/Boss: action `admin_approve` duyệt sớm dù chưa đủ phiếu; đồng thời bật `canOrganizeLive`
- Model: `LiveApprovalVote`, field `LiveSession.approvalStatus|approvalYesCount|approvalVotesNeeded`

### 2. Tặng quà từ dashboard (kể cả tiền mặt)
- Kho: `UserInventoryItem` (cash | product | voucher…) — API `GET/POST /api/inventory`
- Tặng: `POST /api/gift/transfer` — trừ kho, ghi `UserGiftTransfer`
- **Tiền mặt:** lấy STK + ngân hàng người nhận trên app → `buildBankTransferPayload` → deepLink / VietQR hint
  - Người cho mở app ngân hàng; thông tin bên nhận đã điền sẵn theo dashboard
- Có thể gắn `liveSessionId` để ghi thêm `LiveGift`

### File mới
- `lib/bankTransfer.ts`
- `app/api/live/vote/route.ts`
- `app/api/gift/transfer/route.ts`
- `app/api/inventory/route.ts`


## UI 24/08/2026 – Bình chọn + Kho quà

- `components/LiveVotePanel.tsx` — mở bình chọn / bỏ phiếu / admin duyệt
- `components/GiftInventoryPanel.tsx` — kho + tặng sản phẩm/tiền mặt + deepLink ngân hàng
- `app/live/[id]/vote/page.tsx`
- `app/dashboard/gifts/page.tsx`
- Dashboard: shortcut Kho quà, Bình chọn; mỗi phiên live có nút Bình chọn duyệt + Tặng quà


## UI 24/08/2026 ~21:00 – Click user → Tặng quà

### Luồng
1. Click user (`UserChip`) → menu **Tặng quà**
2. Ô giữa màn hình: xác nhận → **Đồng ý**
3. Modal chọn quà có sẵn trong **túi** (kho inventory)
4. **Đồng ý tặng** → nếu tiền mặt: màn chuyển khoản với STK / NH / tên / số tiền / nội dung đã điền sẵn + nút mở app ngân hàng

### File
- `components/GiftToUserFlow.tsx` — modal 3 bước
- `components/UserChip.tsx` — click user + menu tặng quà
- API giữ nguyên: `/api/gift/transfer`, `/api/inventory`


## 24/08/2026 ~21:05 – Gắn UserChip

- `LiveParticipantsMap`: danh sách người xem dùng `UserChip` (click → Tặng quà)
- `HomeClient` chatbox: mỗi tin nhắn hiện `UserChip` theo user gửi


## 24/08/2026 ~21:10 – Tìm user kiểu Facebook

- `GET /api/search/users?q=` — tìm theo name / fullName / email
- Ô tìm kiếm trang chủ: kết quả **Người dùng** (avatar, tên, @username, hạng, ✓ CCCD) + **Nội dung**
- Mỗi user trong kết quả có `UserChip` → Tặng quà


## 24/08/2026 ~21:15 – Khách dùng app + nhắc đăng nhập nhanh

- Màn hình đầu tiên: **Trang chủ** (mockup Phúc Long) — không bắt buộc login
- Khách xem tab, tìm kiếm, gian hàng bình thường
- Click chuyển Dashboard / Live → `GuestAuthPrompt`: nhắc tạo TK / đăng nhập nhanh
  1. Facebook 2. TikTok 3. Google 4. YouTube 5. Zalo
- Nút "Tiếp tục xem mà chưa đăng nhập"
- `GuestNavLink` bọc điều hướng; trang `/login` liệt kê đủ 5 nền tảng


## 24/08/2026 ~21:20 – OAuth = đăng ký mới + 2FA/CCCD từ lần 6

- Đăng nhập nhanh lần đầu (FB/Google/…) → **tạo tài khoản mới**, name/email/avatar OAuth = thông tin đăng ký (`profileFromOAuth`)
- 5 lần đầu: không bắt CCCD / 2FA
- Từ lần **6**:
  - Mobile: bật face hoặc vân tay (một lần)
  - OTP email 6 số → `twoFactorSetupComplete = true`
  - Nhắc bổ sung CCCD (họ tên + số) — có thể “bổ sung sau”
- **Đã hoàn tất** 2FA (+ biometric nếu mobile) → **không hỏi lại** phương thức xác thực


## 24/08/2026 ~21:30 – Rà soát trước GitHub

### Đã sửa
- `@next-auth/prisma-adapter` (đúng package cho next-auth v4)
- Schema: `emailVerified`, `VerificationToken` (Prisma Adapter)
- Tất cả API dùng singleton `lib/prisma` (không `new PrismaClient` rải rác)
- `public/manifest.json` (PWA / Cap)
- `next.config.js` remotePatterns images
- `types/next-auth.d.ts` mở rộng session
- README đầy đủ clone → env → deploy → store
- Trang `/live` theme kem

### Trước khi push
1. `npm install`
2. Điền `.env.local`
3. `npx prisma generate && npx prisma db push`
4. `npm run dev` smoke test
5. Không commit `.env*` (đã có .gitignore)


## 24/08/2026 ~21:40 – Giỏ hàng & đơn mua (kiểu Shopee)

### Schema
- `CartItem` — giỏ user
- `Order` mở rộng: paymentMethod, paymentStatus, shippingStatus, trackingCode, carrier, shippingAddress…
- `OrderStatusLog` — timeline trạng thái
- `AppSetting` key `shipping_lookup_url` — Boss cung cấp URL web tra cứu giao hàng

### API
- `GET/POST /api/cart` — xem / thêm / cập nhật / xóa / chọn
- `GET/POST /api/orders` — danh sách + checkout_cart / buy_now
- `GET/PATCH /api/orders/[id]` — chi tiết, timeline, hủy, xác nhận nhận hàng, admin cập nhật vận đơn
- `GET/POST /api/settings/shipping` — Boss/Admin cấu hình URL tra cứu

### UI
- Long store: nút **Thêm vào giỏ hàng**, icon Giỏ + Đơn mua
- `/cart` — giỏ, chọn SP, COD / CK / ví / thẻ, địa chỉ giao
- `/orders` — tab trạng thái, chi tiết, timeline, link tra cứu vận đơn


## 24/08/2026 ~21:50 – Nghệ sĩ tạo SP + Boss nâng cấp

- Hạng **artist**: được `POST /api/store` tạo sản phẩm (`canCreateStoreProduct`)
- Nút **+ Tạo SP** trên Long store khi rank=artist hoặc Admin
- Boss: `POST /api/admin/rank` `{ userId|email, rank: "artist" }`
- Dashboard Boss: panel `BossPromoteArtist` tìm user → nâng Nghệ sĩ / Pro / Thường
- Nâng artist → `canOrganizeLive = true`, `trustLevel = 2`


## 24/08/2026 ~22:00 – Chatbot AI Admin

- Nút nổi **AI** mọi trang (`AdminAIChatbot` trong Providers)
- **Guest**: AI Admin chung, lịch sử theo `sessionKey` localStorage
- **Đăng nhập**: chatbot **riêng** (`UserAI` + `AssistantChat` theo userId), xưng hô theo tên/hạng
- **Kiến thức chung**: hướng dẫn app + danh sách SP/DV từ `StoreProduct`
- API: `POST/GET /api/assistant`
- Có `OPENAI_API_KEY` → GPT; không có → rule-based `localReply`
- Admin có thể khóa AI user (`UserAI.isBlockedByAdmin`)


## 24/08/2026 ~22:10 – Chatbot Phúc + Đặt lịch Live

- Tên chatbot **luôn là Phúc** (guest & đã login)
- Trang chủ: ô **Đặt lịch Livestream / Biểu diễn** → `open-phuc-chat` intent=booking
- Kịch bản Boss: `GET/POST /api/settings/booking-script` (AppSetting key `booking_livestream_script`)
- API assistant nhận `intent: "booking"` → nạp kịch bản + câu hỏi nhu cầu tổ chức

## 24/08/2026 ~23:25 – Boss knowledge + AI learn

- lib/bossKnowledge.ts
- GET/POST /api/boss/knowledge
- POST /api/boss/knowledge/run (Khởi chạy)
- GET /api/cron/knowledge-refresh (12h, CRON_SECRET)
- components/BossKnowledgePanel.tsx trên dashboard Boss
- /api/assistant nạp ai_knowledge_base


## Checkpoint 25/08/2026 00:13 +07
- Livestream 1080p defaults + liveQuality.ts
- Boss knowledge panel + API run + cron refresh
- Assistant loads ai_knowledge_base
- Zip Long-PhucLongCenter-github.zip for GitHub
- User GitHub: phuclongtivi / repo long (user tự push)
- See CHECKPOINT-2026-08-24.md


## 25/08/2026 ~09:05 – Tiếp tục sửa app
- BossAIProvidersPanel + /api/boss/ai-providers (max 4)
- Dashboard Boss: Providers → Knowledge → Promote Artist
- AdminAIChatbot: auto-open when isBoss
- /api/assistant: Boss command highest priority prompt


## 25/08/2026 ~09:50 – Hạng mới + quyền tab + share
- Rank: guest / user / reporter (Phóng viên) / artist (Nghệ sĩ)
- lib/rank.ts, permissions.ts, screenShare.ts
- Login: tick chia sẻ sự kiện FB/TikTok/Zalo/IG (mặc định bật)
- LiveStreamer: chia sẻ màn hình laptop
- Schema: rank default user, shareEventsOnLogin


## 25/08/2026 – Guest soft prompt
- Khách xem như user, không chặn tab
- GuestNavLink authMode soft: vẫn vào trang + nhắc
- GuestAuthPrompt 2 bước: Đồng ý → chọn FB/TikTok/Google/YouTube/Zalo


## 25/08/2026 – Tab Sự kiện 2 khu vực
- Trên: Đang diễn ra / Sắp diễn ra / Lưu trữ
- Dưới: 6 chủ đề (Âm nhạc, Thời sự&Thể thao, Xem nhận thưởng, Live mua vé, Lịch tổ chức, Hướng dẫn tổ chức)
- app/events + EventsClient + GET /api/live?zone=


## 25/08/2026 ~10:25 – 6 chủ đề Sự kiện chi tiết
- Âm nhạc / Thời sự-Thể thao: AI feed MXH VN (api/events/trends)
- Xem nhận thưởng: 2 upcoming trên cùng + live/archive
- Live mua vé: chỉ upcoming + nút Mua vé → store
- Lịch: map Google + BTC + quyền lợi (contact phuclongtivi)
- Hướng dẫn: mở Phúc + Zalo 0966717808 nếu chưa Nghệ sĩ
- lib/contact.ts

## 25/08 – Vé tự chọn 5k-20tr + Guide cố định


## 25/08 – Gian hàng Nghệ sĩ + giữ hạng + xuất xứ
- ArtistShop model, /api/store/shops
- Store: chọn gian NS → danh mục SP; form Amazon-style
- originWarning tick đỏ; cert trong 3 ngày LV (guide tổ chức)
- Rank: chỉ lên tự động; hạ chỉ Admin (không ghi hướng dẫn app)

## 25/08 – Money ledger dashboard
- MoneyLedgerPanel + /api/user/money-ledger
- In: Kiểm tra → bank deep link
- Out (có PTTT): Kiểm tra → shippingLookupUrl
- WalletLedgerEntry model

## 25/08 – Luồng Shopee hoàn chỉnh
- Order.sellerUserId + shopId khi checkout
- /dashboard/seller kênh người bán (xác nhận, đóng gói, ship, mã VĐ)
- /api/seller/orders
- Dashboard: Giỏ / Đơn mua / Gian hàng / Kênh bán

## 25/08 – Tab superBUY™ Amazon grid + Admin pin

## 25/08 ~11:45 – Rà soát + đóng gói GitHub
- Favorites page
- Rank labels thống nhất
- README
- Long-PhucLongCenter-github.zip / .tar.gz

## DeepSeek V4 Flash + daily AI quota
- DEEPSEEK_API_KEY ưu tiên
- AI_DAILY_REPLY_LIMIT (default 30), Boss miễn

## DeepSeek key in .env + limit 4/day
- Key only in .env (gitignored)
- AI_DAILY_REPLY_LIMIT=4
