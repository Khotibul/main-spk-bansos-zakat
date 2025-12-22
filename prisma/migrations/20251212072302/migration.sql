-- AlterTable
ALTER TABLE "Penilaian" ADD COLUMN     "skor_daya_listrik" DECIMAL(65,30),
ADD COLUMN     "skor_kendaraan" DECIMAL(65,30),
ADD COLUMN     "skor_kondisi_kesehatan" DECIMAL(65,30),
ADD COLUMN     "skor_luas_rumah" DECIMAL(65,30),
ADD COLUMN     "skor_pendidikan" DECIMAL(65,30),
ADD COLUMN     "skor_perlindungan" DECIMAL(65,30),
ADD COLUMN     "skor_status_pekerjaan" DECIMAL(65,30),
ADD COLUMN     "skor_usia" DECIMAL(65,30),
ADD COLUMN     "skor_utang" DECIMAL(65,30);
