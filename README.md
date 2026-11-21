# eKULAP — Elektronik Kutip Lapis & Pengangkutan Sawit

**eKULAP** adalah aplikasi manajemen operasional panen, kutip lapis brondolan, pengangkutan (Surat Pengantar Buah / SPB), hingga rekonsiliasi timbangan Pabrik Kelapa Sawit (PKS) berbasis web untuk perkebunan kelapa sawit (Sinarmas Agribusiness).

Aplikasi ini dirancang untuk menjembatani pencatatan lapangan di Tempat Pengumpulan Hasil (TPH), verifikasi armada pengangkut, pemantauan restan harian dan per stasiun, audit sistem, hingga analisis operasional berbasis AI.

---

## Alur Operasional Utama

```mermaid
flowchart LR
    Start(("○ Start")) --> TPH["Catat Timbang TPH
    & Foto GPS"]
    TPH --> SPB["Buat Surat Jalan
    & Muat Truk"]
    SPB --> Kirim["Berangkatkan Truk
    & Foto Muat"]
    Kirim --> PKS["Timbang Jembatan PKS
    & Hitung Susut"]
    PKS --> Rekap["Rekapan Restan
    & Analisis AI"]
    Rekap --> End((("● End")))
```

1. **Timbang TPH**: Kerani/petugas lapangan mencatat hasil panen (`TBS`, `Brondolan`, atau `Kutip Lapis`), memilih titik TPH, menandai tenaga kerja (multi-pekerja), memvalidasi jarak koordinat GPS terhadap titik paten TPH, serta mengunggah 3–10 foto bukti lapangan.
2. **Surat Jalan (SPB)**: Petugas muat memilih stasiun hasil panen yang masih menyisakan karung di TPH (mendukung pemuatan parsial maupun penuh dengan proteksi anti klaim ganda), menentukan truk dan PKS tujuan, lalu memberangkatkan SPB (`Sudah Dikirim`) beserta foto muatan.
3. **Rekonsiliasi PKS**: Checker PKS mencatat nomor tiket timbangan jembatan PKS, berat bersih (netto PKS), serta foto slip timbangan. Sistem otomatis menghitung selisih susut (Kg dan %) serta menandai anomali jika susut melebihi `2%`.
4. **Rekapan & Analisis AI**: Pimpinan dan Supervisi memantau umur restan per hari maupun per stasiun TPH, mengekspor laporan CSV, dan berkonsultasi dengan Asisten AI Sawit.

---

## Tech Stack Utama

- **Backend**: PHP `^8.3`, Laravel `^13.17`, Inertia.js Laravel `^3.0`
- **Autentikasi & RBAC**: Laravel Fortify `^1.37.2` (login NIK/Username, 2FA, Passkeys via `@laravel/passkeys`), Spatie Laravel Permission `^8.5`
- **AI Integration**: `laravel/ai` (`EkulapAnalystAgent` + 4 tool query operasional + fallback local engine)
- **Routing Type-Safe**: Laravel Wayfinder `^0.1.14`
- **Frontend**: React `^19.2`, TypeScript `^5.7`, Inertia React `^3.0`, Tailwind CSS `^4.0`, Radix UI, Lucide React, Sonner, Vite+ (`vite-plus`)
- **Quality & Testing**: Pest `^5.3`, Larastan (`larastan/larastan`), Laravel Pint `^1.27`
- **Konfigurasi Lokal**: Timezone `Asia/Jakarta` (WIB), Locale `id`, Database default MySQL (`ekulap`)

---

## Fitur & Modul Aplikasi

### 1. Autentikasi & Keamanan Akun

- Login menggunakan **NIK / Username** (`username`) dan password dengan validasi status akun (`Aktif` / `Nonaktif`).
- Pembatasan percobaan login (_rate limiter_ 5x/menit), tantangan 2FA, serta dukungan **Passkey** (`/.well-known/passkey-endpoints`).
- Pengaturan profil, ubah kata sandi, keamanan (2FA & Passkey), dan tampilan di `/settings/*`.
- Redirect halaman beranda otomatis menyesuaikan hak akses tertinggi yang dimiliki role pengguna (`RbacCatalog::homeRouteFor()`).

### 2. Dashboard Eksekutif (`/dashboard`)

- **KPI Summary Grid**: Total stasiun/lot, total karung, total berat (Kg), sisa karung restan di TPH, SPB aktif, serta metrik umur restan (`max_restan_days` dan kumulatif hari restan).
- **Grafik Distribusi Status Karung**: Visualisasi breakdown `Belum Diangkut`, `Diangkut Sebagian`, dan `Sudah Diangkut`.
- **Alur Pipeline & Aktivitas Terbaru**: Ringkasan catatan timbang TPH terbaru dan SPB terkini dengan filter per divisi.
- **AI Alert Strip**: Peringatan otomatis untuk tumpukan restan, anomali susut PKS `> 2%`, dan deviasi GPS lapangan.

### 3. Catatan Hasil & Timbang TPH (`/tph-harvest`)

- Penomoran lot/stasiun otomatis: `HRV-YYYYMMDD-XXX`.
- Dukungan **multi-pekerja** (`tph_harvest_record_worker`) dan pemilihan petugas penimbang (`weigher_user_id`).
- **Validasi Jarak GPS**: Perhitungan jarak Haversine antara posisi pencatatan dengan titik koordinat master TPH (batas toleransi default `100 meter`).
- **Upload & Kompresi Foto**: Wajib 3–10 foto lapangan (maksimal `15 MB` per file), otomatis dikompresi ke JPEG (maks dimensi `1600px`, kualitas `78`) dan dikoreksi orientasi EXIF-nya oleh `ImageCompressionService`.
- **SearchableSelect** untuk pemilihan lokasi blok & titik TPH, serta highlight warna baris dan `StatusBadge` pada komponen `DataTable`.
- Penghapusan lot diblokir otomatis apabila sebagian atau seluruh karung sudah dimuat ke Surat Jalan.

### 4. Surat Jalan (SPB) & Muat Truk (`/surat-jalan`)

- Penomoran SPB otomatis: `SPB-YYYYMMDD-XXX`.
- Pemilihan lot TPH yang masih memiliki sisa karung (`Belum Diangkut` / `Diangkut Sebagian`) dengan penguncian baris database (`lockForUpdate()`) untuk mencegah klaim ganda.
- Mendukung status `Belum Muat` (draft pemuatan bertahap) dan `Sudah Dikirim` (wajib 1–2 foto muatan truk).
- Halaman detail dan **Lembar Cetak Surat Jalan** (`/surat-jalan/{deliveryOrder}`).

### 5. Status Kutip Lapis & Rekonsiliasi PKS (`/pks-reconciliation`)

- Pencatatan tiket timbangan PKS, berat bersih PKS (Kg), waktu tiba, dan unggah foto slip timbang (maks `15 MB`).
- Perhitungan otomatis **Selisih Susut (Kg)** dan sinkronisasi status lot TPH menjadi `Sudah Masuk PKS` apabila seluruh karung pada lot terkait telah ditimbang di PKS.
- Penandaan severity `warning` pada Audit Log jika persentase susut melebihi `2%`.
- Ekspor data status pengiriman & susut PKS ke **CSV** (`/pks-reconciliation/export`).

### 6. Rekapan Hasil Kutip Lapis (`/rekapan-kutip-lapis`)

- **Tab Rekapan Harian**: Agregasi hasil panen per tanggal kerja (jumlah stasiun, jumlah TPH, karung, berat, terangkut, sisa restan, dan umur restan).
- **Tab Restan per Stasiun TPH**: Agregasi sisa karung yang belum tuntas per titik TPH, memecah karung yang masih berada di TPH vs karung yang sudah masuk SPB namun berstatus `Belum Muat`, lengkap dengan rincian _age breakdown_.
- Filter rentang tanggal (`date_from`, `date_to`) dan divisi, modal detail rincian lot/stasiun, serta **Ekspor CSV** (`/rekapan-kutip-lapis/export`).

### 7. Asisten AI Sawit (`/ai-assistant`)

- Didukung `EkulapAnalystAgent` (`laravel/ai`) dengan 4 tool analisis data aktual database:
    - `GetHarvestBacklogTool` (antrean restan karung di TPH)
    - `GetShrinkageAuditTool` (audit selisih susut timbangan PKS)
    - `GetGpsDeviationAuditTool` (audit deviasi koordinat GPS)
    - `GetWorkerProductionTool` (peringkat produktivitas pemanen & kutip lapis)
- Dilengkapi **fallback deterministik lokal** (`AiInsightService`) apabila API key provider LLM (`gemini`, `openai`, `anthropic`, `groq`, `deepseek`, `openrouter`) belum dikonfigurasi atau tidak dapat dijangkau.

### 8. Master Data Kebun & Armada (`/master-data`)

- Pengelolaan referensi operasional dalam satu halaman modular:
    - Divisi (`divisions`)
    - Blok & Tahun Tanam (`blocks`)
    - Titik Koordinat Paten TPH (`tph_points`)
    - Tenaga Kerja — `Pemanen TBS` & `Kutip Lapis Brondolan` (`workers`, lengkap dengan toggle Aktif/Nonaktif)
    - Armada Truk (`trucks`)
    - Pabrik Kelapa Sawit tujuan (`pks_mills`)

### 9. Manajemen Pengguna (`/users`) & RBAC Dinamis (`/roles`)

- Manajemen akun petugas berdasarkan NIK/Username, divisi, jabatan/role, serta aktivasi/nonaktivasi akun.
- Kontrol akses berbasis **Spatie Laravel Permission** (`10 grup modul` / `21 permission granular`).
- Role sistem bawaan (`Admin`, `Kerani Produksi`, `Supervisi/Asisten`, `Pimpinan (EM/RC)`, `Supir`, `Checker PKS`) tidak dapat dihapus, dan izin `Admin` selalu penuh.
- Mendukung pembuatan **Role Kustom**, kloning izin dari template role, pembaruan matriks permission secara real-time, serta penghapusan role kustom yang tidak lagi dipakai pengguna.

### 10. Monitor Sistem & Audit Log (`/system-monitor`)

- **System Health Banner & Error Translator**: Membaca tail file `storage/logs/laravel.log` dan menerjemahkan error teknis (seperti `PostTooLargeException` / HTTP 413, `SQLSTATE`, izin folder storage, `TokenMismatchException`, gangguan API AI) ke bahasa operasional yang mudah dipahami beserta saran tindakan.
- Memantau status tautan `public/storage` (`storage:link`), ukuran file log, kegagalan upload 24 jam, dan percobaan login gagal.
- **Tabel Jejak Audit (`audit_logs`)**: Mencatat aktivitas lintas kategori (`auth`, `upload`, `harvest`, `spb`, `pks`, `master`, `users`) lengkap dengan pelaku, IP, waktu WIB, filter pencarian/tanggal/tingkat keparahan, dan **Ekspor CSV**.

---

## Struktur Database Utama

| Tabel                                                                                      | Fungsi                                                                   |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `users`                                                                                    | Akun pengguna aplikasi (NIK/username, role, divisi, status, 2FA)         |
| `divisions`, `blocks`, `tph_points`                                                        | Struktur kebun dan koordinat GPS paten TPH                               |
| `workers`, `trucks`, `pks_mills`                                                           | Master pekerja lapangan, armada truk, dan pabrik PKS                     |
| `tph_harvest_records`                                                                      | Catatan lot timbang TPH (`HRV-...`), berat, GPS, foto, dan status angkut |
| `tph_harvest_record_worker`                                                                | Relasi pivot multi-pekerja per catatan timbang TPH                       |
| `delivery_orders`                                                                          | Header Surat Jalan (`SPB-...`), truk, PKS, tiket, netto PKS, susut       |
| `delivery_order_items`                                                                     | Rincian muatan karung per lot TPH pada masing-masing SPB                 |
| `audit_logs`                                                                               | Log jejak audit operasional dan keamanan aplikasi                        |
| `roles`, `permissions`, `model_has_roles`, `role_has_permissions`, `model_has_permissions` | Tabel RBAC dari `spatie/laravel-permission`                              |
| `passkeys`, `cache`, `jobs`, `sessions`                                                    | Dukungan passkey WebAuthn, cache, antrean, dan sesi                      |

---

## Akun & Role Demo Bawaan (`UserSeeder`)

Password default untuk seluruh akun seed lokal adalah `password`:

| NIK / Username | Nama           | Role                | Status   |
| -------------- | -------------- | ------------------- | -------- |
| `10010001`     | Erik Harahap   | `Admin`             | Aktif    |
| `10010002`     | Valent         | `Pimpinan (EM/RC)`  | Aktif    |
| `10010003`     | Rizky Pratama  | `Kerani Produksi`   | Aktif    |
| `10010004`     | Andi Wijaya    | `Supervisi/Asisten` | Aktif    |
| `10010005`     | Budi Hartono   | `Supir`             | Aktif    |
| `10010006`     | Hendra Gunawan | `Checker PKS`       | Aktif    |
| `10010007`     | Darmawan       | `Kerani Produksi`   | Nonaktif |

---

## Panduan Instalasi & Pengembangan Lokal

```bash
# 1. Setup awal otomatis (install dependency, .env, key, migrasi, build frontend)
composer run setup

# 2. Jalankan seeder data kebun, pengguna, dan RBAC
php artisan db:seed --class=EkulapSeeder

# 3. Aktifkan tautan folder penyimpanan foto
php artisan storage:link

# 4. Jalankan server pengembangan (Laravel + Queue + Vite)
composer run dev
```

Perintah pengujian & kualitas kode:

```bash
# Jalankan Pint, PHPStan/Larastan, dan seluruh test Pest
composer run test

# Atau jalankan suite test Pest secara ringkas
php artisan test --compact
```

---

## Riwayat Update Major & Fitur

> **Catatan Pemeliharaan Dokumen**: Setiap kali terdapat pembaruan major (_major update_) pada aplikasi eKULAP, tambahkan entri baru di bagian teratas daftar di bawah ini berisi tanggal/versi, ringkasan perubahan, dan daftar fitur utamanya.

### [v1.4.0] — Manajemen Role & Hak Akses Dinamis (RBAC) _(2026-11-20)_

- **Integrasi `spatie/laravel-permission`**: Migrasi otorisasi dari pengecekan role statis ke sistem permission granular berbasis database (`RbacCatalog` dengan 10 grup modul dan 21 izin).
- **Halaman Role & Matriks Akses (`/roles`)**: Antarmuka Admin untuk membuat role kustom (dari nol atau duplikasi template), mengatur matriks izin per modul (`PermissionMatrixCard`), dan menghapus role kustom yang tidak terpakai.
- **Proteksi Rute & UI Dinamis**: Middleware `permission:*` pada seluruh rute `routes/web.php`, hook frontend `usePermissions()`, penyesuaian menu `AdminSidebar`/`MobileBottomNav`, serta redirect halaman beranda otomatis sesuai hak akses role saat login.
- **Cakupan Test**: Penambahan `tests/Feature/RbacManagementTest.php` untuk memverifikasi pembuatan role kustom, assignment ke user, dan penegakan permission.

### [v1.3.0] — Analitik Restan, Modul Rekapan & Standardisasi DataTable _(2026-11-18)_

- **Modul Rekapan Hasil Kutip Lapis (`/rekapan-kutip-lapis`)**: Penambahan `RestanAnalyticsService` dan `RekapanController` dengan tampilan tab **Rekapan Harian** dan **Restan per Stasiun TPH**, pemecahan umur restan (`restan_days`), modal detail (`RekapanDetailModal`, `RekapanStationModal`), filter rentang tanggal/divisi, serta ekspor CSV.
- **Komponen `DataTable` Global & `SearchableSelect`**: Standardisasi seluruh tabel modul (`TphHarvestTable`, `SuratJalanTable`, `PksReconciliationTable`, `MasterData`, `UsersTable`, `AuditActivityTable`) dengan pencarian, sorting, paginasi, highlight baris, serta `SearchableSelect` untuk lokasi TPH.
- **Pembaruan Dashboard & Tema Sidebar**: Penyesuaian `KpiSummaryGrid`, `DashboardChartsRow`, `sidebarTheme.ts` (tema pembeda environment development vs produksi), serta konfigurasi timezone aplikasi ke `Asia/Jakarta`.

### [v1.2.0] — System Monitor, Audit Log & Optimasi Upload Foto _(2026-11-18)_

- **Modul Monitor Sistem & Audit Log (`/system-monitor`)**: Penambahan tabel `audit_logs`, `AuditLoggerService`, dan `SystemHealthLogService` yang menerjemahkan error log Laravel menjadi ringkasan bahasa non-teknis beserta saran perbaikan, lengkap dengan filter & ekspor CSV.
- **Penanganan Upload Foto Skala Lapangan**: Penambahan `ImageCompressionService` (kompresi JPEG otomatis + perbaikan orientasi EXIF via GD), peningkatan batas upload foto hingga `15 MB` per file, konfigurasi `.htaccess`/server, serta pencatatan insiden `PostTooLargeException` (HTTP 413) ke log audit.
- **Lokalisasi Validasi & Login**: Translasi pesan validasi ke Bahasa Indonesia dan penyesuaian tampilan error halaman login (`AuthLogin`).

### [v1.1.0] — Revisi Multi-Pekerja, Multi-Foto & Penyederhanaan Status SPB _(2026-11-17)_

- **Multi-Pekerja & Penimbang di TPH**: Dukungan lebih dari satu pekerja per lot panen (`tph_harvest_record_worker`), field jumlah TPH (`tph_count`), petugas penimbang (`weigher_user_id`), serta unggah 3–10 foto bukti lapangan (`photo_paths`).
- **Pembaruan Surat Jalan (SPB)**: Penambahan catatan (`notes`), unggah 1–2 foto muatan (`loading_photo_paths`), serta penyederhanaan status pengiriman menjadi `Belum Muat` dan `Sudah Dikirim`.
- **Branding & UI**: Penambahan logo eKULAP, komponen _date picker_, serta penyempurnaan halaman login.

### [v1.0.0] — Rilis Awal Sistem Inti eKULAP _(2026-11-16)_

- **Pondasi Operasional Kebun ke PKS**: Implementasi modul Timbang TPH (`HRV-...`) dengan validasi GPS Haversine, Surat Jalan SPB (`SPB-...`) anti klaim ganda, dan Rekonsiliasi Timbangan PKS dengan deteksi susut.
- **Master Data & Manajemen Pengguna**: CRUD Divisi, Blok, Titik TPH, Pekerja, Truk, PKS, serta manajemen akun pengguna berbasis NIK.
- **Asisten AI Sawit & Dashboard**: Integrasi `laravel/ai` (`EkulapAnalystAgent`) dengan 4 tool analisis operasional dan Dashboard KPI eksekutif.
