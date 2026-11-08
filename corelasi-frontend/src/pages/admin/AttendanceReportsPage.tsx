import React, { useEffect, useMemo, useState } from "react";
import { reportService } from "@/services/reportService";
import { academicService } from "@/services/academicService";
import type { Kelas, MataPelajaran } from "@/types/academic";
import type { AttendanceSortBy, AttendanceSortOrder, AttendanceStatus, StudentAttendanceSummary } from "@/types/report";
import {
  DataTable,
  Button,
  StatusBadge,
  FilterBar,
  Toast,
  LoadingState,
  ErrorState,
  Select,
} from "@/components/shared";
import type { SemanticState } from "@/utils/semanticState";
import { Download } from "lucide-react";
import { exportToExcel } from "@/utils/exportHelper";
import { getAttendancePercentageLabel, hasAttendanceData } from "@/utils/attendanceReport";

export const AttendanceReportsPage: React.FC = () => {
  const [reports, setReports] = useState<StudentAttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMapel, setSelectedMapel] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>("all");
  const [sorting, setSorting] = useState<{ sortBy: AttendanceSortBy; sortOrder: AttendanceSortOrder }>({
    sortBy: "name", sortOrder: "asc",
  });
  const [classes, setClasses] = useState<Kelas[]>([]);
  const [subjects, setSubjects] = useState<MataPelajaran[]>([]);
  const [retry, setRetry] = useState(0);
  const [loadedFilters, setLoadedFilters] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const filtersKey = JSON.stringify([selectedClass, selectedMapel, attendanceStatus, sorting, retry]);
    const loadReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, kelas, mapel] = await Promise.all([
          reportService.getAttendanceReports(selectedClass || undefined, {
            mapelId: selectedMapel || undefined,
            attendanceStatus,
            ...sorting,
          }),
          academicService.getKelas(),
          academicService.getMapel(),
        ]);
        if (active) {
          setReports(data);
          setClasses(kelas);
          setSubjects(mapel);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Gagal memuat data rekap absensi.");
        }
      } finally {
        if (active) {
          setLoadedFilters(filtersKey);
          setLoading(false);
        }
      }
    };
    void loadReports();
    return () => { active = false; };
  }, [selectedClass, selectedMapel, attendanceStatus, sorting, retry]);

  const pending = loading || loadedFilters !== JSON.stringify([selectedClass, selectedMapel, attendanceStatus, sorting, retry]);

  const handleSortChange = (key: string) => {
    if (key !== "name" && key !== "percentage") return;
    setSorting((current) => ({
      sortBy: key,
      sortOrder: current.sortBy === key && current.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (r) => r.siswaName.toLowerCase().includes(term) || r.nis.includes(term),
      );
    }

    return result;
  }, [search, reports]);

  const handleExportExcel = () => {
    if (pending || error) return;
    if (filteredReports.length === 0) {
      setToastMessage("Tidak ada data untuk diekspor.");
      return;
    }
    const exportData = filteredReports.map((r) => ({
      NIS: r.nis,
      "Nama Siswa": r.siswaName,
      Kelas: r.kelasName,
      Hadir: r.hadir,
      Sakit: r.sakit,
      Izin: r.izin,
      Alpa: r.alpa,
      "Persentase Kehadiran (%)": getAttendancePercentageLabel(r),
    }));
    exportToExcel(
      exportData,
      `Rekap_Kehadiran_Siswa_${new Date().toISOString().split("T")[0]}`,
    );
  };

  const columns = [
    {
      header: "NIS",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[12px] font-mono text-bg-ink-muted font-bold">
          {r.nis}
        </span>
      ),
    },
    {
      header: "Nama Siswa",
      sortKey: "name",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[13px] font-semibold text-bg-ink">
          {r.siswaName}
        </span>
      ),
    },
    {
      header: "Kelas",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[12px] text-bg-ink-secondary">{r.kelasName}</span>
      ),
    },
    {
      header: "Hadir (H)",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[13px] font-mono text-primary font-bold">
          {r.hadir}
        </span>
      ),
    },
    {
      header: "Sakit (S)",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[13px] font-mono text-status-info font-bold">
          {r.sakit}
        </span>
      ),
    },
    {
      header: "Izin (I)",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[13px] font-mono text-status-warning font-bold">
          {r.izin}
        </span>
      ),
    },
    {
      header: "Alpa (A)",
      cell: (r: StudentAttendanceSummary) => (
        <span className="text-[13px] font-mono text-status-danger font-bold">
          {r.alpa}
        </span>
      ),
    },
    {
      header: "Persentase Kehadiran",
      sortKey: "percentage",
      cell: (r: StudentAttendanceSummary) => {
        if (!hasAttendanceData(r)) {
          return <StatusBadge label={getAttendancePercentageLabel(r)} state="neutral" size="xs" />;
        }
        let state: SemanticState = "safe";
        if (r.percentage < 90) {
          state = "danger";
        } else if (r.percentage < 95) {
          state = "warning";
        }

        return (
          <StatusBadge label={getAttendancePercentageLabel(r)} state={state} size="xs" />
        );
      },
    },
  ];

  const classOptions = classes.map((kelas) => ({
    value: String(kelas.id),
    label: `Kelas ${kelas.name}`,
  }));

  return (
    <div className="space-y-6">
      {toastMessage && (
        <Toast
          message={toastMessage}
          variant="warning"
          onClose={() => setToastMessage(null)}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-bg-ink font-sans">
            Rekap Kehadiran Siswa
          </h1>
          <p className="mt-1 text-[13px] text-bg-ink-secondary leading-snug">
            Evaluasi persentase kehadiran kumulatif seluruh siswa per mata
            pelajaran dan agenda kelas.
          </p>
        </div>
        <Button
          onClick={handleExportExcel}
          disabled={pending || !!error}
          className="gap-1.5 font-semibold text-[12px] h-9 self-start sm:self-center"
        >
          <Download className="h-4 w-4" />
          Ekspor Excel
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchPlaceholder="Cari siswa atau NIS..."
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={selectedClass}
        onFilterChange={setSelectedClass}
        filterPlaceholder="Semua Kelas"
        filterLabel="Kelas"
        filterOptions={classOptions}
        actions={
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <label htmlFor="attendance-report-mapel" className="text-[13px] font-semibold text-bg-ink-secondary">
                Mata Pelajaran
              </label>
              <Select
                id="attendance-report-mapel"
                value={selectedMapel}
                onChange={(event) => setSelectedMapel(event.target.value)}
                className="h-9 py-1 pl-3.5 pr-10 text-[13px]"
              >
                <option value="">Semua Mapel</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={String(subject.id)}>{subject.name}</option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[150px]">
              <label htmlFor="attendance-report-status" className="text-[13px] font-semibold text-bg-ink-secondary">
                Kehadiran
              </label>
              <Select
                id="attendance-report-status"
                value={attendanceStatus}
                onChange={(event) => setAttendanceStatus(event.target.value as AttendanceStatus)}
                className="h-9 py-1 pl-3.5 pr-10 text-[13px]"
              >
                <option value="all">Semua siswa</option>
                <option value="below_90">Kehadiran &lt; 90%</option>
                <option value="at_least_90">Kehadiran ≥ 90%</option>
              </Select>
            </div>
          </div>
        }
      />

      {/* Main Table */}
      {pending ? (
        <LoadingState message="Memuat data rekap absensi..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setRetry((value) => value + 1)} />
      ) : (
        <DataTable
          title="Tabel Rekapitulasi Presensi Siswa"
          columns={columns}
          data={filteredReports}
          keyExtractor={(r) => r.siswaId}
          sortBy={sorting.sortBy}
          sortOrder={sorting.sortOrder}
          onSortChange={handleSortChange}
          emptyStateTitle="Tidak ada data"
          emptyStateDescription="Tidak ada data kehadiran yang sesuai dengan filter atau pencarian."
        />
      )}
    </div>
  );
};
export default AttendanceReportsPage;
