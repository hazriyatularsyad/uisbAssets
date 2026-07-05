import { X, Calendar } from "lucide-react"
import { useState } from "react"
import { Asset } from "../types"

interface ExportPDFModalProps {
  assets: Asset[]
  onClose: () => void
}

export default function ExportPDFModal({
  assets,
  onClose,
}: ExportPDFModalProps) {
  const [pdfSortKey, setPdfSortKey] = useState<
    "name" | "location" | "category"
  >("name")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")

    const doc = new jsPDF({ orientation: "landscape" })

    // Filter berdasarkan tanggal
    let filteredAssets = [...assets]

    if (startDate) {
      filteredAssets = filteredAssets.filter((asset) => {
        const purchaseDate = new Date(asset.purchaseDate)
        return purchaseDate >= new Date(startDate)
      })
    }

    if (endDate) {
      filteredAssets = filteredAssets.filter((asset) => {
        const purchaseDate = new Date(asset.purchaseDate)
        const endDateObj = new Date(endDate)
        endDateObj.setHours(23, 59, 59, 999) // Akhir hari
        return purchaseDate <= endDateObj
      })
    }

    const sortedForPdf = filteredAssets.sort((a, b) =>
      a[pdfSortKey].localeCompare(b[pdfSortKey]),
    )

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Laporan Aset Kantor - UISB", 14, 16)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")

    // Informasi filter tanggal
    let dateFilterInfo = ""
    if (startDate && endDate) {
      const start = new Date(startDate).toLocaleDateString("id-ID")
      const end = new Date(endDate).toLocaleDateString("id-ID")
      dateFilterInfo = `Periode: ${start} - ${end}`
    } else if (startDate) {
      const start = new Date(startDate).toLocaleDateString("id-ID")
      dateFilterInfo = `Mulai dari: ${start}`
    } else if (endDate) {
      const end = new Date(endDate).toLocaleDateString("id-ID")
      dateFilterInfo = `Sampai dengan: ${end}`
    }

    const sortLabel =
      pdfSortKey === "name"
        ? "Nama"
        : pdfSortKey === "location"
          ? "Lokasi"
          : "Kategori"

    doc.text(`Diurutkan berdasarkan: ${sortLabel}`, 14, 23)

    if (dateFilterInfo) {
      doc.text(dateFilterInfo, 14, 28)
      doc.text(
        `Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`,
        14,
        33,
      )
      doc.text(`Total aset: ${sortedForPdf.length}`, 14, 38)
    } else {
      doc.text(
        `Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`,
        14,
        28,
      )
      doc.text(`Total aset: ${sortedForPdf.length}`, 14, 33)
    }

    // Tentukan startY berdasarkan tinggi header
    // Y=16 (judul) + 7 (jarak) + 5 (sortLabel) + (dateFilterInfo ? 15 : 10) = 38 atau 43
    const headerHeight = dateFilterInfo ? 42 : 37
    const startY = headerHeight + 5

    autoTable(doc, {
      startY,
      head: [
        [
          "No",
          "Nama Barang",
          "Kategori",
          "Tanggal Beli",
          "Harga",
          "Lokasi",
          "Status",
          "Kondisi",
        ],
      ],
      body: sortedForPdf.map((asset, i) => [
        i + 1,
        asset.name,
        asset.category,
        new Date(asset.purchaseDate).toLocaleDateString("id-ID"),
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(asset.price),
        asset.location,
        asset.status,
        `${asset.condition}%`,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: {
        fillColor: [24, 24, 27],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    doc.save(`Laporan-Aset-UISB-${new Date().toISOString().split("T")[0]}.pdf`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <X size={16} />
        </button>
        <h3 className="text-lg font-bold text-white">Ekspor Laporan PDF</h3>
        <p className="text-xs text-zinc-500 mt-1">
          Pilih filter tanggal dan urutan data
        </p>

        {/* Date Range Filter */}
        <div className="mt-6 space-y-3">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Filter tanggal pembelian:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="export-start-date"
                className="mb-1 block text-[10px] text-zinc-500"
              >
                Dari tanggal
              </label>
              <label
                htmlFor="export-start-date"
                className="relative block cursor-pointer"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector("input")
                  if (input && "showPicker" in input) {
                    try {
                      ;(input as any).showPicker()
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                }}
              >
                <input
                  id="export-start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full cursor-pointer border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
                />
              </label>
            </div>
            <div>
              <label
                htmlFor="export-end-date"
                className="mb-1 block text-[10px] text-zinc-500"
              >
                Sampai tanggal
              </label>
              <label
                htmlFor="export-end-date"
                className="relative block cursor-pointer"
                onClick={(e) => {
                  const input = e.currentTarget.querySelector("input")
                  if (input && "showPicker" in input) {
                    try {
                      ;(input as any).showPicker()
                    } catch (err) {
                      console.warn(err)
                    }
                  }
                }}
              >
                <input
                  id="export-end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full cursor-pointer border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-600"
                />
              </label>
            </div>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate("")
                setEndDate("")
              }}
              className="text-[10px] text-zinc-400 hover:text-white underline"
            >
              Reset filter tanggal
            </button>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Urutkan berdasarkan:
          </p>
          {(
            [
              { key: "name", label: "Nama Barang (A-Z)" },
              { key: "location", label: "Lokasi (A-Z)" },
              { key: "category", label: "Kategori (A-Z)" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPdfSortKey(opt.key)}
              className={`w-full text-left px-4 py-3 text-sm font-medium border transition-all ${
                pdfSortKey === opt.key
                  ? "border-white bg-zinc-800 text-white"
                  : "border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {pdfSortKey === opt.key ? "✓ " : ""}
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 border border-zinc-800 hover:bg-zinc-900 hover:text-white"
          >
            Batal
          </button>
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-zinc-200"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}
