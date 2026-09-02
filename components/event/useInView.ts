"use client";

import { useEffect, useRef, useState } from "react";

type Listener = (on: boolean) => void;

const pool = new Map<string, IntersectionObserver>();
const owners = new WeakMap<Element, Listener>();

function observer(margin: string) {
  let io = pool.get(margin);
  if (io) return io;
  io = new IntersectionObserver(
    (entries, inst) => {
      for (const e of entries) {
        const fn = owners.get(e.target);
        if (!fn) continue;
        if (e.isIntersecting) {
          fn(true);
          inst.unobserve(e.target);
          owners.delete(e.target);
        }
      }
    },
    { root: null, rootMargin: margin, threshold: 0.05 }
  );
  pool.set(margin, io);
  return io;
}

export function useInView<T extends HTMLElement>(rootMargin = "160px") {
  const ref = useRef<T | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setOn(true);
      return;
    }
    const io = observer(rootMargin);
    owners.set(el, setOn);
    io.observe(el);
    return () => {
      io.unobserve(el);
      owners.delete(el);
    };
  }, [rootMargin]);

  return { ref, on };
}
