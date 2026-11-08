import { describe, it, expect } from "vitest";
import {
  searchGrades,
  filterGradesByStatus,
  sortGrades,
  filterAndSortGrades,
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

    it("harus memperlakukan score bernilai null maupun undefined sebagai pending", () => {
      const dataWithNull: GradeRow[] = [
        { tugasId: "1", tugasTitle: "A", mapelName: "M", score: 80 },
        { tugasId: "2", tugasTitle: "B", mapelName: "M", score: null as unknown as number },
        { tugasId: "3", tugasTitle: "C", mapelName: "M", score: undefined },
      ];
      expect(filterGradesByStatus(dataWithNull, "graded")).toHaveLength(1);
      expect(filterGradesByStatus(dataWithNull, "pending")).toHaveLength(2);
    });
  });

  describe("sortGrades", () => {
    it("harus mengurutkan skor secara descending dengan nilai null/undefined selalu di akhir", () => {
      const result = sortGrades(mockGrades, "score", "desc");
      const scores = result.map((r) => r.score);
      expect(scores).toEqual([92, 88, 75, undefined]);
      expect(result[result.length - 1].tugasId).toBe("tug-3");
    });

    it("harus mengurutkan skor secara ascending dengan nilai null/undefined tetap di posisi paling akhir", () => {
      const result = sortGrades(mockGrades, "score", "asc");
      const scores = result.map((r) => r.score);
      expect(scores).toEqual([75, 88, 92, undefined]);
      expect(result[result.length - 1].tugasId).toBe("tug-3");
    });

    it("harus mengurutkan berdasarkan nama mata pelajaran", () => {
      const result = sortGrades(mockGrades, "mapel", "asc");
      const mapels = result.map((r) => r.mapelName);
      expect(mapels[0]).toBe("Bahasa Indonesia");
      expect(mapels[mapels.length - 1]).toBe("Matematika");
    });

    it("harus mengurutkan berdasarkan nama tugas", () => {
      const result = sortGrades(mockGrades, "title", "asc");
      expect(result[0].tugasTitle).toBe("Analisis Struktur Teks Eksposisi");
    });
  });

  describe("filterAndSortGrades (composite pipeline)", () => {
    it("harus menggabungkan search, filter status, dan sort dengan konsisten", () => {
      const result = filterAndSortGrades(mockGrades, {
        searchQuery: "fisika",
        status: "graded",
        sortBy: "score",
        sortOrder: "desc",
      });

      expect(result).toHaveLength(2);
      expect(result[0].tugasId).toBe("tug-4"); // Score 92
      expect(result[1].tugasId).toBe("tug-2"); // Score 75
    });
  });
});

