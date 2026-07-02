export type AssetCategory =
  | "Peralatan IT"
  | "Furnitur"
  | "Alat Tulis Kantor"
  | "Kendaraan"
  | "Lainnya"

export type AssetStatus = "Tersedia" | "Digunakan" | "Rusak"

export interface Asset {
  id: string // e.g., AST-0001
  name: string
  category: AssetCategory
  purchaseDate: string // YYYY-MM-DD
  price: number // in IDR
  location: string
  status: AssetStatus
  condition: number // 0 - 100, calculated or specified
  description?: string
  receipt_url?: string | null
}

export interface DashboardStats {
  totalAssets: number
  totalValue: number
  criticalAssetsCount: number
  categoryDistribution: {
    category: AssetCategory
    count: number
    value: number
    color: string
  }[]
  maintenanceRequired: Asset[]
}
