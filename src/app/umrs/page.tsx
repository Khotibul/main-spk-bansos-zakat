"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UMR = {
  id_umr: number;
  provinsi: string;
  kabupaten: string;
  nilai_umr: number;
  tanggal_berlaku: string | null;
};

export default function Page() {
  const [data, setData] = useState<UMR[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id_umr: "",
    provinsi: "",
    kabupaten: "",
    nilai_umr: "",
    tanggal_berlaku: "",
  });

  const [filters, setFilters] = useState({
    provinsi: "",
    kabupaten: "",
  });

  /* ================= FETCH ================= */
  async function fetchUMR() {
    setLoading(true);

    const params = new URLSearchParams();
    if (filters.provinsi) params.append("provinsi", filters.provinsi);
    if (filters.kabupaten) params.append("kabupaten", filters.kabupaten);

    const res = await fetch(`/api/umrs?${params.toString()}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchUMR();
  }, []);

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // VALIDASI WAJIB
    if (!form.provinsi || !form.kabupaten || !form.nilai_umr) {
      alert("❗ Provinsi, Kabupaten, dan Nilai UMR wajib diisi");
      return;
    }

    const payload = {
      ...form,
      nilai_umr: Number(form.nilai_umr), // PENTING
    };

    const res = await fetch("/api/umrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm({
        id_umr: "",
        provinsi: "",
        kabupaten: "",
        nilai_umr: "",
        tanggal_berlaku: "",
      });
      fetchUMR();
    }
  }

  /* ================= DELETE ================= */
  async function handleDelete(id: number) {
    if (!confirm("Hapus data UMR ini?")) return;

    await fetch("/api/umrs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_umr: id }),
    });

    fetchUMR();
  }

  /* ================= EDIT ================= */
  function handleEdit(item: UMR) {
    setForm({
      id_umr: String(item.id_umr),
      provinsi: item.provinsi,
      kabupaten: item.kabupaten,
      nilai_umr: String(item.nilai_umr),
      tanggal_berlaku: item.tanggal_berlaku
        ? item.tanggal_berlaku.split("T")[0]
        : "",
    });
  }

  /* ================= RENDER ================= */
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manajemen Data UMR</h1>

      {/* FILTER */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Filter Provinsi</Label>
              <Input
                value={filters.provinsi}
                onChange={(e) =>
                  setFilters({ ...filters, provinsi: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Filter Kabupaten</Label>
              <Input
                value={filters.kabupaten}
                onChange={(e) =>
                  setFilters({ ...filters, kabupaten: e.target.value })
                }
              />
            </div>
          </div>
          <Button onClick={fetchUMR}>Cari</Button>
        </CardContent>
      </Card>

      {/* FORM */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provinsi *</Label>
                <Input
                  value={form.provinsi}
                  onChange={(e) =>
                    setForm({ ...form, provinsi: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Kabupaten *</Label>
                <Input
                  value={form.kabupaten}
                  onChange={(e) =>
                    setForm({ ...form, kabupaten: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Nilai UMR *</Label>
                <Input
                  type="number"
                  value={form.nilai_umr}
                  onChange={(e) =>
                    setForm({ ...form, nilai_umr: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Tanggal Berlaku</Label>
                <Input
                  type="date"
                  value={form.tanggal_berlaku}
                  onChange={(e) =>
                    setForm({ ...form, tanggal_berlaku: e.target.value })
                  }
                />
              </div>
            </div>

            <Button type="submit">
              {form.id_umr ? "Update" : "Tambah"} UMR
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provinsi</TableHead>
                  <TableHead>Kabupaten</TableHead>
                  <TableHead>Nilai UMR</TableHead>
                  <TableHead>Tanggal Berlaku</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id_umr}>
                    <TableCell>{item.provinsi}</TableCell>
                    <TableCell>{item.kabupaten}</TableCell>
                    <TableCell>{item.nilai_umr}</TableCell>
                    <TableCell>
                      {item.tanggal_berlaku
                        ? new Date(
                            item.tanggal_berlaku
                          ).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id_umr)}
                      >
                        Hapus
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {!data.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Tidak ada data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
