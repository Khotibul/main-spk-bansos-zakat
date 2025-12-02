import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/* ==========================================
   Options (HARUS sama dengan nilai dropdown)
========================================== */
const PENDAPATAN_OPTIONS = [
  "<500.000-1.000.000",
  ">1.000.000-2.000.000",
  ">2.000.000",
];

const KONDISI_RUMAH_OPTIONS = ["kurang layak", "cukup layak", "layak"];

const PEKERJAAN_OPTIONS = ["pengangguran", "swasta", "pns", "polri/tni"];

const JUMLAH_UTANG_OPTIONS = [
  "tidak ada",
  "<500.000",
  ">1.000.000",
  ">2.000.000",
];

/* ================================
   Helper: Normalize + Validate row
================================ */
function serverValidate(row: any) {
  const errors: string[] = [];

  const nik = String(row.nik ?? "").trim();
  const nama = String(row.nama ?? "").trim();

  const pendapatan_bulanan = String(row.pendapatan_bulanan ?? "");
  const jumlah_tanggungan = Number(row.jumlah_tanggungan);
  const status_pekerjaan = String(row.status_pekerjaan ?? "");
  const kondisi_rumah = String(row.kondisi_rumah ?? "");
  const jumlah_utang = String(row.jumlah_utang ?? "");
  const pengeluaran_wajib = Number(row.pengeluaran_wajib);
  const tanggal_input = row.tanggal_input
    ? new Date(row.tanggal_input)
    : new Date();

  // ======== VALIDATION ========
  if (!/^\d{16}$/.test(nik)) errors.push("NIK harus 16 digit");
  if (!PENDAPATAN_OPTIONS.includes(pendapatan_bulanan))
    errors.push("Pendapatan tidak valid");
  if (isNaN(jumlah_tanggungan))
    errors.push("Jumlah tanggungan harus angka");
  if (!KONDISI_RUMAH_OPTIONS.includes(kondisi_rumah))
    errors.push("Kondisi rumah tidak valid");
  if (!PEKERJAAN_OPTIONS.includes(status_pekerjaan))
    errors.push("Status pekerjaan tidak valid");
  if (!JUMLAH_UTANG_OPTIONS.includes(jumlah_utang))
    errors.push("Jumlah utang tidak valid");
  if (isNaN(pengeluaran_wajib))
    errors.push("Pengeluaran wajib harus angka");

  // ======== NORMALIZED ROW ========
  const normalized = {
    nik,
    nama,
    alamat: row.alamat ?? "",
    kecamatan: row.kecamatan ?? "",
    kabupaten: row.kabupaten ?? "",
    pendapatan_bulanan,
    jumlah_tanggungan,
    aset: row.aset ?? null, // JSON?
    status_pekerjaan,
    kondisi_rumah,
    jumlah_utang,
    pengeluaran_wajib,
    tanggal_input,
  };

  return { errors, normalized };
}

/* =======================
   GET — Semua warga
======================= */
export async function GET() {
  try {
    const rows = await prisma.warga.findMany({
      orderBy: { tanggal_input: "desc" },
    });

    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { error: "Database error", detail: String(err) },
      { status: 500 }
    );
  }
}

/* =======================
   POST — Create/Update
======================= */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { errors, normalized } = serverValidate(body);
    if (errors.length)
      return NextResponse.json({ errors }, { status: 400 });

    const saved = await prisma.warga.upsert({
      where: { nik: normalized.nik },
      update: normalized,
      create: normalized,
    });

    return NextResponse.json(saved);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menyimpan data", detail: String(err) },
      { status: 500 }
    );
  }
}

/* =======================
   DELETE — by NIK
======================= */
export async function DELETE(request: NextRequest) {
  try {
    const { nik } = await request.json();

    if (!nik)
      return NextResponse.json(
        { error: "NIK wajib" },
        { status: 400 }
      );

    await prisma.warga.delete({ where: { nik } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal menghapus data", detail: String(err) },
      { status: 500 }
    );
  }
}
