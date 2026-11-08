import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataTable, type ColumnDef, type DataTableProps } from "@/components/shared/DataTable";

interface Row { id: string; name: string; percentage: number; kelas: string }
const rows: Row[] = [
  { id: "b", name: "Budi", percentage: 80, kelas: "X-A" },
  { id: "a", name: "Ani", percentage: 100, kelas: "X-A" },
];
const columns: ColumnDef<Row>[] = [
  { header: "Nama", accessorKey: "name", sortKey: "name" },
  { header: "Persentase", accessorKey: "percentage", sortKey: "percentage" },
  { header: "Kelas", accessorKey: "kelas" },
];

describe("DataTable optional controlled sorting", () => {
  let root: Root;
  let container: HTMLDivElement;

  async function renderTable(props: Partial<DataTableProps<Row>> = {}) {
    await act(async () => {
      root.render(<DataTable columns={columns} data={rows} keyExtractor={(row) => row.id} {...props} />);
    });
  }

  function button(label: string) {
    const node = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
    if (!node) throw new Error(`Missing button: ${label}`);
    return node;
  }

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => { root.unmount(); });
    container.remove();
    vi.unstubAllGlobals();
  });

  it("keeps ordinary tables and their supplied row order unchanged", async () => {
    await renderTable({ columns: [{ header: "Nama", accessorKey: "name" }] });
    expect(container.querySelector("thead")).toHaveTextContent("Nama");
    expect(container.querySelector("thead button")).toBeNull();
    expect(container.querySelector("th[aria-sort]")).toBeNull();
    expect([...container.querySelectorAll("tbody tr")].map((row) => row.textContent)).toEqual(["Budi", "Ani"]);
  });

  it("does not enable sorting when a callback is absent", async () => {
    await renderTable({ sortBy: "name", sortOrder: "asc" });
    expect(container.querySelector("thead button")).toBeNull();
    expect(container.querySelector("th[aria-sort]")).toBeNull();
  });

  it("emits keys and follows parent-controlled direction and icon changes", async () => {
    const onSortChange = vi.fn();
    await renderTable({ sortBy: "name", sortOrder: "asc", onSortChange });
    expect(button("Nama").closest("th")).toHaveAttribute("aria-sort", "ascending");
    expect(button("Nama").querySelector("svg.lucide-arrow-up")).not.toBeNull();
    expect(button("Persentase").closest("th")).toHaveAttribute("aria-sort", "none");
    await act(async () => { button("Nama").click(); });
    expect(onSortChange).toHaveBeenLastCalledWith("name");
    expect(button("Nama").closest("th")).toHaveAttribute("aria-sort", "ascending");
    await renderTable({ sortBy: "name", sortOrder: "desc", onSortChange });
    expect(button("Nama").closest("th")).toHaveAttribute("aria-sort", "descending");
    expect(button("Nama").querySelector("svg.lucide-arrow-down")).not.toBeNull();
    await act(async () => { button("Persentase").click(); });
    expect(onSortChange).toHaveBeenLastCalledWith("percentage");
    await renderTable({ sortBy: "percentage", sortOrder: "asc", onSortChange });
    expect(button("Persentase").closest("th")).toHaveAttribute("aria-sort", "ascending");
    expect(button("Nama").closest("th")).toHaveAttribute("aria-sort", "none");
  });

  it("uses focusable native buttons and leaves unsortable headers plain", async () => {
    await renderTable({ sortBy: "percentage", onSortChange: vi.fn() });
    const sortButton = button("Persentase");
    expect(sortButton.type).toBe("button");
    expect(sortButton.tabIndex).toBe(0);
    sortButton.focus();
    expect(document.activeElement).toBe(sortButton);
    expect(sortButton.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const ordinaryHeader = [...container.querySelectorAll("th")].find((header) => header.textContent === "Kelas");
    expect(ordinaryHeader?.querySelector("button")).toBeNull();
    expect(ordinaryHeader).not.toHaveAttribute("aria-sort");
  });

  it("preserves selection and pagination alongside sortable headers", async () => {
    const onSortChange = vi.fn();
    const onSelectAllToggle = vi.fn();
    const onSelectToggle = vi.fn();
    await renderTable({
      sortBy: "name", onSortChange, selectable: true,
      onSelectAllToggle, onSelectToggle, paginate: true, pageSize: 1,
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[aria-label="Pilih semua baris"]')!.click();
      container.querySelector<HTMLButtonElement>('button[aria-label="Pilih baris 1"]')!.click();
      button("Nama").click();
    });
    expect(onSelectAllToggle).toHaveBeenCalledTimes(1);
    expect(onSelectToggle).toHaveBeenCalledWith(0);
    expect(onSortChange).toHaveBeenCalledWith("name");
    expect(container.querySelector("tbody")).toHaveTextContent("Budi");
    await act(async () => { button("Selanjutnya").click(); });
    expect(container.querySelector("tbody")).toHaveTextContent("Ani");
    expect(onSortChange).toHaveBeenCalledTimes(1);
  });
});
