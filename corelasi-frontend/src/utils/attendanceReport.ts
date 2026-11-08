import type { AttendanceSortBy, AttendanceSortOrder, StudentAttendanceSummary } from "@/types/report";

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

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareStudentIds(left: string, right: string): number {
  if (/^[0-9]+$/.test(left) && /^[0-9]+$/.test(right)) {
    const leftId = BigInt(left);
    const rightId = BigInt(right);
    return leftId < rightId ? -1 : leftId > rightId ? 1 : 0;
  }
  return compareText(left, right);
}

export function sortAttendanceReports(
  reports: StudentAttendanceSummary[],
  sortBy: AttendanceSortBy = "name",
  sortOrder: AttendanceSortOrder = "asc",
): StudentAttendanceSummary[] {
  const direction = sortOrder === "desc" ? -1 : 1;
  return [...reports].sort((left, right) => {
    const nameOrder = compareText(left.siswaName.toLowerCase(), right.siswaName.toLowerCase());
    const idOrder = compareStudentIds(String(left.siswaId), String(right.siswaId));
    if (sortBy === "name") return nameOrder * direction || idOrder;

    const leftHasData = hasAttendanceData(left);
    const rightHasData = hasAttendanceData(right);
    if (leftHasData !== rightHasData) return leftHasData ? -1 : 1;
    return (left.percentage - right.percentage) * direction || nameOrder || idOrder;
  });
}
