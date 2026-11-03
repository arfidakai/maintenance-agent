import { NextResponse } from "next/server";
import { checkWebsite, createMaintenanceTasks, makeAgentReply, type Website } from "@/lib/maintenance";

const defaultWebsites: Website[] = [
  { id: "1", name: "Acme Store", url: "https://acme.example.com", status: "up" },
  { id: "2", name: "Marketing Site", url: "https://marketing.example.com", status: "up" },
  { id: "3", name: "Customer Portal", url: "https://portal.example.com", status: "up" },
];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string; websites?: Website[] };
    const websites = body.websites?.length ? body.websites : defaultWebsites;
    const checked = await Promise.all(websites.map(checkWebsite));
    const tasks = await createMaintenanceTasks(checked);
    return NextResponse.json({ reply: await makeAgentReply(checked, tasks), websites: checked, tasks });
  } catch {
    return NextResponse.json({ error: "Monitoring gagal diproses." }, { status: 500 });
  }
}
