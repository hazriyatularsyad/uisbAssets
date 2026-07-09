import { Edit2, Trash2 } from "lucide-react"
import { useState } from "react"
import { Asset } from "../types"
import { formatIDR, formatDateID } from "../utils/assetHelpers"
import ImageGalleryModal from "./ImageGalleryModal"

interface AssetTableProps {
  assets: Asset[]
  totalAssets: number
  sortKey: "name" | "purchaseDate" | "location" | "price" | null
  sortOrder: "asc" | "desc"
  onSort: (key: "name" | "purchaseDate" | "location" | "price") => void
  onEdit: (asset: Asset) => void
  onDelete: (asset: Asset) => void
}

export default function AssetTable({
  assets,
  totalAssets,
  sortKey,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: AssetTableProps) {
  const sortIcon = (key: string) =>
    sortKey === key ? (sortOrder === "asc" ? "↑" : "↓") : "↕"

  const statusClass = (status: string) => {
    if (status === "Tersedia")
      return "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
    if (status === "Digunakan")
      return "bg-blue-950/40 text-blue-400 border border-blue-900/50"
    return "bg-red-950/40 text-red-400 border border-red-900/50"
  }

  const conditionClass = (condition: number) => {
    if (condition >= 75) return "text-emerald-400"
    if (condition >= 50) return "text-yellow-500"
    return "text-red-400"
  }

  const conditionBarClass = (condition: number) => {
    if (condition >= 75) return "bg-emerald-500"
    if (condition >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const AssetImageCarousel = ({
    asset,
    compact = false,
  }: {
    asset: Asset
    compact?: boolean
  }) => {
    const imageUrls =
      asset.images && asset.images.length > 0
        ? asset.images
        : asset.receipt_url
          ? [asset.receipt_url]
          : []

    const [galleryOpen, setGalleryOpen] = useState(false)

    const openGallery = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setGalleryOpen(true)
    }

    if (imageUrls.length === 0) {
      return (
        <div className="flex h-full min-h-24 w-full items-center justify-center bg-zinc-900 text-[10px] text-zinc-600">
          Tidak ada gambar
        </div>
      )
    }

    // Tampilkan HANYA gambar pertama
    const currentUrl = imageUrls[0]

    return (
      <div className="w-full">
        <div
          className={`relative overflow-hidden bg-zinc-900 ${
            compact ? "h-16 w-16 cursor-pointer" : "h-48 w-full cursor-pointer"
          }`}
          onClick={openGallery}
        >
          <img
            src={currentUrl}
            alt={`Gambar aset ${asset.name}`}
            className={`w-full object-cover transition-opacity hover:opacity-90 ${
              compact ? "h-16" : "h-48"
            }`}
          />
        </div>

        {galleryOpen && (
          <ImageGalleryModal
            images={imageUrls}
            assetName={asset.name}
            onClose={() => setGalleryOpen(false)}
          />
        )}
      </div>
    )
  }

  return (
    <>
      {/* ==================== MOBILE CARD VIEW ==================== */}
      <div className="flex flex-col gap-3 sm:hidden">
        {assets.length > 0 ? (
          assets.map((asset, index) => (
            <div
              key={asset.id}
              className="border border-zinc-800 bg-zinc-950/60"
            >
              {/* Gambar paling atas */}
              <div className="w-full border-b border-zinc-800 bg-zinc-900 p-3 sm:h-80">
                <AssetImageCarousel asset={asset} />
              </div>

              {/* Konten card */}
              <div className="p-4 space-y-3">
                {/* Nomor + Nama */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-600 font-mono">
                      #{index + 1}
                    </span>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {asset.category}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(asset.status)}`}
                  >
                    {asset.status}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                      Tanggal Beli
                    </p>
                    <p className="text-zinc-300">
                      {formatDateID(asset.purchaseDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                      Harga
                    </p>
                    <p className="text-zinc-300 font-mono">
                      {formatIDR(asset.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                      Sumber Dana
                    </p>
                    <p className="text-zinc-300">{asset.source || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                      Lokasi
                    </p>
                    <p className="text-zinc-300">{asset.location}</p>
                  </div>
                </div>

                {/* Kondisi */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">
                      Kondisi
                    </p>
                    <span
                      className={`text-xs font-bold font-mono ${conditionClass(asset.condition)}`}
                    >
                      {asset.condition}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1">
                    <div
                      className={`h-full ${conditionBarClass(asset.condition)}`}
                      style={{ width: `${asset.condition}%` }}
                    />
                  </div>
                </div>

                {/* Aksi */}
                <div className="flex gap-2 pt-2 border-t border-zinc-900">
                  <button
                    onClick={() => onEdit(asset)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs cursor-pointer font-semibold text-zinc-400 border border-zinc-800 hover:bg-zinc-900 hover:text-white transition-all"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(asset)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs cursor-pointer font-semibold text-zinc-400 border border-zinc-800 hover:bg-zinc-900 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-zinc-600 font-medium border border-zinc-800">
            Tidak ada aset yang cocok dengan filter atau pencarian.
          </div>
        )}
      </div>

      {/* ==================== DESKTOP TABLE VIEW ==================== */}
      <div
        id="assets-table-container"
        className="hidden sm:block overflow-hidden rounded-none border border-zinc-850 bg-zinc-950/60 shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="py-4 px-4 text-center">No</th>
                <th className="py-4 px-4 text-center">Gambar</th>
                <th
                  className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => onSort("name")}
                >
                  Nama Barang {sortIcon("name")}
                </th>
                <th className="py-4 px-4">Kategori</th>
                <th
                  className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => onSort("purchaseDate")}
                >
                  Tanggal Beli {sortIcon("purchaseDate")}
                </th>
                <th
                  className="py-4 px-4 hidden md:table-cell cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => onSort("price")}
                >
                  Harga {sortIcon("price")}
                </th>
                <th className="py-4 px-4 hidden md:table-cell">Sumber</th>
                <th
                  className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => onSort("location")}
                >
                  Lokasi {sortIcon("location")}
                </th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Kondisi</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {assets.length > 0 ? (
                assets.map((asset, index) => (
                  <tr key={asset.id} className="group hover:bg-zinc-900/10">
                    <td className="py-4 px-4 text-center text-zinc-500 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="mx-auto flex justify-center">
                        <AssetImageCarousel asset={asset} compact />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">
                        {asset.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-medium">
                      {asset.category}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-medium">
                      {formatDateID(asset.purchaseDate)}
                    </td>
                    <td className="py-4 px-4 text-zinc-300 hidden md:table-cell font-mono">
                      {formatIDR(asset.price)}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-medium hidden md:table-cell">
                      {asset.source || "—"}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-medium">
                      {asset.location}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(asset.status)}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 bg-zinc-900 h-1 rounded-none overflow-hidden hidden lg:block">
                          <div
                            className={`h-full rounded-none ${conditionBarClass(asset.condition)}`}
                            style={{ width: `${asset.condition}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold font-mono text-right w-10 ${conditionClass(asset.condition)}`}
                        >
                          {asset.condition}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(asset)}
                          className="rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                          title="Edit Aset"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(asset)}
                          className="rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-all"
                          title="Hapus Aset"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-12 text-center text-zinc-600 font-medium"
                  >
                    Tidak ada aset yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


    </>
  )
}
