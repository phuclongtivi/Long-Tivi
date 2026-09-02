"use client";

import { useRouter } from "next/navigation";

export default function SecondaryControlDock({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  return (
    <div className={compact ? "pl-secondary-dock pl-secondary-dock-compact" : "pl-secondary-dock"} aria-label="Điều khiển nhanh">
      <button
        type="button"
        aria-label="Mở AI & Automation"
        className="pl-secondary-ai-only"
        onClick={() => router.push("/dashboard?section=ai")}
      >
        AI
      </button>
    </div>
  );
}
