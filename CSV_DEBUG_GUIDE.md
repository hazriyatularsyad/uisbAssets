# Instruksi Debug Data Import CSV

## Untuk Mengatasi Masalah "Data di Preview Tidak Terbaca"

### Langkah 1: Pastikan File CSV Benar
Buka file CSV di text editor (Notepad/VS Code), pastikan:
- Header line pertama: `Nama Barang,Kategori,Tanggal Beli,Harga,Sumber,Lokasi,Status,Kondisi`
- Setiap baris data punya 8 kolom (pisah dengan koma)
- Tidak ada karakter khusus di awal/akhir baris

### Langkah 2: Buka Browser Console
1. Tekan **F12** (Windows) atau **Cmd+Option+I** (Mac)
2. Pilih tab **Console**
3. Biarkan terbuka saat melakukan import

### Langkah 3: Upload File CSV
1. Klik tombol "Import CSV"
2. Klik download icon untuk download template (opsional)
3. Upload file CSV

### Langkah 4: Lihat Console Logs
Saat file berhasil di-upload, console akan menampilkan:
```
File parsed successfully:
- Headers: [Array of column names]
- Data rows: [number of rows]
- First row: [Object with data]
- Mapping: [Object with field mapping]
```

### Langkah 5: Klik "Lanjut ke Preview"
Jika data tidak terbaca, alert akan menampilkan:
```
Debug Info:
Data dimau...
Sample row: {...}
Column mapping: {...}
Checking name: "..."
Checking location: "..."
```

## Yang Perlu Dicek:

1. **Headers**: Apakah semua 8 kolom ada?
2. **Data rows**: Berapa jumlah baris?
3. **First row**: Apakah data terlihat benar?
4. **Sample row di alert**: Apakah values kosong atau ada isi?
5. **Console REJECTED logs**: Ada pesan reject?

## Format CSV yang Benar:

```csv
Nama Barang,Kategori,Tanggal Beli,Harga,Sumber,Lokasi,Status,Kondisi
Monitor LG,Peralatan IT,2024-01-15,3500000,Hibah,Ruang IT,Tersedia,Baik
Meja Kerja,Furnitur,2024-02-20,1200000,Yayasan,Ruang Rapat,Digunakan,Baik
```

## Tips:
- Jangan gunakan quotes kecuali data punya koma
- Pastikan Nama Barang dan Lokasi tidak kosong
- Tanggal format YYYY-MM-DD
- Harga hanya angka, tanpa titik ribuan
