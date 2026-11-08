import { describe, it, expect } from "vitest";
import {
  searchAttendanceStudents,
  filterAttendanceByDateRange,
  filterAttendanceByStatus,
  filterAttendanceLogs,
} from "../utils/attendanceFilters";
import type { AbsensiSiswa } from "../types/attendance";

describe("Attendance Filters Utility Tests (Yappier Albertus)", () => {
  const mockLogs: AbsensiSiswa[] = [
    {
      id: "abs-1",
      siswaId: "s-1",
      siswaName: "Ahmad Fauzi",
      nis: "103022300001",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelName: "Matematika",
      tanggal: "2026-06-01",
      status: "Hadir",
      keterangan: "",
    },
    {
      id: "abs-2",
      siswaId: "s-2",
      siswaName: "Budi Santoso",
      nis: "103022300002",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelName: "Fisika",
      tanggal: "2026-06-05",
      status: "Sakit",
      keterangan: "Demam berdarah",
    },
    {
      id: "abs-3",
      siswaId: "s-3",
      siswaName: "Citra Lestari",
      nis: "103022300003",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelName: "Bahasa Inggris",
      tanggal: "2026-06-10",
      status: "Izin",
      keterangan: "Lomba olimpiade",
    },
    {
      id: "abs-4",
      siswaId: "s-4",
      siswaName: "Dedi Setiawan",
      nis: "103022300004",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelName: "Biologi",
      tanggal: "2026-06-15",
      status: "Alpa",
      keterangan: "Tanpa kabar",
    },
    {
      id: "abs-5",
      siswaId: "s-1",
      siswaName: "Ahmad Fauzi",
      nis: "103022300001",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelName: "Matematika",
      tanggal: "2026-06-20",
      status: "Alpa",
      keterangan: "Kesiangan",
    },
  ];

  describe("1. searchAttendanceStudents", () => {
    it("returns all logs when search query is empty or only whitespace", () => {
      expect(searchAttendanceStudents(mockLogs, "")).toHaveLength(5);
      expect(searchAttendanceStudents(mockLogs, "   ")).toHaveLength(5);
    });

    it("filters logs by student name (case-insensitive)", () => {
      const result = searchAttendanceStudents(mockLogs, "ahmad");
      expect(result).toHaveLength(2);
      expect(result[0].siswaName).toBe("Ahmad Fauzi");

      const resultUpper = searchAttendanceStudents(mockLogs, "AHMAD");
      expect(resultUpper).toHaveLength(2);
    });

    it("filters logs by student NIS", () => {
      const result = searchAttendanceStudents(mockLogs, "103022300003");
      expect(result).toHaveLength(1);
      expect(result[0].siswaName).toBe("Citra Lestari");
    });

    it("filters logs by subject name (mapelName)", () => {
      const result = searchAttendanceStudents(mockLogs, "Fisika");
      expect(result).toHaveLength(1);
      expect(result[0].siswaName).toBe("Budi Santoso");
    });

    it("returns empty array when student is not found", () => {
      const result = searchAttendanceStudents(mockLogs, "Zulkifli Fiktif");
      expect(result).toHaveLength(0);
    });
  });

  describe("2. filterAttendanceByDateRange", () => {
    it("returns all logs if neither startDate nor endDate is provided", () => {
      expect(filterAttendanceByDateRange(mockLogs)).toHaveLength(5);
    });

    it("filters logs from startDate onwards", () => {
      const result = filterAttendanceByDateRange(mockLogs, "2026-06-10");
      expect(result).toHaveLength(3);
      expect(result.map((r) => r.tanggal)).toEqual([
        "2026-06-10",
        "2026-06-15",
        "2026-06-20",
      ]);
    });

    it("filters logs up to endDate", () => {
      const result = filterAttendanceByDateRange(mockLogs, undefined, "2026-06-05");
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.tanggal)).toEqual(["2026-06-01", "2026-06-05"]);
    });

    it("filters logs within a closed range [startDate, endDate]", () => {
      const result = filterAttendanceByDateRange(
        mockLogs,
        "2026-06-05",
        "2026-06-15",
      );
      expect(result).toHaveLength(3);
      expect(result[0].tanggal).toBe("2026-06-05");
      expect(result[2].tanggal).toBe("2026-06-15");
    });

    it("returns empty array when range has no matching dates", () => {
      const result = filterAttendanceByDateRange(
        mockLogs,
        "2026-07-01",
        "2026-07-31",
      );
      expect(result).toHaveLength(0);
    });
  });

  describe("3. filterAttendanceByStatus", () => {
    it("returns all logs when status is empty or 'Semua'", () => {
      expect(filterAttendanceByStatus(mockLogs, "")).toHaveLength(5);
      expect(filterAttendanceByStatus(mockLogs, "Semua")).toHaveLength(5);
    });

    it("filters logs strictly by 'Hadir'", () => {
      const result = filterAttendanceByStatus(mockLogs, "Hadir");
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("Hadir");
    });

    it("filters logs strictly by 'Sakit'", () => {
      const result = filterAttendanceByStatus(mockLogs, "Sakit");
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("Sakit");
    });

    it("filters logs strictly by 'Alpa'", () => {
      const result = filterAttendanceByStatus(mockLogs, "Alpa");
      expect(result).toHaveLength(2);
    });
  });

  describe("4. filterAttendanceLogs (Composite Filtering)", () => {
    it("combines student search, status filter, and date range simultaneously", () => {
      const result = filterAttendanceLogs(mockLogs, {
        searchQuery: "Ahmad",
        status: "Alpa",
        startDate: "2026-06-10",
        endDate: "2026-06-30",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("abs-5");
      expect(result[0].siswaName).toBe("Ahmad Fauzi");
      expect(result[0].status).toBe("Alpa");
      expect(result[0].tanggal).toBe("2026-06-20");
    });
  });
});
