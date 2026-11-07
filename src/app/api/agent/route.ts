import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { runTool, tools } from "@/lib/agent/tools";
import { createClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT =
  "Kamu asisten maintenance website. Jawab singkat. Buat task hanya untuk website yang down atau lambat (>3000 ms).";
const MAX_ITERATIONS = 8;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: unknown };
    if (typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json({ error: "Message wajib diisi." }, { status: 400 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const supabase = await createClient();
    const messages: Anthropic.MessageParam[] = [
      { role: "user", content: body.message },
    ];
    let reply = "";

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-5-5",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");
      if (text) reply = text;

      const toolUses = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );
      if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
        break;
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: await Promise.all(
          toolUses.map(async (toolUse) => ({
            type: "tool_result" as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify(
              await runTool(
                toolUse.name,
                typeof toolUse.input === "object" && toolUse.input !== null
                  ? (toolUse.input as Record<string, unknown>)
                  : {},
                supabase,
              ),
            ),
          })),
        ),
      });
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Agent gagal diproses." }, { status: 500 });
  }
}
