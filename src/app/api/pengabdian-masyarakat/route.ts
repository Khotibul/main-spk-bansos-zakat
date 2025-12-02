import prisma from '@/lib/prisma';
import type {
  PengmasForm,
  PostPengabdianMasyarakat
} from '@/types/pengabdian-masyarakat';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const result = await prisma.pengabdianMasyarakat.findMany({
    where: { deleted_at: null },
    include: {
      dosen: { include: { dosen: true } },
      mahasiswa: { include: { mahasiswa: true } }
    },
    orderBy: { updated_at: 'desc' }
  });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const data = (await request.json()) as PengmasForm;
  // const contohQuery = await prisma.$queryRaw('SEL')
  const result = await prisma.pengabdianMasyarakat.upsert({
    where: { id: data.id, judul: data.judul },
    create: {
      judul: data.judul,
      anggaran: parseFloat(data.anggaran),
      lokasi: data.lokasi,
      tgl_mulai: new Date(data.tgl_mulai),
      tgl_selesai: new Date(data.tgl_selesai),
      dosen: {
        createMany: {
          data: data.dosen.map((dsn) => ({
            nidn: dsn.nidn,
            isKetua: dsn.isKetua
          }))
        }
      },
      mahasiswa: {
        createMany: {
          data: data.mahasiswa.map((mhs) => ({
            npm: mhs.npm
          }))
        }
      }
    },
    update: {
      judul: data.judul,
      anggaran: parseFloat(data.anggaran),
      lokasi: data.lokasi,
      tgl_mulai: new Date(data.tgl_mulai),
      tgl_selesai: new Date(data.tgl_selesai),
      dosen: {
        createMany: {
          data: data.dosen.map((dsn) => ({
            nidn: dsn.nidn,
            isKetua: dsn.isKetua
          }))
        }
      },
      mahasiswa: {
        createMany: {
          data: data.mahasiswa.map((mhs) => ({
            npm: mhs.npm
          }))
        }
      }
    }
  });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const data = (await request.json()) as PostPengabdianMasyarakat;
  const { id } = data;
  const result = await prisma.pengabdianMasyarakat.update({
    where: { id },
    data: { deleted_at: new Date().toISOString() }
  });
  return NextResponse.json(result);
}
