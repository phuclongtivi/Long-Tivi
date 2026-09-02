"use client";

export function AppCopyright({
  year = new Date().getFullYear(),
}: {
  year?: number;
}) {
  return (
    <footer
      style={{
        marginTop: 28,
        marginBottom: 8,
        padding: "16px 12px 8px",
        textAlign: "center",
        borderTop: "1px solid var(--pl-border, #243044)",
        color: "var(--pl-muted, #9AA8B8)",
        fontSize: 12,
        lineHeight: 1.55,
        letterSpacing: "0.02em",
      }}
    >
      <div className="pl-brand">Phúc Long Center</div>
      <div>Việt Yên, Hưng Yên Province, Việt Nam</div>
      <div>
        <a href="https://www.phuclongtivi.com" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
          www.phuclongtivi.com
        </a>
      </div>
      <div>superBUY™ · LIVE · Trợ lý AI</div>
      <div>Phiên bản 0.9.29</div>
      <div>
        © {year} Phúc Long Center. Bảo lưu mọi quyền.
      </div>
      <div style={{ opacity: 0.8 }}>
        Nội dung do người dùng đăng tải thuộc trách nhiệm người đăng.
        Liên hệ{" "}
        <a href="mailto:phuclongtivi@gmail.com" style={{ color: "inherit", textDecoration: "underline" }}>
          phuclongtivi@gmail.com
        </a>
      </div>
    </footer>
  );
}
