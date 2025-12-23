import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/* ==========================================
   Options (HARUS sama dengan nilai dropdown)
========================================== */
const PENDAPATAN_OPTIONS = [
  "<500.000-1.000.000",
  ">1.000.000",
  ">2.000.000",
  ">3.000.000",
  ">4.000.000",
];

const KONDISI_RUMAH_OPTIONS = ["Kurang Layak", "Cukup Layak", "Layak"];

const PEKERJAAN_OPTIONS = ["Tidak Bekerja", "Swasta", "PNS", "Polri/TNI"];

const JUMLAH_UTANG_OPTIONS = [
  "Tidak Punya",
  "<500.000",
  ">1.000.000",
  ">2.000.000",

];

/* ==== Tambahan Dropdown Baru ==== */
const PERLINDUNGAN_KESEHATAN_OPTIONS = [
  "Tidak ada",
  "BPJS kelas 3",
  "BPJS kelas 2",
  "BPJS kelas 1",
  "Asuransi Swasta",
];

const KONDISI_KESEHATAN_OPTIONS = [
  "Lumpuh",
  "Kelainan/difable",
  "Tuna netra/rungu/wicara",
  "Riwayat penyakit",
  "Sehat",
];

const PENDIDIKAN_OPTIONS = ["SD", "SMP", "SMA", "D1-S1", "S2-S3"];

const KENDARAAN_OPTIONS = [
  "Tidak punya",
  "Sepeda",
  "Motor",
  "Motor lebih 1",
  "Mobil",
];

const DAYA_LISTRIK_OPTIONS = [
  "450 va",
  "900 va",
  "1300 va",
  "2200 va",
  "3500 va",
];

/* ================================
   Helper: Normalize + Validate row
================================ */
function serverValidate(row: any) {
  const errors: string[] = [];

  const nik = String(row.nik ?? "").trim();
  const nama = String(row.nama ?? "").trim();
  const nama_ibu = String(row.nama_ibu ?? "").trim();
  const usia = Number(row.usia);

  const pendapatan_bulanan = String(row.pendapatan_bulanan ?? "");
  const jumlah_tanggungan = Number(row.jumlah_tanggungan);
  const status_pekerjaan = String(row.status_pekerjaan ?? "");
  const kondisi_rumah = String(row.kondisi_rumah ?? "");
  const jumlah_utang = String(row.jumlah_utang ?? "");
  const pengeluaran_wajib = Number(row.pengeluaran_wajib);

  const perlindungan_kesehatan = String(row.perlindungan_kesehatan ?? "");
  const kondisi_kesehatan = String(row.kondisi_kesehatan ?? "");
  const pendidikan = String(row.pendidikan ?? "");
  const kendaraan = String(row.kendaraan ?? "");
  const daya_listrik = String(row.daya_listrik ?? "");
  const luas_rumah = Number(row.luas_rumah);

  const tanggal_input = row.tanggal_input
    ? new Date(row.tanggal_input)
    : new Date();

  // ======== VALIDATION ==========
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

  if (!PERLINDUNGAN_KESEHATAN_OPTIONS.includes(perlindungan_kesehatan))
    errors.push("Perlindungan kesehatan tidak valid");

  if (!KONDISI_KESEHATAN_OPTIONS.includes(kondisi_kesehatan))
    errors.push("Kondisi kesehatan tidak valid");

  if (!PENDIDIKAN_OPTIONS.includes(pendidikan))
    errors.push("Pendidikan tidak valid");

  if (!KENDARAAN_OPTIONS.includes(kendaraan))
    errors.push("Kendaraan tidak valid");

  if (!DAYA_LISTRIK_OPTIONS.includes(daya_listrik))
    errors.push("Daya listrik tidak valid");

  if (isNaN(usia)) errors.push("Usia harus angka");
  if (isNaN(luas_rumah)) errors.push("Luas rumah harus angka");

  // ======== NORMALIZED ROW ========
  const normalized = {
    nik,
    nama,
    nama_ibu,
    usia,
    alamat: row.alamat ?? "",
    kecamatan: row.kecamatan ?? "",
    kabupaten: row.kabupaten ?? "",

    pendapatan_bulanan,
    jumlah_tanggungan,
    aset: row.aset ?? null,

    status_pekerjaan,
    kondisi_rumah,
    jumlah_utang,
    pengeluaran_wajib,

    perlindungan_kesehatan,
    kondisi_kesehatan,
    pendidikan,
    kendaraan,
    daya_listrik,
    luas_rumah,

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
    console.error("API /warga error:", err);

    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}

/* =======================
   POST — Create/Update
======================= */
// Contoh di file /api/warga/route.ts
// Di file /api/warga/route.ts, ganti fungsi POST Anda dengan ini

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("API: Menerima body:", body); // DEBUG: Log data yang diterima

    const { errors, normalized } = serverValidate(body);
    console.log("API: Hasil validasi:", { errors, normalized }); // DEBUG: Log hasil validasi

    if (errors.length > 0) {
      console.log("API: Validasi gagal, mengembalikan error 400");
      return NextResponse.json(
        { message: "Validasi gagal", errors },
        { status: 400 }
      );
    }

    console.log("API: Mencoba menyimpan/update data ke database...");
    const warga = await prisma.warga.upsert({
      where: { nik: normalized.nik },
      update: { ...normalized },
      create: { ...normalized },
    });
    console.log("API: Berhasil menyimpan data. Result:", warga);

    return NextResponse.json(
      { message: "Data warga berhasil disimpan.", data: warga },
      { status: 201 }
    );

  } catch (error: any) {
    // Log error lengkap ke console server
    console.error("API: TERJADI ERROR DI POST /api/warga:", error);

    // Tangani error spesifik dari Prisma (misal: NIK duplikat)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Data dengan NIK ini sudah ada." },
        { status: 409 } // 409 Conflict
      );
    }

    // Tangani error jika request body bukan JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Request body tidak valid (bukan format JSON)." },
        { status: 400 }
      );
    }

    // Kembalikan error detail untuk debugging
    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
        detail: error.message,
        stack: error.stack, // Tambahkan stack trace untuk melihat lokasi error
      },
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
