# Debugging Data Import CSV

## Langkah-langkah Debug:

1. **Buka Browser Console** (tekan F12 atau Cmd+Option+I)
2. **Klik "Import CSV"** di aplikasi
3. **Download template** atau buat file CSV sendiri
4. **Upload file CSV**
5. **Lihat Console** untuk error messages

## Kemungkinan Masalah & Solusi:

### Masalah 1: "Kolom wajib tidak ditemukan"
- **Sebab**: File CSV tidak punya semua 8 kolom
- **Solusi**: Pastikan file punya kolom: Nama Barang, Kategori, Tanggal Beli, Harga, Sumber, Lokasi, Status, Kondisi

### Masalah 2: "Tidak ada data yang valid"
- **Sebab**: Data tidak ter-map atau field wajib kosong
- **Solusi**: 
  - Lihat debug info di alert message
  - Pastikan kolom "Nama Barang" dan "Lokasi" tidak kosong
  - Cek di console untuk REJECTED log

### Masalah 3: Data terlihat di mapping tapi tidak di preview
- **Sebab**: mapRowToAsset reject data
- **Solusi**: Buka console, cari "REJECTED" log, lihat nilai name dan location

## Informasi Debug yang Ditampilkan:

Alert akan menunjukkan:
- Jumlah data yang dimuat
- Sample row (baris pertama)
- Column mapping yang digunakan
- Nilai name dan location yang di-check

Informasi ini membantu diagnosa masalah.
