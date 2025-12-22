import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

/* ============================================================
 * POST – CEK KELAYAKAN WARGA
 * ============================================================ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nik, nama, nama_ibu } = body;

    if (!nik || !nama || !nama_ibu) {
      return NextResponse.json(
        { error: "NIK, Nama Lengkap, dan Nama Ibu Kandung wajib diisi" },
        { status: 400 }
      );
    }

    /* ================= CARI WARGA ================= */
    const warga = await prisma.warga.findFirst({
      where: {
        nik,
        nama: {
          equals: nama,
          mode: "insensitive",
        },
        nama_ibu: {
          equals: nama_ibu,
          mode: "insensitive",
        },
      },
      include: {
        penilaian: {
          orderBy: {
            tanggal_penilaian: "desc",
          },
          take: 1,
        },
      },
    });

    if (!warga) {
      return NextResponse.json(
        { error: "Data warga tidak ditemukan" },
        { status: 404 }
      );
    }

    const penilaian = warga.penilaian[0];

    if (!penilaian) {
      return NextResponse.json({
        nik: warga.nik,
        nama: warga.nama,
        status: "BELUM DINILAI",
      });
    }

    return NextResponse.json({
      nik: warga.nik,
      nama: warga.nama,
      status_validasi: penilaian.status_validasi,
      skor_total: penilaian.skor_total,
      rekomendasi_bantuan: penilaian.rekomendasi_bantuan,
      kategori_asnaf: penilaian.kategori_asnaf,
      tanggal_penilaian: penilaian.tanggal_penilaian,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
