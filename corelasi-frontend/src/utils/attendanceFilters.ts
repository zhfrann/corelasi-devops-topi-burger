import type { AbsensiSiswa, StatusKehadiran } from "@/types/attendance";

export interface AttendanceFilterCriteria {
  searchQuery?: string;
  status?: StatusKehadiran | "Semua" | "";
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

/**
 * Filter list of attendance logs by student name or NIS
 */
export function searchAttendanceStudents(
  logs: AbsensiSiswa[],
  query: string,
): AbsensiSiswa[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return logs;

  return logs.filter((log) => {
    const nameMatch = (log.siswaName || "").toLowerCase().includes(clean);
    const nisMatch = (log.nis || "").toLowerCase().includes(clean);
    const mapelMatch = (log.mapelName || "").toLowerCase().includes(clean);
    return nameMatch || nisMatch || mapelMatch;
  });
}

/**
 * Filter attendance logs by date range [startDate, endDate] inclusive
 */
export function filterAttendanceByDateRange(
  logs: AbsensiSiswa[],
  startDate?: string,
  endDate?: string,
): AbsensiSiswa[] {
  if (!startDate && !endDate) return logs;

  return logs.filter((log) => {
    if (!log.tanggal) return false;
    if (startDate && log.tanggal < startDate) return false;
    if (endDate && log.tanggal > endDate) return false;
    return true;
  });
}

/**
 * Filter attendance logs by attendance status (Hadir, Sakit, Izin, Alpa)
 */
export function filterAttendanceByStatus(
  logs: AbsensiSiswa[],
  status?: string,
): AbsensiSiswa[] {
  if (!status || status === "" || status === "Semua") {
    return logs;
  }

  const targetStatus = status.toLowerCase();
  return logs.filter((log) => (log.status || "").toLowerCase() === targetStatus);
}

/**
 * Composite filtering pipeline combining search, status filter, and date range
 */
export function filterAttendanceLogs(
  logs: AbsensiSiswa[],
  criteria: AttendanceFilterCriteria,
): AbsensiSiswa[] {
  let result = logs;

  if (criteria.searchQuery) {
    result = searchAttendanceStudents(result, criteria.searchQuery);
  }

  if (criteria.status) {
    result = filterAttendanceByStatus(result, criteria.status);
  }

  if (criteria.startDate || criteria.endDate) {
    result = filterAttendanceByDateRange(
      result,
      criteria.startDate,
      criteria.endDate,
    );
  }

  return result;
}
