import { NextResponse } from "next/server";

const ROUTES: Record<string, string> = {
  conversation: "chatgpt",
  planning: "chatgpt",
  video: "gemini",
  image: "gemini",
  batch_text: "deepseek",
  low_cost_reasoning: "deepseek",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const taskType = String(body.taskType || "conversation");
  return NextResponse.json({
    provider: ROUTES[taskType] || "chatgpt",
    taskType,
    mode: "router-scaffold",
    guardrails: ["permission-check", "action-log", "user-confirmation-for-important-actions"],
  });
}
