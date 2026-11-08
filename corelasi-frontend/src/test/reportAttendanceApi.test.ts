import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", () => ({ apiGet: vi.fn().mockResolvedValue([]) }));

describe("attendance report API parameters", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("keeps existing calls without filters and with class only compatible", async () => {
    vi.stubEnv("MODE", "production");
    vi.resetModules();
    const { apiGet } = await import("@/services/api");
    const { reportService } = await import("@/services/reportService");
    await reportService.getAttendanceReports();
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", undefined);
    await reportService.getAttendanceReports("1");
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", { kelasId: "1" });
  });

  it("sends the selected subject and combines it with class", async () => {
    vi.stubEnv("MODE", "production");
    vi.resetModules();
    const { apiGet } = await import("@/services/api");
    const { reportService } = await import("@/services/reportService");
    await reportService.getAttendanceReports(undefined, { mapelId: "2" });
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", { mapelId: "2" });
    await reportService.getAttendanceReports("1", { mapelId: "2" });
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", { kelasId: "1", mapelId: "2" });
    await reportService.getAttendanceReports("1", { mapelId: "" });
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", { kelasId: "1" });
    await reportService.getAttendanceReports(undefined, { mapelId: "" });
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", undefined);
  });

  it("sends each attendance category with the active class and subject", async () => {
    vi.stubEnv("MODE", "production");
    vi.resetModules();
    const { apiGet } = await import("@/services/api");
    const { reportService } = await import("@/services/reportService");
    for (const attendanceStatus of ["all", "below_90", "at_least_90"] as const) {
      await reportService.getAttendanceReports("1", { mapelId: "2", attendanceStatus });
      expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", {
        kelasId: "1", mapelId: "2", attendanceStatus,
      });
    }
    await reportService.getAttendanceReports(undefined, { attendanceStatus: "below_90" });
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", { attendanceStatus: "below_90" });
  });

  it("passes whitelisted sorting combinations alongside all active filters", async () => {
    vi.stubEnv("MODE", "production");
    vi.resetModules();
    const { apiGet } = await import("@/services/api");
    const { reportService } = await import("@/services/reportService");
    for (const sortBy of ["name", "percentage"] as const) {
      for (const sortOrder of ["asc", "desc"] as const) {
        await reportService.getAttendanceReports("1", { mapelId: "2", attendanceStatus: "below_90", sortBy, sortOrder });
        expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", {
          kelasId: "1", mapelId: "2", attendanceStatus: "below_90", sortBy, sortOrder,
        });
      }
    }
    await reportService.getAttendanceReports(undefined, { sortBy: "percentage", sortOrder: "asc" });
    expect(apiGet).toHaveBeenLastCalledWith("/reports/attendance/", { sortBy: "percentage", sortOrder: "asc" });
  });
});
