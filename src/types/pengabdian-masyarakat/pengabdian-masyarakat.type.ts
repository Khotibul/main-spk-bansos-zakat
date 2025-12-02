import type { Dosen, DosenPelakuPengmas, Mahasiswa, MahasiswaPelakuPengmas } from '@prisma/client';
import type { InputJsonValue } from '@prisma/client/runtime/library';

export type PengmasPayload = {
  id: string;
  judul: string;
  lokasi: string;
  tgl_mulai: string;
  tgl_selesai: string;
  anggaran: number;
  luaran_filenames: string[];
  proposal_filename: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  dosen: (DosenPelakuPengmas & { dosen: Dosen })[];
  mahasiswa: (MahasiswaPelakuPengmas & { mahasiswa: Mahasiswa })[];
};

export type PengmasForm = {
  id?: string;
  judul: string;
  lokasi: string;
  tgl_mulai: string;
  tgl_selesai: string;
  anggaran: number;
  luaran_filenames?: string[];
  proposal_filename?: string | null;
  dosen: DosenPelakuPengmas[];
  mahasiswa: MahasiswaPelakuPengmas[];
};

export type PengabdianMasyarakatPayload = {
  id?: string;
  judul: string;
  nidn_ketua: string;
  ketua: Dosen;
  dosen_anggota: Dosen[];
  mahasiswa: Mahasiswa[];
  lokasi: string;
  tgl_mulai: string;
  tgl_selesai: string;
  anggaran: number;
  luaran_filenames: string[];
  proposal_filename: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type PostPengabdianMasyarakat = {
  id?: string;
  judul: string;
  nidn_ketua: string;
  dosen_anggota: InputJsonValue[];
  mahasiswa: InputJsonValue[];
  lokasi: string;
  tgl_mulai: string;
  tgl_selesai: string;
  anggaran: number;
  luaran_filenames: string[];
  proposal_filename?: string;
};
