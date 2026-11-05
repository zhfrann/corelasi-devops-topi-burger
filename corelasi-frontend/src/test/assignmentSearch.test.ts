import { describe, it, expect } from "vitest";
import { searchAssignments } from "../utils/assignmentFilters";
import type { Tugas } from "../types/learning";

describe("searchAssignments utility unit tests", () => {
  const mockAssignments: Tugas[] = [
    {
      id: "tug-1",
      title: "Latihan Aljabar Linear",
      description: "Kerjakan soal matriks halaman 45",
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
      description: "Laporan praktikum dinamika gerak dan gravitasi",
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

  it("returns all assignments when query is empty or whitespace only", () => {
    expect(searchAssignments(mockAssignments, "")).toEqual(mockAssignments);
    expect(searchAssignments(mockAssignments, "   ")).toEqual(mockAssignments);
  });

  it("filters assignments by title (case-insensitive)", () => {
    const result = searchAssignments(mockAssignments, "aljabar");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tug-1");

    const resultUppercase = searchAssignments(mockAssignments, "ALJABAR");
    expect(resultUppercase).toHaveLength(1);
    expect(resultUppercase[0].id).toBe("tug-1");
  });

  it("filters assignments by subject name (mapelName)", () => {
    const result = searchAssignments(mockAssignments, "Fisika");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tug-2");
  });

  it("filters assignments by description content", () => {
    const result = searchAssignments(mockAssignments, "matriks");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tug-1");
  });

  it("returns empty array when no assignment matches the query", () => {
    const result = searchAssignments(mockAssignments, "Biologi Sel Kanker");
    expect(result).toHaveLength(0);
  });

  it("handles leading and trailing whitespace properly", () => {
    const result = searchAssignments(mockAssignments, "  Newton  ");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("tug-2");
  });
});
