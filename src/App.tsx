import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import AssetList from "./components/AssetList"
import Login from "./components/Login"
import { Asset } from "./types"

import { calculateAssetCondition } from "./utils/assetHelpers"

const API_URL = "https://uisbassets-production.up.railway.app/api"

const parseApiResponse = async (res: Response) => {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("assetgrid_token")
  const isForm = options.body instanceof FormData
  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  if (!isForm) headers["Content-Type"] = "application/json"
  const res = await fetch(url, {
    ...options,
    headers,
  })
  return res
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "assets">(
    () =>
      (localStorage.getItem("assetgrid_tab") as "dashboard" | "assets") ??
      "dashboard",
  )
  const [assets, setAssets] = useState<Asset[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string>("")

  useEffect(() => {
    localStorage.setItem("assetgrid_tab", activeTab)
  }, [activeTab])

  useEffect(() => {
    const savedAuth = localStorage.getItem("assetgrid_auth")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await authFetch(`${API_URL}/assets`)
        const data = await parseApiResponse(res)
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("assetgrid_token")
            localStorage.removeItem("assetgrid_auth")
            setIsAuthenticated(false)
            return
          }
        }
        if (mounted && Array.isArray(data) && data.length > 0) {
          setAssets(data)
          localStorage.setItem("assetgrid_assets", JSON.stringify(data))
          return
        }
      } catch (err) {
        console.warn("Gagal load dari PostgreSQL, fallback localStorage", err)
      }

      const saved = localStorage.getItem("assetgrid_assets")
      if (saved) {
        try {
          setAssets(JSON.parse(saved))
        } catch {
          setAssets([])
        }
      } else {
        setAssets([])
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem("assetgrid_assets", JSON.stringify(assets))
    }
  }, [assets])

  const handleAddAsset = async (
    newAssetData: Omit<Asset, "id" | "condition">,
    receiptFiles?: File[] | null,
  ) => {
    const computedCondition = calculateAssetCondition(
      newAssetData.purchaseDate,
      newAssetData.category,
    )
    const id = `AST-${String(Date.now()).slice(-6)}`
    const toSave = { id, ...newAssetData, condition: computedCondition }

    try {
      const formData = new FormData()
      Object.entries(toSave).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
      if (receiptFiles && receiptFiles.length > 0) {
        receiptFiles.forEach((file) => formData.append("receipt", file))
      }

      const token = localStorage.getItem("assetgrid_token")
      const res = await fetch(`${API_URL}/assets`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await parseApiResponse(res)
      if (!res.ok) {
        throw new Error(data.error || "Gagal menambah aset")
      }
      const created: Asset = {
        ...toSave,
        receipt_url: data.receiptUrl ?? null,
        images: data.images ?? (data.receiptUrl ? [data.receiptUrl] : []),
      }
      const updated = [created, ...assets]
      setAssets(updated)
      localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
    } catch (err) {
      console.error("Gagal tambah ke PostgreSQL", err)
    }
  }

  const handleEditAsset = async (
    updatedAsset: Asset,
    receiptFiles?: File[] | null,
  ) => {
    try {
      const form = new FormData()
      // append editable fields
      const fields = { ...updatedAsset }
      delete (fields as any).id
      Object.entries(fields).forEach(([k, v]) => {
        if (k === "images") {
          form.append("images", JSON.stringify(v ?? []))
        } else if (Array.isArray(v)) {
          form.append(k, JSON.stringify(v))
        } else {
          form.append(k, v as any)
        }
      })
      if (receiptFiles && receiptFiles.length > 0) {
        receiptFiles.forEach((file) => form.append("receipt", file))
      }

      const res = await authFetch(`${API_URL}/assets/${updatedAsset.id}`, {
        method: "PUT",
        body: form,
      })
      const data = await parseApiResponse(res)
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui aset")
      }
      const updated = assets.map((a) =>
        a.id === updatedAsset.id
          ? {
              ...updatedAsset,
              receipt_url: data.receiptUrl || a.receipt_url,
              images: data.images ?? updatedAsset.images ?? a.images ?? [],
            }
          : a,
      )
      setAssets(updated)
      localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
    } catch (err) {
      console.error("Gagal update ke PostgreSQL", err)
    }
  }

  const handleDeleteAsset = async (id: string) => {
    try {
      await authFetch(`${API_URL}/assets/${id}`, { method: "DELETE" })
      const updated = assets.filter((a) => a.id !== id)
      setAssets(updated)
      localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
    } catch (err) {
      console.error("Gagal hapus dari PostgreSQL", err)
    }
  }

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || "Username atau password salah.")
        return false
      }
      localStorage.setItem("assetgrid_token", data.token)
      localStorage.setItem("assetgrid_auth", "true")
      setIsAuthenticated(true)
      setCurrentUser(data.username)
      setActiveTab("dashboard")
      localStorage.setItem("assetgrid_tab", "dashboard")
      setAuthError(null)
      return true
    } catch (err) {
      setAuthError("Gagal menghubungi server.")
      return false
    }
  }

  const handleRegister = async (username: string, password: string): Promise<string> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return data.error || "Gagal mendaftar pengguna."
      }
      return "" // empty = sukses
    } catch (err) {
      return "Gagal menghubungi server."
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser("")
    setAuthError(null)
    localStorage.removeItem("assetgrid_auth")
    localStorage.removeItem("assetgrid_token")
  }

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        error={authError}
      />
    )
  }

  return (
    <div
      id="app-container"
      className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans md:flex-row bg-grid-pattern"
    >
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={currentUser}
        onLogout={handleLogout}
        onRegister={handleRegister}
      />

      <main
        id="main-content"
        className="mx-auto flex-1 w-full max-w-7xl overflow-y-auto px-4 py-8 sm:px-6 md:px-8"
      >
        {activeTab === "dashboard" ? (
          <Dashboard
            assets={assets}
            onViewAllAssets={() => setActiveTab("assets")}
          />
        ) : (
          <AssetList
            assets={assets}
            onAddAsset={handleAddAsset}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}
      </main>
    </div>
  )
}
