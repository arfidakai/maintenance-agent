"use client";

import { useState } from "react";
import { Activity, CheckCircle2, CircleHelp, Globe2, Plus, Send, Sparkles, Wrench } from "lucide-react";
import { Badge, Button, Card, Input } from "@/components/ui";
import type { MaintenanceTask, Website } from "@/lib/maintenance";

type Message = { role: "agent" | "user"; text: string };
const initialSites: Website[] = [
  { id: "1", name: "Acme Store", url: "https://acme.example.com", status: "up", latency: 142 },
  { id: "2", name: "Marketing Site", url: "https://marketing.example.com", status: "up", latency: 218 },
  { id: "3", name: "Customer Portal", url: "https://portal.example.com", status: "up", latency: 96 },
];

export function MaintenanceAgent() {
  const [websites, setWebsites] = useState(initialSites);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [messages, setMessages] = useState<Message[]>([{ role: "agent", text: "Halo! Saya siap memeriksa kesehatan website Anda. Coba minta saya untuk memeriksa semua website." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMessages((current) => [...current, { role: "user", text }]);
    setLoading(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, websites }) });
      const data = (await response.json()) as { reply?: string; websites?: Website[]; tasks?: MaintenanceTask[]; error?: string };
      if (!response.ok) throw new Error(data.error);
      setWebsites(data.websites ?? websites);
      setTasks((current) => [...(data.tasks ?? []), ...current]);
      setMessages((current) => [...current, { role: "agent", text: data.reply ?? "Pemeriksaan selesai." }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "agent", text: error instanceof Error ? error.message : "Terjadi kesalahan." }]);
    } finally { setLoading(false); }
  }

  const onlineCount = websites.filter((site) => site.status === "up").length;
  return (
    <main className="min-h-screen">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-navy p-2 text-white"><Wrench size={20} /></div><div><h1 className="font-bold tracking-tight">Maintenance Agent</h1><p className="text-xs text-slate-500">Website health, simplified.</p></div></div><div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-teal" /> Sistem aktif</div></div></header>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-6"><div><p className="mb-2 text-sm font-semibold text-teal">OVERVIEW</p><h2 className="text-3xl font-bold tracking-tight">Selamat pagi, Arfida</h2><p className="mt-1 text-slate-500">Pantau semua website dan biarkan agent mengurus sisanya.</p></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5"><div className="mb-3 flex justify-between text-slate-500"><span className="text-sm">Website aktif</span><Globe2 size={18} /></div><p className="text-3xl font-bold">{onlineCount}<span className="text-lg font-normal text-slate-400">/{websites.length}</span></p><p className="mt-1 text-xs text-teal">● Semua terpantau</p></Card>
            <Card className="p-5"><div className="mb-3 flex justify-between text-slate-500"><span className="text-sm">Uptime rata-rata</span><Activity size={18} /></div><p className="text-3xl font-bold">99.9%</p><p className="mt-1 text-xs text-slate-400">30 hari terakhir</p></Card>
            <Card className="p-5"><div className="mb-3 flex justify-between text-slate-500"><span className="text-sm">Task terbuka</span><Wrench size={18} /></div><p className="text-3xl font-bold">{tasks.length}</p><p className="mt-1 text-xs text-slate-400">Perlu perhatian</p></Card>
          </div>
          <Card className="overflow-hidden"><div className="flex items-center justify-between border-b px-5 py-4"><div><h3 className="font-semibold">Website Anda</h3><p className="text-sm text-slate-500">Status real-time dari endpoint utama.</p></div><Button className="gap-2 bg-navy text-white" onClick={() => setInput("Periksa semua website")}><Plus size={16} /> Cek sekarang</Button></div><div className="divide-y">{websites.map((site) => <div className="flex items-center justify-between px-5 py-4" key={site.id}><div className="flex items-center gap-3"><div className={`rounded-full p-2 ${site.status === "up" ? "bg-teal/10 text-teal" : "bg-red-50 text-red-500"}`}>{site.status === "up" ? <CheckCircle2 size={18} /> : <CircleHelp size={18} />}</div><div><p className="text-sm font-semibold">{site.name}</p><p className="text-xs text-slate-400">{site.url}</p></div></div><div className="text-right"><Badge className={site.status === "up" ? "bg-teal/10 text-teal" : "bg-red-50 text-red-600"}>{site.status === "up" ? "Operational" : "Down"}</Badge>{site.latency && <p className="mt-1 text-xs text-slate-400">{site.latency}ms</p>}</div></div>)}</div></Card>
        </section>
        <aside><Card className="flex h-[620px] flex-col overflow-hidden"><div className="border-b bg-navy px-5 py-4 text-white"><div className="flex items-center gap-2"><Sparkles size={18} className="text-teal" /><h3 className="font-semibold">Chat dengan agent</h3></div><p className="mt-1 text-xs text-slate-300">Saya bisa memeriksa dan membuat task.</p></div><div className="flex-1 space-y-4 overflow-y-auto p-5">{messages.map((message, index) => <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`} key={index}><div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-sm bg-teal text-white" : "rounded-bl-sm bg-mist text-slate-700"}`}>{message.text}</div></div>)}{loading && <div className="text-sm text-slate-400">Agent sedang memeriksa...</div>}</div><form className="border-t p-4" onSubmit={sendMessage}><div className="flex gap-2"><Input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Contoh: cek semua website..." /><Button aria-label="Kirim pesan" className="bg-teal px-3 text-white" type="submit"><Send size={17} /></Button></div><p className="mt-3 text-[11px] text-slate-400">Agent dapat membuat task maintenance otomatis.</p></form></Card></aside>
      </div>
    </main>
  );
}
