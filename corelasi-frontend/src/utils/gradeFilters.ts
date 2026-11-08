export interface GradeRow {
  tugasId: string;
  tugasTitle: string;
  mapelName: string;
  score?: number;
  feedback?: string;
}

export type GradeStatusFilter = "all" | "graded" | "pending";

export interface GradeFilterCriteria {
  searchQuery?: string;
  status?: GradeStatusFilter | string;
}

/**
 * Filter grades list by assignment title or subject name (case-insensitive & trimmed)
 */
export function searchGrades(
  grades: GradeRow[],
  query: string,
): GradeRow[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return grades;

  return grades.filter((g) => {
    const titleMatch = (g.tugasTitle || "").toLowerCase().includes(clean);
    const mapelMatch = (g.mapelName || "").toLowerCase().includes(clean);
    return titleMatch || mapelMatch;
  });
}

/**
 * Filter grades list by grading status: all, graded (score exists), or pending (score undefined)
 */
export function filterGradesByStatus(
  grades: GradeRow[],
  status?: GradeStatusFilter | string,
): GradeRow[] {
  if (!status || status === "all") return grades;
  if (status === "graded") {
    return grades.filter((g) => g.score !== undefined);
  }
  if (status === "pending") {
    return grades.filter((g) => g.score === undefined);
  }
  return grades;
}

