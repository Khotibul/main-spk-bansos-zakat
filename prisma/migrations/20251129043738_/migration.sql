-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'PERANGKAT_DESA', 'KEPALA_DESA');

-- CreateTable
CREATE TABLE "Warga" (
    "id_warga" SERIAL NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT,
    "kecamatan" TEXT,
    "kabupaten" TEXT,
    "pendapatan_bulanan" TEXT,
    "jumlah_tanggungan" INTEGER,
    "aset" JSONB,
    "status_pekerjaan" TEXT,
    "kondisi_rumah" TEXT,
    "jumlah_utang" TEXT,
    "pengeluaran_wajib" INTEGER,
    "tanggal_input" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warga_pkey" PRIMARY KEY ("id_warga")
);

-- CreateTable
CREATE TABLE "Umrs" (
    "id_umr" SERIAL NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "nilai_umr" DECIMAL(65,30) NOT NULL,
    "tanggal_berlaku" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Umrs_pkey" PRIMARY KEY ("id_umr")
);

-- CreateTable
CREATE TABLE "Penilaian" (
    "id_penilaian" SERIAL NOT NULL,
    "id_warga" INTEGER NOT NULL,
    "skor_pendapatan" DECIMAL(65,30) NOT NULL,
    "skor_aset" DECIMAL(65,30) NOT NULL,
    "skor_rumah" DECIMAL(65,30) NOT NULL,
    "skor_tanggungan" DECIMAL(65,30) NOT NULL,
    "skor_total" DECIMAL(65,30) NOT NULL,
    "kategori_asnaf" TEXT,
    "rekomendasi_bantuan" TEXT,
    "tanggal_penilaian" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_layak" TEXT,

    CONSTRAINT "Penilaian_pkey" PRIMARY KEY ("id_penilaian")
);

-- CreateTable
CREATE TABLE "AhpWeights" (
    "id" SERIAL NOT NULL,
    "kriteria" TEXT NOT NULL,
    "bobot" DECIMAL(65,30) NOT NULL,
    "tanggal_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AhpWeights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warga_nik_key" ON "Warga"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Penilaian" ADD CONSTRAINT "Penilaian_id_warga_fkey" FOREIGN KEY ("id_warga") REFERENCES "Warga"("id_warga") ON DELETE CASCADE ON UPDATE CASCADE;
