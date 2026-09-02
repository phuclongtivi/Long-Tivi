# Long ProTivi Desktop

Long ProTivi Desktop là bản soft Windows cho môi trường headquarter của hệ sinh thái 1986.

## Chuẩn hỗ trợ

- Chuẩn chính: Windows 10/11 64-bit.
- Tối ưu giao diện theo Windows 11.
- Windows 8 không còn là chuẩn chính cho bản soft chuyên nghiệp.

## Bản build cần xuất

- `Long ProTivi Setup.exe`: bản cài đặt.
- `Long ProTivi Portable.exe`: bản chạy ngay không cần cài.

## URL mặc định

```text
https://long.live/protivi
```

Có thể đổi URL build bằng biến môi trường:

```powershell
$env:LONG_PROTIVI_URL="https://long.live/protivi"
```

## Thông tin bản quyền

```text
Phúc Long Center
Việt Yên, Hưng Yên Province, Việt Nam
www.phuclongtivi.com
superBUY · LIVE · Trợ lý AI
Copyright © 2026 Phúc Long Center. Bảo lưu mọi quyền.
Liên hệ: phuclongtivi@gmail.com
```

## Build local trên Windows

```powershell
cd desktop/long-protivi
npm install
npm run build:win
```

File build nằm trong:

```text
desktop/long-protivi/release
```

## Build bằng GitHub Actions

Sau khi up repo lên GitHub:

1. Mở tab `Actions`.
2. Chọn workflow `Build Long ProTivi Windows`.
3. Bấm `Run workflow`.
4. Tải artifact `Long-ProTivi-Windows`.

## Lưu ý ký app

Giai đoạn đầu có thể build unsigned để test nội bộ. Khi phát hành rộng, nên dùng chứng chỉ code signing cho Windows để giảm cảnh báo SmartScreen.
