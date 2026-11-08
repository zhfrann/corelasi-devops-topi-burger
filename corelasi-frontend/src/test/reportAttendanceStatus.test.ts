import { beforeEach, describe, expect, it } from "vitest";
import { reportService } from "@/services/reportService";
import type { AttendanceStatus } from "@/types/report";

describe("attendance percentage categories in the mock service", () => {
  const fixtures = [
    { id: "low", present: 4, total: 5 },
    { id: "boundary", present: 9, total: 10 },
    { id: "full", present: 5, total: 5 },
    { id: "zero", present: 0, total: 5 },
    { id: "empty", present: 0, total: 0 },
    { id: "rounded", present: 112, total: 125 },
    { id: "half-low", present: 177, total: 200 },
    { id: "half-boundary", present: 179, total: 200 },
    { id: "half-high", present: 181, total: 200 },
    { id: "outside", present: 4, total: 5 },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("corelasi_users_db", JSON.stringify(fixtures.map(({ id }) => ({
      id, name: id, role: "siswa", kelasId: id === "outside" ? "k-2" : "k-1", kelasName: "XI-A",
    }))));
    const records = [
      ...fixtures.map((fixture) => ({ ...fixture, mapelId: "mp-1" })),
      { id: "low", present: 5, total: 5, mapelId: "mp-2" },
      { id: "full", present: 0, total: 5, mapelId: "mp-2" },
    ].flatMap(({ id, present, total, mapelId }) => Array.from({ length: total }, (_, index) => ({
      id: `${id}-${mapelId}-${index}`, siswaId: id, mapelId, status: index < present ? "Hadir" : "Alpa",
    })));
    localStorage.setItem("corelasi_attendance_siswa", JSON.stringify(records));
  });

  const rowsFor = (attendanceStatus?: AttendanceStatus, mapelId = "mp-1") =>
    reportService.getAttendanceReports("k-1", { mapelId, attendanceStatus });

  it("keeps the full roster, including students without data, when all or omitted", async () => {
    const all = await rowsFor("all");
    expect(all).toHaveLength(9);
    expect(all.find((row) => row.siswaId === "empty")).toMatchObject({
      hadir: 0, sakit: 0, izin: 0, alpa: 0, percentage: 0,
    });
    expect(await rowsFor()).toEqual(all);
  });

  it("includes 80% and real 0% in below_90 but excludes students without records", async () => {
    const rows = await rowsFor("below_90");
    expect(rows.map((row) => row.siswaId)).toEqual(["half-low", "low", "zero"]);
    expect(rows.find((row) => row.siswaId === "zero")).toMatchObject({ alpa: 5, percentage: 0 });
    expect(rows.find((row) => row.siswaId === "low")?.percentage).toBe(80);
  });

  it("includes exactly 90% and 100% and evaluates rounded percentages", async () => {
    const rows = await rowsFor("at_least_90");
    expect(rows.map((row) => row.siswaId)).toEqual(["boundary", "full", "half-boundary", "half-high", "rounded"]);
    expect(rows.find((row) => row.siswaId === "boundary")?.percentage).toBe(90);
    expect(rows.find((row) => row.siswaId === "full")?.percentage).toBe(100);
    expect(rows.find((row) => row.siswaId === "rounded")).toMatchObject({ hadir: 112, alpa: 13, percentage: 90 });
  });

  it("matches the API's half-to-even rounding instead of changing the backend formula", async () => {
    const rows = await rowsFor("all");
    expect(rows.find((row) => row.siswaId === "half-low")?.percentage).toBe(88);
    expect(rows.find((row) => row.siswaId === "half-boundary")?.percentage).toBe(90);
    expect(rows.find((row) => row.siswaId === "half-high")?.percentage).toBe(90);
  });

  it("applies subject and class filters before percentage categories", async () => {
    expect((await rowsFor("at_least_90", "mp-2")).map((row) => row.siswaId)).toEqual(["low"]);
    expect((await rowsFor("below_90", "mp-2")).map((row) => row.siswaId)).toEqual(["full"]);
    expect(await rowsFor("below_90", "mp-empty")).toEqual([]);
    expect(await rowsFor("at_least_90", "mp-empty")).toEqual([]);
    expect(await rowsFor("all", "mp-empty")).toHaveLength(9);
  });
});
