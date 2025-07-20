# Sistem Pendukung Keputusan - Penentuan Lokasi Tofico Syrup

Sistem Pendukung Keputusan (Decision Support System) untuk menentukan lokasi terbaik pendirian usaha Tofico Syrup menggunakan algoritma **SAW (Simple Additive Weighting)** dan **WP (Weighted Product)**.

## Fitur Utama

### Analisis Multi-Kriteria

- **Algoritma SAW**: Metode penjumlahan terbobot untuk evaluasi alternatif
- **Algoritma WP**: Metode perkalian terbobot untuk perbandingan
- **Perbandingan Hasil**: Analisis konsistensi antara kedua algoritma
- **Rekomendasi Otomatis**: Sistem memberikan rekomendasi lokasi terbaik


### Manajemen Lokasi

- **CRUD Operations**: Tambah, edit, hapus, dan lihat lokasi
- **Data Lengkap**: Nama, alamat, koordinat (latitude/longitude)
- **Penilaian Kriteria**: Input nilai untuk setiap kriteria (0-100)
- **Validasi Data**: Sistem validasi input untuk memastikan data akurat


### ️ Integrasi Peta

- **Google Maps**: Buka lokasi di Google Maps
- **Street View**: Lihat kondisi lokasi secara virtual
- **Pencarian Koordinat**: Helper untuk mencari koordinat berdasarkan alamat
- **Copy Koordinat**: Salin koordinat ke clipboard


### ️ Manajemen Kriteria

- **Kriteria Fleksibel**: Tambah, edit, hapus kriteria sesuai kebutuhan
- **Tipe Kriteria**: Benefit (semakin tinggi semakin baik) atau Cost (semakin rendah semakin baik)
- **Bobot Dinamis**: Atur bobot setiap kriteria
- **Normalisasi Otomatis**: Sistem otomatis menormalisasi bobot total menjadi 1.0


### Visualisasi & Laporan

- **Ranking Visual**: Tampilan ranking dengan ikon dan warna
- **Progress Bar**: Visualisasi skor dalam bentuk progress bar
- **Tabel Perbandingan**: Perbandingan detail hasil kedua algoritma
- **Statistik Lokasi**: Dashboard statistik lokasi dan kriteria


## ️ Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: CSS Grid, Flexbox, Responsive Design
- **Icons**: Unicode Emoji & Symbols
- **Storage**: LocalStorage untuk persistensi data
- **Maps**: Google Maps API integration


## Kriteria Default

| Kriteria | Bobot | Tipe | Deskripsi
|-----|-----|-----|-----
| Kepadatan Penduduk | 0.25 | Benefit | Tingkat kepadatan penduduk di area lokasi
| Aksesibilitas | 0.20 | Benefit | Kemudahan akses transportasi dan infrastruktur
| Tingkat Persaingan | 0.15 | Cost | Jumlah kompetitor di sekitar lokasi
| Biaya Sewa | 0.20 | Cost | Biaya sewa tempat usaha per bulan
| Potensi Pasar | 0.20 | Benefit | Potensi target market di area tersebut


## Instalasi & Setup

### Prasyarat

- XAMPP atau web server lokal lainnya
- Browser modern (Chrome, Firefox, Safari, Edge)


### Langkah Instalasi

1. **Download & Extract**

```shellscript
# Download atau clone repository
git clone [repository-url]
```


2. **Setup XAMPP**

```plaintext
xampp/htdocs/tofico-dss/
├── index.html
├── styles.css
└── script.js
```


3. **Jalankan XAMPP**

1. Start Apache service
2. Buka browser dan akses: `http://localhost/tofico-dss/`



4. **Verifikasi**

1. Pastikan semua tab dapat diakses
2. Test tambah/edit lokasi dan kriteria
3. Cek hasil algoritma SAW dan WP





## Cara Penggunaan

### 1. Mengelola Lokasi

```plaintext
Tab "Kelola Lokasi" → Klik "Tambah Lokasi Baru"
- Isi nama lokasi
- Masukkan alamat lengkap
- Input koordinat (gunakan helper jika perlu)
- Berikan nilai untuk setiap kriteria (0-100)
```

### 2. Mengelola Kriteria

```plaintext
Tab "Kelola Kriteria" → Klik "Tambah Kriteria Baru"
- Tentukan ID kriteria (unik)
- Nama kriteria yang deskriptif
- Atur bobot (sistem akan normalisasi otomatis)
- Pilih tipe: Benefit atau Cost
```

### 3. Melihat Hasil Analisis

```plaintext
Tab "Hasil Analisis"
- Lihat ranking SAW dan WP
- Bandingkan konsistensi hasil
- Baca rekomendasi sistem
- Export atau print hasil jika diperlukan
```

### 4. Menggunakan Peta

```plaintext
Tab "Peta Lokasi"
- Lihat semua lokasi dengan koordinat
- Klik "Google Maps" untuk buka di maps
- Klik "Street View" untuk lihat kondisi lokasi
- Gunakan helper koordinat untuk lokasi baru
```

## Konfigurasi

### Mengubah Kriteria Default

Edit file `script.js` pada bagian:

```javascript
let criteria = [
  { 
    id: "newCriteria", 
    name: "Nama Kriteria Baru", 
    weight: 0.1, 
    type: "benefit" // atau "cost"
  },
  // ... kriteria lainnya
];
```

### Menambah Lokasi Default

Edit file `script.js` pada bagian:

```javascript
let locations = [
  {
    id: 1,
    name: "Nama Lokasi",
    address: "Alamat Lengkap",
    latitude: -6.2088,
    longitude: 106.8456,
    criteria: {
      criteriaId: nilai, // 0-100
      // ... kriteria lainnya
    }
  },
  // ... lokasi lainnya
];
```

## Algoritma yang Digunakan

### SAW (Simple Additive Weighting)

1. **Normalisasi**: Nilai kriteria dinormalisasi (0-1)

1. Benefit: `r_ij = x_ij / max(x_ij)`
2. Cost: `r_ij = min(x_ij) / x_ij`



2. **Perhitungan Skor**: `S_i = Σ(w_j × r_ij)`

1. `w_j` = bobot kriteria j
2. `r_ij` = nilai normalisasi alternatif i kriteria j





### WP (Weighted Product)

1. **Perhitungan S**: `S_i = Π(x_ij^w_j)`

1. Benefit: eksponen positif
2. Cost: eksponen negatif



2. **Perhitungan V**: `V_i = S_i / Σ(S_i)`


## Kustomisasi Tampilan

### Mengubah Tema Warna

Edit file `styles.css`:

```css
:root {
  --primary-color: #4f46e5;    /* Warna utama */
  --secondary-color: #f3f4f6;  /* Warna sekunder */
  --success-color: #22c55e;    /* Warna sukses */
  --danger-color: #ef4444;     /* Warna bahaya */
}
```

### Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { ... }

/* Tablet */
@media (max-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

## Keamanan & Validasi

- ✅ Input validation untuk semua form
- ✅ XSS protection dengan proper escaping
- ✅ Data sanitization sebelum disimpan
- ✅ Error handling untuk operasi CRUD
- ✅ Backup otomatis ke localStorage


## Kompatibilitas

| Browser | Desktop | Mobile | Tablet
|-----|-----|-----|-----
| Chrome | ✅ | ✅ | ✅
| Firefox | ✅ | ✅ | ✅
| Safari | ✅ | ✅ | ✅
| Edge | ✅ | ✅ | ✅


## Troubleshooting

### Error 404 pada CSS/JS

```plaintext
Solusi: Pastikan struktur folder benar
xampp/htdocs/tofico-dss/
├── index.html
├── styles.css
└── script.js
```

### Data Tidak Tersimpan

```plaintext
Solusi: 
1. Cek browser support localStorage
2. Clear browser cache
3. Pastikan tidak ada error JavaScript di console
```

### Koordinat Tidak Akurat

```plaintext
Solusi:
1. Gunakan Google Maps untuk mendapatkan koordinat akurat
2. Format: latitude, longitude (contoh: -6.2088, 106.8456)
3. Gunakan helper koordinat yang tersedia
```

### Hasil Algoritma Tidak Konsisten

```plaintext
Solusi:
1. Periksa bobot kriteria (total harus = 1.0)
2. Pastikan tipe kriteria benar (benefit/cost)
3. Validasi input nilai kriteria (0-100)
```

## Pengembangan Lanjutan

### Fitur yang Dapat Ditambahkan

- 🔐 **Sistem Login**: Multi-user dengan role management
- 🗄️ **Database**: Integrasi MySQL untuk data persistence
- 📄 **Export PDF**: Generate laporan dalam format PDF
- 📊 **Dashboard Analytics**: Grafik dan chart untuk visualisasi
- 🌐 **API Integration**: Integrasi dengan layanan eksternal
- 📱 **Mobile App**: Versi mobile native
- 🔄 **Real-time Sync**: Sinkronisasi data real-time
- 🎯 **Advanced Algorithms**: TOPSIS, ELECTRE, AHP


### Struktur Database (Opsional)

```sql
-- Tabel Lokasi
CREATE TABLE locations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kriteria
CREATE TABLE criteria (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  weight DECIMAL(5,3) NOT NULL,
  type ENUM('benefit', 'cost') NOT NULL
);

-- Tabel Penilaian
CREATE TABLE evaluations (
  location_id INT,
  criteria_id VARCHAR(50),
  value INT NOT NULL,
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (criteria_id) REFERENCES criteria(id),
  PRIMARY KEY (location_id, criteria_id)
);
```

## Kontribusi

Untuk berkontribusi pada proyek ini:

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request


## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## Kontak & Support

- **Developer**: [Nama Developer]
- **Email**: [[email@example.com](mailto:email@example.com)]
- **GitHub**: [github.com/username]
- **Documentation**: [Link ke dokumentasi lengkap]


---

## Acknowledgments

- Terima kasih kepada komunitas open source
- Referensi algoritma SAW dan WP dari literatur akademik
- Google Maps API untuk integrasi peta
- XAMPP untuk development environment


---

**© 2024 Tofico Syrup Decision Support System. All rights reserved.**
