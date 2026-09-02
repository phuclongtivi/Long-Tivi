# Long Graphic Optimization v2

## Mục tiêu thiết kế

Phiên bản này xây dựng ngôn ngữ thiết kế mới cho app Long theo hướng trẻ trung, gọn gàng, tinh tế và có một lớp khoa học viễn tưởng nhẹ. Tinh thần chính là giao diện mạng xã hội hiện đại: feed rõ, card nổi, video mượt, thao tác nhanh và không tạo cảm giác nặng mắt.

## Bảng màu

- Nền chính: xanh trắng rất nhạt, dùng radial glow để tạo chiều sâu.
- Surface/card: trắng kính mờ, có blur nhẹ và border mảnh.
- Màu nhấn: cyan `#22d3ee`, blue `#2563eb`, violet `#8b5cf6`.
- CTA/LIVE: gradient hồng `#ff2d75` sang tím/xanh để tạo cảm giác năng lượng.
- Dark mode: nền navy đen, vẫn giữ glow cyan/violet nhưng giảm độ gắt.

## Chữ viết

- Dùng system font stack giống mạng xã hội hiện đại để nhẹ và rõ trên iOS/Android.
- Tiêu đề giảm letter-spacing nhẹ để nhìn cao cấp hơn.
- Kicker/label dùng uppercase, font-weight cao, letter-spacing rộng tạo cảm giác “studio / sci-fi panel”.

## Đồ hoạ và card

- Card Home, thông báo, chat, mixer chuyển sang glass card.
- Poster sự kiện tăng vùng hiển thị để nhìn giống social feed hơn.
- Nhãn LIVE chuyển sang pill gradient thay vì badge phẳng.
- Bottom nav chuyển sang floating glass dock.
- Nút Live trung tâm dùng radial gradient và glow.

## Video / Vào Rạp

- Stage video được nâng chiều cao để tạo cảm giác Reels/Cinema rõ hơn.
- Chỉ video hiện tại phát; video kế tiếp chỉ preload metadata.
- Drag dùng CSS transform và `requestAnimationFrame` để thao tác vuốt mượt hơn.
- Card video dùng nền tối, border glow nhẹ và overlay metadata ở đáy.

## LIVE / Mixer

- Action bar LIVE dùng chip kính, trạng thái active có cyan glow.
- Bàn Mixer được gom thành panel rõ ràng, mỗi nguồn âm là một row riêng.
- Các nút quan trọng dùng gradient CTA thống nhất.
- Trạng thái AI Vision và tự lưu mixer hiển thị như panel phụ, không làm rối giao diện.

## File chính đã cập nhật

- `app/globals.css`
- `components/event/theme.css`
- `components/event/HomeWallTab.tsx`
- `components/event/EventWallPost.tsx`
- `components/event/EventNoticeWallCard.tsx`
- `components/EventChatDrops.tsx`
- `components/LiveLandingClient.tsx`
- `components/event/LiveActionBar.tsx`
- `components/event/LiveReelsTab.tsx`
- `components/event/OrganizerLiveDesk.tsx`
- `components/event/LiveAudioMixer.tsx`

## Kiểm tra

Đã chạy:

```bash
npm run build
```

Kết quả: production build thành công.
