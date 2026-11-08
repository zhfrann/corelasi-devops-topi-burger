export interface GradeRow {
  tugasId: string;
  tugasTitle: string;
  mapelName: string;
  score?: number;
  feedback?: string;
}

export type GradeStatusFilter = "all" | "graded" | "pending";

export type GradeSortKey = "score" | "title" | "mapel";
export type GradeSortOrder = "asc" | "desc";

export interface GradeFilterCriteria {
  searchQuery?: string;
  status?: GradeStatusFilter | string;
  sortBy?: GradeSortKey | string;
  sortOrder?: GradeSortOrder;
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
 * Filter grades list by grading status: all, graded (score exists), or pending (score undefined or null)
 */
export function filterGradesByStatus(
  grades: GradeRow[],
  status?: GradeStatusFilter | string,
): GradeRow[] {
  if (!status || status === "all") return grades;
  if (status === "graded") {
    return grades.filter((g) => typeof g.score === "number");
  }
  if (status === "pending") {
    return grades.filter((g) => g.score == null);
  }
  return grades;
}

/**
 * Sort grades by score (with nulls-last), assignment title, or subject name
 */
export function sortGrades(
  grades: GradeRow[],
  sortBy: GradeSortKey | string = "score",
  sortOrder: GradeSortOrder = "desc",
): GradeRow[] {
  const result = [...grades];
  const isAsc = sortOrder === "asc";

  return result.sort((a, b) => {
    if (sortBy === "score") {
      const aMissing = a.score == null;
      const bMissing = b.score == null;

      // Always place unrated assignments at the bottom
      if (aMissing && bMissing) {
        return a.tugasTitle.localeCompare(b.tugasTitle);
      }
      if (aMissing) return 1;
      if (bMissing) return -1;

      const diff = isAsc ? (a.score! - b.score!) : (b.score! - a.score!);
      if (diff !== 0) return diff;
      return a.tugasTitle.localeCompare(b.tugasTitle);
    }

    if (sortBy === "title") {
      const cmp = a.tugasTitle.localeCompare(b.tugasTitle);
      return isAsc ? cmp : -cmp;
    }

    if (sortBy === "mapel") {
      const cmp = a.mapelName.localeCompare(b.mapelName);
      if (cmp !== 0) return isAsc ? cmp : -cmp;
      return a.tugasTitle.localeCompare(b.tugasTitle);
    }

    return 0;
  });
}

/**
 * Composite filtering and sorting pipeline
 */
export function filterAndSortGrades(
  grades: GradeRow[],
  criteria: GradeFilterCriteria,
): GradeRow[] {
  let result = grades;
  if (criteria.searchQuery) {
    result = searchGrades(result, criteria.searchQuery);
  }
  if (criteria.status) {
    result = filterGradesByStatus(result, criteria.status);
  }
  if (criteria.sortBy) {
    result = sortGrades(
      result,
      criteria.sortBy,
      criteria.sortOrder || "desc",
    );
  }
  return result;
}


