import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, Search, FileText, ExternalLink } from "lucide-react";
import { apiGet, apiPatch } from "@/services/api";

interface PengajuanIzinItem {
  id: string | number;
  nama_siswa?: string;
  namaSiswa?: string;
  kelas?: string;
  jenis_izin?: "SAKIT" | "IZIN";
  jenisIzin?: "SAKIT" | "IZIN";
  tanggal_mulai?: string;
  tanggalMulai?: string;
  tanggal_selesai?: string;
  tanggalSelesai?: string;
  alasan: string;
  bukti_url?: string;
  buktiUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  catatan?: string;
}

// Path relatif terhadap baseURL di @/services/api (sama seperti "/schedules/pembelajaran/")
const LEAVES_ENDPOINT = "/leaves/";

export default function PersetujuanIzinGuruPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [pengajuanList, setPengajuanList] = useState<PengajuanIzinItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch data dari backend Django
  const fetchPengajuanList = async () => {
    try {
      setLoading(true);
      const response = await apiGet<
        PengajuanIzinItem[] | { results: PengajuanIzinItem[] }
      >(LEAVES_ENDPOINT);

      // Menangani response berupa array atau paginasi DRF (results)
      const data = Array.isArray(response) ? response : response?.results || [];

      setPengajuanList(data);
    } catch (error) {
      console.error("Gagal mengambil data permohonan izin dari backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuanList();
  }, []);

  // 2. Eksekusi aksi Approve / Reject ke backend
  const handleAction = async (id: string | number, newStatus: "APPROVED" | "REJECTED") => {
    try {
      await apiPatch(`${LEAVES_ENDPOINT}${id}/`, { status: newStatus });

      // Update status di UI lokal setelah sukses tersimpan di database
      setPengajuanList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (error) {
      console.error("Gagal memperbarui status izin di backend:", error);
      alert("Gagal memperbarui status izin.");
    }
  };

  const filteredData = pengajuanList.filter((item) => {
    const nama = item.nama_siswa || item.namaSiswa || "";
    const matchSearch =
      nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.alasan || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === "ALL") return matchSearch;
    return matchSearch && item.status === selectedFilter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Verifikasi & Persetujuan Izin Siswa</h1>
        <p className="text-sm text-gray-500">
          Kelola dan persetujui permohonan izin/sakit siswa untuk kelas perwalian & tugas piket.
        </p>
      </div>

      {/* Control Bar: Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg w-full md:w-80 text-sm">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari nama siswa atau alasan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-gray-700"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === filter
                  ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {filter === "ALL"
                ? "Semua"
                : filter === "PENDING"
                ? "Menunggu"
                : filter === "APPROVED"
                ? "Disetujui"
                : "Ditolak"}
            </button>
          ))}
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3.5">Nama Siswa</th>
                <th className="px-6 py-3.5">Jenis</th>
                <th className="px-6 py-3.5">Tanggal Izin</th>
                <th className="px-6 py-3.5">Alasan & Bukti</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    Memuat data permohonan izin dari server...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const namaSiswa = item.nama_siswa || item.namaSiswa || "Siswa";
                  const kelas = item.kelas || "X-A";
                  const jenisIzin = item.jenis_izin || item.jenisIzin || "IZIN";
                  const tglMulai = item.tanggal_mulai || item.tanggalMulai || "-";
                  const tglSelesai = item.tanggal_selesai || item.tanggalSelesai || tglMulai;
                  const lampiran = item.bukti_url || item.buktiUrl;

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800">{namaSiswa}</div>
                        <div className="text-xs text-gray-400">Kelas: {kelas}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                            jenisIzin === "SAKIT"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}
                        >
                          {jenisIzin}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-700">
                        {tglMulai === tglSelesai ? tglMulai : `${tglMulai} s/d ${tglSelesai}`}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-gray-700 truncate">{item.alasan}</p>
                        {lampiran && (
                          <a
                            href={lampiran}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" /> Lihat Lampiran
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="w-3.5 h-3.5" /> Ditolak
                          </span>
                        )}
                        {item.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> Menunggu
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {item.status === "PENDING" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleAction(item.id, "APPROVED")}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => handleAction(item.id, "REJECTED")}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                            >
                              Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Selesai</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Tidak ada pengajuan izin yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}