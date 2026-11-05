import type { Tugas } from "@/types/learning";

/**
 * Filter list of assignments based on search keyword (title, mapelName, description)
 */
export function searchAssignments(assignments: Tugas[], query: string): Tugas[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return assignments;

  return assignments.filter((tugas) => {
    const titleMatch = tugas.title.toLowerCase().includes(cleanQuery);
    const mapelMatch = (tugas.mapelName || "").toLowerCase().includes(cleanQuery);
    const descMatch = (tugas.description || "").toLowerCase().includes(cleanQuery);

    return titleMatch || mapelMatch || descMatch;
  });
}
