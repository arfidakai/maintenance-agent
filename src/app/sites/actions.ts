"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export async function addSite(formData: FormData) {
  const name = formData.get("name")
  const url = formData.get("url")

  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Nama site wajib diisi.")
  }

  if (typeof url !== "string" || !url.trim().startsWith("http")) {
    throw new Error("URL harus diawali dengan http.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("sites").insert({
    name: name.trim(),
    url: url.trim(),
  })

  if (error) {
    throw new Error(`Gagal menambahkan site: ${error.message}`)
  }

  revalidatePath("/sites")
}

export async function deleteSite(formData: FormData) {
  const id = formData.get("id")

  if (typeof id !== "string" || !id) {
    throw new Error("ID site tidak valid.")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("sites").delete().eq("id", id)

  if (error) {
    throw new Error(`Gagal menghapus site: ${error.message}`)
  }

  revalidatePath("/sites")
}
