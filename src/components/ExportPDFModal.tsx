import { X } from "lucide-react"
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

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf")
    const { default: autoTable } = await import("jspdf-autotable")

    const doc = new jsPDF({ orientation: "landscape" })

    const sortedForPdf = [...assets].sort((a, b) =>
      a[pdfSortKey].localeCompare(b[pdfSortKey]),
    )

    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("Laporan Aset Kantor - UISB", 14, 16)

    doc.setFontSize(9)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Diurutkan berdasarkan: ${pdfSortKey === "name" ? "Nama" : pdfSortKey === "location" ? "Lokasi" : "Kategori"}`,
      14,
      23,
    )
    doc.text(`Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 29)
    doc.text(`Total aset: ${sortedForPdf.length}`, 14, 35)

    autoTable(doc, {
      startY: 40,
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
          Pilih urutan data dalam laporan
        </p>

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
