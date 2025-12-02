import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

// ========================
// GET: Semua penilaian
// ========================
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

// ========================
// POST: Create / Update
// ========================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id_penilaian,
      id_warga,
      skor_pendapatan,
      skor_aset,
      skor_rumah,
      skor_tanggungan,
      skor_total,
      kategori_asnaf,
      rekomendasi_bantuan,
      status_layak,
    } = body;

    if (!id_warga) {
      return NextResponse.json(
        { error: "id_warga wajib diisi" },
        { status: 400 }
      );
    }

    // UPDATE
    if (id_penilaian) {
      const updated = await prisma.penilaian.update({
        where: { id_penilaian: Number(id_penilaian) },
        data: {
          id_warga,
          skor_pendapatan,
          skor_aset,
          skor_rumah,
          skor_tanggungan,
          skor_total,
          kategori_asnaf,
          rekomendasi_bantuan,
          status_layak,
          tanggal_penilaian: new Date(),
        },
      });

      return NextResponse.json(updated);
    }

    // CREATE
    const created = await prisma.penilaian.create({
      data: {
        id_warga,
        skor_pendapatan,
        skor_aset,
        skor_rumah,
        skor_tanggungan,
        skor_total,
        kategori_asnaf,
        rekomendasi_bantuan,
        status_layak,
        tanggal_penilaian: new Date(),
      },
    });

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ========================
// DELETE
// ========================
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.id_penilaian) {
      return NextResponse.json(
        { error: "id_penilaian wajib diisi" },
        { status: 400 }
      );
    }

    const deleted = await prisma.penilaian.delete({
      where: { id_penilaian: Number(body.id_penilaian) },
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
