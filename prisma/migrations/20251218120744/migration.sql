/*
  Warnings:

  - The `status_validasi` column on the `Penilaian` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Penilaian" DROP COLUMN "status_validasi",
ADD COLUMN     "status_validasi" TEXT NOT NULL DEFAULT 'PENDING';
