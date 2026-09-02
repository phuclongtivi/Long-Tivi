"use client";

import { useEffect, useMemo, useState } from "react";

type ScreenProfile = "desktop-16-9" | "wide" | "compact" | "portrait";

function detectProfile(width: number, height: number): ScreenProfile {
  const ratio = width / Math.max(height, 1);
  if (ratio < 1.1) return "portrait";
  if (width < 1180) return "compact";
  if (ratio > 1.92) return "wide";
  return "desktop-16-9";
}

function useScreenProfile() {
  const [screen, setScreen] = useState({
    width: 1920,
    height: 1080,
    profile: "desktop-16-9" as ScreenProfile,
  });

  useEffect(() => {
    function update() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const profile = detectProfile(width, height);
      const scale = Math.min(width / 1920, height / 1080);

      document.documentElement.dataset.lpScreen = profile;
      document.documentElement.style.setProperty("--lp-screen-w", `${width}px`);
      document.documentElement.style.setProperty("--lp-screen-h", `${height}px`);
      document.documentElement.style.setProperty("--lp-fit-scale", scale.toFixed(3));
      setScreen({ width, height, profile });
    }

    update();
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return screen;
}

const signalCards = [
  ["Live input", "Camera, DSLR, audio, screen source", "720p default, 1080p optional"],
  ["Mixer Pro", "Sound, video, object AI", "Preset saved per user"],
  ["AI HQ", "Boss AI, user agents, credit guard", "Controlled upgrade loop"],
  ["Device bridge", "TV, AR, VR, MR, desktop", "QR remote ready"],
];

const qualityRows = [
  ["Default output", "720p", "Smooth first, lower operating cost"],
  ["Upgrade option", "1080p", "Manual switch for strong source"],
  ["Desktop canvas", "1920 x 1080", "Primary design and QA baseline"],
  ["Adaptive ratio", "Auto", "Portrait, compact, 16:9 and ultrawide"],
];

export default function LongProTiviHome() {
  const screen = useScreenProfile();
  const profileLabel = useMemo(() => {
    if (screen.profile === "portrait") return "Portrait fallback";
    if (screen.profile === "compact") return "Compact web";
    if (screen.profile === "wide") return "Ultrawide";
    return "1920 x 1080";
  }, [screen.profile]);

  return (
    <main className="lp-protivi-page">
      <section className="lp-protivi-stage" aria-label="Long ProTivi headquarters">
        <header className="lp-protivi-topbar">
          <div>
            <span className="lp-kicker">Long ProTivi</span>
            <h1>Headquarter điều phối livestream và AI</h1>
          </div>
          <div className="lp-screen-readout" aria-label="Screen detection">
            <strong>{profileLabel}</strong>
            <span>{screen.width} x {screen.height}</span>
          </div>
        </header>

        <div className="lp-protivi-grid">
          <aside className="lp-panel lp-nav-panel" aria-label="Primary modules">
            <span className="lp-kicker">Command rail</span>
            <button className="lp-rail-button active" type="button">HQ Overview</button>
            <button className="lp-rail-button" type="button">Live Control</button>
            <button className="lp-rail-button" type="button">Mixer Pro</button>
            <button className="lp-rail-button" type="button">AI Agents</button>
            <button className="lp-rail-button" type="button">Device Bridge</button>
            <button className="lp-rail-button" type="button">Boss Console</button>
          </aside>

          <section className="lp-panel lp-live-panel">
            <div className="lp-section-title">
              <span className="lp-kicker">Live display mode</span>
              <strong>Canvas chuẩn 16:9</strong>
            </div>
            <div className="lp-live-canvas">
              <div className="lp-canvas-mark">1920 x 1080</div>
              <div className="lp-canvas-grid">
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="lp-live-status">
                <b>Output: 720p</b>
                <span>Balanced cost, smooth playback, adaptive bitrate</span>
              </div>
            </div>
            <div className="lp-signal-strip">
              {signalCards.map(([title, body, meta]) => (
                <article key={title}>
                  <strong>{title}</strong>
                  <span>{body}</span>
                  <small>{meta}</small>
                </article>
              ))}
            </div>
          </section>

          <aside className="lp-panel lp-side-panel">
            <div className="lp-section-title">
              <span className="lp-kicker">Adaptive profile</span>
              <strong>Auto screen fit</strong>
            </div>
            <table className="lp-quality-table">
              <tbody>
                {qualityRows.map(([label, value, note]) => (
                  <tr key={label}>
                    <th>{label}</th>
                    <td>{value}</td>
                    <td>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="lp-quick-actions">
              <button type="button">Connect TV</button>
              <button type="button">AR / VR / MR</button>
              <button type="button">Open Mixer</button>
            </div>
          </aside>
        </div>

        <footer className="lp-protivi-footer">
          <span>Light sci-fi theme active</span>
          <span>Mobile screens use compact fallback, not iPhone-only layout</span>
          <span>Desktop first baseline: 1920 x 1080</span>
        </footer>
      </section>
    </main>
  );
}
