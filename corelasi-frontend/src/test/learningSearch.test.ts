import { describe, it, expect } from "vitest";
import { searchMaterials, searchCourses } from "../utils/learningFilters";
import type { Materi } from "../types/learning";
import type { JadwalPembelajaran } from "../types/schedule";

describe("searchMaterials and searchCourses unit tests", () => {
  const mockMaterials: Materi[] = [
    {
      id: "mat-1",
      title: "Modul 1: Pengantar Vektor dan Skalar",
      description: "Membahas konsep resultan vektor dan perkalian dot cross",
      sourceType: "file",
      fileUrl: "/media/modul1.pdf",
      dateCreated: "2026-06-01",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelId: "mp-1",
      mapelName: "Fisika",
      guruId: "g-1",
      guruName: "Budi Santoso, M.Pd.",
      status: "Dipublikasikan",
    },
    {
      id: "mat-2",
      title: "Modul 2: Kinematika Gerak Lurus",
      description: "GLB dan GLBB serta grafik kecepatan terhadap waktu",
      sourceType: "file",
      fileUrl: "/media/modul2.pdf",
      dateCreated: "2026-06-05",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelId: "mp-1",
      mapelName: "Fisika",
      guruId: "g-1",
      guruName: "Budi Santoso, M.Pd.",
      status: "Dipublikasikan",
    },
    {
      id: "mat-3",
      title: "Slide Presentasi: Dinamika Newton",
      description: "Hukum 1, 2, 3 Newton beserta contoh soal gaya gesek",
      sourceType: "link",
      fileUrl: "https://slides.example.com/newton",
      dateCreated: "2026-06-10",
      kelasId: "k-1",
      kelasName: "X-A",
      mapelId: "mp-1",
      mapelName: "Fisika",
      guruId: "g-2",
      guruName: "Siti Aminah, S.Pd.",
      status: "Dipublikasikan",
    },
  ];

  const mockCourses: JadwalPembelajaran[] = [
    {
      id: "sch-1",
      mapelId: "MP-MAT",
      mapelName: "Matematika Wajib",
      guruId: "g-1",
      guruName: "Ahmad Dahlan",
      kelasId: "k-1",
      kelasName: "X-A",
      semesterId: "sem-1",
      hari: "Senin",
      waktuMulai: "07:00",
      waktuSelesai: "08:30",
    },
    {
      id: "sch-2",
      mapelId: "MP-FIS",
      mapelName: "Fisika Dasar",
      guruId: "g-2",
      guruName: "Budi Santoso",
      kelasId: "k-1",
      kelasName: "X-A",
      semesterId: "sem-1",
      hari: "Selasa",
      waktuMulai: "08:30",
      waktuSelesai: "10:00",
    },
  ];

  describe("searchMaterials", () => {
    it("returns all materials when query is empty or whitespace", () => {
      expect(searchMaterials(mockMaterials, "")).toEqual(mockMaterials);
      expect(searchMaterials(mockMaterials, "   ")).toEqual(mockMaterials);
    });

    it("filters materials by title keyword (case-insensitive)", () => {
      const result = searchMaterials(mockMaterials, "vektor");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("mat-1");
    });

    it("filters materials by description keyword", () => {
      const result = searchMaterials(mockMaterials, "GLBB");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("mat-2");
    });

    it("filters materials by teacher name", () => {
      const result = searchMaterials(mockMaterials, "Siti Aminah");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("mat-3");
    });

    it("returns empty array when query does not match any material", () => {
      const result = searchMaterials(mockMaterials, "Termodinamika Quantum");
      expect(result).toHaveLength(0);
    });
  });

  describe("searchCourses", () => {
    it("returns all courses when query is empty or whitespace", () => {
      expect(searchCourses(mockCourses, "")).toEqual(mockCourses);
      expect(searchCourses(mockCourses, "   ")).toEqual(mockCourses);
    });

    it("filters courses by subject name", () => {
      const result = searchCourses(mockCourses, "Fisika");
      expect(result).toHaveLength(1);
      expect(result[0].mapelId).toBe("MP-FIS");
    });

    it("filters courses by mapelId code", () => {
      const result = searchCourses(mockCourses, "MP-MAT");
      expect(result).toHaveLength(1);
      expect(result[0].mapelName).toBe("Matematika Wajib");
    });

    it("filters courses by teacher name", () => {
      const result = searchCourses(mockCourses, "Dahlan");
      expect(result).toHaveLength(1);
      expect(result[0].mapelId).toBe("MP-MAT");
    });

    it("returns empty array if no course matches", () => {
      const result = searchCourses(mockCourses, "Biologi");
      expect(result).toHaveLength(0);
    });
  });
});
