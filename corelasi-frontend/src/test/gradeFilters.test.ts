import { describe, it, expect } from "vitest";
import {
  searchGrades,
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
});
