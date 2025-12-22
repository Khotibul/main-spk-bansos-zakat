/*
  Warnings:

  - The `status_validasi` column on the `Penilaian` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StatusValidasi" AS ENUM ('BELUM_DIAJUKAN', 'MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- AlterTable
ALTER TABLE "Penilaian" DROP COLUMN "status_validasi",
ADD COLUMN     "status_validasi" "StatusValidasi" NOT NULL DEFAULT 'BELUM_DIAJUKAN';

-- CreateTable
CREATE TABLE "ValidasiLog" (
    "id" SERIAL NOT NULL,
    "id_penilaian" INTEGER NOT NULL,
    "keputusan" "StatusValidasi" NOT NULL,
    "catatan" TEXT,
    "validated_by" TEXT NOT NULL,
    "validated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ValidasiLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ValidasiLog" ADD CONSTRAINT "ValidasiLog_id_penilaian_fkey" FOREIGN KEY ("id_penilaian") REFERENCES "Penilaian"("id_penilaian") ON DELETE CASCADE ON UPDATE CASCADE;
