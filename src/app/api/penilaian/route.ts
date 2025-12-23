import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

/* ============================================================
 * UTIL: MAP FIELD ↔ KRITERIA AHP
 * ============================================================ */
const KRITERIA_MAP: Record<string, string> = {
  skor_pendapatan: "pendapatan",
  skor_aset: "aset",
  skor_rumah: "rumah",
  skor_tanggungan: "tanggungan",
  skor_utang: "utang",

  skor_perlindungan: "perlindungan_kesehatan",
  skor_kondisi_kesehatan: "kondisi_kesehatan",
  skor_pendidikan: "pendidikan",
  skor_kendaraan: "kendaraan",
  skor_daya_listrik: "daya_listrik",
  skor_usia: "usia",
  skor_luas_rumah: "luas_rumah",
  skor_status_pekerjaan: "status_pekerjaan",
};

/* ============================================================
 * HITUNG SKOR TOTAL (AHP DINAMIS)
 * ============================================================ */
async function hitungSkorTotal(body: any) {
  const ahp = await prisma.ahpWeights.findMany();

  let total = new Prisma.Decimal(0);

  for (const field in KRITERIA_MAP) {
    const nilai = body[field];
    if (nilai === undefined || nilai === null) continue;

    const kriteria = KRITERIA_MAP[field];

    const bobot = ahp.find(
      (a) => a.kriteria.toLowerCase() === kriteria
    )?.bobot;

    if (!bobot) continue;

    total = total.plus(
      new Prisma.Decimal(nilai).mul(bobot)
    );
  }

  return total;
}
let cachedBobot: any[] | null = null;

async function getBobot() {
  if (!cachedBobot) {
    cachedBobot = await prisma.ahpWeights.findMany();
  }
  return cachedBobot;
}
const ahp = await getBobot();
/* ============================================================
 * GET
 * ============================================================ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_warga = searchParams.get("id_warga");

    const result = await prisma.penilaian.findMany({
      where: id_warga ? { id_warga: Number(id_warga) } : {},
      include: { warga: true },
      orderBy: { tanggal_penilaian: "desc" },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ============================================================
 * CREATE (POST)
 * ============================================================ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id_warga) {
      return NextResponse.json(
        { error: "id_warga wajib diisi" },
        { status: 400 }
      );
    }

    const skor_total = await hitungSkorTotal(body);

    const created = await prisma.penilaian.create({
      data: {
        id_warga: Number(body.id_warga),

        skor_pendapatan: new Prisma.Decimal(body.skor_pendapatan ?? 0),
        skor_aset: new Prisma.Decimal(body.skor_aset ?? 0),
        skor_rumah: new Prisma.Decimal(body.skor_rumah ?? 0),
        skor_tanggungan: new Prisma.Decimal(body.skor_tanggungan ?? 0),
        skor_utang: new Prisma.Decimal(body.skor_utang ?? 0),

        skor_perlindungan: new Prisma.Decimal(body.skor_perlindungan ?? 0),
        skor_kondisi_kesehatan: new Prisma.Decimal(body.skor_kondisi_kesehatan ?? 0),
        skor_pendidikan: new Prisma.Decimal(body.skor_pendidikan ?? 0),
        skor_kendaraan: new Prisma.Decimal(body.skor_kendaraan ?? 0),
        skor_daya_listrik: new Prisma.Decimal(body.skor_daya_listrik ?? 0),
        skor_usia: new Prisma.Decimal(body.skor_usia ?? 0),
        skor_luas_rumah: new Prisma.Decimal(body.skor_luas_rumah ?? 0),
        skor_status_pekerjaan: new Prisma.Decimal(body.skor_status_pekerjaan ?? 0),

        skor_total,

        kategori_asnaf: body.kategori_asnaf,
        rekomendasi_bantuan: body.rekomendasi_bantuan,
        status_layak: body.status_layak,
        tanggal_penilaian: new Date(body.tanggal_penilaian ?? new Date()),
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ============================================================
 * UPDATE (PUT)
 * ============================================================ */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id_penilaian) {
      return NextResponse.json(
        { error: "id_penilaian wajib diisi" },
        { status: 400 }
      );
    }

    const skor_total = await hitungSkorTotal(body);

    const updated = await prisma.penilaian.update({
      where: { id_penilaian: Number(body.id_penilaian) },
      data: {
        skor_pendapatan: new Prisma.Decimal(body.skor_pendapatan ?? 0),
        skor_aset: new Prisma.Decimal(body.skor_aset ?? 0),
        skor_rumah: new Prisma.Decimal(body.skor_rumah ?? 0),
        skor_tanggungan: new Prisma.Decimal(body.skor_tanggungan ?? 0),
        skor_utang: new Prisma.Decimal(body.skor_utang ?? 0),

        skor_perlindungan: new Prisma.Decimal(body.skor_perlindungan ?? 0),
        skor_kondisi_kesehatan: new Prisma.Decimal(body.skor_kondisi_kesehatan ?? 0),
        skor_pendidikan: new Prisma.Decimal(body.skor_pendidikan ?? 0),
        skor_kendaraan: new Prisma.Decimal(body.skor_kendaraan ?? 0),
        skor_daya_listrik: new Prisma.Decimal(body.skor_daya_listrik ?? 0),
        skor_usia: new Prisma.Decimal(body.skor_usia ?? 0),
        skor_luas_rumah: new Prisma.Decimal(body.skor_luas_rumah ?? 0),
        skor_status_pekerjaan: new Prisma.Decimal(body.skor_status_pekerjaan ?? 0),

        skor_total,

        kategori_asnaf: body.kategori_asnaf,
        rekomendasi_bantuan: body.rekomendasi_bantuan,
        status_layak: body.status_layak,
        tanggal_penilaian: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ============================================================
 * DELETE
 * ============================================================ */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id_penilaian) {
      return NextResponse.json(
        { error: "id_penilaian wajib diisi" },
        { status: 400 }
      );
    }

    await prisma.penilaian.delete({
      where: { id_penilaian: Number(body.id_penilaian) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
