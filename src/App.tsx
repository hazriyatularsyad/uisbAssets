import { useEffect, useState } from "react"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import AssetList from "./components/AssetList"
import Login from "./components/Login"
import { Asset } from "./types"
import { INITIAL_ASSETS } from "./data/mockAssets"
import { calculateAssetCondition } from "./utils/assetHelpers"

const DEMO_USERNAME = "admin"
const DEMO_PASSWORD = "123456"

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "assets">(
    "dashboard",
  )
  const [assets, setAssets] = useState<Asset[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const savedAuth = localStorage.getItem("assetgrid_auth")
    if (savedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("assetgrid_assets")
    if (saved) {
      try {
        setAssets(JSON.parse(saved))
      } catch (error) {
        console.error(
          "Failed to parse assets from localStorage, loading initial data",
          error,
        )
        setAssets(INITIAL_ASSETS)
      }
    } else {
      setAssets(INITIAL_ASSETS)
    }
  }, [])

  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem("assetgrid_assets", JSON.stringify(assets))
    }
  }, [assets])

  const getNextAssetId = (currentAssets: Asset[]): string => {
    if (currentAssets.length === 0) return "AST-0001"

    const ids = currentAssets.map((asset) => {
      const parts = asset.id.split("-")
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10)
        return Number.isNaN(num) ? 0 : num
      }
      return 0
    })

    const maxId = Math.max(...ids, 0)
    const nextId = maxId + 1
    return `AST-${String(nextId).padStart(4, "0")}`
  }

  const handleAddAsset = (newAssetData: Omit<Asset, "id" | "condition">) => {
    const nextId = getNextAssetId(assets)
    const computedCondition = calculateAssetCondition(
      newAssetData.purchaseDate,
      newAssetData.category,
    )

    const newAsset: Asset = {
      ...newAssetData,
      id: nextId,
      condition: computedCondition,
    }

    const updated = [newAsset, ...assets]
    setAssets(updated)
    localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
  }

  const handleEditAsset = (updatedAsset: Asset) => {
    const updated = assets.map((asset) =>
      asset.id === updatedAsset.id ? updatedAsset : asset,
    )
    setAssets(updated)
    localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
  }

  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter((asset) => asset.id !== id)
    setAssets(updated)
    localStorage.setItem("assetgrid_assets", JSON.stringify(updated))
  }

  const handleLogin = (username: string, password: string) => {
    if (
      username.trim().toLowerCase() === DEMO_USERNAME &&
      password === DEMO_PASSWORD
    ) {
      setIsAuthenticated(true)
      setAuthError(null)
      localStorage.setItem("assetgrid_auth", "true")
      return true
    }

    setAuthError("Username atau password salah. Coba admin dan 123456.")
    return false
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAuthError(null)
    localStorage.removeItem("assetgrid_auth")
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
        userEmail={DEMO_USERNAME}
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
