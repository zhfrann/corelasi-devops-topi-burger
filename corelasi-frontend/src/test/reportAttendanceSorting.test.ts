import { beforeEach, describe, expect, it } from "vitest";
import { reportService } from "@/services/reportService";
import type { AttendanceReportFilters } from "@/types/report";

describe("attendance report sorting in the mock service", () => {
  const fixtures = [
    { id: "120", name: "Budi", present: 4, total: 5 },
    { id: "103", name: "Citra", present: 9, total: 10 },
    { id: "130", name: "Ani", present: 5, total: 5 },
    { id: "110", name: "Ani", present: 4, total: 5 },
    { id: "150", name: "Dedi", present: 0, total: 5 },
    { id: "107", name: "Ayu", present: 0, total: 0 },
    { id: "109", name: "Ayu", present: 0, total: 0 },
    { id: "115", name: "ani", present: 5, total: 5 },
    { id: "180", name: "Outside", present: 5, total: 5 },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("corelasi_users_db", JSON.stringify(fixtures.map(({ id, name }) => ({
      id, name, role: "siswa", kelasId: id === "180" ? "k-2" : "k-1", kelasName: "X-A",
    }))));
    const records = [
      ...fixtures.map((fixture) => ({ ...fixture, mapelId: "mp-1" })),
      { id: "120", name: "Budi", present: 0, total: 5, mapelId: "mp-2" },
      { id: "110", name: "Ani", present: 5, total: 5, mapelId: "mp-2" },
    ].flatMap(({ id, present, total, mapelId }) => Array.from({ length: total }, (_, index) => ({
      id: `${id}-${mapelId}-${index}`, siswaId: id, mapelId, status: index < present ? "Hadir" : "Alpa",
    })));
    localStorage.setItem("corelasi_attendance_siswa", JSON.stringify(records));
  });

  const rowsFor = (filters: AttendanceReportFilters = {}) =>
    reportService.getAttendanceReports("k-1", { mapelId: "mp-1", ...filters });

  it("defaults to name ascending and uses IDs to break equal names", async () => {
    const rows = await rowsFor();
    expect(rows.map((row) => row.siswaId)).toEqual(["110", "115", "130", "107", "109", "120", "103", "150"]);
    const descending = await rowsFor({ sortBy: "name", sortOrder: "desc" });
    expect(descending.map((row) => row.siswaId)).toEqual(["150", "103", "120", "107", "109", "110", "115", "130"]);
  });

  it("sorts percentages numerically and keeps missing records below real zero in either direction", async () => {
    const ascending = await rowsFor({ sortBy: "percentage", sortOrder: "asc" });
    expect(ascending.map((row) => row.siswaId)).toEqual(["150", "110", "120", "103", "115", "130", "107", "109"]);
    expect(ascending.map((row) => row.percentage)).toEqual([0, 80, 80, 90, 100, 100, 0, 0]);
    const descending = await rowsFor({ sortBy: "percentage", sortOrder: "desc" });
    expect(descending.map((row) => row.siswaId)).toEqual(["115", "130", "103", "110", "120", "150", "107", "109"]);
  });

  it("sorts only the results of class, subject and attendance filters", async () => {
    const rows = await rowsFor({ attendanceStatus: "below_90", sortBy: "percentage", sortOrder: "desc" });
    expect(rows.map((row) => row.siswaId)).toEqual(["110", "120", "150"]);
    const otherSubject = await rowsFor({ mapelId: "mp-2", attendanceStatus: "below_90", sortBy: "percentage" });
    expect(otherSubject.map((row) => row.siswaId)).toEqual(["120"]);
    expect(await rowsFor({ mapelId: "mp-empty", attendanceStatus: "below_90", sortBy: "percentage" })).toEqual([]);
  });

  it("breaks ties by numeric IDs rather than their string representations", async () => {
    localStorage.setItem("corelasi_users_db", JSON.stringify([
      { id: "10", name: "Ani", role: "siswa", kelasId: "k-1" },
      { id: "2", name: "Ani", role: "siswa", kelasId: "k-1" },
    ]));
    localStorage.setItem("corelasi_attendance_siswa", "[]");
    expect((await rowsFor()).map((row) => row.siswaId)).toEqual(["2", "10"]);
    expect((await rowsFor({ sortBy: "percentage", sortOrder: "desc" })).map((row) => row.siswaId)).toEqual(["2", "10"]);
  });

  it("keeps legacy mock string IDs deterministic when values and names are equal", async () => {
    localStorage.setItem("corelasi_users_db", JSON.stringify([
      { id: "student-b", name: "Ani", role: "siswa", kelasId: "k-1" },
      { id: "student-a", name: "Ani", role: "siswa", kelasId: "k-1" },
    ]));
    localStorage.setItem("corelasi_attendance_siswa", "[]");
    expect((await rowsFor({ sortBy: "name", sortOrder: "desc" })).map((row) => row.siswaId)).toEqual(["student-a", "student-b"]);
  });
});
