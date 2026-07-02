import { Search } from "lucide-react"
import { AssetCategory, AssetStatus } from "../types"

const CATEGORIES: AssetCategory[] = [
  "Peralatan IT",
  "Furnitur",
  "Alat Tulis Kantor",
]

interface AssetFiltersProps {
  searchQuery: string
  selectedCategory: string
  selectedStatus: AssetStatus | "Semua"
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onStatusChange: (value: AssetStatus | "Semua") => void
}

export default function AssetFilters({
  searchQuery,
  selectedCategory,
  selectedStatus,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
}: AssetFiltersProps) {
  return (
    <div
      id="filters-panel"
      className="rounded-none border border-zinc-850 bg-zinc-950 p-5 space-y-4"
    >
      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Cari kode, nama, atau lokasi aset..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-none border border-zinc-900 bg-zinc-900/40 py-2.5 pr-4 pl-11 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-700 focus:bg-zinc-900/60 transition-all font-medium"
        />
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Kategori:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(["Semua", ...CATEGORIES] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`rounded-none px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-zinc-800 text-white shadow-md"
                    : "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Status:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(["Semua", "Tersedia", "Digunakan", "Rusak"] as const).map(
              (stat) => (
                <button
                  key={stat}
                  onClick={() => onStatusChange(stat)}
                  className={`rounded-none px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedStatus === stat
                      ? "bg-zinc-800 text-white shadow-md"
                      : "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-900"
                  }`}
                >
                  {stat}
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
