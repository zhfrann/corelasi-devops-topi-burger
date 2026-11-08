import { describe, it, expect } from "vitest";
import {
  searchGrades,
  filterGradesByStatus,
  type GradeRow,
} from "../utils/gradeFilters";

describe("Grade Filters Utility Tests (Fadhli)", () => {
  const mockGrades: GradeRow[] = [
    {
      tugasId: "tug-1",
      tugasTitle: "Latihan Soal Aljabar Linear",
      mapelName: "Matematika",
      score: 88,
      feedback: "Pemahaman konsep sangat baik",
    },
    {
      tugasId: "tug-2",
      tugasTitle: "Praktikum Hukum Newton",
      mapelName: "Fisika",
      score: 75,
      feedback: "Perbaiki format laporan praktikum",
    },
    {
      tugasId: "tug-3",
      tugasTitle: "Analisis Struktur Teks Eksposisi",
      mapelName: "Bahasa Indonesia",
      score: undefined,
      feedback: undefined,
    },
    {
      tugasId: "tug-4",
      tugasTitle: "Proyek Rangkaian Listrik Paralel",
      mapelName: "Fisika",
      score: 92,
      feedback: "Sangat rapi dan akurat",
    },
  ];

  describe("searchGrades", () => {
    it("harus mengembalikan semua data jika query pencarian kosong atau hanya spasi", () => {
      expect(searchGrades(mockGrades, "")).toHaveLength(4);
      expect(searchGrades(mockGrades, "   ")).toHaveLength(4);
    });

    it("harus menyaring berdasarkan nama tugas secara case-insensitive", () => {
      const result = searchGrades(mockGrades, "aljabar");
      expect(result).toHaveLength(1);
      expect(result[0].tugasId).toBe("tug-1");
    });

    it("harus menyaring berdasarkan nama mata pelajaran", () => {
      const result = searchGrades(mockGrades, "fisika");
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.tugasId)).toEqual(["tug-2", "tug-4"]);
    });

    it("harus menangani whitespace ekstra di awal dan akhir query", () => {
      const result = searchGrades(mockGrades, "  newton  ");
      expect(result).toHaveLength(1);
      expect(result[0].tugasId).toBe("tug-2");
    });

    it("harus mengembalikan array kosong bila kata kunci tidak cocok", () => {
      const result = searchGrades(mockGrades, "Kimia Organik");
      expect(result).toHaveLength(0);
    });
  });

  describe("filterGradesByStatus", () => {
    it("harus mengembalikan semua data bila status adalah 'all' atau undefined", () => {
      expect(filterGradesByStatus(mockGrades, "all")).toHaveLength(4);
      expect(filterGradesByStatus(mockGrades)).toHaveLength(4);
    });

    it("harus menyaring hanya tugas yang sudah memiliki nilai ketika status 'graded'", () => {
      const result = filterGradesByStatus(mockGrades, "graded");
      expect(result).toHaveLength(3);
      expect(result.every((g) => g.score !== undefined)).toBe(true);
      expect(result.map((g) => g.tugasId)).toEqual(["tug-1", "tug-2", "tug-4"]);
    });

    it("harus menyaring hanya tugas yang belum memiliki nilai ketika status 'pending'", () => {
      const result = filterGradesByStatus(mockGrades, "pending");
      expect(result).toHaveLength(1);
      expect(result[0].tugasId).toBe("tug-3");
      expect(result[0].score).toBeUndefined();
    });
  });
});

