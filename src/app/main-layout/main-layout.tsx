"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

import Cookie from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";
type Users = {
  id_users: number;
  username: string;
  role: string;
};

type Warga = {
  id_warga: number;
  nik: string;
  nama: string;
  usia?: number;
  pendapatan_bulanan?: number;
  jumlah_tanggungan?: number;
};

type Penilaian = {
  id_penilaian: number;
  id_warga: number;
  status_layak?: "LAYAK" | "TIDAK_LAYAK";
  status_validasi?: "MENUNGGU" | "DISETUJUI" | "DITOLAK";
};

import {
  Users as UsersIcon, // Ganti nama untuk menghindari konflik
  Home,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  UserX,
  Clock, // Icon untuk status menunggu
  AlertCircle, // Icon untuk status ditolak
} from "lucide-react";

/* ============================================================
 * TYPES & CONTEXT
 * ============================================================ */
type MainLayoutProps = {
  children: React.ReactNode;
};

type GlobalContextData = {
  users?: Users | null;
};

const GlobalContext = createContext<GlobalContextData>({
  users: null,
});

export const useUserContext = () => useContext(GlobalContext);

/* ============================================================
 * MAIN LAYOUT
 * ============================================================ */
export const MainLayout = ({ children }: MainLayoutProps) => {
  const [users, setUsers] = useState<Users | null>(null);
  const [warga, setWarga] = useState<Warga[]>([]);
  const [penilaian, setPenilaian] = useState<Penilaian[]>([]);
  const [loading, setLoading] = useState(true);

  /* === USER DARI COOKIE === */
  useEffect(() => {
    const raw = Cookie.get("user");
    if (!raw || raw === "undefined") return;

    try {
      setUsers(JSON.parse(raw));
    } catch {
      setUsers(null);
    }
  }, []);

  /* === FETCH DATA WARGA & PENILAIAN === */
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [wargaRes, penilaianRes] = await Promise.all([
          fetch("/api/warga"),
          fetch("/api/penilaian"),
        ]);

        const wargaData = await wargaRes.json();
        const penilaianData = await penilaianRes.json();

        setWarga(Array.isArray(wargaData) ? wargaData : []);
        setPenilaian(Array.isArray(penilaianData) ? penilaianData : []);
      } catch (err) {
        console.error("Gagal memuat data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  /* === HITUNG TOTAL === */
  const totalWarga = warga.length;
  const totalPenilaian = penilaian.length;

  // --- Statistik Kelayakan ---
  const totalLayak = penilaian.filter((p) => p.status_layak === "LAYAK").length;
  const totalTidakLayak = penilaian.filter(
    (p) => p.status_layak === "TIDAK_LAYAK"
  ).length;

  // --- Statistik Validasi (Berdasarkan skema baru) ---
  const totalMenungguValidasi = penilaian.filter(
    (p) => p.status_validasi === "MENUNGGU"
  ).length;
  const totalDisetujui = penilaian.filter(
    (p) => p.status_validasi === "DISETUJUI"
  ).length;
  const totalDitolak = penilaian.filter(
    (p) => p.status_validasi === "DITOLAK"
  ).length;

  // --- SOLUSI: Pisahkan variabel untuk PERHITUNGAN (number) dan TAMPILAN (string) ---
  const persentaseLayakNumber =
    totalPenilaian > 0 ? (totalLayak / totalPenilaian) * 100 : 0;
  const persentaseTidakLayakNumber =
    totalPenilaian > 0 ? (totalTidakLayak / totalPenilaian) * 100 : 0;
  const persentaseLayakString = persentaseLayakNumber.toFixed(1);
  const persentaseTidakLayakString = persentaseTidakLayakNumber.toFixed(1);

  return (
    <SidebarProvider defaultOpen>
      <GlobalContext.Provider value={{ users }}>
        <AppSidebar />

        <SidebarInset>
          {/* ================= HEADER ================= */}
          <header className="h-16 flex shrink-0 items-center gap-2 border-b bg-background shadow-sm">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <BreadcrumbSeparator className="hidden md:block" />

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink
                      href="/"
                      className="flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Sistem Informasi Bantuan Desa
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {users && (
              <div className="ml-auto px-4 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium">{users.username}</p>
                  <p className="text-xs text-muted-foreground">{users.role}</p>
                </div>
              </div>
            )}
          </header>

          {/* ================= CONTENT ================= */}
          <main className="flex-1 space-y-6 p-6 bg-muted/30">
            {children}

            {/* ================= DASHBOARD TOTAL ================= */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Warga"
                value={totalWarga}
                icon={<UsersIcon className="h-4 w-4" />}
                description="Jumlah seluruh warga terdaftar"
              />
              <StatCard
                title="Total Penilaian"
                value={totalPenilaian}
                icon={<FileText className="h-4 w-4" />}
                description="Jumlah warga yang telah dinilai"
              />
              <StatCard
                title="Layak Bantuan"
                value={totalLayak}
                icon={<UserCheck className="h-4 w-4" />}
                description="Warga yang layak menerima bantuan"
                trend={persentaseLayakString + "% dari total penilaian"}
                trendUp={true}
              />
              <StatCard
                title="Tidak Layak"
                value={totalTidakLayak}
                icon={<UserX className="h-4 w-4" />}
                description="Warga yang tidak layak menerima bantuan"
                trend={persentaseTidakLayakString + "% dari total penilaian"}
                trendUp={false}
              />
            </div>

            {/* ================= GRAFIK & TABEL ================= */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Grafik Pie */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Distribusi Kelayakan
                  </CardTitle>
                  <CardDescription>
                    Persentase warga yang layak dan tidak layak menerima bantuan
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="flex flex-col items-center justify-center h-64">
                    <div className="relative w-48 h-48">
                      <svg
                        viewBox="0 0 100 100"
                        className="transform -rotate-90 w-48 h-48"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="10"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="10"
                          // Gunakan variabel NUMBER untuk perhitungan
                          strokeDasharray={`${
                            persentaseLayakNumber * 2.51
                          } 251`}
                          className="transition-all duration-500 ease-in-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {persentaseLayakString}%
                          </p>
                          <p className="text-xs text-muted-foreground">Layak</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Layak ({totalLayak})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        <span className="text-sm">
                          Tidak Layak ({totalTidakLayak})
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Bar */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Progress Penilaian
                  </CardTitle>
                  <CardDescription>
                    Persentase warga yang telah dinilai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress Penilaian</span>
                        <span>
                          {totalPenilaian}/{totalWarga}
                        </span>
                      </div>
                      <Progress
                        value={
                          totalWarga > 0
                            ? (totalPenilaian / totalWarga) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {totalLayak}
                        </p>
                        <p className="text-xs text-muted-foreground">Layak</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">
                          {totalTidakLayak}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Tidak Layak
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ================= TABS UNTUK VALIDASI ================= */}
            <Tabs defaultValue="kelayakan" className="space-y-4">
              <TabsList>
                <TabsTrigger value="kelayakan">Data Kelayakan</TabsTrigger>
                <TabsTrigger value="validasi">Status Validasi</TabsTrigger>
              </TabsList>

              <TabsContent value="kelayakan">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersIcon className="h-5 w-5" />
                      Data Warga Terbaru
                    </CardTitle>
                    <CardDescription>
                      Daftar warga yang terdaftar dalam sistem
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Memuat data warga...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="overflow-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="px-4 py-3 text-left font-medium">
                                NIK
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Nama
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Usia
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Pendapatan
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Tanggungan
                              </th>
                              <th className="px-4 py-3 text-left font-medium">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {warga.slice(0, 5).map((w) => {
                              const penilaianWarga = penilaian.find(
                                (p) => p.id_warga === w.id_warga
                              );

                              return (
                                <tr
                                  key={w.id_warga}
                                  className="border-b hover:bg-muted/50 transition-colors"
                                >
                                  <td className="px-4 py-3">{w.nik}</td>
                                  <td className="px-4 py-3 font-medium">
                                    {w.nama}
                                  </td>
                                  <td className="px-4 py-3">{w.usia ?? "-"}</td>
                                  <td className="px-4 py-3">
                                    {w.pendapatan_bulanan ?? "-"}
                                  </td>
                                  <td className="px-4 py-3">
                                    {w.jumlah_tanggungan ?? 0}
                                  </td>
                                  <td className="px-4 py-3">
                                    {penilaianWarga ? (
                                      <StatusBadge
                                        status={
                                          penilaianWarga.status_layak ??
                                          "BELUM_DINILAI"
                                        }
                                      />
                                    ) : (
                                      <Badge variant="outline">
                                        Belum Dinilai
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        {warga.length > 5 && (
                          <div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                              Menampilkan 5 dari {warga.length} warga.{" "}
                              <a
                                href="/warga"
                                className="text-primary hover:underline"
                              >
                                Lihat semua
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="validasi">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    title="Menunggu Validasi"
                    value={totalMenungguValidasi}
                    icon={<Clock className="h-4 w-4" />}
                    description="Penilaian yang menunggu keputusan"
                    trendColor="text-yellow-600"
                  />
                  <StatCard
                    title="Disetujui"
                    value={totalDisetujui}
                    icon={<CheckCircle className="h-4 w-4" />}
                    description="Penilaian yang telah disetujui"
                    trendColor="text-green-600"
                  />
                  <StatCard
                    title="Ditolak"
                    value={totalDitolak}
                    icon={<XCircle className="h-4 w-4" />}
                    description="Penilaian yang telah ditolak"
                    trendColor="text-red-600"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </GlobalContext.Provider>
    </SidebarProvider>
  );
};

/* ============================================================
 * COMPONENTS
 * ============================================================ */
function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendUp = true,
  trendColor = "text-green-600", // Tambahkan prop untuk warna trend
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  trendColor?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center text-xs mt-2 ${trendColor}`}>
            <TrendingUp
              className={`h-3 w-3 mr-1 ${!trendUp && "rotate-180"}`}
            />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "LAYAK" || status === "DISETUJUI"
      ? "default"
      : status === "TIDAK_LAYAK" || status === "DITOLAK"
      ? "destructive"
      : status === "MENUNGGU"
      ? "secondary"
      : "outline";

  return <Badge variant={variant}>{status}</Badge>;
}
