"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { MainLayout } from "../main-layout/main-layout";

// =============================
// Types
// =============================
export type AHPWeight = {
  id?: number;
  kriteria: string;
  bobot: number;
  tanggal_update?: string;
};

// =============================
// FULL KRITERIA LIST — 13 TOTAL
// =============================
const KRITERIA_LIST = [
  "pendapatan",
  "aset",
  "rumah",
  "tanggungan",
  "utang",
  "perlindungan_kesehatan",
  "kondisi_kesehatan",
  "pendidikan",
  "kendaraan",
  "daya_listrik",
  "usia",
  "luas_rumah",
  "status_pekerjaan",
];

export default function FuzzyAHPPage() {
  const { register, handleSubmit, reset, setValue } = useForm<AHPWeight>();
  const [data, setData] = useState<AHPWeight[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  // =============================
  // GET DATA
  // =============================
  async function fetchWeights() {
    const res = await fetch("/api/ahpWeights");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    fetchWeights();
  }, []);

  // =============================
  // SUBMIT CREATE / UPDATE
  // =============================
  async function submit(form: AHPWeight) {
    const payload = { ...form, id: editingId ?? undefined };
    await fetch("/api/ahpWeights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    reset();
    setEditingId(null);
    fetchWeights();
  }

  // =============================
  // EDIT ROW
  // =============================
  function editRow(row: AHPWeight) {
    setEditingId(row.id ?? null);
    setValue("kriteria", row.kriteria);
    setValue("bobot", row.bobot);
  }

  // =============================
  // DELETE ROW
  // =============================
  async function removeRow(id: number) {
    await fetch("/api/ahpWeights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchWeights();
  }

  // =============================
  // FUZZY INPUTS (13 fields)
  // =============================
  const [fuzzyInput, setFuzzyInput] = useState(
    Object.fromEntries(KRITERIA_LIST.map((k) => [k, 0]))
  );

  const [prediksi, setPrediksi] = useState<string>("");

  // =============================
  // FUZZY-AHP PREDICTION
  // =============================
  function fuzzyPredict() {
    const getWeight = (key: string) =>
      data.find((d) => d.kriteria.toLowerCase() === key)?.bobot || 0;

    // SUM(score * bobot)
    let total = 0;
    for (const k of KRITERIA_LIST) {
      total += (fuzzyInput as any)[k] * getWeight(k);
    }

    let kategori = "";
    if (total >= 10.75) kategori = "Sangat Layak";
    else if (total >= 5.5) kategori = "Layak";
    else kategori = "Tidak Layak";

    setPrediksi(`Skor: ${total.toFixed(3)} — ${kategori}`);
  }

  return (
    <MainLayout>
      <h1 className="text-xl font-bold mb-4">Fuzzy-AHP — Pengaturan Bobot</h1>

      {/* Form Create / Edit */}
      <form className="flex gap-2 mb-6" onSubmit={handleSubmit(submit)}>
        <select className="border px-2 py-1" {...register("kriteria")} required>
          <option value="">Pilih Kriteria</option>
          {KRITERIA_LIST.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <Input
          type="number"
          step="0.001"
          placeholder="Bobot"
          {...register("bobot", { valueAsNumber: true })}
          required
        />
        <Button type="submit">{editingId ? "Update" : "Tambah"}</Button>
      </form>

      {/* Table */}
      <Table className="mb-10">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Kriteria</TableHead>
            <TableHead>Bobot</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.id}</TableCell>
              <TableCell>{d.kriteria}</TableCell>
              <TableCell>{d.bobot}</TableCell>
              <TableCell>
                <Button variant="secondary" onClick={() => editRow(d)}>Edit</Button>
                <Button variant="destructive" className="ml-2" onClick={() => removeRow(d.id!)}>Hapus</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Fuzzy Inputs */}
      <h2 className="text-lg font-semibold mb-2">Prediksi Fuzzy-AHP</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {KRITERIA_LIST.map((k) => (
          <Input
            key={k}
            type="number"
            placeholder={`Fuzzy ${k}`}
            onChange={(e) =>
              setFuzzyInput({ ...fuzzyInput, [k]: Number(e.target.value) })
            }
          />
        ))}
      </div>

      <Button onClick={fuzzyPredict}>Hitung Prediksi</Button>

      {prediksi && (
        <p className="mt-4 p-3 bg-gray-100 rounded-md font-medium">
          {prediksi}
        </p>
      )}
    </MainLayout>
  );
}
