import prisma from '@/lib/prisma';
import { NextResponse, type NextRequest } from 'next/server';

// GET: semua bobot AHP
export async function GET(request: NextRequest) {
  const result = await prisma.ahpWeights.findMany({ orderBy: { tanggal_update: 'desc' } });
  return NextResponse.json(result);
}

// POST: upsert by id kalau ada, kalau tidak create
export async function POST(request: NextRequest) {
  const data = await request.json();

  if (data.id) {
    const result = await prisma.ahpWeights.update({
      where: { id: Number(data.id) },
      data: {
        kriteria: data.kriteria,
        bobot: data.bobot,
        tanggal_update: data.tanggal_update ? new Date(data.tanggal_update) : new Date()
      }
    });
    return NextResponse.json(result);
  }

  const result = await prisma.ahpWeights.create({
    data: {
      kriteria: data.kriteria,
      bobot: data.bobot,
      tanggal_update: data.tanggal_update ? new Date(data.tanggal_update) : new Date()
    }
  });
  return NextResponse.json(result);
}

// DELETE: hapus by id
export async function DELETE(request: NextRequest) {
  const data = await request.json();
  const { id } = data;
  const result = await prisma.ahpWeights.delete({ where: { id: Number(id) } });
  return NextResponse.json(result);
}
