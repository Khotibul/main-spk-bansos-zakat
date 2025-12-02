"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id_umr: "", provinsi: "", kabupaten: "", nilai_umr: "", tanggal_berlaku: "" });
  const [filters, setFilters] = useState({ provinsi: "", kabupaten: "" });

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

  useEffect(() => { fetchUMR(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await fetch(`/api/umrs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ id_umr: "", provinsi: "", kabupaten: "", nilai_umr: "", tanggal_berlaku: "" });
      fetchUMR();
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus data UMR?")) return;
    await fetch(`/api/umrs`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_umr: id }),
    });
    fetchUMR();
  }

  function handleEdit(item) {
    setForm({
      id_umr: item.id_umr,
      provinsi: item.provinsi,
      kabupaten: item.kabupaten,
      nilai_umr: item.nilai_umr,
      tanggal_berlaku: item.tanggal_berlaku?.split("T")[0] ?? "",
    });
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manajemen Data UMR</h1>

      {/* Filter */}
      <Card className="p-4">
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Filter Provinsi</Label>
              <Input value={filters.provinsi} onChange={(e) => setFilters({ ...filters, provinsi: e.target.value })} />
            </div>
            <div>
              <Label>Filter Kabupaten</Label>
              <Input value={filters.kabupaten} onChange={(e) => setFilters({ ...filters, kabupaten: e.target.value })} />
            </div>
          </div>
          <Button onClick={fetchUMR}>Cari</Button>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="p-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Provinsi</Label>
                <Input value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })} required />
              </div>
              <div>
                <Label>Kabupaten</Label>
                <Input value={form.kabupaten} onChange={(e) => setForm({ ...form, kabupaten: e.target.value })} required />
              </div>
              <div>
                <Label>Nilai UMR</Label>
                <Input type="number" value={form.nilai_umr} onChange={(e) => setForm({ ...form, nilai_umr: e.target.value })} required />
              </div>
              <div>
                <Label>Tanggal Berlaku</Label>
                <Input type="date" value={form.tanggal_berlaku} onChange={(e) => setForm({ ...form, tanggal_berlaku: e.target.value })} />
              </div>
            </div>
            <Button type="submit">{form.id_umr ? "Update" : "Tambah"} UMR</Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <CardContent>
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
                    <TableCell>{new Date(item.tanggal_berlaku).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id_umr)}>Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
