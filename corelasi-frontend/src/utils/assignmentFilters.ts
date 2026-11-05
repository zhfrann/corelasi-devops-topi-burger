import type { Tugas, Submission } from "@/types/learning";

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

/**
 * Resolve student submission status for a specific assignment
 */
export function getSubmissionStatus(tugasId: string, submissions: Submission[]): string {
  const sub = submissions.find((s) => s.tugasId === tugasId);
  if (!sub) return "Belum Mengumpulkan";
  return sub.status;
}

/**
 * Filter assignments by submission status
 */
export function filterAssignmentsByStatus(
  assignments: Tugas[],
  submissions: Submission[],
  statusFilter?: string,
): Tugas[] {
  if (!statusFilter || statusFilter === "" || statusFilter === "Semua") {
    return assignments;
  }

  return assignments.filter((tugas) => {
    const currentStatus = getSubmissionStatus(tugas.id, submissions);
    if (statusFilter === "Late" || statusFilter === "Terlambat") {
      return currentStatus === "Late" || currentStatus === "Terlambat";
    }
    return currentStatus.toLowerCase() === statusFilter.toLowerCase();
  });
}

/**
 * Unified filter combining search query and submission status
 */
export function filterAndSearchAssignments(
  assignments: Tugas[],
  submissions: Submission[],
  query: string,
  statusFilter?: string,
): Tugas[] {
  const searched = searchAssignments(assignments, query);
  return filterAssignmentsByStatus(searched, submissions, statusFilter);
}
