"use client";
import * as React from "react";
import { useEffect, useState, createContext, useContext } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { createColumnHelper } from "@tanstack/react-table";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Pen, Trash, Plus, Upload, FileSpreadsheet } from "lucide-react";
import { MainLayout } from "../main-layout/main-layout";

/* ======================
   Constants / Options
   ====================== */
const PENDAPATAN_OPTIONS = [
  "<500.000-1.000.000",
  ">1.000.000-2000.000",
  ">2.000.000",
];

const KONDISI_RUMAH_OPTIONS = ["kurang layak", "cukup layak", "layak"];
const PEKERJAAN_OPTIONS = ["pengangguran", "swasta", "pns", "polri/tni"];
const JUMLAH_UTANG_OPTIONS = ["tidak ada", "<500.000", ">1.000.000", ">=2.000.000"];

/* ======================
   Types
   ====================== */
export type WargaRow = {
  id_warga?: number;
  nik: string;
  nama: string;
  alamat?: string;
  kecamatan?: string;
  pendapatan_bulanan?: string | number;
  jumlah_tanggungan?: number;
  aset?: string;
  status_pekerjaan?: string;
  kondisi_rumah?: string;
  jumlah_utang?: string | number;
  pengeluaran_wajib?: number;
  tanggal_input?: string;
};

type PreviewRow = {
  idx: number; // 0-based sheet row index
  data: WargaRow;
  valid: boolean;
  errors: string[];
};

/* ======================
   Table columns (display)
   ====================== */
const columnHelper = createColumnHelper<WargaRow>();

export const columns = [
  { accessorKey: "nik", header: "NIK" },
  { accessorKey: "nama", header: "Nama" },
  { accessorKey: "alamat", header: "Alamat" },
  { accessorKey: "kecamatan", header: "Kecamatan" },
  { accessorKey: "pendapatan_bulanan", header: "Pendapatan" },
  { accessorKey: "jumlah_tanggungan", header: "Tanggungan" },
  { accessorKey: "aset", header: "Aset" },
  { accessorKey: "status_pekerjaan", header: "Pekerjaan" },
  { accessorKey: "kondisi_rumah", header: "Kondisi Rumah" },
  { accessorKey: "jumlah_utang", header: "Utang" },
  { accessorKey: "pengeluaran_wajib", header: "Pengeluaran Wajib" },
];

/* ======================
   Helper validators
   ====================== */
const isNumeric = (v: any) => {
  if (v === null || v === undefined || v === "") return false;
  return !isNaN(Number(String(v).toString().replace(/[^0-9.-]+/g, "")));
};

function validateRow(row: any): { valid: boolean; errors: string[]; normalized: WargaRow } {
  const errors: string[] = [];

  // Normalization helpers
  const get = (k: string) => {
    if (row[k] !== undefined && row[k] !== null) return row[k];
    const lower = Object.keys(row).find((x) => x.toLowerCase() === k.toLowerCase());
    return lower ? row[lower] : undefined;
  };

  const nik = String(get("nik") ?? "").trim();
  const nama = String(get("nama") ?? "").trim();
  const alamat = get("alamat") ?? null;
  const kecamatan = get("kecamatan") ?? null;
  const pendapatan_bulanan = get("pendapatan_bulanan") ?? get("pendapatan") ?? null;
  const jumlah_tanggungan = get("jumlah_tanggungan") ?? get("tanggungan") ?? null;
  const aset = get("aset") ?? null;
  const status_pekerjaan = get("status_pekerjaan") ?? get("pekerjaan") ?? null;
  const kondisi_rumah = get("kondisi_rumah") ?? get("kondisi") ?? get("rumah") ?? null;
  const jumlah_utang = get("jumlah_utang") ?? get("utang") ?? null;
  const pengeluaran_wajib = get("pengeluaran_wajib") ?? get("pengeluaran") ?? null;
  const tanggal_input = get("tanggal_input") ?? get("tanggal");

  // 1) NIK 16 digit numeric
  if (!/^\d{16}$/.test(nik)) errors.push("NIK harus 16 digit numerik");

  // 2) pendapatan must match options
  if (!PENDAPATAN_OPTIONS.includes(String(pendapatan_bulanan))) {
    errors.push(`Pendapatan harus: ${PENDAPATAN_OPTIONS.join(" | ")}`);
  }

  // 3) jumlah_tanggungan numeric
  if (!isNumeric(jumlah_tanggungan)) errors.push("Jumlah tanggungan harus angka");

  // 4) kondisi rumah dropdown
  if (!KONDISI_RUMAH_OPTIONS.includes(String(kondisi_rumah))) {
    errors.push(`Kondisi rumah harus: ${KONDISI_RUMAH_OPTIONS.join(" | ")}`);
  }

  // 5) status pekerjaan
  if (!PEKERJAAN_OPTIONS.includes(String(status_pekerjaan))) {
    errors.push(`Status pekerjaan harus: ${PEKERJAAN_OPTIONS.join(" | ")}`);
  }

  // 6) jumlah utang options
  if (!JUMLAH_UTANG_OPTIONS.includes(String(jumlah_utang))) {
    errors.push(`Jumlah utang harus: ${JUMLAH_UTANG_OPTIONS.join(" | ")}`);
  }

  // 7) pengeluaran wajib numeric
  if (!isNumeric(pengeluaran_wajib)) errors.push("Pengeluaran wajib harus angka");

  const normalized: WargaRow = {
    nik,
    nama,
    alamat: alamat ?? "",
    kecamatan: kecamatan ?? "",
    pendapatan_bulanan: String(pendapatan_bulanan),
    jumlah_tanggungan: Number(String(jumlah_tanggungan).replace(/[^0-9.-]+/g, "")) || 0,
    aset: aset ? String(aset) : "",
    status_pekerjaan: String(status_pekerjaan),
    kondisi_rumah: String(kondisi_rumah),
    jumlah_utang: String(jumlah_utang),
    pengeluaran_wajib: Number(String(pengeluaran_wajib).replace(/[^0-9.-]+/g, "")) || 0,
    tanggal_input: tanggal_input ? String(tanggal_input) : new Date().toISOString(),
  };

  return { valid: errors.length === 0, errors, normalized };
}

/* ======================
   Component
   ====================== */
export default function WargaPage() {
  const { register, setValue, reset, handleSubmit } = useForm<WargaRow>();
  const [data, setData] = useState<WargaRow[]>([]);
  const [action, setAction] = useState<"Create" | undefined>(undefined);
  const [posting, setPosting] = useState(false);

  // upload preview state
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [bulkReport, setBulkReport] = useState<any | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // fetch warga
  async function fetchWarga() {
    const res = await fetch("/api/warga");
    const json = await res.json().catch(() => []);
    setData(json);
  }

  useEffect(() => {
    fetchWarga();
  }, []);

  // single form submit (create/upsert)
  async function submit(form: WargaRow) {
    setPosting(true);

    // validate basic NIK length before sending
    if (!/^\d{16}$/.test(String(form.nik))) {
      alert("NIK harus 16 digit angka");
      setPosting(false);
      return;
    }

    // normalize some fields
    const payload = {
      ...form,
      pendapatan_bulanan: String(form.pendapatan_bulanan),
      jumlah_utang: String(form.jumlah_utang),
    };

    await fetch("/api/warga", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    await fetchWarga();
    reset();
    setAction(undefined);
    setPosting(false);
  }

  /* ======================
     File: parse & validate preview
     ====================== */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreviewRows([]);
    setBulkReport(null);

    if (!f) return;

    const dataBuf = await f.arrayBuffer();
    const workbook = XLSX.read(dataBuf, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    const preview: PreviewRow[] = rawRows.map((r, idx) => {
      const { valid, errors, normalized } = validateRow(r);
      return { idx, data: normalized, valid, errors };
    });

    setPreviewRows(preview);
  };

  /* ======================
     Download template
     ====================== */
  const downloadTemplate = () => {
    const templateRow = {
      nik: "3274011201010001", // example 16 digits
      nama: "Nama Lengkap",
      alamat: "Alamat jalan ...",
      kecamatan: "Contoh Kecamatan",
      pendapatan_bulanan: "<500.000-1.000.000", // must be one of options
      jumlah_tanggungan: 2,
      aset: "Tanah Pribadi",
      status_pekerjaan: "swasta",
      kondisi_rumah: "cukup layak",
      jumlah_utang: "tidak ada",
      pengeluaran_wajib: 300000,
      tanggal_input: new Date().toISOString().slice(0, 10),
    };

    const ws = XLSX.utils.json_to_sheet([templateRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TemplateWarga");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "template_warga.xlsx");
  };

  /* ======================
     Import to server (send original file)
     - server endpoint: /api/warga/import (expects FormData file)
     ====================== */
  const importFileToServer = async () => {
    if (!file) return alert("Pilih file terlebih dahulu");
    // warn user if there are invalid rows
    const invalidCount = previewRows.filter((r) => !r.valid).length;
    if (invalidCount > 0) {
      if (!confirm(`${invalidCount} baris tidak valid. Tetap upload file utuh ke server untuk validasi server-side?`)) {
        return;
      }
    }

    setImporting(true);
    setBulkReport(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/warga/import", {
      method: "POST",
      body: fd,
    });

    const json = await res.json().catch(() => ({ error: "Invalid response" }));
    setBulkReport(json);
    setImporting(false);
    fetchWarga();
  };

  /* ======================
     Import only valid rows by sending JSON -> /api/warga/bulk (if you have)
     If your server does not have /api/warga/bulk, this button can be ignored.
     We'll still implement optional POST to /api/warga/bulk
     ====================== */
  const importValidRowsJson = async () => {
    const validRows = previewRows.filter((r) => r.valid).map((r) => r.data);
    if (validRows.length === 0) return alert("Tidak ada baris valid untuk diimport");

    setImporting(true);
    const res = await fetch("/api/warga/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: validRows }),
    });

    const json = await res.json().catch(() => ({ error: "Invalid response" }));
    setBulkReport(json);
    setImporting(false);
    fetchWarga();
  };

  /* ======================
     Delete helper (single)
     ====================== */
  const deleteWarga = async (nik: string) => {
    if (!confirm("Hapus warga ini?")) return;
    await fetch("/api/warga", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nik }),
    });
    fetchWarga();
  };

  /* ======================
     Render
     ====================== */
  return (
    <MainLayout>
      <div className="flex justify-between items-center py-4 gap-4">
        <Input placeholder="Cari nama..." className="max-w-sm" />

        <div className="flex items-center gap-2">
          {/* Upload */}
          <label className="cursor-pointer">
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            <Button variant="secondary" title="Upload Excel">
              <Upload className="mr-2" /> Upload Excel
            </Button>
          </label>

          {/* Download Template */}
          <Button onClick={downloadTemplate} variant="outline" title="Download Template Excel">
            <FileSpreadsheet className="mr-2" /> Template Excel
          </Button>

          {/* Tambah */}
          <Button onClick={() => setAction("Create")}>
            <Plus className="mr-1" /> Tambah Warga
          </Button>
        </div>
      </div>

      {/* IMPORT PREVIEW + ACTIONS */}
      {previewRows.length > 0 && (
        <div className="mb-6 rounded-md border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <strong>Preview file:</strong> {file?.name ?? "—"} — Total baris: {previewRows.length}
            </div>
            <div className="flex gap-2">
              <Button onClick={importFileToServer} disabled={importing}>
                {importing ? "Importing..." : "Import File (server-side)"}
              </Button>
              <Button onClick={importValidRowsJson} variant="secondary" disabled={importing}>
                {importing ? "Importing..." : `Import Baris Valid (${previewRows.filter(r=>r.valid).length})`}
              </Button>
              <Button onClick={() => { setFile(null); setPreviewRows([]); setBulkReport(null); }} variant="ghost">
                Reset
              </Button>
            </div>
          </div>

          {/* summary */}
          <div className="mb-3">
            <span className="mr-4">Valid: {previewRows.filter((r) => r.valid).length}</span>
            <span className="mr-4">Invalid: {previewRows.filter((r) => !r.valid).length}</span>
          </div>

          {/* Preview table small */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">NIK</th>
                  <th className="p-2 text-left">Nama</th>
                  <th className="p-2 text-left">Pendapatan</th>
                  <th className="p-2 text-left">Tanggungan</th>
                  <th className="p-2 text-left">Kondisi Rumah</th>
                  <th className="p-2 text-left">Pekerjaan</th>
                  <th className="p-2 text-left">Utang</th>
                  <th className="p-2 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((pr, idx) => (
                  <tr key={pr.idx} className={pr.valid ? "" : "bg-red-50"}>
                    <td className="p-2 align-top">{pr.idx + 2}</td>
                    <td className="p-2 align-top">{pr.data.nik}</td>
                    <td className="p-2 align-top">{pr.data.nama}</td>
                    <td className="p-2 align-top">{String(pr.data.pendapatan_bulanan)}</td>
                    <td className="p-2 align-top">{String(pr.data.jumlah_tanggungan)}</td>
                    <td className="p-2 align-top">{pr.data.kondisi_rumah}</td>
                    <td className="p-2 align-top">{pr.data.status_pekerjaan}</td>
                    <td className="p-2 align-top">{String(pr.data.jumlah_utang)}</td>
                    <td className="p-2 align-top">
                      {pr.valid ? <span className="text-green-600">OK</span> : (
                        <ul className="text-sm text-red-700 list-disc ml-5">
                          {pr.errors.map((e,i)=> <li key={i}>{e}</li>)}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bulkReport && (
            <div className="mt-3">
              <h4 className="font-semibold">Hasil Import (server)</h4>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(bulkReport, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* FORM INPUT (Add single warga) */}
      {action && (
        <form className="mb-6 grid grid-cols-2 gap-3" onSubmit={handleSubmit(submit)}>
          <Input placeholder="NIK (16 digit)" {...register("nik")} required />
          <Input placeholder="Nama" {...register("nama")} required />
          <Input placeholder="Alamat" {...register("alamat")} />
          <Input placeholder="Kecamatan" {...register("kecamatan")} />

          <select {...register("pendapatan_bulanan")} className="border px-2 py-1">
            <option value="">Pilih Pendapatan</option>
            {PENDAPATAN_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
          </select>

          <Input type="number" placeholder="Jumlah Tanggungan" {...register("jumlah_tanggungan", { valueAsNumber: true })} />

          <select {...register("aset")} className="border px-2 py-1">
            <option value="">Pilih Aset</option>
            <option value="Tanah Pribadi">Tanah Pribadi</option>
            <option value="Tanah Sewa">Tanah Sewa</option>
            <option value="Tidak Punya">Tidak Punya</option>
          </select>

          <select {...register("status_pekerjaan")} className="border px-2 py-1">
            <option value="">Pilih Pekerjaan</option>
            {PEKERJAAN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <select {...register("kondisi_rumah")} className="border px-2 py-1">
            <option value="">Pilih Kondisi Rumah</option>
            {KONDISI_RUMAH_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <select {...register("jumlah_utang")} className="border px-2 py-1">
            <option value="">Pilih Jumlah Utang</option>
            {JUMLAH_UTANG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>

          <Input type="number" placeholder="Pengeluaran Wajib" {...register("pengeluaran_wajib", { valueAsNumber: true })} />

          <div className="col-span-2 flex gap-2">
            <Button type="submit" disabled={posting}>{posting ? "Menyimpan..." : "Simpan Warga"}</Button>
            <Button type="button" variant="ghost" onClick={() => { reset(); setAction(undefined); }}>Batal</Button>
          </div>
        </form>
      )}

      {/* DATA TABEL (existing warga) */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={String(col.accessorKey ?? col.accessorKey)}>{String(col.header)}</TableHead>
              ))}
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length ? (
              data.map((row, ri) => (
                <TableRow key={row.nik ?? ri}>
                  <TableCell>{row.nik}</TableCell>
                  <TableCell>{row.nama}</TableCell>
                  <TableCell>{row.alamat}</TableCell>
                  <TableCell>{row.kecamatan}</TableCell>
                  <TableCell>{String(row.pendapatan_bulanan)}</TableCell>
                  <TableCell>{String(row.jumlah_tanggungan)}</TableCell>
                  <TableCell>{row.aset}</TableCell>
                  <TableCell>{row.status_pekerjaan}</TableCell>
                  <TableCell>{row.kondisi_rumah}</TableCell>
                  <TableCell>{String(row.jumlah_utang)}</TableCell>
                  <TableCell>{String(row.pengeluaran_wajib)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => {
                        // populate form to edit
                        setAction("Create");
                        setValue("nik", row.nik);
                        setValue("nama", row.nama);
                        setValue("alamat", row.alamat ?? "");
                        setValue("kecamatan", row.kecamatan ?? "");
                        setValue("pendapatan_bulanan", row.pendapatan_bulanan ?? "");
                        setValue("jumlah_tanggungan", Number(row.jumlah_tanggungan ?? 0));
                        setValue("aset", row.aset ?? "");
                        setValue("status_pekerjaan", row.status_pekerjaan ?? "");
                        setValue("kondisi_rumah", row.kondisi_rumah ?? "");
                        setValue("jumlah_utang", row.jumlah_utang ?? "");
                        setValue("pengeluaran_wajib", Number(row.pengeluaran_wajib ?? 0));
                      }}>
                        <Pen />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteWarga(row.nik)}>
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} className="text-center">No data</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
}
