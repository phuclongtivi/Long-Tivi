# Event feature — Long App

Copy thư mục này vào repo khi up GitHub (ví dụ `components/event/`).

## Hành vi đã chốt
- Nút **Đăng** nằm trên màn hình tạo sự kiện của Nghệ sỹ / Admin / Boss / Phóng viên.
- Đăng xong **lên Home ngay**, không duyệt.
- Feed sự kiện **gấp đôi** kích thước, hiện: tổ chức, quà, vé, thời gian + địa điểm, khách mời.
- Click feed → khung thông báo nội dung công bố + Tham dự / Mua vé.
- Nghệ sỹ sửa sự kiện của mình trong dashboard.
- Dashboard **Phóng viên + Nghệ sỹ**: nút Tạo Event sáng.
- **User + khách**: nút mờ + ghi chú nâng hạng.

## File
- `roles.ts` — quyền tạo event
- `types.ts` — model sự kiện
- `EventCreateForm.tsx` — form tạo / sửa
- `EventFeedCard.tsx` — card Home size x2
- `EventDetailSheet.tsx` — popup click feed
- `CreateEventButton.tsx` — nút dashboard
- `event-feature.css`

## Checkpoint 2026-08-27 01:48
Import từ `index.ts` để nối Event + Shop + Live product + Cart.

```ts
import { DashboardShopButtons, LiveProductForm, sortFeed } from "./event-feature";
```

Quyền tạo shop / niêm yết = cùng `canCreateEvent`.
