# Dokumentasi Fitur: Pencarian, Filter Status Penilaian, dan Pengurutan Nilai Siswa Terpadu

**Kontributor:** Fadhli Dzaki  
**Git User:** fadhlidzaki  
**Branch:** `feat/grades-search-filter-sorting-fadhli`  
**Target Branch:** `main`  
**Modul:** Pembelajaran & Penilaian Siswa (`/siswa/grades`)  
**Status:** Ready for Review & Quality Gate Verified  

---

## 1. Latar Belakang & Masalah
Pada halaman riwayat penilaian mandiri siswa (`/siswa/grades`), data nilai tugas dan evaluasi ditampilkan secara statis tanpa fasilitas pencarian kata kunci, penyaringan status koreksi guru, maupun pengurutan performa akademik. Ketika jumlah penugasan meningkat sepanjang semester:
1. Siswa kesulitan melacak tugas spesifik atau mata pelajaran tertentu yang membutuhkan perhatian khusus.
2. Siswa tidak dapat membedakan dengan cepat mana tugas yang sudah selesai dinilai oleh guru (*graded*) dan mana tugas yang masih dalam antrean koreksi (*pending*).
3. Tidak ada mekanisme untuk mengurutkan tugas berdasarkan nilai tertinggi ke terendah (atau sebaliknya) untuk evaluasi performa belajar siswa. Jika pengurutan nilai diterapkan secara naif, tugas yang belum dinilai (*null/undefined*) akan mengaburkan urutan nilai tertinggi/terendah.

---

## 2. Cakupan Tiga Fitur yang Ditambahkan

### Fitur 1: Pencarian Tugas & Mata Pelajaran (`search`)
- **Backend:** Mendukung parameter `search` pada endpoint `GET /api/learning/my-grades/?search=...`. Menyaring penugasan berdasarkan kecocokan nama tugas (`tugas__title__icontains`) atau nama mata pelajaran (`mapel__name__icontains`) menggunakan kombinasi Django `Q` object.
- **Frontend:** Fungsi murni `searchGrades(grades, query)` yang kebal terhadap *whitespace* ekstra (*trimming*) dan *case-insensitive*. Terintegrasi dengan komponen `FilterBar`.

### Fitur 2: Filter Status Penilaian (`status`)
- **Backend:** Mendukung parameter `status=all|graded|pending` yang divalidasi oleh `StudentGradesQuerySerializer`.
  - `graded`: Hanya menampilkan tugas yang telah dikoreksi dan memiliki nilai resmi (`score is not None`).
  - `pending`: Hanya menampilkan tugas yang belum dinilai guru (`score is None`).
- **Frontend:** Fungsi `filterGradesByStatus(grades, status)` yang terhubung langsung ke dropdown pilihan pada `FilterBar` ("Semua Status", "Sudah Dinilai", "Menunggu Penilaian").

### Fitur 3: Pengurutan Nilai dengan Nulls-Last Behavior (`sort`)
- **Backend:** Mendukung parameter `sortBy=score|title|mapel` dan `sortOrder=asc|desc`.
  - Menggunakan algoritma pengurutan tuple Python yang menjamin tugas belum dinilai (*unscored/null*) **selalu berada di urutan terbawah (*nulls-last*)**, baik saat diurutkan dari nilai tertinggi (`desc`) maupun terendah (`asc`).
- **Frontend:** Fungsi murni `sortGrades(grades, sortBy, sortOrder)` terhubung ke header kolom "Perolehan Nilai" pada tabel `DataTable`. Kolom dapat diklik untuk toggle `desc` <-> `asc` dengan visualisasi arah panah sorting, sementara kolom teks tetap statis.

---

## 3. Desain Arsitektur & Keamanan (DevSecOps / STRIDE)

| Ancaman STRIDE | Mitigasi yang Diterapkan |
| --- | --- |
| **Spoofing** | Proteksi endpoint `StudentGradesView` dengan `IsAuthenticated`. Siswa hanya diidentifikasi melalui token autentikasi resmi. |
| **Tampering** | Parameter query `search`, `status`, `sortBy`, dan `sortOrder` divalidasi dan disanitasi ketat melalui `StudentGradesQuerySerializer` dengan pilihan *whitelist* tetap (`ChoiceField`). |
| **Repudiation** | Endpoint membaca data langsung dari relasi tugas terdaftar dan submission siswa tanpa mutasi data yang tidak tercatat. |
| **Information Disclosure** | Enforced student scoping: Siswa dibatasi secara ketat hanya dapat melihat tugas pada kelas tempat mereka terdaftar (`kelas_id=user.kelas_id`), mencegah akses horizontal terhadap nilai siswa lain. |
| **Denial of Service** | Query ORM dioptimasi dengan `select_related("mapel", "kelas")` dan filtering langsung di level database sebelum diproses ke memory. |
| **Elevation of Privilege** | Pengecekan role berbasis RBAC. Siswa biasa tidak dapat menyuntikkan `siswaId` untuk mengintip nilai siswa lain. Hanya role `guru` atau `admin` yang diizinkan menyediakan query `siswaId`. |

---

## 4. Komponen & Berkas yang Berubah

### Backend (`corelasi-backend`)
- `apps/learning/serializers.py`: Menambahkan `StudentGradesQuerySerializer` untuk validasi parameter query pencarian, filter, dan sorting.
- `apps/learning/views.py`: Menambahkan endpoint APIView `StudentGradesView` yang melayani kalkulasi agregat KPI nilai dan data penugasan berfilter.
- `apps/learning/urls.py`: Mendaftarkan route API `my-grades/`.
- `apps/learning/tests.py`: Menambahkan integration tests komprehensif menguji skenario pencarian, filter status, pengurutan nulls-last, validasi 400 bad request, dan pencegahan akses tanpa izin (401).

### Frontend (`corelasi-frontend`)
- `src/utils/gradeFilters.ts`: Fungsi murni utilitas `searchGrades`, `filterGradesByStatus`, `sortGrades`, dan pipeline komposit `filterAndSortGrades`.
- `src/services/learningService.ts`: Metode `getMyGrades(params)` yang memanggil endpoint backend dengan fallback komputasi *in-memory* mock untuk lingkungan pengujian Vitest.
- `src/pages/siswa/GradesPage.tsx`: Integrasi antarmuka pengguna pada `FilterBar` dan `DataTable` sortable columns dengan kepatuhan urutan hook React.
- `src/test/gradeFilters.test.ts`: Test suite komprehensif untuk pengujian logika pencarian, filter status, dan pengurutan nilai.

---

## 5. Hasil Pengujian & Quality Gate

1. **Backend Integration Tests:**
   - Pencarian tugas berdasarkan kata kunci (judul & mata pelajaran).
   - Filter status `graded` dan `pending`.
   - Pengurutan skor `asc` dan `desc` dengan verifikasi *nulls-last*.
   - Validasi parameter salah (`400 Bad Request`).
   - Penolakan akses tanpa autentikasi (`401 Unauthorized`).

2. **Frontend Unit Tests (Vitest):**
   - 100% test passing pada `gradeFilters.test.ts`.
   - Menguji isolasi fungsi murni, penanganan input spasi/whitespace, stabilitas array, dan determinisme sorting.
