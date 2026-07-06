export const CSV_TEMPLATE_HEADERS = [
  "Nama Barang",
  "Kategori",
  "Tanggal Beli",
  "Harga",
  "Sumber",
  "Lokasi",
  "Status",
  "Kondisi",
]

export const SAMPLE_DATA = [
  [
    "Monitor LG 24 Inch",
    "Peralatan IT",
    "2024-01-15",
    "3500000",
    "Hibah",
    "Ruang IT",
    "",
    "",
  ],
  [
    "Meja Kerja Kayu",
    "Furnitur",
    "2024-02-20",
    "1200000",
    "Yayasan",
    "Ruang Rapat",
    "",
    "",
  ],
  [
    "Printer Canon Laser",
    "Peralatan IT",
    "2024-03-10",
    "5000000",
    "Pemerintah",
    "Ruang Administrasi",
    "",
    "",
  ],
  [
    "Kursi Putar Ergonomis",
    "Furnitur",
    "2024-01-22",
    "850000",
    "Hibah",
    "Ruang Kerja",
    "",
    "",
  ],
  [
    "Lemari Filing Besi",
    "Furnitur",
    "2023-12-05",
    "750000",
    "Yayasan",
    "Ruang Arsip",
    "",
    "",
  ],
  [
    "Keyboard Logitech",
    "Peralatan IT",
    "2024-04-01",
    "450000",
    "Hibah",
    "Ruang IT",
    "",
    "",
  ],
  [
    "Mouse Wireless",
    "Peralatan IT",
    "2024-04-01",
    "200000",
    "Hibah",
    "Ruang IT",
    "",
    "",
  ],
  [
    "Meja Rapat Besar",
    "Furnitur",
    "2023-11-10",
    "3000000",
    "Pemerintah",
    "Ruang Meeting",
    "",
    "",
  ],
]

export const generateCSVContent = (includeSample: boolean = true): string => {
  const headers = CSV_TEMPLATE_HEADERS.join(",")

  if (!includeSample) {
    return headers
  }

  const rows = SAMPLE_DATA.map((row) =>
    row.map((cell) => `"${cell}"`).join(","),
  ).join("\n")

  return `${headers}\n${rows}`
}

export const downloadCSV = (content: string, filename: string = "template-aset.csv") => {
  const element = document.createElement("a")
  element.setAttribute(
    "href",
    "data:text/csv;charset=utf-8," + encodeURIComponent(content),
  )
  element.setAttribute("download", filename)
  element.style.display = "none"
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
