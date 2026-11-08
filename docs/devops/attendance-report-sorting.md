# Sorting rekap kehadiran siswa

Fitur ini dibuat dari `main` setelah PR #5 (filter persentase kehadiran) merged.
Halaman `/admin/reports/attendance` kini mengurutkan nama dan persentase melalui
backend. Hasil pencarian dan ekspor Excel mempertahankan urutan yang diterima.

## Kontrak dan perilaku

```http
GET /api/reports/attendance/?kelasId=1&mapelId=2&attendanceStatus=below_90&sortBy=percentage&sortOrder=asc
```

| Parameter | Nilai | Default jika tidak dikirim atau kosong |
| --- | --- | --- |
| `sortBy` | `name`, `percentage` | `name` |
| `sortOrder` | `asc`, `desc` | `asc` |

Nilai di luar daftar menghasilkan HTTP 400 menggunakan envelope error yang
sudah ada (`errors.sortBy` / `errors.sortOrder`). Endpoint, response, dan scope
akses tidak berubah. Sorting dilakukan setelah filter kelas/mapel dan kategori
kehadiran, tanpa menyusun field query dari input bebas.

- Nama diurutkan tanpa membedakan huruf besar/kecil. Nama sama memakai ID siswa
  ascending sebagai pemecah seri, termasuk saat nama diurutkan descending.
- Persentase diurutkan sebagai angka. Nilai sama memakai nama A–Z lalu ID siswa.
- Siswa tanpa catatan selalu di bawah pada sorting persentase, pada kedua arah.
  Mereka tetap berlabel Belum ada data. Siswa dengan presensi nyata 0% tetap
  mengikuti urutan angka dan masuk kategori < 90%.
- Mock mengikuti aturan backend. ID numerik dibandingkan sebagai angka; ID mock
  lama berupa string nonnumerik memakai urutan leksikal yang deterministik.

Nama Siswa aktif A–Z saat awal; klik pertama mengubahnya menjadi Z–A. Klik
pertama Persentase Kehadiran mengurutkan terendah–tertinggi, lalu klik berikutnya
membalik arah. Pindah kolom selalu memulai ascending. Filter dan pencarian tidak
mereset sorting; loading, error/retry, dan respons terlambat tetap ditangani.

## Komponen shared

`DataTable` menerima props opsional `sortBy`, `sortOrder`, dan `onSortChange`.
Kolom yang mendukung sorting diberi `sortKey`. Parent mengontrol state dan request;
tabel hanya menampilkan tombol, ikon, serta `aria-sort`. Tombol native dapat
diaktifkan dengan keyboard. Kolom/pemakai tanpa callback tetap berupa tabel biasa.
Selection, pagination, dan halaman pemakai lain tidak perlu diubah.

## Verifikasi lokal, 8 November 2026

Python 3.12 dan SQLite test; Node 24. MEDIA_ROOT dan hasil coverage pengujian
diarahkan ke `/tmp`, sedangkan smoke test memakai database disposable.

| Pemeriksaan | Hasil |
| --- | --- |
| `python manage.py check` | Lulus |
| `python manage.py makemigrations --check --dry-run` | Tidak ada perubahan schema |
| `python manage.py test reports` | 30 tes lulus |
| Suite backend dengan label eksplisit melalui coverage | 142 tes lulus |
| Coverage backend | Total 83%; serializer query 100%; views laporan 91% |
| `npm test` | 164 tes pada 26 berkas lulus |
| Frontend coverage melalui CLI text/LCOV | 164 tes lulus; coverage baris 67,28% |
| Tes komponen DataTable dan halaman laporan | 20 tes lulus |
| Lint seluruh berkas frontend yang diubah | Lulus |
| `npm run build` | Lulus; warning ukuran bundle yang sudah ada |

Suite backend lengkap:

```bash
python -m coverage run --source=apps,config,shared \
  --omit='*/migrations/*,*/tests.py,*/tests/*' \
  manage.py test accounts academic schedules attendance learning journals reports config.tests
```

Tes meliputi nama asc/desc dengan urutan insert diacak, persentase 0/80/90/100,
data kosong, seri nama/ID, parameter salah, scope guru, kombinasi filter,
regresi fitur mapel/kategori, query API, mock, props opsional tabel, selection,
pagination, ikon/aria-sort, toggle, ekspor, retry, dan respons lama.

Smoke test Chrome terhadap frontend/backend asli lulus:

- Default A–Z dan toggle nama melalui Enter; toggle persentase melalui Space.
- Urutan persentase numerik di kedua arah, data kosong selalu terakhir, dan
  siswa dengan nama/persentase sama stabil menurut ID.
- Kelas, mapel, kategori, hasil kosong, dan pencarian mempertahankan sorting.
- File XLSX diunduh lalu XML worksheet dibandingkan dengan seluruh baris tabel
  setelah pencarian: NIS, nama, persentase, dan urutannya sama, termasuk label
  Belum ada data.
- Parameter sorting tidak valid menghasilkan HTTP 400.
- Halaman tidak melebar pada viewport 1280, 768, 640, dan 390px.

## Batas verifikasi

Konfigurasi, dependency, lockfile, workflow, dan Sonar tidak diubah. Kendala
baseline lockfile tetap menghalangi clean install; pengujian memakai dependency
lokal yang tersedia. Lint proyek masih gagal pada catch kosong di
`authService.ts:107`. Workflow backend memakai test tanpa label sehingga hasil
CI tidak menggantikan suite eksplisit di atas. CI/Sonar belum diklaim lulus.

## Demo reviewer

1. Masuk sebagai admin dan buka Rekap Kehadiran Siswa.
2. Klik Nama Siswa; urutan A–Z berubah menjadi Z–A.
3. Klik Persentase Kehadiran dua kali untuk membandingkan kedua arah.
4. Pilih kelas/mapel/kategori dan cari nama/NIS; sorting tetap aktif.
5. Ekspor Excel dan bandingkan urutan dengan tabel.
6. Pada Semua siswa, periksa data kosong selalu di bawah untuk sorting persentase.
