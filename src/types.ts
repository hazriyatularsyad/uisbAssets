export type AssetCategory =
  | "Aset Bergerak"
  | "Aset Tetap"
  | "Mobiler"
  | "Barang Elektronik"
  | "Alat Sarana dan Prasarana"

export type AssetStatus = "Baik" | "Rusak Ringan" | "Rusak Berat"

export type AssetSource = "Hibah" | "Yayasan" | "Pemerintah"

export interface Asset {
  id: string // e.g., AST-0001
  name: string
  category: AssetCategory
  purchaseDate: string // YYYY-MM-DD
  price: number // in IDR
  location: string
  status: AssetStatus
  source: AssetSource
  condition: number // 0 - 100, calculated or specified
  description?: string
  receipt_url?: string | null
  images?: string[]
}

export interface AssetLoan {
  id: string
  assetId: string
  assetName: string
  borrowerName: string
  borrowDate: string
  loanLocation: string
  notes?: string
  returnedAt: string | null
  returnedBy?: string
  receivedBy?: string
  returnDate?: string
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
