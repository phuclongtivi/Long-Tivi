"use client";
import DashboardClient from "@/components/DashboardClient";
export default function DashboardPage() {
  return (
    <DashboardClient
      user={{ id: "guest", name: null, email: null, rank: "user", trustLevel: 0 }}
      recentLives={[]}
    />
  );
}
