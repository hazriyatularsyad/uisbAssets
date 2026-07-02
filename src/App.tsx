import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import AssetList from "./components/AssetList"
import Login from "./components/Login"
import { Asset } from "./types"
import { INITIAL_ASSETS } from "./data/mockAssets"
import { calculateAssetCondition } from "./utils/assetHelpers"

const API_URL = "http://localhost:4000/api"

const authFetch = (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("assetgrid_token")
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
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
        const data = await res.json()
        if (mounted && data.length > 0) {
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
          setAssets(INITIAL_ASSETS)
        }
      } else {
        setAssets(INITIAL_ASSETS)
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
  ) => {
    const computedCondition = calculateAssetCondition(
      newAssetData.purchaseDate,
      newAssetData.category,
    )
    const id = `AST-${String(Date.now()).slice(-6)}`
    const toSave = { id, ...newAssetData, condition: computedCondition }

    try {
      await authFetch(`${API_URL}/assets`, {
        method: "POST",
        body: JSON.stringify(toSave),
      })
      const updated = [toSave as Asset, ...assets]
      setAssets(updated)
      localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
    } catch (err) {
      console.error("Gagal tambah ke PostgreSQL", err)
    }
  }

  const handleEditAsset = async (updatedAsset: Asset) => {
    try {
      await authFetch(`${API_URL}/assets/${updatedAsset.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedAsset),
      })
      const updated = assets.map((a) =>
        a.id === updatedAsset.id ? updatedAsset : a,
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
      setAuthError(null)
      return true
    } catch (err) {
      setAuthError("Gagal menghubungi server.")
      return false
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
    return <Login onLogin={handleLogin} error={authError} />
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
