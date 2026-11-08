import React, { useState } from 'react';
import { Upload, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiPost } from '@/services/api';

interface FormDataState {
  jenis_izin: 'SAKIT' | 'IZIN';
  tanggal_mulai: string;
  tanggal_selesai: string;
  alasan: string;
  bukti: File | null;
}

export default function PengajuanIzinPage() {
  const [formData, setFormData] = useState<FormDataState>({
    jenis_izin: 'SAKIT',
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: '',
    bukti: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, bukti: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      // Kirim ke backend Django. File bukti belum dikirim (menyusul setelah alur dasar jalan).
      await apiPost('/leaves/', {
        jenis_izin: formData.jenis_izin,
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
        alasan: formData.alasan,
      });

      setStatusMsg({
        type: 'success',
        text: 'Pengajuan izin berhasil dikirim ke Wali Kelas & Guru Piket!',
      });

      setFormData({
        jenis_izin: 'SAKIT',
        tanggal_mulai: '',
        tanggal_selesai: '',
        alasan: '',
        bukti: null,
      });
    } catch (err) {
      console.error('Gagal mengirim pengajuan izin:', err);
      setStatusMsg({
        type: 'error',
        text: 'Gagal mengirim pengajuan. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Form Pengajuan Izin / Sakit</h1>
        <p className="text-sm text-gray-500">
          Isi formulir di bawah ini untuk mengajukan ketidakhadiran ke Wali Kelas & Guru Piket.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span className="text-sm font-medium">{statusMsg.text}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jenis Pengajuan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, jenis_izin: 'SAKIT' }))}
                className={`py-3 px-4 rounded-lg font-medium border text-sm transition-all ${
                  formData.jenis_izin === 'SAKIT'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 font-semibold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                🏥 Sakit
              </button>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, jenis_izin: 'IZIN' }))}
                className={`py-3 px-4 rounded-lg font-medium border text-sm transition-all ${
                  formData.jenis_izin === 'IZIN'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 font-semibold shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                ✉️ Izin (Acara / Hal Penting)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Dari Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                required
                value={formData.tanggal_mulai}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Sampai Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                required
                value={formData.tanggal_selesai}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Alasan Ketidakhadiran <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alasan"
              rows={4}
              required
              placeholder="Jelaskan alasan izin / sakit secara rinci..."
              value={formData.alasan}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-gray-700 placeholder-gray-400 resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Lampiran Bukti {formData.jenis_izin === 'SAKIT' ? '(Surat Dokter)' : '(Surat Orang Tua / Bukti)'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-semibold text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                    <span>Pilih file</span>
                    <input
                      type="file"
                      name="bukti"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">atau drag & drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF maksimal 5MB</p>
                {formData.bukti && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">
                    File terpilih: {formData.bukti.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm text-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}