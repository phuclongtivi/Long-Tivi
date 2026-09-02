"use client";
import HomeClient from "@/components/HomeClient";
export default function HomePage() {
  return <HomeClient isLoggedIn={false} userName={null} userRank="user" />;
}
