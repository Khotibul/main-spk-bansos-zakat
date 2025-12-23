"use client";
import { useState } from "react";

type Result = {
  nik: string;
  nama: string;
  status?: string;
  status_validasi?: string;
  skor_total?: number;
  rekomendasi_bantuan?: string;
  kategori_asnaf?: string;
  tanggal_penilaian?: string;
};

export default function CekKelayakanPage() {
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [namaIbu, setNamaIbu] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/warga/cek-kelayakan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nik,
        nama,
        nama_ibu: namaIbu,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Terjadi kesalahan");
    } else {
      setResult(json);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-center">
        Cek Kelayakan Bantuan Sosial
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="NIK"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Nama Ibu Kandung"
          value={namaIbu}
          onChange={(e) => setNamaIbu(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? "Memproses..." : "Cek Kelayakan"}
        </button>
      </form>

      {/* ================= HASIL ================= */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="border rounded p-4 space-y-2">
          <p><b>NIK:</b> {result.nik}</p>
          <p><b>Nama:</b> {result.nama}</p>

          {result.status === "BELUM DINILAI" ? (
            <p className="text-yellow-600 font-semibold">
              Status: BELUM DINILAI
            </p>
          ) : (
            <>
              <p>
                <b>Status Validasi:</b>{" "}
                <span
                  className={`font-semibold ${
                    result.status_validasi === "DISETUJUI"
                      ? "text-green-600"
                      : result.status_validasi === "DITOLAK"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {result.status_validasi}
                </span>
              </p>
              <p><b>Skor Total:</b> {result.skor_total}</p>
              <p><b>Kategori Asnaf:</b> {result.kategori_asnaf ?? "-"}</p>
              <p>
                <b>Rekomendasi Bantuan:</b>{" "}
                {result.rekomendasi_bantuan ?? "-"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
