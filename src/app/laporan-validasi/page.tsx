"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainLayout } from "../main-layout/main-layout";
import { Button } from "@/components/ui/button";

/* ============================================================
 * TYPES
 * ============================================================ */
type Penilaian = {
  id_penilaian: number;
  skor_total: number;
  kategori_asnaf: string;
  rekomendasi_bantuan: string;
  status_layak: string;
  tanggal_penilaian: string;
  warga: {
    nama: string;
    nik: string;
  };
};

/* ============================================================
 * PAGE
 * ============================================================ */
export default function LaporanPenilaianPage() {
  const [data, setData] = useState<Penilaian[]>([]);
  const [loading, setLoading] = useState(true);
  async function ajukanValidasi(id_penilaian: number) {
    const confirm = window.confirm(
      "Ajukan permohonan validasi untuk data ini?"
    );
    if (!confirm) return;

    try {
      const res = await fetch("/api/penilaian/validasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_penilaian }),
      });

      if (!res.ok) throw new Error("Gagal mengajukan validasi");

      alert("Permohonan validasi berhasil dikirim");

      // refresh data
      setLoading(true);
      fetch("/api/penilaian")
        .then((r) => r.json())
        .then(setData)
        .finally(() => setLoading(false));
    } catch (err) {
      alert("Terjadi kesalahan saat mengajukan validasi");
    }
  }

  useEffect(() => {
    fetch("/api/penilaian")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  /* ============================================================
   * STATISTIK
   * ============================================================ */
  const statistik = useMemo(() => {
    const total = data.length;
    const layak = data.filter((d) => d.status_layak === "Layak").length;

    return {
      total,
      layak,
      tidakLayak: total - layak,
      persenLayak: total ? ((layak / total) * 100).toFixed(2) : "0",
    };
  }, [data]);

  /* ============================================================
   * UI
   * ============================================================ */
  return (
    <MainLayout>
      <h1 className="text-xl font-bold mb-6">
        Laporan Hasil Penilaian Bantuan
      </h1>

      {/* STATISTIK */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border p-4 rounded">
          <p>Total Data</p>
          <p className="text-2xl font-bold">{statistik.total}</p>
        </div>
        <div className="border p-4 rounded bg-green-50">
          <p>Layak</p>
          <p className="text-2xl font-bold text-green-700">{statistik.layak}</p>
        </div>
        <div className="border p-4 rounded bg-red-50">
          <p>Tidak Layak</p>
          <p className="text-2xl font-bold text-red-700">
            {statistik.tidakLayak}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>NIK</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Rekomendasi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.id_penilaian}>
                <TableCell>{d.id_penilaian}</TableCell>
                <TableCell>{d.warga.nama}</TableCell>
                <TableCell>{d.warga.nik}</TableCell>
                <TableCell>{d.skor_total}</TableCell>
                <TableCell>{d.kategori_asnaf}</TableCell>
                <TableCell>{d.rekomendasi_bantuan}</TableCell>
                <TableCell>
                  <span
                    className={
                      d.status_layak === "Layak"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {d.status_layak}
                  </span>
                </TableCell>
                <TableCell>
                  {new Date(d.tanggal_penilaian).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {d.status_layak === "Layak" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => ajukanValidasi(d.id_penilaian)}
                    >
                      Permohonan Validasi
                    </Button>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
}
