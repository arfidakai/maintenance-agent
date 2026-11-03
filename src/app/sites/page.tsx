import { addSite, deleteSite } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"

type Site = {
  id: string
  name: string | null
  url: string | null
}

export default async function SitesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sites")
    .select("id, name, url")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Gagal memuat sites: ${error.message}`)
  }

  const sites = (data ?? []) as Site[]

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-10">
      <div>
        <p className="mb-2 text-sm font-semibold text-teal">SITES</p>
        <h1 className="text-3xl font-bold tracking-tight">Manage sites</h1>
        <p className="mt-1 text-slate-500">Tambahkan dan kelola website yang ingin dipantau.</p>
      </div>

      <form action={addSite} className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-soft sm:flex-row sm:items-end">
        <label className="flex-1 text-sm font-medium">
          Nama
          <Input className="mt-2" name="name" placeholder="Marketing Site" required />
        </label>
        <label className="flex-1 text-sm font-medium">
          URL
          <Input className="mt-2" name="url" placeholder="https://example.com" required />
        </label>
        <Button className="h-9 bg-navy text-white" type="submit">
          Add site
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-28 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell className="py-8 text-center text-slate-500" colSpan={3}>
                  Belum ada site.
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name ?? "-"}</TableCell>
                  <TableCell>
                    {site.url ? (
                      <a className="text-teal hover:underline" href={site.url} rel="noreferrer" target="_blank">
                        {site.url}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={deleteSite}>
                      <input name="id" type="hidden" value={site.id} />
                      <Button className="text-red-600 hover:bg-red-50" type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
