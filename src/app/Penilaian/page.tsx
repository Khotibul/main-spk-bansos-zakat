"use client";
import React, { useEffect, useMemo, useState } from "react";
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

/* ============================================================
 * TYPES
 * ============================================================ */
function mapBobot(bobotAHP: AHPWeight[]) {
  const map: Record<string, number> = {};

  bobotAHP.forEach((b) => {
    map[b.kriteria.toLowerCase()] = Number(b.bobot);
  });

  return map;
}

export type PenilaianPayload = {
  id_penilaian?: number;
  id_warga: number;

  skor_pendapatan: number;
  skor_aset: number;
  skor_rumah: number;
  skor_tanggungan: number;
  skor_utang?: number;

  // --- SKOR BARU (8 KRITERIA) ---
  skor_perlindungan?: number;
  skor_kondisi_kesehatan?: number;
  skor_pendidikan?: number;
  skor_kendaraan?: number;
  skor_daya_listrik?: number;
  skor_usia?: number;
  skor_luas_rumah?: number;
  skor_status_pekerjaan?: number;

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
  pendapatan_bulanan: number;
  aset: string;
  kondisi_rumah: string;
  jumlah_tanggungan: number;

  perlindungan_kesehatan?: string;
  kondisi_kesehatan?: string;
  pendidikan?: string;
  kendaraan?: string;
  daya_listrik?: number;
  luas_rumah?: number;
  usia?: number;
  status_pekerjaan?: string;
  jumlah_utang?: number;
};

export type AHPWeight = {
  id?: number;
  kriteria: string;
  bobot: number;
};

/* ============================================================
 * UTIL
 * ============================================================ */

function parseRupiah(value?: string | number): number {
  if (value === null || value === undefined) return 0;

  if (typeof value === "number") return value;

  return (
    Number(
      value.replace(/[^0-9]/g, "") // hapus Rp, titik, spasi
    ) || 0
  );
}

function toNumberSafe(v: any): number {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/* ============================================================
 * KONVERSI SKOR
 * ============================================================ */

function skorPendapatanFromString(p?: string): number {
  if (!p) return 1;

  const pendapatan = Number(
    p.replace(/[^0-9]/g, "") // hapus Rp, titik, spasi, simbol
  );

  if (pendapatan <= 1_000_000) return 5;
  if (pendapatan <= 2_000_000) return 4;
  if (pendapatan <= 3_000_000) return 3;
  if (pendapatan <= 4_000_000) return 2;
  return 1;
}

function skorAset(a?: any): number {
  const aset = String(a ?? "").toLowerCase();

  if (aset === "Tidak Punya") return 5;
  if (aset === "Kost") return 4;
  if (aset === "Tanah Sewa") return 3;
  if (aset === "Tanah Pribadi") return 2;
  if (aset.includes("Tanah Perkebunan/Pertanian")) return 1;
  return 1;
}

function skorRumah(r?: string): number {
  const rumah = (r ?? "").toLowerCase();

  return rumah === "kurang layak"
    ? 5
    : rumah === "cukup layak"
    ? 3
    : rumah === "layak"
    ? 2
    : 1;
}
function skorUtangFromString(u?: string): number {
  if (!u) return 1;

  const utang = Number(
    u.replace(/[^0-9]/g, "") // hapus Rp, titik, spasi, simbol
  );

  if (utang >= 10_000_000) return 5;
  if (utang >= 5_000_000) return 4;
  if (utang >= 1_000_000) return 3;
  if (utang > 0) return 2;
  return 1;
}

function skorTanggungan(t?: number): number {
  const x = Number(t ?? 0);

  return x >= 4 ? 5 : x === 3 ? 4 : x === 2 ? 3 : x === 1 ? 2 : 1;
}

/* ============================================================
 * KATEGORI
 * ============================================================ */
function kategoriByTotal(total: number): string {
  if (total >= 4.00) return "Fakir";
  if (total >= 3.50) return "Miskin";
  if (total >= 3.00) return "Ghorim";
  return "Mampu / Tidak Layak";
}

function rekomendasiByKategori(k: string) {
  if (k === "Fakir") return "Dana Sosial + Sembako Rutin + Zakat";
  if (k === "Miskin") return "Sembako Rutin + Zakat";
  if (k === "Ghorim") return "Zakat";
  return "Tidak Direkomendasikan";
}

/* ============================================================
 * COMPONENT
 * ============================================================ */
export default function PenilaianPage() {
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<PenilaianPayload>();

  const [data, setData] = useState<PenilaianPayload[]>([]);
  const [wargaList, setWargaList] = useState<WargaItem[]>([]);
  const [bobotAHP, setBobotAHP] = useState<AHPWeight[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ============================================================
   * FETCH DATA
   * ============================================================ */
  async function fetchPenilaian() {
  try {
    setLoading(true);
    const res = await fetch("/api/penilaian");

    if (!res.ok) throw new Error("Fetch penilaian gagal");

    setData(await res.json());
  } catch (e) {
    console.error(e);
    setError("Gagal memuat data penilaian");
  } finally {
    setLoading(false);
  }
}

  /* ============================================================
   * PRESENTASE KELAYAKAN
   * ============================================================ */
  const statistikKelayakan = useMemo(() => {
    const total = data.length;

    if (total === 0) {
      return {
        total: 0,
        layak: 0,
        tidakLayak: 0,
        persenLayak: 0,
        persenTidakLayak: 0,
      };
    }

    const layak = data.filter(
      (d) => d.status_layak?.toLowerCase() === "layak"
    ).length;

    const tidakLayak = total - layak;

    return {
      total,
      layak,
      tidakLayak,
      persenLayak: Number(((layak / total) * 100).toFixed(2)),
      persenTidakLayak: Number(((tidakLayak / total) * 100).toFixed(2)),
    };
  }, [data]);

  async function fetchWarga() {
    const res = await fetch("/api/warga");
    if (!res.ok) return;

    const json = await res.json();

    setWargaList(
      json.map((w: any) => ({
        id_warga: w.id_warga,
        nik: w.nik,
        nama: w.nama,

        pendapatan_bulanan: toNumberSafe(w.pendapatan_bulanan),
        aset: w.aset ?? "",
        kondisi_rumah: w.kondisi_rumah ?? "",
        jumlah_tanggungan: toNumberSafe(w.jumlah_tanggungan),

        perlindungan_kesehatan: w.perlindungan_kesehatan,
        kondisi_kesehatan: w.kondisi_kesehatan,
        pendidikan: w.pendidikan,
        kendaraan: w.kendaraan,
        daya_listrik: toNumberSafe(w.daya_listrik),
        luas_rumah: toNumberSafe(w.luas_rumah),
        usia: toNumberSafe(w.usia),
        status_pekerjaan: w.status_pekerjaan,
        jumlah_utang: toNumberSafe(w.jumlah_utang),
      }))
    );
  }

  async function fetchBobot() {
    const res = await fetch("/api/ahpWeights");
    if (res.ok) setBobotAHP(await res.json());
  }

  useEffect(() => {
    fetchPenilaian();
    fetchWarga();
    fetchBobot();
  }, []);
  useEffect(() => {
    if (bobotAHP.length === 0) return;

    const total = bobotAHP.reduce((sum, b) => sum + Number(b.bobot), 0);

    if (Math.abs(total - 1) > 0.01) {
      console.warn("⚠️ Total bobot AHP tidak = 1 :", total);
    }
  }, [bobotAHP]);

  /* ============================================================
   * BOBOT DINAMIS
   * ============================================================ */
  const bobot = useMemo(() => {
    const m = mapBobot(bobotAHP);

    return {
      pendapatan: m["pendapatan"] ?? 0,
      aset: m["aset"] ?? 0,
      rumah: m["rumah"] ?? 0,
      tanggungan: m["tanggungan"] ?? 0,

      perlindungan: m["perlindungan_kesehatan"] ?? 0,
      kesehatan: m["kondisi_kesehatan"] ?? 0,
      pendidikan: m["pendidikan"] ?? 0,
      kendaraan: m["kendaraan"] ?? 0,
      listrik: m["daya_listrik"] ?? 0,
      usia: m["usia"] ?? 0,
      luas: m["luas_rumah"] ?? 0,
      pekerjaan: m["status_pekerjaan"] ?? 0,
    };
  }, [bobotAHP]);

  /* ============================================================
   * HITUNG AHP
   * ============================================================ */
  function hitungAHP(s: {
    p: number;
    a: number;
    r: number;
    t: number;
    perlindungan: number;
    kesehatan: number;
    pendidikan: number;
    kendaraan: number;
    listrik: number;
    usia: number;
    luas: number;
    pekerjaan: number;
  }) {
    return (
      s.p * bobot.pendapatan +
      s.a * bobot.aset +
      s.r * bobot.rumah +
      s.t * bobot.tanggungan +
      s.perlindungan * bobot.perlindungan +
      s.kesehatan * bobot.kesehatan +
      s.pendidikan * bobot.pendidikan +
      s.kendaraan * bobot.kendaraan +
      s.listrik * bobot.listrik +
      s.usia * bobot.usia +
      s.luas * bobot.luas +
      s.pekerjaan * bobot.pekerjaan
    );
  }

  /* ============================================================
   * AUTO FILL SAAT PILIH WARGA
   * ============================================================ */
  const selected = watch("id_warga");

  useEffect(() => {
    if (!selected) return;

    const w = wargaList.find((x) => x.id_warga === Number(selected));
    if (!w) return;

    const sp = skorPendapatanFromString(String(w.pendapatan_bulanan));
    const sa = skorAset(w.aset);
    const sr = skorRumah(w.kondisi_rumah);
    const st = skorTanggungan(w.jumlah_tanggungan);
    const skor_utang = skorUtangFromString(String(w.jumlah_utang));

    const skor_perlindungan = w.perlindungan_kesehatan ? 5 : 1;
    const skor_kondisi_kesehatan =
      w.kondisi_kesehatan === "Sakit Berat"
        ? 5
        : w.kondisi_kesehatan === "Kelainan/difable"
        ? 4
        : w.kondisi_kesehatan === "Tuna netra/rungu/wicara"
        ? 3
        : w.kondisi_kesehatan === "Riwayat Penyakit"
        ? 2
        : 1;

    const skor_pendidikan =
      w.pendidikan === "SD"
        ? 5
        : w.pendidikan === "SMP"
        ? 4
        : w.pendidikan === "SMA"
        ? 3
        : w.pendidikan === "D3/S1"
        ? 2
        : 1;

    const skor_kendaraan =
      w.kendaraan === "Tidak Punya"
        ? 5
        : w.kendaraan === "Sepeda"
        ? 4
        : w.kendaraan === "Motor"
        ? 3
        : w.kendaraan === "Mobil"
        ? 2
        : 1;

    const dayaListrik = w.daya_listrik ?? 0;
    const usia = w.usia ?? 0;
    const luasRumah = w.luas_rumah ?? 0;

    const skor_daya_listrik =
      dayaListrik <= 450 ? 5 : dayaListrik <= 900 ? 3 : 1;

    const skor_usia = usia >= 60 ? 5 : usia >= 40 ? 3 : 1;

    const skor_luas_rumah = luasRumah <= 30 ? 5 : luasRumah <= 60 ? 3 : 1;

    const skor_status_pekerjaan =
      w.status_pekerjaan === "Tidak Bekerja"
        ? 5
        : w.status_pekerjaan === "Serabutan"
        ? 4
        : w.status_pekerjaan === "swasta"
        ? 3
        : w.status_pekerjaan === "pns"
        ? 2
        : 1;

    const total = Number(
      hitungAHP({
        p: sp,
        a: sa,
        r: sr,
        t: st,
        perlindungan: skor_perlindungan,
        kesehatan: skor_kondisi_kesehatan,
        pendidikan: skor_pendidikan,
        kendaraan: skor_kendaraan,
        listrik: skor_daya_listrik,
        usia: skor_usia,
        luas: skor_luas_rumah,
        pekerjaan: skor_status_pekerjaan,
      }).toFixed(3)
    );

    const kat = kategoriByTotal(total);

    // Masukkan ke form
    setValue("skor_pendapatan", sp);
    setValue("skor_aset", sa);
    setValue("skor_rumah", sr);
    setValue("skor_tanggungan", st);

    setValue("skor_perlindungan", skor_perlindungan);
    setValue("skor_kondisi_kesehatan", skor_kondisi_kesehatan);
    setValue("skor_pendidikan", skor_pendidikan);
    setValue("skor_kendaraan", skor_kendaraan);
    setValue("skor_daya_listrik", skor_daya_listrik);
    setValue("skor_usia", skor_usia);
    setValue("skor_luas_rumah", skor_luas_rumah);
    setValue("skor_status_pekerjaan", skor_status_pekerjaan);
    setValue("skor_utang", skor_utang);

    setValue("skor_total", total);
    setValue("kategori_asnaf", kat);
    setValue("rekomendasi_bantuan", rekomendasiByKategori(kat));
    setValue(
      "status_layak",
      kat !== "Mampu / Tidak Layak" ? "Layak" : "Tidak Layak"
    );
  }, [selected, wargaList, bobot, setValue]);

  /* ============================================================
   * SUBMIT
   * ============================================================ */
  async function submit(form: PenilaianPayload) {
    setError(null);

    if (!form.id_warga) {
      setError("Warga belum dipilih");
      return;
    }

    const method = editingId ? "PUT" : "POST";

    const res = await fetch("/api/penilaian", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id_penilaian: editingId,
        tanggal_penilaian: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      setError("Gagal menyimpan data");
      return;
    }

    reset();
    setEditingId(null);
    fetchPenilaian();
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
    setError("Gagal menghapus data");
    return;
  }

  fetchPenilaian();
}


  /* ============================================================
   * UI
   * ============================================================ */
  return (
    <MainLayout>
      <h1 className="text-xl font-bold mb-4">
        Manajemen Penilaian Bantuan (AHP Bobot Dinamis)
      </h1>

      {error && (
        <div className="mb-4 text-red-600 text-sm border p-2 rounded">
          {error}
        </div>
      )}
      {/* STATISTIK */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded p-4 bg-white">
          <p className="text-sm text-gray-500">Total Penilaian</p>
          <p className="text-2xl font-bold">{statistikKelayakan.total}</p>
        </div>

        <div className="border rounded p-4 bg-green-50">
          <p className="text-sm text-green-700">Layak</p>
          <p className="text-2xl font-bold text-green-700">
            {statistikKelayakan.layak}
          </p>
          <p className="text-sm text-green-600">
            {statistikKelayakan.persenLayak}%
          </p>
        </div>

        <div className="border rounded p-4 bg-red-50">
          <p className="text-sm text-red-700">Tidak Layak</p>
          <p className="text-2xl font-bold text-red-700">
            {statistikKelayakan.tidakLayak}
          </p>
          <p className="text-sm text-red-600">
            {statistikKelayakan.persenTidakLayak}%
          </p>
        </div>
      </div>

      {/* FORM */}
      {/* FORM */}
      <form
        className="grid grid-cols-3 gap-3 mb-6"
        onSubmit={handleSubmit(submit)}
      >
        {/* PILIH WARGA */}
        <select
          className="border p-2 rounded col-span-3"
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

        {/* SKOR AHP LAMA */}
        <Input
          readOnly
          {...register("skor_pendapatan")}
          placeholder="Skor Pendapatan"
        />
        <Input readOnly {...register("skor_aset")} placeholder="Skor Aset" />
        <Input readOnly {...register("skor_rumah")} placeholder="Skor Rumah" />
        <Input
          readOnly
          {...register("skor_tanggungan")}
          placeholder="Skor Tanggungan"
        />
        <Input readOnly {...register("skor_utang")} placeholder="Skor Hutang" />

        {/* SKOR BARU */}
        <Input
          readOnly
          {...register("skor_perlindungan")}
          placeholder="Skor Perlindungan"
        />
        <Input
          readOnly
          {...register("skor_kondisi_kesehatan")}
          placeholder="Skor Kesehatan"
        />
        <Input
          readOnly
          {...register("skor_pendidikan")}
          placeholder="Skor Pendidikan"
        />
        <Input
          readOnly
          {...register("skor_kendaraan")}
          placeholder="Skor Kendaraan"
        />
        <Input
          readOnly
          {...register("skor_daya_listrik")}
          placeholder="Skor Daya Listrik"
        />
        <Input readOnly {...register("skor_usia")} placeholder="Skor Usia" />
        <Input
          readOnly
          {...register("skor_luas_rumah")}
          placeholder="Skor Luas Rumah"
        />
        <Input
          readOnly
          {...register("skor_status_pekerjaan")}
          placeholder="Skor Pekerjaan"
        />

        {/* HASIL AKHIR */}
        <Input readOnly {...register("skor_total")} placeholder="Skor Total" />
        <Input
          readOnly
          {...register("kategori_asnaf")}
          placeholder="Kategori"
        />
        <Input
          readOnly
          {...register("rekomendasi_bantuan")}
          placeholder="Rekomendasi"
        />
        <Input
          readOnly
          {...register("status_layak")}
          placeholder="Status Layak"
        />

        {/* BUTTON */}
        <Button className="col-span-3" disabled={loading} type="submit">
          {editingId ? "Update Penilaian" : "Simpan Penilaian"}
        </Button>
      </form>

      {/* TABLE */}
      {/* TABLE */}
      <div className="w-full overflow-x-auto mt-6 border rounded-lg">
        <Table className="min-w-max text-sm">
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="whitespace-nowrap">ID</TableHead>
              <TableHead className="whitespace-nowrap">Warga</TableHead>

              {/* SKOR AHP LAMA */}
              <TableHead className="whitespace-nowrap">Pendapatan</TableHead>
              <TableHead className="whitespace-nowrap">Aset</TableHead>
              <TableHead className="whitespace-nowrap">Rumah</TableHead>
              <TableHead className="whitespace-nowrap">Tanggungan</TableHead>
              <TableHead className="whitespace-nowrap">Hutang</TableHead>

              {/* SKOR BARU */}
              <TableHead className="whitespace-nowrap">Perlindungan</TableHead>
              <TableHead className="whitespace-nowrap">Kesehatan</TableHead>
              <TableHead className="whitespace-nowrap">Pendidikan</TableHead>
              <TableHead className="whitespace-nowrap">Kendaraan</TableHead>
              <TableHead className="whitespace-nowrap">Listrik</TableHead>
              <TableHead className="whitespace-nowrap">Usia</TableHead>
              <TableHead className="whitespace-nowrap">Luas</TableHead>
              <TableHead className="whitespace-nowrap">Pekerjaan</TableHead>

              <TableHead className="whitespace-nowrap">Total</TableHead>
              <TableHead className="whitespace-nowrap">Kategori</TableHead>
              <TableHead className="whitespace-nowrap">Rekomendasi</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Aksi</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id_penilaian}>
                <TableCell>{row.id_penilaian}</TableCell>
                <TableCell>{row.warga?.nama}</TableCell>

                {/* SKOR LAMA */}
                <TableCell>{row.skor_pendapatan}</TableCell>
                <TableCell>{row.skor_aset}</TableCell>
                <TableCell>{row.skor_rumah}</TableCell>
                <TableCell>{row.skor_tanggungan}</TableCell>
                <TableCell>{row.skor_utang}</TableCell>
                {/* SKOR BARU */}
                <TableCell>{row.skor_perlindungan}</TableCell>
                <TableCell>{row.skor_kondisi_kesehatan}</TableCell>
                <TableCell>{row.skor_pendidikan}</TableCell>
                <TableCell>{row.skor_kendaraan}</TableCell>
                <TableCell>{row.skor_daya_listrik}</TableCell>
                <TableCell>{row.skor_usia}</TableCell>
                <TableCell>{row.skor_luas_rumah}</TableCell>
                <TableCell>{row.skor_status_pekerjaan}</TableCell>

                <TableCell className="font-semibold">
                  {row.skor_total}
                </TableCell>
                <TableCell>{row.kategori_asnaf}</TableCell>
                <TableCell>{row.rekomendasi_bantuan}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      row.status_layak === "Layak"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {row.status_layak}
                  </span>
                </TableCell>

                <TableCell className="flex gap-2 min-w-max">
                  <Button size="sm" onClick={() => editRow(row)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
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
      </div>
    </MainLayout>
  );
}
