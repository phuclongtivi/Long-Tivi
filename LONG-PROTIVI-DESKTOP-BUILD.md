# Long ProTivi Desktop Build

## Kết quả cần có

- `Long ProTivi Setup.exe`: bản cài đặt Windows.
- `Long ProTivi Portable.exe`: bản chạy ngay không cần cài.

## Chuẩn hệ điều hành

- Chuẩn chính: Windows 10/11 64-bit.
- Giao diện tối ưu theo Windows 11.
- Không ưu tiên Windows 8 cho bản soft chuyên nghiệp.

## Thông tin bản quyền dùng từ mobile app

```text
Phúc Long Center
Việt Yên, Hưng Yên Province, Việt Nam
www.phuclongtivi.com
superBUY · LIVE · Trợ lý AI
Copyright © 2026 Phúc Long Center. Bảo lưu mọi quyền.
Liên hệ: phuclongtivi@gmail.com
```

## Cấu trúc source

```text
desktop/long-protivi/
  package.json
  src/main.js
  src/preload.js
  build/LICENSE.txt
  README-VI.md
.github/workflows/build-long-protivi-windows.yml
```

## Build bằng GitHub Actions

1. Up source lên GitHub.
2. Vào tab `Actions`.
3. Chọn `Build Long ProTivi Windows`.
4. Bấm `Run workflow`.
5. Giữ URL mặc định `https://long.live/protivi` hoặc nhập URL khác.
6. Sau khi workflow chạy xong, tải artifact `Long-ProTivi-Windows`.

## Build local trên Windows

```powershell
cd desktop/long-protivi
npm install
npm run build:win
```

File xuất ra nằm ở:

```text
desktop/long-protivi/release
```

## Quyền/cài đặt cần báo Boss trước khi build phát hành

- Cần quyền push source lên GitHub repo.
- Cần GitHub Actions bật cho repo.
- Cần Internet để tải Electron/electron-builder khi build.
- Giai đoạn phát hành rộng nên cần chứng chỉ ký Windows code signing để giảm cảnh báo SmartScreen.
- Nếu muốn auto-update, cần thêm nơi phát hành bản cập nhật và policy duyệt update của Boss.

## Trạng thái

Source desktop và workflow build đã được chuẩn bị. Môi trường hiện tại là Linux nên chưa xuất trực tiếp file `.exe`; workflow Windows trên GitHub sẽ xuất installer và portable.
