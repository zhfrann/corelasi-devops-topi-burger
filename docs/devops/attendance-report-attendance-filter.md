# Filter persentase kehadiran

Fitur ini melanjutkan filter mapel dari PR #4 yang sudah merged pada `main`.
Halaman `/admin/reports/attendance` kini memiliki pilihan Kehadiran. Sebelumnya
seluruh roster ditampilkan tanpa kategori dan siswa tanpa catatan terlihat 0%.

## Perilaku dan kontrak API

```http
GET /api/reports/attendance/?kelasId=1&mapelId=2&attendanceStatus=below_90
```

| Pilihan UI | attendanceStatus | Baris yang dikembalikan |
| --- | --- | --- |
| Semua siswa | `all` | Seluruh roster sesuai kelas/scope, termasuk tanpa presensi |
| Kehadiran < 90% | `below_90` | Total presensi > 0 dan percentage terlapor < 90 |
| Kehadiran ≥ 90% | `at_least_90` | Total presensi > 0 dan percentage terlapor ≥ 90 |

Parameter tidak dikirim atau kosong sama dengan `all`. Nilai di luar daftar
menghasilkan HTTP 400 dengan envelope error yang sudah ada dan
`errors.attendanceStatus`. Hasil `data: []` tetap merupakan response normal.
Endpoint, hak akses, field response, dan pembatasan scope guru dipertahankan.

Backend memfilter catatan mapel terlebih dahulu, menghitung jumlah dan persentase,
lalu menerapkan kategori. Kategori menggunakan integer `percentage` yang
dikembalikan API: 112 hadir dari 125 catatan (89,6%) dilaporkan sebagai 90% dan
masuk kelompok ≥ 90%. Rumus pembulatan backend tidak berubah. Pembulatan mock
disamakan dengan Python, termasuk nilai tepat di tengah yang dibulatkan ke
integer genap: 88,5 → 88, 89,5 → 90, dan 90,5 → 90.

Total nol ditentukan dari `hadir + sakit + izin + alpa`, bukan dari percentage.
Field numerik `percentage` tetap 0 untuk kompatibilitas, tetapi tabel memberi
badge netral **Belum ada data** dan Excel menggunakan label yang sama. Siswa
dengan catatan nyata tetapi tidak pernah hadir tetap memiliki 0% dan masuk
kategori < 90%.

Mengubah mapel mempertahankan kategori, dan mengubah kategori mempertahankan
kelas/mapel. Pencarian nama/NIS tetap lokal dan ekspor mengikuti hasil yang
terlihat. Filter baru mengikuti mekanisme loading/error/retry dan penolakan
respons lama yang sudah ada; ekspor dinonaktifkan selama pemuatan atau error.

## Verifikasi lokal, 8 November 2026

Environment: Python 3.12, Node 24, SQLite test; MEDIA_ROOT dan hasil coverage
diarahkan ke `/tmp` agar data kerja tidak berubah.

| Pemeriksaan | Hasil |
| --- | --- |
| `python manage.py check` | Lulus |
| `python manage.py makemigrations --check --dry-run` | Tidak ada perubahan schema |
| `python manage.py test reports` | 22 tes lulus, termasuk regresi filter mapel |
| Suite backend berlabel eksplisit melalui coverage | 134 tes lulus |
| Coverage backend | Total 83%; serializer query 100%; views laporan 91% |
| `npm test` | 149 tes pada 24 berkas lulus |
| Tes frontend dengan coverage text/LCOV melalui CLI | 149 tes lulus; coverage baris 66,61% |
| Lint berkas frontend yang diubah | Lulus |
| `npm run build` | Lulus; warning ukuran bundle yang sudah ada |

Suite backend lengkap:

```bash
python -m coverage run --source=apps,config,shared \
  --omit='*/migrations/*,*/tests.py,*/tests/*' \
  manage.py test accounts academic schedules attendance learning journals reports config.tests
```

Tes baru meliputi nilai 0/80/90/100%, data kosong, batas pembulatan, kombinasi
kelas/mapel/kategori, kategori tidak valid, pembatasan akses, query jalur API,
mock, pilihan UI, label netral, ekspor hasil pencarian, retry, dan respons lama.

Smoke test Chrome memakai frontend/backend asli serta database disposable:

- Matematika + < 90% menampilkan 80% dan 0% nyata; siswa tanpa catatan dikecualikan.
- Matematika + ≥ 90% menampilkan 90%, 100%, dan 89,6% yang terlapor sebagai 90%.
- Perubahan mapel mempertahankan kategori. Mapel tanpa catatan menghasilkan
  hasil kosong untuk kedua kategori persentase dan roster penuh pada Semua siswa.
- Ekspor siswa tanpa catatan diunduh dan XML di dalam XLSX diperiksa: berisi
  **Belum ada data**, bukan 0%.
- Kategori tidak valid menghasilkan 400. Layout tidak melebar pada viewport
  1280, 768, 640, dan 390px.

## Batas verifikasi dan scope

Konfigurasi, dependency, lockfile, workflow, dan Sonar tidak diubah.
`npm ci --dry-run` masih gagal pada ketidaksesuaian lockfile baseline
(`@emnapi/core`, `@emnapi/runtime`, dan `@emnapi/wasi-threads`). Tes frontend
memakai dependency lokal yang sudah tersedia. Lint seluruh proyek masih gagal
pada catch kosong di `authService.ts:107`, yang sudah ada sebelum fitur ini.

Workflow backend saat ini memakai test tanpa label sehingga bukti CI tidak
menggantikan suite eksplisit di atas. Hasil CI dan Sonar belum diklaim lulus.

## Demo reviewer

1. Masuk sebagai admin, buka Rekap Kehadiran Siswa, dan pilih kelas serta mapel.
2. Bandingkan Semua siswa, Kehadiran < 90%, dan Kehadiran ≥ 90%.
3. Ubah mapel dan pastikan kategori tetap aktif.
4. Pilih Semua siswa dan mapel tanpa presensi; periksa label Belum ada data.
5. Cari nama/NIS dan ekspor Excel; isi dan urutan mengikuti hasil yang terlihat.
