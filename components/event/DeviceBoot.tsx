"use client";

import { useEffect } from "react";
import { applyDeviceClass } from "./device";
import "./device.css";

export function DeviceBoot() {
  useEffect(() => {
    applyDeviceClass();
    window.addEventListener("resize", applyDeviceClass);
    window.addEventListener("orientationchange", applyDeviceClass);
    return () => {
      window.removeEventListener("resize", applyDeviceClass);
      window.removeEventListener("orientationchange", applyDeviceClass);
    };
  }, []);
  return null;
}
