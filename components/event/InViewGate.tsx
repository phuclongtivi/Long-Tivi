"use client";

import type { ReactNode } from "react";
import { useInView } from "./useInView";

export function InViewGate({
  height = 220,
  once = true,
  children,
  className,
}: {
  height?: number | string;
  once?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { ref, on } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={className} style={{ minHeight: on ? undefined : height }}>
      {on || !once ? children : null}
    </div>
  );
}
