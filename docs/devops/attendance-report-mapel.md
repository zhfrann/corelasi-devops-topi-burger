# Filter mata pelajaran pada rekap kehadiran

Sebelumnya halaman admin menghitung semua catatan kehadiran dan memfilter kelas
secara lokal berdasarkan nama. Sekarang halaman `/admin/reports/attendance`
mengirim ID kelas dan mata pelajaran ke backend. Pencarian nama/NIS tetap lokal;
ekspor Excel mengikuti baris dan urutan yang ditampilkan.

## Kontrak API

```http
GET /api/reports/attendance/?kelasId=1&mapelId=2
```

- Endpoint, envelope, dan field response lama tetap digunakan.
- `mapelId` tidak dikirim atau kosong berarti Semua Mapel, termasuk presensi
  tanpa mapel. Mapel spesifik hanya menghitung catatan mapel tersebut sebelum
  jumlah hadir/sakit/izin/alpa dan persentase dihitung.
- `mapelId` harus berupa integer positif yang ada. Teks, angka desimal, nol,
  negatif, ID di luar rentang database, dan ID tidak ditemukan menghasilkan
  HTTP 400 dengan `success: false`, `message`, dan `errors.mapelId`.
- Roster mengikuti scope pengguna dan kelas. Mapel valid tanpa presensi tetap
  mengembalikan siswa dengan seluruh hitungan dan `percentage` numerik nol.
  Rumus pembulatan persentase API yang sudah ada dipertahankan.
- Siswa dan pengguna tanpa autentikasi tetap ditolak; filter tidak memperluas
  scope guru. Response `data: []` merupakan hasil normal.

Pilihan kelas/mapel berasal dari master dan tetap tersedia ketika hasil kosong.
Perubahan filter memuat ulang laporan; respons lama diabaikan. Loading dan error
menyembunyikan tabel lama serta menonaktifkan ekspor. Tombol Coba Lagi menggunakan
kombinasi filter aktif. Label Mata Pelajaran terhubung ke elemen select.

## Bukti pengujian lokal

Dijalankan pada 8 November 2026 menggunakan Python 3.12 dan Node 24:

| Pemeriksaan | Hasil |
| --- | --- |
| `python manage.py check` | Lulus |
| `python manage.py makemigrations --check --dry-run` | Tidak ada perubahan |
| `python manage.py test reports` | 13 tes lulus |
| `python manage.py test accounts academic schedules attendance learning journals reports config.tests` melalui coverage | 125 tes lulus |
| Backend coverage | Total 83%; serializer query 100%; views laporan 91% |
| `npm test` | 138 tes pada 23 berkas lulus |
| `npm test -- --coverage` dengan reporter text/LCOV lewat argumen CLI | 138 tes lulus; coverage baris 65,60% |
| `npx eslint` pada seluruh berkas frontend yang diubah | Lulus |
| `npm run build` | Lulus; warning ukuran bundle yang sudah ada |

Backend memakai SQLite test dan MEDIA_ROOT sementara melalui settings di `/tmp`,
sehingga upload pengujian tidak masuk database/media kerja. Coverage ditulis ke
`/tmp`. Frontend memakai dependency yang sudah tersedia; clean install belum
terbukti karena `npm ci` pada baseline gagal akibat lockfile tidak sinkron.
Lint seluruh proyek juga masih gagal pada blok catch kosong di
`src/services/authService.ts:107`, yang sudah ada sebelum fitur ini.

Tes baru meliputi agregasi mapel, catatan tanpa mapel, roster nol, kombinasi kelas,
validasi dan akses API; mock service; query jalur API non-test; serta UI aktual,
hasil kosong, error/retry, ekspor hasil pencarian, dan respons terlambat.

Smoke test Chrome terhadap frontend/backend asli dengan database sementara lulus:
Semua Mapel 50%, kelas + Matematika 100%, ekspor Excel terunduh, `mapelId=abc`
menghasilkan 400, Kimia tanpa presensi mempertahankan siswa dengan nol, dan
Semua Mapel menghapus parameter mapel. Viewport 390px tidak membuat halaman melebar.

Workflow dan konfigurasi tidak diubah. Perintah `manage.py test` tanpa label
yang dipakai workflow saat ini hanya menemukan 18 tes lokal, sehingga tidak
membuktikan tes reports berjalan. Hasil CI/Sonar perlu dibaca terpisah dari bukti
suite eksplisit di atas.

## Demo reviewer

1. Masuk sebagai admin dan buka Rekap Kehadiran Siswa.
2. Pilih kelas, lalu mapel yang memiliki presensi. Periksa perubahan hitungan.
3. Cari nama/NIS dan ekspor Excel; isi file mengikuti hasil yang terlihat.
4. Pilih Semua Mapel untuk menghitung seluruh catatan kembali.
5. Pilih mapel valid tanpa presensi; siswa pada roster tetap muncul dengan nol.
