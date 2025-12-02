import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

export const runtime = "nodejs"; // penting untuk file FormData

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File tidak ada" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  let success = 0;
  let invalid = 0;
  let failed: any[] = [];

  for (const r of rows) {
    // Same validation as POST
    const res = validateRowServer(r);
    if (res.errors.length) {
      invalid++;
      failed.push({ row: r, errors: res.errors });
      continue;
    }

    try {
      await prisma.warga.upsert({
        where: { nik: res.normalized.nik },
        update: res.normalized,
        create: res.normalized,
      });
      success++;
    } catch (e) {
      failed.push({ row: r, error: (e as Error).message });
    }
  }

  return NextResponse.json({
    fileName: file.name,
    total: rows.length,
    success,
    invalid,
    failed,
  });
}

/******** Reuse validator ********/
function validateRowServer(row: any) {
  const PENDAPATAN_OPTIONS = [
    "<500.000-1.000.000",
    ">=1.000.000-2000.000",
    ">=2.000.000",
  ];
  const KONDISI_RUMAH_OPTIONS = ["kurang layak", "cukup layak", "layak"];
  const PEKERJAAN_OPTIONS = ["pengangguran", "swasta", "pns", "polri/tni"];
  const JUMLAH_UTANG_OPTIONS = ["tidak ada", "<500.000", ">1000.000", ">=2000.000"];

  const errors: string[] = [];

  const nik = String(row.nik ?? "").trim();
  const pendapatan = String(row.pendapatan_bulanan);
  const utang = String(row.jumlah_utang);
  const pekerjaan = String(row.status_pekerjaan);
  const kondisi = String(row.kondisi_rumah);

  if (!/^\d{16}$/.test(nik)) errors.push("NIK harus 16 digit");
  if (!PENDAPATAN_OPTIONS.includes(pendapatan)) errors.push("Pendapatan tidak valid");
  if (!PEKERJAAN_OPTIONS.includes(pekerjaan)) errors.push("Pekerjaan tidak valid");
  if (!KONDISI_RUMAH_OPTIONS.includes(kondisi)) errors.push("Kondisi rumah tidak valid");
  if (!JUMLAH_UTANG_OPTIONS.includes(utang)) errors.push("Utang tidak valid");

  const normalized = {
    nik,
    nama: row.nama ?? "",
    alamat: row.alamat ?? "",
    kecamatan: row.kecamatan ?? "",
    pendapatan_bulanan: pendapatan,
    jumlah_tanggungan: Number(row.jumlah_tanggungan ?? 0),
    aset: row.aset ?? "",
    status_pekerjaan: pekerjaan,
    kondisi_rumah: kondisi,
    jumlah_utang: utang,
    pengeluaran_wajib: Number(row.pengeluaran_wajib ?? 0),
    tanggal_input: row.tanggal_input ?? new Date().toISOString(),
  };

  return { errors, normalized };
}
