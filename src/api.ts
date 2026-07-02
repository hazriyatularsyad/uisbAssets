import type { Asset } from "./types"

const base = "/api"

export async function getAssets(): Promise<Asset[]> {
  const res = await fetch(`${base}/assets`)
  if (!res.ok) throw new Error("Failed to fetch assets")
  return res.json()
}

export async function addAsset(asset: Omit<Asset, "id">) {
  const res = await fetch(`${base}/assets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  })
  if (!res.ok) throw new Error("Failed to add asset")
  const data = await res.json()
  return data.id
}

export async function updateAsset(id: string, asset: Partial<Asset>) {
  const res = await fetch(`${base}/assets/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asset),
  })
  if (!res.ok) throw new Error("Failed to update asset")
  return res.json()
}

export async function deleteAsset(id: string) {
  const res = await fetch(`${base}/assets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to delete asset")
  return res.json()
}

// categories
export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${base}/categories`)
  if (!res.ok) throw new Error("Failed to fetch categories")
  return res.json()
}

export async function addCategory(name: string) {
  const res = await fetch(`${base}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to add category")
  return res.json()
}

// Auth placeholders (implement proper auth separately)
export async function signIn(email: string, password: string) {
  // accept any credentials for now (demo)
  return Promise.resolve({ user: { email } })
}

export async function signOutUser() {
  return Promise.resolve()
}

export default {
  getAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  getCategories,
  addCategory,
  signIn,
  signOutUser,
}
