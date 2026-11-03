import Anthropic from "@anthropic-ai/sdk";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export type WebsiteStatus = "up" | "down";
export type Website = { id: string; name: string; url: string; status: WebsiteStatus; latency?: number };
export type MaintenanceTask = { id: string; title: string; website: string; priority: "High" | "Medium"; createdAt: string };

export async function checkWebsite(site: Pick<Website, "id" | "name" | "url">): Promise<Website> {
  const started = Date.now();
  try {
    const response = await fetch(site.url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(8000) });
    return { ...site, status: response.ok ? "up" : "down", latency: Date.now() - started };
  } catch {
    return { ...site, status: "down", latency: Date.now() - started };
  }
}

export async function createMaintenanceTasks(websites: Website[]): Promise<MaintenanceTask[]> {
  const tasks = websites.filter((site) => site.status === "down").map((site) => ({
    id: crypto.randomUUID(),
    title: `Investigasi downtime ${site.name}`,
    website: site.url,
    priority: "High" as const,
    createdAt: new Date().toISOString(),
  }));
  if (tasks.length && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("maintenance_tasks").insert(tasks);
    if (error) console.error("Gagal menyimpan task Supabase:", error.message);
  }
  return tasks;
}

export async function makeAgentReply(websites: Website[], tasks: MaintenanceTask[]) {
  const down = websites.filter((site) => site.status === "down");
  const fallback = down.length
    ? `${down.length} website bermasalah: ${down.map((site) => site.name).join(", ")}. Saya sudah membuat ${tasks.length} task maintenance prioritas tinggi.`
    : `Semua ${websites.length} website aktif dan merespons dengan baik. Belum ada task maintenance baru.`;
  if (!process.env.ANTHROPIC_API_KEY) return fallback;
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const result = await client.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 180,
      messages: [{ role: "user", content: `Ringkas hasil monitoring ini dalam Bahasa Indonesia, maksimal 2 kalimat: ${fallback}` }],
    });
    const text = result.content.find((item) => item.type === "text");
    return text?.type === "text" ? text.text : fallback;
  } catch {
    return fallback;
  }
}
