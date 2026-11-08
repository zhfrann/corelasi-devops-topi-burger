import type { Materi, Tugas, Submission } from "@/types/learning";

export const MOCK_MATERI: Materi[] = [
  {
    id: "mat-1",
    title: "Pengenalan Aljabar Linier",
    description: "Pertemuan pertama membahas matriks, operasi baris elementer, dan penyelesaian sistem persamaan linier.",
    sourceType: "file",
    fileUrl: "http://example.com/files/aljabar_dasar.pdf",
    dateCreated: "2026-06-01",
    kelasId: "k-1",
    kelasName: "X-A",
    mapelId: "mp-1",
    mapelName: "Matematika",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "mat-2",
    title: "Dinamika Partikel dan Hukum Newton",
    description: "Membahas 3 Hukum Newton tentang gerak benda beserta analisis diagram gaya bebas pada bidang miring.",
    sourceType: "file",
    fileUrl: "http://example.com/files/hukum_newton.pdf",
    dateCreated: "2026-06-01",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-2",
    mapelName: "Fisika",
    guruId: "2",
    guruName: "Budi Santoso, M.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "mat-3",
    title: "Struktur Atom dan Konfigurasi Elektron",
    description: "Materi pengenalan model atom modern, mekanika kuantum, orbital, dan cara pengisian elektron pada kulit atom.",
    sourceType: "link",
    dateCreated: "2026-06-02",
    kelasId: "k-3",
    kelasName: "XII-A",
    mapelId: "mp-2",
    mapelName: "Fisika", // Mapped under Physics for XII-A simulation
    guruId: "2",
    guruName: "Budi Santoso, M.Pd.",
    status: "Draft"
  }
];

export const MOCK_TUGAS: Tugas[] = [
  {
    id: "tug-1",
    title: "Latihan Soal Aljabar Elementer",
    description: "Selesaikan 5 soal persamaan linier dengan metode eliminasi Gauss-Jordan sesuai PDF materi.",
    fileUrl: "http://example.com/files/latihan_aljabar.pdf",
    dueDate: "2026-06-10",
    dateCreated: "2026-06-01",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-1",
    mapelName: "Matematika",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-2",
    title: "Tugas Mandiri Analisis Gaya Bebas",
    description: "Gambarkan diagram gaya bebas pada sistem katrol ganda dan hitung percepatan masing-masing beban.",
    dueDate: "2026-06-08",
    dateCreated: "2026-06-01",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-2",
    mapelName: "Fisika",
    guruId: "2",
    guruName: "Budi Santoso, M.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-3",
    title: "Praktikum Hukum Newton II",
    description: "Laporan praktikum dinamika gerak dan percepatan balok.",
    dueDate: "2026-06-05",
    dateCreated: "2026-05-28",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-2",
    mapelName: "Fisika",
    guruId: "2",
    guruName: "Budi Santoso, M.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-4",
    title: "Analisis Struktur Teks Anekdot",
    description: "Identifikasi orientasi, krisis, dan koda teks anekdot.",
    dueDate: "2026-06-12",
    dateCreated: "2026-06-02",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-3",
    mapelName: "Bahasa Indonesia",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-5",
    title: "Writing Descriptive Essay: My School",
    description: "Write a 300-word descriptive essay in English.",
    dueDate: "2026-06-15",
    dateCreated: "2026-06-03",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-4",
    mapelName: "Bahasa Inggris",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-6",
    title: "Uji Pemahaman Fungsi Kuadrat",
    description: "Menghitung diskriminan dan koordinat titik puncak.",
    dueDate: "2026-06-14",
    dateCreated: "2026-06-02",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-1",
    mapelName: "Matematika",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-7",
    title: "Laporan Praktikum Termodinamika",
    description: "Analisis efisiensi mesin kalor dan siklus Carnot.",
    dueDate: "2026-06-16",
    dateCreated: "2026-06-04",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-2",
    mapelName: "Fisika",
    guruId: "2",
    guruName: "Budi Santoso, M.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-8",
    title: "Resensi Novel Sastra Indonesia",
    description: "Kajian unsur intrinsik novel Indonesia.",
    dueDate: "2026-06-20",
    dateCreated: "2026-06-05",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-3",
    mapelName: "Bahasa Indonesia",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-9",
    title: "Proyek Trigonometri & Pengukuran Tinggi",
    description: "Pengukuran tinggi objek dengan sudut elevasi.",
    dueDate: "2026-06-07",
    dateCreated: "2026-05-30",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-1",
    mapelName: "Matematika",
    guruId: "3",
    guruName: "Siti Aminah, S.Pd.",
    status: "Dipublikasikan"
  },
  {
    id: "tug-10",
    title: "Tugas Mandiri Gelombang Bunyi & Cahaya",
    description: "Perhitungan efek Doppler dan interferensi cahaya.",
    dueDate: "2026-06-18",
    dateCreated: "2026-06-05",
    kelasId: "k-2",
    kelasName: "XI-A",
    mapelId: "mp-2",
    mapelName: "Fisika",
    guruId: "2",
    guruName: "Budi Santoso, M.Pd.",
    status: "Dipublikasikan"
  }
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1",
    tugasId: "tug-1",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-02",
    fileUrl: "http://example.com/uploads/rian-aljabar.pdf",
    status: "Terkumpul",
    grade: 85,
    feedback: "Pekerjaan rapi, langkah eliminasi tepat."
  },
  {
    id: "sub-2",
    tugasId: "tug-2",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-02",
    fileUrl: "http://example.com/uploads/rian-gaya-bebas.pdf",
    status: "Terkumpul",
    grade: 75,
    feedback: "Perbaiki arah vektor gaya normal."
  },
  {
    id: "sub-3",
    tugasId: "tug-3",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-05-30",
    fileUrl: "http://example.com/uploads/rian-praktikum-newton.pdf",
    status: "Terkumpul",
    grade: 92,
    feedback: "Analisis grafik percepatan sangat mendalam dan akurat."
  },
  {
    id: "sub-4",
    tugasId: "tug-4",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-03",
    fileUrl: "http://example.com/uploads/rian-anekdot.pdf",
    status: "Terkumpul",
    grade: 78,
    feedback: "Perhatikan kaidah kebahasaan dan konjungsi temporal."
  },
  {
    id: "sub-5",
    tugasId: "tug-5",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-04",
    fileUrl: "http://example.com/uploads/rian-essay.pdf",
    status: "Terkumpul",
    grade: 95,
    feedback: "Excellent vocabulary and grammatical structure!"
  },
  {
    id: "sub-6",
    tugasId: "tug-6",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-03",
    fileUrl: "http://example.com/uploads/rian-fungsi-kuadrat.pdf",
    status: "Terkumpul",
    grade: 70,
    feedback: "Perlu latihan lagi pada penentuan titik puncak parabola."
  },
  {
    id: "sub-7",
    tugasId: "tug-7",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-05",
    fileUrl: "http://example.com/uploads/rian-termodinamika.pdf",
    status: "Terkumpul",
    grade: 88,
    feedback: "Perhitungan efisiensi mesin Carnot sudah benar."
  },
  {
    id: "sub-8",
    tugasId: "tug-8",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-06",
    fileUrl: "http://example.com/uploads/rian-resensi.pdf",
    status: "Terkumpul",
    feedback: ""
  },
  {
    id: "sub-9",
    tugasId: "tug-9",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-05-31",
    fileUrl: "http://example.com/uploads/rian-trigonometri.pdf",
    status: "Terkumpul",
    grade: 96,
    feedback: "Presentasi dan hasil perhitungannya luar biasa kreatif!"
  },
  {
    id: "sub-10",
    tugasId: "tug-10",
    siswaId: "4",
    siswaName: "Rian Hidayat",
    submitDate: "2026-06-06",
    fileUrl: "http://example.com/uploads/rian-gelombang.pdf",
    status: "Terkumpul",
    feedback: ""
  }
];
