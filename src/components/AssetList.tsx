import { Plus } from "lucide-react"
import { useState } from "react"
import { Asset, AssetStatus } from "../types"
import AssetFilters from "./AssetFilters"
import AssetTable from "./AssetTable"
import AddAssetModal from "./AddAssetModal"
import EditAssetModal from "./EditAssetModal"
import DeleteAssetModal from "./DeleteAssetModal"
import ExportPDFModal from "./ExportPDFModal"

interface AssetListProps {
  assets: Asset[]

  onAddAsset: (
    asset: Omit<Asset, "id" | "condition">,
    receiptFile?: File | null,
  ) => void
  onEditAsset: (asset: Asset, receipt?: File | null) => void
  onDeleteAsset: (id: string) => void
}

export default function AssetList({
  assets,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
}: AssetListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua")
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | "Semua">(
    "Semua",
  )
  const [sortKey, setSortKey] = useState<
    "name" | "purchaseDate" | "location" | "price" | null
  >(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null)
  const [isPdfOpen, setIsPdfOpen] = useState(false)

  const handleSort = (key: "name" | "purchaseDate" | "location" | "price") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const filteredAssets = assets
    .filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === "Semua" || asset.category === selectedCategory
      const matchesStatus =
        selectedStatus === "Semua" || asset.status === selectedStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      if (!sortKey) return 0
      if (sortKey === "price")
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price
      let valA = a[sortKey]
      let valB = b[sortKey]
      if (sortKey === "purchaseDate") {
        valA = new Date(valA).getTime().toString()
        valB = new Date(valB).getTime().toString()
      }
      return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    })

  return (
    <div id="assets-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
            / MANAJEMEN ASET
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            Daftar Aset
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Kelola seluruh aset kantor. Kondisi terhitung otomatis dari tanggal
            beli.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <button
            onClick={() => setIsPdfOpen(true)}
            className="flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all"
          >
            Ekspor PDF
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-none border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all"
          >
            <Plus size={16} />
            Tambah Aset
          </button>
        </div>
      </div>
      <AssetFilters
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
      />
      <AssetTable
        assets={filteredAssets}
        totalAssets={assets.length}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={setEditAsset}
        onDelete={setDeleteAsset}
      />

      {isAddOpen && (
        <AddAssetModal
          onAdd={(asset, file) => {
            onAddAsset(asset, file)
            setIsAddOpen(false)
          }}
          onClose={() => setIsAddOpen(false)}
        />
      )}
      {editAsset && (
        <EditAssetModal
          asset={editAsset}
          onEdit={onEditAsset}
          onClose={() => setEditAsset(null)}
        />
      )}
      {deleteAsset && (
        <DeleteAssetModal
          asset={deleteAsset}
          onConfirm={() => {
            onDeleteAsset(deleteAsset.id)
            setDeleteAsset(null)
          }}
          onClose={() => setDeleteAsset(null)}
        />
      )}
      {isPdfOpen && (
        <ExportPDFModal
          assets={filteredAssets}
          onClose={() => setIsPdfOpen(false)}
        />
      )}
    </div>
  )
}
