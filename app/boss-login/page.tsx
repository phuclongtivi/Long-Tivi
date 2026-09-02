export default function BossLoginPage() {
  return (
    <main className="pl-page pl-future-shell" style={{ minHeight: "100dvh", padding: 20, color: "var(--pl-text)" }}>
      <section className="pl-boss-console" style={{ maxWidth: 520, margin: "48px auto" }}>
        <span className="pl-future-kicker">Boss access</span>
        <h1 style={{ color: "#f8fbff", margin: "6px 0 10px", fontSize: 28 }}>Đăng nhập Boss</h1>
        <p>
          Luồng riêng cho Boss/admin. Bản production cần xác thực tài khoản quản trị
          và mã Google Authenticator trước khi mở Boss Menu.
        </p>
        <div className="pl-agent-grid" style={{ marginTop: 16 }}>
          <label>
            Boss ID
            <input placeholder="boss@long.live" />
          </label>
          <label>
            Google Authenticator
            <input placeholder="6 chữ số" inputMode="numeric" />
          </label>
        </div>
        <button type="button" className="pl-holo-button" style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14 }}>
          Xác thực Boss
        </button>
      </section>
    </main>
  );
}
