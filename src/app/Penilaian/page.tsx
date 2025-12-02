"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainLayout } from "../main-layout/main-layout";

/** =========================
 * TYPES
 * ========================= */
export type PenilaianPayload = {
  id_penilaian?: number;
  id_warga: number;
  skor_pendapatan: number;
  skor_aset: number;
  skor_rumah: number;
  skor_tanggungan: number;
  skor_total?: number;
  kategori_asnaf?: string;
  rekomendasi_bantuan?: string;
  status_layak?: string;
  tanggal_penilaian?: string;
  warga?: any;
};

export type WargaItem = {
  id_warga: number;
  nik: string;
  nama: string;
  pendapatan_bulanan: number; // harapkan number (tanpa titik ribuan)
  aset: string; // "Tidak Punya" | "Tanah Sewa" | "Tanah Pribadi"
  kondisi_rumah: string; // "Kurang Layak" | "Cukup Layak" | "Layak"
  jumlah_tanggungan: number;
};

/** =========================
 * AHP RULES (dari inputmu)
 * bobot dan konversi skor
 * ========================= */
const bobot = {
  pendapatan: 0.4,
  aset: 0.25,
  rumah: 0.2,
  tanggungan: 0.15,
};

// konversi pendapatan -> skor (sesuai request)
// note: nilai pendapatan_bulanan harus numeric (tanpa pemisah titik)
function skorPendapatanFromNumber(p: string): number {
  if (p = "500.000") return 5;
  if (p = "500.000 < 1.000.000") return 4;
  if (p = "1.000.000 < 2.000.000") return 2;
  // >= 2_000_000
  return 1;
}

function skorAset(a: string): number {

  if (a === "Tidak Punya") return 5;
  if (a === "Kost") return 4;
  if (a === "Tanah Sewa") return 3;
  if (a === "Tanah Pribadi") return 2;
  if (a === "Tanah Perkebunan") return 1;
  // Tanah Pribadi atau lainnya → terbaik
  return 1;
}

function skorRumah(r: string): number {
  if (!r) return 1;
  if (r.toLowerCase() === "kurang layak" || r === "Kurang Layak") return 5;
  if (r.toLowerCase() === "cukup layak" || r === "Cukup Layak") return 3;
  // Layak
  return 1;
}

function skorTanggungan(t: number): number {
  if (!t || isNaN(t)) return 1;
  if (t >= 3) return 5;
  if (t === 2) return 3;
  return 1; // t === 1 or 0
}

function hitungAHP(p: number, a: number, r: number, t: number) {
  // p,a,r,t sudah berupa skor (1..5)
  return (
    p * bobot.pendapatan +
    a * bobot.aset +
    r * bobot.rumah +
    t * bobot.tanggungan
  );
}

/**
 * Karena skor 5 = kondisi terburuk, total AHP lebih besar berarti lebih miskin.
 * Skala total berada di rentang [1 .. 5] karena bobot sum = 1 dan skor masing-masing 1..5
 */
function kategoriByTotal(total: number): string {
  if (total >= 4.0) return "Fakir";
  if (total >= 3.0) return "Miskin";
  if (total >= 2.0) return "Ghorim";
  return "Mampu / Tidak Layak";
}

function rekomendasiByKategori(k: string) {
  if (k === "Fakir") return "Dana Sosial + Sembako + Zakat";
  if (k === "Miskin") return "Sembako Rutin + Zakat";
  if (k === "Ghorim") return "Zakat";
  return "Tidak Direkomendasikan";
}

/** =========================
 * COMPONENT
 * ========================= */
export default function PenilaianPage() {
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<PenilaianPayload>();

  const [data, setData] = useState<PenilaianPayload[]>([]);
  const [wargaList, setWargaList] = useState<WargaItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // fetch penilaian & warga
  async function fetchPenilaian() {
    const res = await fetch("/api/penilaian");
    if (res.ok) {
      setData(await res.json());
    } else {
      setData([]);
    }
  }

  async function fetchWarga() {
    const res = await fetch("/api/warga");
    if (res.ok) {
      const json = await res.json();
      // kalau API mengirim pendapatan format string, coba parse
      const normalized: WargaItem[] = json.map((w: any) => ({
        id_warga: w.id_warga,
        nik: w.nik,
        nama: w.nama,
        pendapatan_bulanan:
          typeof w.pendapatan_bulanan === "number"
            ? w.pendapatan_bulanan
            : Number(String(w.pendapatan_bulanan).replace(/\./g, "").replace(/[^0-9]/g, "")) || 0,
        aset: w.aset ?? "",
        kondisi_rumah: w.kondisi_rumah ?? "",
        jumlah_tanggungan: Number(w.jumlah_tanggungan) || 0,
      }));
      setWargaList(normalized);
    } else {
      setWargaList([]);
    }
  }

  useEffect(() => {
    fetchPenilaian();
    fetchWarga();
  }, []);

  // ketika warga dipilih -> otomatis hitung skor AHP
  const selected = watch("id_warga");
  useEffect(() => {
    if (!selected) return;
    const id = Number(selected);
    const w = wargaList.find((x) => Number(x.id_warga) === id);
    if (!w) return;

    const sp = skorPendapatanFromNumber(String(w.pendapatan_bulanan));
    const sa = skorAset(String(w.aset));
    const sr = skorRumah(String(w.kondisi_rumah));
    const st = skorTanggungan(Number(w.jumlah_tanggungan));

    // isi skor di form (angka)
    setValue("skor_pendapatan", sp);
    setValue("skor_aset", sa);
    setValue("skor_rumah", sr);
    setValue("skor_tanggungan", st);

    const total = hitungAHP(sp, sa, sr, st);
    const totalFix = Number(total.toFixed(3));

    const kat = kategoriByTotal(totalFix);
    const rek = rekomendasiByKategori(kat);
    const layak = kat !== "Mampu" ? "Layak" : "Tidak Layak";

    setValue("skor_total", totalFix);
    setValue("kategori_asnaf", kat);
    setValue("rekomendasi_bantuan", rek);
    setValue("status_layak", layak);
  }, [selected, wargaList, setValue]);

  // submit ke backend (simpan penilaian)
  async function submit(form: PenilaianPayload) {
    // pastikan id_warga ada
    if (!form.id_warga) {
      alert("Pilih warga terlebih dahulu");
      return;
    }

    // pastikan skor_total sudah terisi (kalau tidak, hitung lagi)
    let payload = { ...form };
    if (payload.skor_total === undefined || payload.skor_total === null) {
      // recompute from form values
      const sp = Number(payload.skor_pendapatan) || 0;
      const sa = Number(payload.skor_aset) || 0;
      const sr = Number(payload.skor_rumah) || 0;
      const st = Number(payload.skor_tanggungan) || 0;
      payload.skor_total = Number(hitungAHP(sp, sa, sr, st).toFixed(3));
      payload.kategori_asnaf = kategoriByTotal(payload.skor_total);
      payload.rekomendasi_bantuan = rekomendasiByKategori(payload.kategori_asnaf!);
      payload.status_layak = payload.kategori_asnaf !== "Mampu" ? "Layak" : "Tidak Layak";
    }

    const res = await fetch("/api/penilaian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      alert("Gagal menyimpan penilaian: " + err);
    } else {
      reset();
      setEditingId(null);
      fetchPenilaian();
    }
  }

  function editRow(row: PenilaianPayload) {
    setEditingId(row.id_penilaian ?? null);
    reset(row);
  }

  async function removeRow(id_penilaian: number) {
    const res = await fetch("/api/penilaian", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_penilaian }),
    });
    if (!res.ok) {
      const t = await res.text();
      alert("Gagal hapus: " + t);
    } else {
      fetchPenilaian();
    }
  }

  return (
    <MainLayout>
      <h1 className="text-xl font-bold mb-4">Manajemen Penilaian (AHP Otomatis)</h1>

      {/* FORM */}
      <form className="grid grid-cols-3 gap-3 mb-6" onSubmit={handleSubmit(submit)}>
        <select
          className="border p-2 rounded"
          {...register("id_warga", { valueAsNumber: true })}
          defaultValue=""
        >
          <option value="">Pilih Warga</option>
          {wargaList.map((w) => (
            <option key={w.id_warga} value={w.id_warga}>
              {w.nama} — {w.nik}
            </option>
          ))}
        </select>

        <Input readOnly {...register("skor_pendapatan", { valueAsNumber: true })} placeholder="Skor Pendapatan" />
        <Input readOnly {...register("skor_aset", { valueAsNumber: true })} placeholder="Skor Aset" />
        <Input readOnly {...register("skor_rumah", { valueAsNumber: true })} placeholder="Skor Rumah" />
        <Input readOnly {...register("skor_tanggungan", { valueAsNumber: true })} placeholder="Skor Tanggungan" />

        <Input readOnly {...register("skor_total", { valueAsNumber: true })} placeholder="Total" />
        <Input readOnly {...register("kategori_asnaf")} placeholder="Kategori" />
        <Input readOnly {...register("rekomendasi_bantuan")} placeholder="Rekomendasi" />
        <Input readOnly {...register("status_layak")} placeholder="Status" />

        <Button className="col-span-3" type="submit">
          {editingId ? "Update Penilaian" : "Tambah Penilaian"}
        </Button>
      </form>

      {/* TABLE DATA */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Warga</TableHead>
            <TableHead>Pendapatan</TableHead>
            <TableHead>Aset</TableHead>
            <TableHead>Rumah</TableHead>
            <TableHead>Tanggungan</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Rekom</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id_penilaian}>
              <TableCell>{row.id_penilaian}</TableCell>
              <TableCell>{row.warga?.nama ?? "-"}</TableCell>
              <TableCell>{row.skor_pendapatan}</TableCell>
              <TableCell>{row.skor_aset}</TableCell>
              <TableCell>{row.skor_rumah}</TableCell>
              <TableCell>{row.skor_tanggungan}</TableCell>
              <TableCell>{row.skor_total}</TableCell>
              <TableCell>{row.kategori_asnaf}</TableCell>
              <TableCell>{row.rekomendasi_bantuan}</TableCell>
              <TableCell>{row.status_layak}</TableCell>
              <TableCell>
                <Button onClick={() => editRow(row)}>Edit</Button>
                <Button
                  className="ml-2"
                  variant="destructive"
                  onClick={() => removeRow(row.id_penilaian!)}
                >
                  Hapus
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MainLayout>
  );
}
