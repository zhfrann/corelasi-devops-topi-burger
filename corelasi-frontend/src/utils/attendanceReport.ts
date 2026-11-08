import type { StudentAttendanceSummary } from "@/types/report";

export function hasAttendanceData(report: StudentAttendanceSummary): boolean {
  return report.hadir + report.sakit + report.izin + report.alpa > 0;
}

export function getAttendancePercentageLabel(report: StudentAttendanceSummary): string {
  return hasAttendanceData(report) ? `${report.percentage}%` : "Belum ada data";
}

export function calculateAttendancePercentage(hadir: number, total: number): number {
  if (total === 0) return 0;
  const percentage = (hadir / total) * 100;
  const lower = Math.floor(percentage);
  // Match the API's Python round(): exact .5 ties go to the nearest even integer.
  return percentage - lower === 0.5 ? lower + (lower % 2) : Math.round(percentage);
}
