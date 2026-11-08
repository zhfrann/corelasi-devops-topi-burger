import React, { useState } from 'react';
import { Clock, CheckCircle2, XCircle, FileText, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IzinItem {
  id: string;
  jenis_izin: 'SAKIT' | 'IZIN';
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatan_guru?: string;
  tanggal_pengajuan: string;
}

export default function RiwayatIzinPage() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data Mock sementara untuk demo cepat
  const [riwayatIzin] = useState<IzinItem[]>([
    {
      id: 'IZN-001',
      jenis_izin: 'SAKIT',
      tanggal_mulai: '2026-11-02',
      tanggal_selesai: '2026-11-03',
      alasan: 'Demam tinggi dan flu berat, istirahat atas saran dokter.',
      status: 'APPROVED',
      catatan_guru: 'Semoga lekas sembuh Rian. Surat dokter terverifikasi.',
      tanggal_pengajuan: '2026-11-02',
    },
    {
      id: 'IZN-002',
      jenis_izin: 'IZIN',
      tanggal_mulai: '2026-11-09',
      tanggal_selesai: '2026-11-09',
      alasan: 'Menghadiri acara pernikahan kakak kandung di luar kota.',
      status: 'PENDING',
      tanggal_pengajuan: '2026-11-08',
    },
  ]);

  const getStatusBadge = (status: IzinItem['status']) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Menunggu Persetujuan
          </span>
        );
    }
  };

  const filteredData = riwayatIzin.filter(
    (item) =>
      item.alasan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jenis_izin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Pengajuan Izin</h1>
          <p className="text-sm text-gray-500">
            Pantau status verifikasi pengajuan izin/sakit kamu dari Wali Kelas & Guru Piket.
          </p>
        </div>
        <Link
          to="/siswa/izin/pengajuan"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Buat Pengajuan Baru
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan alasan atau jenis izin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent text-gray-700"
        />
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3.5">Tanggal Izin</th>
                <th className="px-6 py-3.5">Jenis</th>
                <th className="px-6 py-3.5">Alasan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Catatan Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                      {item.tanggal_mulai === item.tanggal_selesai
                        ? item.tanggal_mulai
                        : `${item.tanggal_mulai} s/d ${item.tanggal_selesai}`}
                      <div className="text-[11px] text-gray-400 font-normal">
                        Diajukan: {item.tanggal_pengajuan}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                          item.jenis_izin === 'SAKIT'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {item.jenis_izin}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">{item.alasan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-xs italic text-gray-500">
                      {item.catatan_guru || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Belum ada riwayat pengajuan izin.
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