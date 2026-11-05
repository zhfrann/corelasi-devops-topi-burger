import type { Materi } from "@/types/learning";
import type { JadwalPembelajaran } from "@/types/schedule";

/**
 * Filter learning materials / modules based on search keyword
 * Searches within title, description, and teacher name
 */
export function searchMaterials(materials: Materi[], query: string): Materi[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return materials;

  return materials.filter((item) => {
    const titleMatch = item.title.toLowerCase().includes(cleanQuery);
    const descMatch = (item.description || "").toLowerCase().includes(cleanQuery);
    const guruMatch = (item.guruName || "").toLowerCase().includes(cleanQuery);

    return titleMatch || descMatch || guruMatch;
  });
}

/**
 * Filter courses / subject modules in LearningPage based on search keyword
 * Searches within mapelName, mapelId, and guruName
 */
export function searchCourses(
  courses: JadwalPembelajaran[],
  query: string,
): JadwalPembelajaran[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return courses;

  return courses.filter((item) => {
    const mapelNameMatch = item.mapelName.toLowerCase().includes(cleanQuery);
    const mapelIdMatch = item.mapelId.toLowerCase().includes(cleanQuery);
    const guruNameMatch = (item.guruName || "").toLowerCase().includes(cleanQuery);

    return mapelNameMatch || mapelIdMatch || guruNameMatch;
  });
}
