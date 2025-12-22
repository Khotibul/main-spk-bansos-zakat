import prisma from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

/* =========================
 * GET
 * ========================= */
export async function GET() {
  const result = await prisma.ahpWeights.findMany({
    orderBy: { tanggal_update: "desc" },
  });
  return NextResponse.json(result);
}

/* =========================
 * POST (CREATE / UPDATE)
 * ========================= */
export async function POST(req: Request) {
  const body = await req.json();

  const result = body.id
    ? await prisma.ahpWeights.update({
        where: { id: Number(body.id) },
        data: {
          kriteria: body.kriteria,
          bobot: Number(body.bobot),
          tanggal_update: new Date(),
        },
      })
    : await prisma.ahpWeights.create({
        data: {
          kriteria: body.kriteria,
          bobot: Number(body.bobot),
          tanggal_update: new Date(),
        },
      });

  return NextResponse.json(result);
}

/* =========================
 * DELETE
 * ========================= */
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const result = await prisma.ahpWeights.delete({
    where: { id: Number(id) },
  });
  return NextResponse.json(result);
}
