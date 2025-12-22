import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/* ============================================================
 * PATCH – VALIDASI PENILAIAN
 * Status: DISETUJUI | DITOLAK
 * ============================================================ */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id_penilaian,
      keputusan,        // DISETUJUI | DITOLAK
      catatan,
      validated_by      // username / email validator
    } = body;

    // ================= VALIDASI INPUT =================
    if (!id_penilaian || !keputusan || !validated_by) {
      return NextResponse.json(
        { error: "id_penilaian, keputusan, dan validated_by wajib diisi" },
        { status: 400 }
      );
    }

    if (!["DISETUJUI", "DITOLAK"].includes(keputusan)) {
      return NextResponse.json(
        { error: "keputusan harus DISETUJUI atau DITOLAK" },
        { status: 400 }
      );
    }

    // ================= TRANSAKSI =================
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update status_validasi di Penilaian
      const penilaian = await tx.penilaian.update({
        where: {
          id_penilaian: Number(id_penilaian),
        },
        data: {
          status_validasi: keputusan,
        },
      });

      // 2. Simpan log validasi
      const log = await tx.validasiLog.create({
        data: {
          id_penilaian: Number(id_penilaian),
          keputusan,
          catatan: catatan ?? null,
          validated_by,
        },
      });

      return { penilaian, log };
    });

    return NextResponse.json({
      message: `Penilaian berhasil ${keputusan}`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
