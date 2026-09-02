/** Viewport + class thiết bị. Gọi 1 lần trong layout. */

export function applyDeviceClass() {
  if (typeof window === "undefined") return;
  const w = window.innerWidth;
  const root = document.documentElement;
  root.classList.toggle("pl-phone", w < 768);
  root.classList.toggle("pl-tablet", w >= 768 && w < 1200);
  root.classList.toggle("pl-laptop", w >= 1200);
  root.classList.toggle("pl-touch", "ontouchstart" in window);
}

export const VIEWPORT_META =
  "width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5";
