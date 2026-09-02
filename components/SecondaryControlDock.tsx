"use client";

export default function SecondaryControlDock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "pl-secondary-dock pl-secondary-dock-compact" : "pl-secondary-dock"} aria-label="Điều khiển nhanh">
      <button type="button" aria-label="AI hỗ trợ" className="pl-secondary-ai-only">AI</button>
    </div>
  );
}
