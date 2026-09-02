import DeviceConnectPanel from "@/components/DeviceConnectPanel";

export default function TvConnectPage() {
  return (
    <main className="pl-page pl-future-shell" style={{ minHeight: "100dvh", padding: 16, color: "var(--pl-text)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <DeviceConnectPanel />
      </div>
    </main>
  );
}
