import { describe, it, expect, beforeEach } from "vitest";
import { reportService } from "../services/reportService";

describe("Report Service Unit Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should compile all student attendance summaries", async () => {
    const list = await reportService.getAttendanceReports();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("percentage");
    expect(list[0]).toHaveProperty("hadir");
    expect(list[0]).toHaveProperty("nis");
  });

  it("should compile attendance summaries filtered by class ID", async () => {
    const list = await reportService.getAttendanceReports("k-1"); // X-A
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((r) => r.kelasName === "X-A")).toBe(true);
  });

  it("should report zero attendance when a student has no records", async () => {
    localStorage.setItem(
      "corelasi_users_db",
      JSON.stringify([
        {
          id: "student-empty",
          name: "Siswa Kosong",
          email: "empty@corelasi.test",
          role: "siswa",
          status: "aktif",
          kelasId: "k-1",
          kelasName: "X-A",
          password: "password123",
        },
      ]),
    );
    localStorage.setItem("corelasi_attendance_siswa", "[]");

    const [report] = await reportService.getAttendanceReports();

    expect(report).toMatchObject({
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpa: 0,
      percentage: 0,
    });
  });

  it("should compile all student grade summaries with averages", async () => {
    const list = await reportService.getGradeReports();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty("average");
    expect(list[0]).toHaveProperty("grades");
  });

  it("should compile grade summaries filtered by class ID", async () => {
    const list = await reportService.getGradeReports("k-2"); // XI-A
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((r) => r.kelasName === "XI-A")).toBe(true);
  });

  it("should report a zero average when a student has no graded work", async () => {
    localStorage.setItem(
      "corelasi_users_db",
      JSON.stringify([
        {
          id: "student-empty",
          name: "Siswa Kosong",
          email: "empty@corelasi.test",
          role: "siswa",
          status: "aktif",
          kelasId: "k-1",
          kelasName: "X-A",
          password: "password123",
        },
      ]),
    );
    localStorage.setItem("corelasi_learning_tugas", "[]");
    localStorage.setItem("corelasi_learning_submissions", "[]");

    const [report] = await reportService.getGradeReports();

    expect(report.average).toBe(0);
    expect(report.grades).toEqual([]);
  });

  it("should compile high-level school operational metrics", async () => {
    const report = await reportService.getOperationalReport();
    expect(report).toBeDefined();
    expect(report.totalSiswa).toBeGreaterThan(0);
    expect(report.totalGuru).toBeGreaterThan(0);
    expect(report.attendanceRate).toBeGreaterThan(0);
    expect(report.journalCompletionRate).toBeGreaterThan(0);
  });
});

describe("Attendance report subject aggregation", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("corelasi_users_db", JSON.stringify([
      { id: "a", name: "Ani", role: "siswa", kelasId: "k-1", kelasName: "X-A" },
      { id: "b", name: "Budi", role: "siswa", kelasId: "k-1", kelasName: "X-A" },
      { id: "c", name: "Citra", role: "siswa", kelasId: "k-2", kelasName: "X-B" },
    ]));
    localStorage.setItem("corelasi_attendance_siswa", JSON.stringify([
      { id: "1", siswaId: "a", mapelId: "mp-1", status: "Hadir" },
      { id: "2", siswaId: "a", mapelId: "mp-2", status: "Alpa" },
      { id: "3", siswaId: "a", mapelId: null, status: "Sakit" },
      { id: "4", siswaId: "c", mapelId: "mp-1", status: "Izin" },
    ]));
  });

  it("includes subjectless records for all subjects", async () => {
    const rows = await reportService.getAttendanceReports(undefined, { mapelId: "" });
    expect(rows[0]).toMatchObject({ hadir: 1, sakit: 1, alpa: 1, percentage: 33 });
  });

  it("filters records before counting and preserves class and roster", async () => {
    const rows = await reportService.getAttendanceReports("k-1", { mapelId: "mp-1" });
    expect(rows.map((row) => row.siswaId)).toEqual(["a", "b"]);
    expect(rows[0]).toMatchObject({ hadir: 1, sakit: 0, alpa: 0, percentage: 100 });
    expect(rows[1]).toMatchObject({ hadir: 0, sakit: 0, izin: 0, alpa: 0, percentage: 0 });
  });

  it("keeps zero counts when the selected subject has no attendance", async () => {
    const rows = await reportService.getAttendanceReports(undefined, { mapelId: "mp-empty" });
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row).toMatchObject({ hadir: 0, sakit: 0, izin: 0, alpa: 0, percentage: 0 });
    }
  });
});
