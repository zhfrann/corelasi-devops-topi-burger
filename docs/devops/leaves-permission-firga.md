# Dokumentasi Fitur: Pengajuan Izin/Sakit Online & Persetujuan Guru

**Kontributor:** Andreas Christian Firga (maxswin99)  
**NIM:** 103022300002  
**Branch:** `feature/izin-guru-firga`  
**Target Branch:** `main`  
**Status:** Verification & Testing Complete

---

## 1. Latar Belakang & Masalah
Sebelumnya, pengajuan izin atau sakit siswa masih belum terintegrasi secara digital. Siswa tidak memiliki sarana mandiri untuk mengunggah surat dokter atau bukti perizinan, dan guru tidak memiliki dashboard terpusat untuk memverifikasi atau menolak pengajuan izin siswa yang berdampak pada status kehadiran KBM.

## 2. Fitur yang Diimplementasikan
1. **Pengajuan Izin / Sakit Online Siswa (`/siswa/izin/pengajuan`):**
   - Siswa dapat mengajukan izin atau sakit dengan memilih jenis izin (`SAKIT` / `IZIN`), menentukan rentang tanggal (`tanggal_mulai` dan `tanggal_selesai`), mengisi alasan tertulis, serta mengunggah berkas bukti pendukung (PDF/gambar surat dokter).
2. **Riwayat & Status Verifikasi Izin Siswa (`/siswa/izin/riwayat`):**
   - Siswa dapat melihat daftar seluruh pengajuan izin yang pernah diajukan lengkap dengan badge status verifikasi real-time (`PENDING`, `APPROVED`, `REJECTED`).
3. **Dashboard Persetujuan Izin oleh Guru (`/guru/izin/persetujuan`):**
   - Guru pengampu/piket dapat memeriksa daftar permohonan izin siswa yang masuk, membaca alasan, mengunduh bukti surat dokter, serta memberikan tindakan persetujuan (`Approve`) atau penolakan (`Reject`).
4. **Backend REST API Leaves Service:**
   - Aplikasi baru Django `leaves` dengan Model `StudentLeave`, Serializer terintegrasi, endpoint CRUD `/api/leaves/`, serta validasi tanggal logic (`end_date >= start_date`).

## 3. Komponen & File Terdampak
- Backend:
  - `apps/leaves/models.py`
  - `apps/leaves/serializers.py`
  - `apps/leaves/views.py`
  - `apps/leaves/urls.py`
  - `apps/leaves/tests.py` (3 automated unit tests)
- Frontend:
  - `src/pages/siswa/PengajuanIzinPage.tsx`
  - `src/pages/siswa/RiwayatIzinPage.tsx`
  - `src/pages/guru/PersetujuanIzinGuruPage.tsx`
  - `src/app/router.tsx` & `src/components/layout/Sidebar.tsx`

## 4. Hasil Verifikasi Kualitas & CI
- **Backend Test:** `manage.py test leaves.tests` lolos 3/3 tests (100% OK).
- **Frontend Test & Build:** `vitest run` lolos 193/193 tests, `tsc -b && vite build` 0 errors.
