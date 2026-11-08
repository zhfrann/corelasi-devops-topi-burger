# Dokumentasi Fitur: Pencarian & Filter Presensi Siswa Terpadu

**Kontributor:** Yappier Albertus Febriandi Krisna Putra (YappierAlbert)  
**NIM:** 103022300148  
**Branch:** `feat/attendance-filters-yappier`  
**Target Branch:** `main`  
**Status:** Ready for Review & Quality Gate Verified

---

## 1. Latar Belakang & Masalah
Pada modul presensi siswa (`/siswa/attendance`), riwayat presensi hanya disajikan dalam satu tabel utuh tanpa kemampuan pencarian atau penyaringan. Siswa yang ingin memverifikasi kehadiran pada rentang tanggal tertentu atau mencari rekaman mata pelajaran spesifik harus memeriksa baris per baris. Hal ini menyulitkan deteksi dini ketidakhadiran (Alpa/Sakit/Izin) yang perlu diajukan koreksi.

## 2. Cakupan Fitur yang Ditambahkan
1. **Pencarian Siswa & Presensi Multi-Atribut (`searchAttendanceStudents`):**
   - Mendukung pencarian kata kunci pada nama siswa, NIS, nama mata pelajaran, dan keterangan izin/sakit.
   - Bersifat *case-insensitive* dan melakukan sanitasi spasi (*whitespace trimming*).
2. **Filter Rentang Tanggal Presensi (`filterAttendanceByDateRange`):**
   - Siswa dapat menyaring presensi dari tanggal awal (`startDate`) hingga tanggal akhir (`endDate`) secara inklusif.
   - Bekerja fleksibel saat hanya salah satu batas tanggal yang diisi.
3. **Filter Status Kehadiran (`filterAttendanceByStatus`):**
   - Dropdown penyaring status resmi: `Hadir`, `Sakit`, `Izin`, dan `Alpa`.
4. **Pipa Komposit Terpadu (`filterAttendanceLogs`):**
   - Menggabungkan ketiga kriteria filter secara simultan dengan performa tinggi menggunakan memoization React (`useMemo`).
   - Menyediakan tombol cepat **Reset** untuk mengembalikan filter ke kondisi default.

## 3. Komponen & File yang Berubah
- `corelasi-frontend/src/utils/attendanceFilters.ts`: Fungsi murni utilitas penyaringan presensi.
- `corelasi-frontend/src/pages/siswa/AttendancePage.tsx`: Integrasi antarmuka `FilterBar` dengan date input dan status dropdown.
- `corelasi-frontend/src/test/attendanceFilters.test.ts`: Test suite unit test komprehensif (14 test cases).

## 4. Hasil Verifikasi Kualitas & CI
- **Unit Test (Vitest):** 14 test cases baru lolos (Total proyek: 164 tests passed, 100% green).
- **TypeScript & Build:** `tsc -b && vite build` lolos tanpa error/warning.
- **Security Check:** Zero hardcoded credentials, validasi tanggal aman.
