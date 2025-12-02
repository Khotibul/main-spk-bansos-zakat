"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { MainLayout } from "../main-layout/main-layout";

// Types
export type AHPWeight = {
  id?: number;
  kriteria: string;
  bobot: number;
  tanggal_update?: string;
};

export default function FuzzyAHPPage() {
  const { register, handleSubmit, reset, setValue } = useForm<AHPWeight>();
  const [data, setData] = useState<AHPWeight[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function fetchWeights() {
    const res = await fetch("/api/ahpWeights");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    fetchWeights();
  }, []);

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

  function editRow(row: AHPWeight) {
    setEditingId(row.id ?? null);
    setValue("kriteria", row.kriteria);
    setValue("bobot", row.bobot);
  }

  async function removeRow(id: number) {
    await fetch("/api/ahpWeights", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchWeights();
  }

  // ---------- Fuzzy-AHP Logic (Simple Prediction Example) ----------
  const [prediksi, setPrediksi] = useState<string>("");
  const [fuzzyInput, setFuzzyInput] = useState({
    pendapatan: 0,
    aset: 0,
    rumah: 0,
    tanggungan: 0
  });

  function fuzzyPredict() {
    const getWeight = (key: string) => data.find(d => d.kriteria.toLowerCase() === key)?.bobot || 0;

    const wPend = getWeight("pendapatan");
    const wAset = getWeight("aset");
    const wRum = getWeight("rumah");
    const wTang = getWeight("tanggungan");

    const score =
      fuzzyInput.pendapatan * wPend +
      fuzzyInput.aset * wAset +
      fuzzyInput.rumah * wRum +
      fuzzyInput.tanggungan * wTang;

    let kategori = "";
    if (score >= 0.75) kategori = "Sangat Layak";
    else if (score >= 0.5) kategori = "Layak";
    else kategori = "Tidak Layak";

    setPrediksi(`Skor: ${score.toFixed(3)} — ${kategori}`);
  }

  return (
    <MainLayout>
      <h1 className="text-xl font-bold mb-4">Fuzzy-AHP — Pengaturan Bobot</h1>

      {/* Form Create / Edit */}
      <form className="flex gap-2 mb-6" onSubmit={handleSubmit(submit)}>
        <Input placeholder="Kriteria" {...register("kriteria")} required />
        <Input type="number" step="0.01" placeholder="Bobot" {...register("bobot", { valueAsNumber: true })} required />
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

      {/* Fuzzy Prediction */}
      <h2 className="text-lg font-semibold mb-2">Prediksi Fuzzy-AHP</h2>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <Input type="number" placeholder="Fuzzy Pendapatan" onChange={(e) => setFuzzyInput({ ...fuzzyInput, pendapatan: Number(e.target.value) })} />
        <Input type="number" placeholder="Fuzzy Aset" onChange={(e) => setFuzzyInput({ ...fuzzyInput, aset: Number(e.target.value) })} />
        <Input type="number" placeholder="Fuzzy Rumah" onChange={(e) => setFuzzyInput({ ...fuzzyInput, rumah: Number(e.target.value) })} />
        <Input type="number" placeholder="Fuzzy Tanggungan" onChange={(e) => setFuzzyInput({ ...fuzzyInput, tanggungan: Number(e.target.value) })} />
      </div>

      <Button onClick={fuzzyPredict}>Hitung Prediksi</Button>

      {prediksi && <p className="mt-4 p-3 bg-gray-100 rounded-md font-medium">{prediksi}</p>}
    </MainLayout>
  );
}
