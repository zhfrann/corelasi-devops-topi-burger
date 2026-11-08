export interface GradeRow {
  tugasId: string;
  tugasTitle: string;
  mapelName: string;
  score?: number;
  feedback?: string;
}

export interface GradeFilterCriteria {
  searchQuery?: string;
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
