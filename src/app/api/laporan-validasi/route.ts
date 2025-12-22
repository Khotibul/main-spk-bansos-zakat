import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

/* ============================================================
 * GET – LAPORAN PENILAIAN (AGREGASI)
 * ============================================================ */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const status = searchParams.get("status");

    const where: any = {};

    if (start && end) {
      where.tanggal_penilaian = {
        gte: new Date(start),
        lte: new Date(end)
      };
    }

    if (status) {
      where.status_layak = status;
    }

    const result = await prisma.penilaian.findMany({
      where,
      include: {
        warga: true
      },
      orderBy: {
        skor_total: "desc"
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
