import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AttendanceReportsPage } from "@/pages/admin/AttendanceReportsPage";
import { academicService } from "@/services/academicService";
import { reportService } from "@/services/reportService";
import type { StudentAttendanceSummary } from "@/types/report";
import { exportToExcel } from "@/utils/exportHelper";

vi.mock("@/utils/exportHelper", () => ({ exportToExcel: vi.fn() }));

const ani: StudentAttendanceSummary = {
  siswaId: "1", siswaName: "Ani", nis: "123", kelasName: "X-A",
  hadir: 1, sakit: 0, izin: 0, alpa: 0, percentage: 100,
};
const budi = { ...ani, siswaId: "2", siswaName: "Budi", nis: "456" };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

describe("attendance report page subject filter", () => {
  let root: Root;
  let container: HTMLDivElement;

  function element<T extends Element>(selector: string): T {
    const result = container.querySelector<T>(selector);
    if (!result) throw new Error(`Missing element: ${selector}`);
    return result;
  }

  function button(text: string) {
    const result = [...container.querySelectorAll("button")].find((node) => node.textContent?.trim() === text);
    if (!result) throw new Error(`Missing button: ${text}`);
    return result;
  }

  async function select(selector: string, value: string) {
    await act(async () => {
      const node = element<HTMLSelectElement>(selector);
      node.value = value;
      node.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  async function search(value: string) {
    await act(async () => {
      const input = element<HTMLInputElement>('input[aria-label="Cari siswa atau NIS..."]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  async function renderPage() {
    await act(async () => { root.render(<AttendanceReportsPage />); });
  }

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(academicService, "getKelas").mockResolvedValue([
      { id: "1", name: "X-A", tingkat: "X", waliKelasId: "", waliKelasName: "" },
    ]);
    vi.spyOn(academicService, "getMapel").mockResolvedValue([
      { id: "2", name: "Matematika" }, { id: "3", name: "Fisika" },
    ]);
    vi.spyOn(reportService, "getAttendanceReports").mockResolvedValue([ani, budi]);
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("loads master options, associates the label, and sends class/subject IDs", async () => {
    await renderPage();
    expect(element<HTMLLabelElement>('label[for="attendance-report-mapel"]').control)
      .toBe(element("#attendance-report-mapel"));
    expect(academicService.getMapel).toHaveBeenCalled();
    expect(element("#attendance-report-mapel")).toHaveTextContent("Matematika");
    await select("#attendance-report-mapel", "2");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith(undefined, { mapelId: "2", attendanceStatus: "all" });
    await select('select[aria-label="Semua Kelas"]', "1");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: "2", attendanceStatus: "all" });
    await select("#attendance-report-mapel", "");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: undefined, attendanceStatus: "all" });
  });

  it("keeps master options and shows an empty state when the report is empty", async () => {
    await renderPage();
    vi.mocked(reportService.getAttendanceReports).mockResolvedValueOnce([]);
    await select("#attendance-report-mapel", "3");
    expect(container).toHaveTextContent("Tidak ada data kehadiran yang sesuai dengan filter atau pencarian.");
    expect(element("#attendance-report-mapel")).toHaveTextContent("Matematika");
    expect(element('select[aria-label="Semua Kelas"]')).toHaveTextContent("Kelas X-A");
    expect(container.querySelector("table")).toBeNull();
  });

  it("blocks stale exports while loading and exports the filtered, searched rows", async () => {
    await renderPage();
    const next = deferred<StudentAttendanceSummary[]>();
    vi.mocked(reportService.getAttendanceReports).mockReturnValueOnce(next.promise);
    await select("#attendance-report-mapel", "2");
    expect(button("Ekspor Excel")).toBeDisabled();
    expect(container.querySelector("table")).toBeNull();
    expect(container).toHaveTextContent("Memuat data rekap absensi...");
    await act(async () => { next.resolve([budi, ani]); });
    await search("  123  ");
    expect(element("tbody")).toHaveTextContent("Ani");
    expect(element("tbody")).not.toHaveTextContent("Budi");
    await act(async () => { button("Ekspor Excel").click(); });
    expect(exportToExcel).toHaveBeenLastCalledWith([
      { NIS: "123", "Nama Siswa": "Ani", Kelas: "X-A", Hadir: 1, Sakit: 0, Izin: 0, Alpa: 0, "Persentase Kehadiran (%)": "100%" },
    ], expect.any(String));
    await search("tidak ditemukan");
    expect(container).toHaveTextContent("Tidak ada data kehadiran yang sesuai");
  });

  it("hides old rows on failure and retries the active filter", async () => {
    await renderPage();
    vi.mocked(reportService.getAttendanceReports).mockRejectedValueOnce(new Error("Permintaan gagal"));
    await select("#attendance-report-mapel", "2");
    expect(element('[role="alert"]')).toHaveTextContent("Permintaan gagal");
    expect(container.querySelector("table")).toBeNull();
    expect(button("Ekspor Excel")).toBeDisabled();
    await act(async () => { button("Coba Lagi").click(); });
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith(undefined, { mapelId: "2", attendanceStatus: "all" });
    expect(element("tbody")).toHaveTextContent("Ani");
  });

  it("ignores an older response that arrives after the latest selection", async () => {
    await renderPage();
    const older = deferred<StudentAttendanceSummary[]>();
    vi.mocked(reportService.getAttendanceReports).mockReturnValueOnce(older.promise).mockResolvedValueOnce([budi]);
    await select("#attendance-report-mapel", "2");
    await select("#attendance-report-mapel", "3");
    await act(async () => { older.resolve([ani]); });
    expect(element("tbody")).toHaveTextContent("Budi");
    expect(element("tbody")).not.toHaveTextContent("Ani");
    expect(element<HTMLSelectElement>("#attendance-report-mapel").value).toBe("3");
  });

  it("ignores an older failure and reports master-data failures", async () => {
    await renderPage();
    const older = deferred<StudentAttendanceSummary[]>();
    vi.mocked(reportService.getAttendanceReports).mockReturnValueOnce(older.promise).mockResolvedValueOnce([budi]);
    await select("#attendance-report-mapel", "2");
    await select("#attendance-report-mapel", "3");
    await act(async () => { older.reject(new Error("Kegagalan lama")); });
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(element("tbody")).toHaveTextContent("Budi");
    vi.mocked(academicService.getMapel).mockRejectedValueOnce(new Error("Master mapel gagal"));
    await select("#attendance-report-mapel", "");
    expect(element('[role="alert"]')).toHaveTextContent("Master mapel gagal");
    expect(button("Ekspor Excel")).toBeDisabled();
  });

  it("offers three attendance choices and preserves class and subject across category changes", async () => {
    await renderPage();
    const status = element<HTMLSelectElement>("#attendance-report-status");
    expect(element<HTMLLabelElement>('label[for="attendance-report-status"]').control).toBe(status);
    expect([...status.options].map((option) => [option.value, option.text])).toEqual([
      ["all", "Semua siswa"], ["below_90", "Kehadiran < 90%"], ["at_least_90", "Kehadiran ≥ 90%"],
    ]);
    expect(status.value).toBe("all");
    await select('select[aria-label="Semua Kelas"]', "1");
    await select("#attendance-report-mapel", "2");
    await select("#attendance-report-status", "below_90");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: "2", attendanceStatus: "below_90" });
    await select("#attendance-report-status", "at_least_90");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: "2", attendanceStatus: "at_least_90" });
    await select("#attendance-report-mapel", "3");
    expect(status.value).toBe("at_least_90");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: "3", attendanceStatus: "at_least_90" });
    await select("#attendance-report-status", "all");
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: "3", attendanceStatus: "all" });
  });

  it("shows and exports missing attendance as neutral while real zero attendance stays 0%", async () => {
    const missing = { ...ani, siswaId: "empty", siswaName: "Tanpa Presensi", nis: "999", hadir: 0, percentage: 0 };
    const zero = { ...ani, siswaId: "zero", siswaName: "Alpa", nis: "888", hadir: 0, alpa: 5, percentage: 0 };
    vi.mocked(reportService.getAttendanceReports).mockResolvedValue([missing, zero]);
    await renderPage();
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveTextContent("Belum ada data");
    expect(rows[0]).not.toHaveTextContent("0%");
    expect(rows[0].querySelector("td:last-child > span")).toHaveClass("bg-bg-sage-slate");
    expect(rows[1]).toHaveTextContent("0%");
    expect(rows[1].querySelector("td:last-child > span")).toHaveClass("text-text-danger");
    await act(async () => { button("Ekspor Excel").click(); });
    expect(exportToExcel).toHaveBeenLastCalledWith([
      expect.objectContaining({ NIS: "999", "Persentase Kehadiran (%)": "Belum ada data" }),
      expect.objectContaining({ NIS: "888", "Persentase Kehadiran (%)": "0%" }),
    ], expect.any(String));
    await search("999");
    await act(async () => { button("Ekspor Excel").click(); });
    expect(exportToExcel).toHaveBeenLastCalledWith([
      expect.objectContaining({ NIS: "999", "Persentase Kehadiran (%)": "Belum ada data" }),
    ], expect.any(String));
  });

  it("shows an empty state for unmatched attendance categories without losing filter options", async () => {
    await renderPage();
    await select("#attendance-report-mapel", "2");
    vi.mocked(reportService.getAttendanceReports).mockResolvedValueOnce([]);
    await select("#attendance-report-status", "below_90");
    expect(container).toHaveTextContent("Tidak ada data kehadiran yang sesuai dengan filter atau pencarian.");
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(element<HTMLSelectElement>("#attendance-report-mapel").value).toBe("2");
    expect(element<HTMLSelectElement>("#attendance-report-status").value).toBe("below_90");
    expect(element("#attendance-report-mapel")).toHaveTextContent("Fisika");
    await act(async () => { button("Ekspor Excel").click(); });
    expect(exportToExcel).not.toHaveBeenCalled();
  });

  it("blocks old exports and ignores a stale category response", async () => {
    await renderPage();
    const older = deferred<StudentAttendanceSummary[]>();
    vi.mocked(reportService.getAttendanceReports).mockReturnValueOnce(older.promise).mockResolvedValueOnce([ani]);
    await select("#attendance-report-status", "below_90");
    expect(button("Ekspor Excel")).toBeDisabled();
    expect(container.querySelector("table")).toBeNull();
    await select("#attendance-report-status", "at_least_90");
    await act(async () => { older.resolve([budi]); });
    expect(element("tbody")).toHaveTextContent("Ani");
    expect(element("tbody")).not.toHaveTextContent("Budi");
    expect(element<HTMLSelectElement>("#attendance-report-status").value).toBe("at_least_90");
  });

  it("retries a failed category request with the same class and subject", async () => {
    await renderPage();
    await select('select[aria-label="Semua Kelas"]', "1");
    await select("#attendance-report-mapel", "2");
    vi.mocked(reportService.getAttendanceReports).mockRejectedValueOnce(new Error("Filter kehadiran gagal"));
    await select("#attendance-report-status", "below_90");
    expect(element('[role="alert"]')).toHaveTextContent("Filter kehadiran gagal");
    expect(button("Ekspor Excel")).toBeDisabled();
    await act(async () => { button("Coba Lagi").click(); });
    expect(reportService.getAttendanceReports).toHaveBeenLastCalledWith("1", { mapelId: "2", attendanceStatus: "below_90" });
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });
});
