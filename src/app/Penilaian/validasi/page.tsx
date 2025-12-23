"use client";
import { useEffect, useState } from "react";

type Penilaian = {
  id_penilaian: number;
  skor_total: number;
  status_validasi: string;
  warga: {
    nik: string;
    nama: string;
    alamat?: string;
  };
};

export default function ValidasiPenilaianPage() {
  const [data, setData] = useState<Penilaian[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= AMBIL DATA ================= */
  const fetchData = async () => {
    setLoading(true);
    const res = await fetch("/api/penilaian");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= AKSI VALIDASI ================= */
  const handleValidasi = async (
    id_penilaian: number,
    keputusan: "DISETUJUI" | "DITOLAK"
  ) => {
    const catatan = prompt(
      keputusan === "DISETUJUI"
        ? "Catatan persetujuan (opsional)"
        : "Alasan penolakan"
    );

    const validated_by = "admin_desa"; // 🔐 nanti ambil dari session

    const res = await fetch("/api/penilaian/validasi", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_penilaian,
        keputusan,
        catatan,
        validated_by,
      }),
    });

    if (res.ok) {
      alert(`Berhasil ${keputusan}`);
      fetchData();
    } else {
      const err = await res.json();
      alert(err.error ?? "Terjadi kesalahan");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Validasi Penilaian Bantuan</h1>

      <div className="overflow-auto border rounded">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">NIK</th>
              <th className="border px-3 py-2">Nama</th>
              <th className="border px-3 py-2">Skor Total</th>
              <th className="border px-3 py-2">Status</th>
              <th className="border px-3 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4">
                  Data kosong
                </td>
              </tr>
            )}

            {!loading &&
              data.map((item) => (
                <tr key={item.id_penilaian}>
                  <td className="border px-3 py-2">
                    {item.warga.nik}
                  </td>
                  <td className="border px-3 py-2">
                    {item.warga.nama}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    {item.skor_total}
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.status_validasi === "DISETUJUI"
                          ? "bg-green-100 text-green-700"
                          : item.status_validasi === "DITOLAK"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status_validasi}
                    </span>
                  </td>
                  <td className="border px-3 py-2 text-center space-x-2">
                    <button
                      disabled={item.status_validasi === "DISETUJUI"}
                      onClick={() =>
                        handleValidasi(item.id_penilaian, "DISETUJUI")
                      }
                      className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
                    >
                      Setujui
                    </button>

                    <button
                      disabled={item.status_validasi === "DITOLAK"}
                      onClick={() =>
                        handleValidasi(item.id_penilaian, "DITOLAK")
                      }
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
