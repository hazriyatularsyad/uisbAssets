# Panduan Import Aset CSV

## Format CSV yang Benar

File CSV HARUS memiliki 8 kolom dengan nama EXACT seperti ini:

```
Nama Barang,Kategori,Tanggal Beli,Harga,Sumber,Lokasi,Status,Kondisi
```

### Detail Setiap Kolom:

1. **Nama Barang** (wajib, tidak boleh kosong)
   - Contoh: "Monitor LG 24 Inch", "Meja Kerja", "Printer"

2. **Kategori** (wajib, harus salah satu dari):
   - "Peralatan IT"
   - "Furnitur"
   - "Alat Tulis Kantor"
   - "Kendaraan"
   - "Lainnya"

3. **Tanggal Beli** (wajib, format YYYY-MM-DD)
   - Contoh: "2024-01-15", "2024-02-20"

4. **Harga** (wajib, angka saja)
   - Contoh: "3500000", "1200000"
   - Jangan gunakan titik atau koma sebagai pemisah ribuan

5. **Sumber** (wajib, harus salah satu dari):
   - "Hibah"
   - "Yayasan"
   - "Pemerintah"

6. **Lokasi** (wajib, tidak boleh kosong)
   - Contoh: "Ruang IT", "Ruang Rapat", "Ruang Administrasi"

7. **Status** (wajib, harus salah satu dari):
   - "Tersedia"
   - "Digunakan"
   - "Rusak"

8. **Kondisi** (wajib, deskripsi kondisi)
   - Contoh: "Baik", "Sangat Baik", "Butuh Perbaikan", "Rusak Ringan"

## Contoh Data Lengkap

```csv
Nama Barang,Kategori,Tanggal Beli,Harga,Sumber,Lokasi,Status,Kondisi
Monitor LG 24 Inch,Peralatan IT,2024-01-15,3500000,Hibah,Ruang IT,Tersedia,Baik
Meja Kerja Kayu,Furnitur,2024-02-20,1200000,Yayasan,Ruang Rapat,Digunakan,Baik
Printer Canon Laser,Peralatan IT,2024-03-10,5000000,Pemerintah,Ruang Administrasi,Tersedia,Sangat Baik
Kursi Putar Ergonomis,Furnitur,2024-01-22,850000,Hibah,Ruang Kerja,Digunakan,Baik
```

## Cara Menggunakan

1. **Download Template**
   - Buka halaman Manajemen Aset
   - Klik tombol "Import CSV"
   - Klik icon Download untuk download template dengan sample data

2. **Edit Template**
   - Buka file dengan Excel atau Google Sheets
   - Edit data sesuai kebutuhan
   - JANGAN ubah nama kolom (header)
   - Pastikan semua kolom tetap ada

3. **Simpan File**
   - Simpan sebagai format CSV (comma-separated values)
   - Pastikan file berakhir dengan `.csv`

4. **Upload File**
   - Kembali ke modal Import CSV
   - Pilih file CSV yang sudah disiapkan
   - Sistem akan validasi kolom secara otomatis

5. **Review Preview**
   - Lihat preview data
   - Pastikan data sudah benar sebelum import

6. **Konfirmasi Import**
   - Klik "Import X Aset"
   - Data akan masuk ke aplikasi
   - Aset akan langsung terlihat di daftar dengan ID otomatis

## Tips

- Jangan gunakan karakter spesial dalam nama kolom
- Pastikan tidak ada spasi di awal/akhir cell
- Tanggal harus format YYYY-MM-DD
- Harga hanya angka, tidak perlu format currency
- Jika ada error, pesan akan menunjukkan kolom mana yang bermasalah

## Debugging

Jika data tidak terbaca saat preview:
- Buka Console Browser (F12 → Console)
- Lihat log untuk debug informasi
- Pastikan semua kolom yang wajib ada di file CSV
