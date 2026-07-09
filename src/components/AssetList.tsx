import { Plus, Download } from "lucide-react"
import { useState } from "react"
import { Asset, AssetStatus } from "../types"
import AssetFilters from "./AssetFilters"
import AssetTable from "./AssetTable"
import AddAssetModal from "./AddAssetModal"
import EditAssetModal from "./EditAssetModal"
import DeleteAssetModal from "./DeleteAssetModal"
import ExportPDFModal from "./ExportPDFModal"
import ImportAssetModal from "./ImportAssetModal"

interface AssetListProps {
  assets: Asset[]

  onAddAsset: (
    asset: Omit<Asset, "id" | "condition">,
    receiptFiles?: File[] | null,
  ) => void
  onEditAsset: (asset: Asset, receiptFiles?: File[] | null) => void
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
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const handleSort = (key: "name" | "purchaseDate" | "location" | "price") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("asc")
    }
  }

  const handleFilterChange = (
    filterSetter: (value: any) => void,
    value: any,
  ) => {
    filterSetter(value)
    setCurrentPage(1)
  }

  const allFilteredAssets = assets
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

  const totalPages = Math.ceil(allFilteredAssets.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const filteredAssets = allFilteredAssets.slice(startIndex, endIndex)

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
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 rounded-none border cursor-pointer border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all"
          >
            <Download size={16} />
            Import CSV
          </button>
          <button
            onClick={() => setIsPdfOpen(true)}
            className="flex items-center gap-2 rounded-none border cursor-pointer border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all"
          >
            Ekspor PDF
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-none border cursor-pointer border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-all"
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
        onSearchChange={(query) => handleFilterChange(setSearchQuery, query)}
        onCategoryChange={(cat) => handleFilterChange(setSelectedCategory, cat)}
        onStatusChange={(status) => handleFilterChange(setSelectedStatus, status)}
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

      {/* Pagination Footer */}
      {allFilteredAssets.length > itemsPerPage && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1 py-4 border-t border-zinc-900">
          <div className="text-xs text-zinc-500">
            <span>
              Halaman{" "}
              <span className="font-semibold text-zinc-300">{currentPage}</span>{" "}
              dari{" "}
              <span className="font-semibold text-zinc-300">{totalPages}</span>
            </span>
            <span className="ml-4 text-zinc-600">
              ({startIndex + 1}-{Math.min(endIndex, allFilteredAssets.length)} dari{" "}
              {allFilteredAssets.length} aset)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-none border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-none border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}

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
      {isImportOpen && (
        <ImportAssetModal
          onImport={async (importedAssets) => {
            for (const asset of importedAssets) {
              await onAddAsset(asset)
            }
          }}
          onClose={() => setIsImportOpen(false)}
        />
      )}
    </div>
  )
}
