import { Edit2, Trash2 } from "lucide-react"
import { Asset, AssetStatus } from "../types"
import { formatIDR, formatDateID } from "../utils/assetHelpers"

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

  return (
    <>
      <div
        id="assets-table-container"
        className="overflow-hidden rounded-none border border-zinc-850 bg-zinc-950/60 shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="py-4 px-4 text-center">No</th>
                <th
                  className="py-4 px-4 cursor-pointer select-none hover:text-white transition-colors"
                  onClick={() => onSort("name")}
                >
                  Nama Barang {sortIcon("name")}
                </th>
                <th className="py-4 px-4">Kategori</th>
                <th
                  className="py-4 px-4 hidden sm:table-cell cursor-pointer select-none hover:text-white transition-colors"
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
                <th
                  className="py-4 px-4 hidden sm:table-cell cursor-pointer select-none hover:text-white transition-colors"
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
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 sm:hidden">
                        {asset.location}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-medium">
                      {asset.category}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 hidden sm:table-cell font-medium">
                      {formatDateID(asset.purchaseDate)}
                    </td>
                    <td className="py-4 px-4 text-zinc-300 hidden md:table-cell font-mono">
                      {formatIDR(asset.price)}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 hidden sm:table-cell font-medium">
                      {asset.location}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          asset.status === "Tersedia"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                            : asset.status === "Digunakan"
                              ? "bg-blue-950/40 text-blue-400 border border-blue-900/50"
                              : "bg-red-950/40 text-red-400 border border-red-900/50"
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 bg-zinc-900 h-1 rounded-none overflow-hidden hidden lg:block">
                          <div
                            className={`h-full rounded-none ${asset.condition >= 75 ? "bg-emerald-500" : asset.condition >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${asset.condition}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold font-mono text-right w-10 ${asset.condition >= 75 ? "text-emerald-400" : asset.condition >= 50 ? "text-yellow-500" : "text-red-400"}`}
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
                    colSpan={9}
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

      <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
        <span>
          Menampilkan{" "}
          <span className="font-semibold text-zinc-300">{assets.length}</span>{" "}
          dari{" "}
          <span className="font-semibold text-zinc-300">{totalAssets}</span>{" "}
          aset
        </span>
        {assets.length !== totalAssets && (
          <span className="text-zinc-600">
            (difilter dari total {totalAssets} aset)
          </span>
        )}
      </div>
    </>
  )
}
