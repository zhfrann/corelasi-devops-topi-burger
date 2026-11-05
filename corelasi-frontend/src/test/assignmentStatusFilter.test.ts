import { describe, it, expect } from "vitest";
import {
  filterAssignmentsByStatus,
  filterAndSearchAssignments,
  getSubmissionStatus,
} from "../utils/assignmentFilters";
import type { Tugas, Submission } from "../types/learning";

describe("filterAssignmentsByStatus and filterAndSearchAssignments unit tests", () => {
  const mockAssignments: Tugas[] = [
    {
      id: "tug-1",
      title: "Latihan Aljabar Linear",
      description: "Kerjakan soal matriks",
      dueDate: "2026-06-15",
      dateCreated: "2026-06-01",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelId: "mp-1",
      mapelName: "Matematika Wajib",
      guruId: "g-1",
      guruName: "Guru Matematika",
      status: "Dipublikasikan",
    },
    {
      id: "tug-2",
      title: "Praktikum Hukum Newton",
      description: "Laporan praktikum dinamika gerak",
      dueDate: "2026-06-18",
      dateCreated: "2026-06-02",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelId: "mp-2",
      mapelName: "Fisika Dasar",
      guruId: "g-2",
      guruName: "Guru Fisika",
      status: "Dipublikasikan",
    },
    {
      id: "tug-3",
      title: "Resensi Novel Laskar Pelangi",
      description: "Tulis resensi buku minimal 500 kata",
      dueDate: "2026-06-20",
      dateCreated: "2026-06-03",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelId: "mp-3",
      mapelName: "Bahasa Indonesia",
      guruId: "g-3",
      guruName: "Guru B. Indo",
      status: "Dipublikasikan",
    },
  ];

  const mockSubmissions: Submission[] = [
    {
      id: "sub-1",
      tugasId: "tug-1",
      siswaId: "s-1",
      siswaName: "Rifki",
      submitDate: "2026-06-14",
      status: "Terkumpul",
    },
    {
      id: "sub-2",
      tugasId: "tug-2",
      siswaId: "s-1",
      siswaName: "Rifki",
      submitDate: "2026-06-19",
      status: "Late",
    },
    // tug-3 has no submission, should be "Belum Mengumpulkan"
  ];

  it("resolves default status 'Belum Mengumpulkan' when no submission exists", () => {
    expect(getSubmissionStatus("tug-3", mockSubmissions)).toBe("Belum Mengumpulkan");
    expect(getSubmissionStatus("tug-unknown", mockSubmissions)).toBe("Belum Mengumpulkan");
  });

  it("resolves actual submission status if submission exists", () => {
    expect(getSubmissionStatus("tug-1", mockSubmissions)).toBe("Terkumpul");
    expect(getSubmissionStatus("tug-2", mockSubmissions)).toBe("Late");
  });

  it("returns all assignments when statusFilter is empty, undefined, or 'Semua'", () => {
    expect(filterAssignmentsByStatus(mockAssignments, mockSubmissions)).toEqual(mockAssignments);
    expect(filterAssignmentsByStatus(mockAssignments, mockSubmissions, "")).toEqual(mockAssignments);
    expect(filterAssignmentsByStatus(mockAssignments, mockSubmissions, "Semua")).toEqual(mockAssignments);
  });

  it("filters correctly by 'Belum Mengumpulkan'", () => {
    const result = filterAssignmentsByStatus(mockAssignments, mockSubmissions, "Belum Mengumpulkan");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tug-3");
  });

  it("filters correctly by 'Terkumpul'", () => {
    const result = filterAssignmentsByStatus(mockAssignments, mockSubmissions, "Terkumpul");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tug-1");
  });

  it("filters correctly by 'Late' or 'Terlambat'", () => {
    const resultLate = filterAssignmentsByStatus(mockAssignments, mockSubmissions, "Late");
    expect(resultLate).toHaveLength(1);
    expect(resultLate[0].id).toBe("tug-2");

    const resultTerlambat = filterAssignmentsByStatus(mockAssignments, mockSubmissions, "Terlambat");
    expect(resultTerlambat).toHaveLength(1);
    expect(resultTerlambat[0].id).toBe("tug-2");
  });

  it("combines search query and status filter correctly", () => {
    // Search for "Fisika" with status "Late" -> should find tug-2
    const match = filterAndSearchAssignments(mockAssignments, mockSubmissions, "Fisika", "Late");
    expect(match).toHaveLength(1);
    expect(match[0].id).toBe("tug-2");

    // Search for "Fisika" with status "Terkumpul" -> should be empty
    const mismatch = filterAndSearchAssignments(mockAssignments, mockSubmissions, "Fisika", "Terkumpul");
    expect(mismatch).toHaveLength(0);
  });
});
