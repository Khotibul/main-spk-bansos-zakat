import prisma from '@/lib/prisma';
import { NextResponse, type NextRequest } from 'next/server';

// GET: cari UMR (opsional filter provinsi/kabupaten)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provinsi = searchParams.get('provinsi');
  const kabupaten = searchParams.get('kabupaten');

  const where: any = {};
  if (provinsi) where.provinsi = provinsi;
  if (kabupaten) where.kabupaten = kabupaten;

  const result = await prisma.umrs.findMany({
    where,
    orderBy: { tanggal_berlaku: 'desc' }
  });
  return NextResponse.json(result);
}

// POST: create atau update by id_umr (jika id_umr disertakan)
export async function POST(request: NextRequest) {
  const data = await request.json();

  if (data.id_umr) {
    const result = await prisma.umrs.update({
      where: { id_umr: Number(data.id_umr) },
      data: {
        provinsi: data.provinsi,
        kabupaten: data.kabupaten,
        nilai_umr: data.nilai_umr,
        tanggal_berlaku: data.tanggal_berlaku ? new Date(data.tanggal_berlaku) : undefined
      }
    });
    return NextResponse.json(result);
  }

  const result = await prisma.umrs.create({
    data: {
      provinsi: data.provinsi,
      kabupaten: data.kabupaten,
      nilai_umr: data.nilai_umr,
      tanggal_berlaku: data.tanggal_berlaku ? new Date(data.tanggal_berlaku) : new Date()
    }
  });
  return NextResponse.json(result);
}

// DELETE: hapus by id_umr
export async function DELETE(request: NextRequest) {
  const data = await request.json();
  const { id_umr } = data;
  const result = await prisma.umrs.delete({ where: { id_umr: Number(id_umr) } });
  return NextResponse.json(result);
}
