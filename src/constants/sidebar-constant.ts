import {
  BookMarked,
  Calendar,
  FileCheck2,
  FileOutput,
  GraduationCap,
  Home,
  Inbox,
  LandPlot,
  ScrollText,
  Search,
  Settings,
  UserRoundCheck,
  UserSquare,
  UsersRound
} from 'lucide-react';

export const MAIN_SIDEBAR_CONSTANTS = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home
  },
  {
    title: 'Data Penduduk',
    url: '/warga',
    icon: UsersRound
  },
  {
    title: 'Penilaian Kelayakan',
    url: '/Penilaian',
    icon: UserSquare
  },
/*   {
    title: 'Pengabdian Masyarakat',
    url: '/pengabdian-masyarakat',
    icon: LandPlot
  } */
];

export const REPORT_SIDEBAR_CONSTANTS = [
  {
    title: 'Upah Minimum Regulasi',
    url: '/umrs',
    icon: BookMarked
  },
 /*  {
    title: 'Laporan Pengabdian Masyarakat',
    url: '/pengabdian-masyarakat-laporan',
    icon: FileCheck2
  },*/
  {
    title: 'Prediksi Ahp-Weights',
    url: '/ahpWeights',
    icon: ScrollText
  },
    {
    title: 'Laporan Kelayakan ',
    url: '/pengabdian-masyarakat-luaran',
    icon: ScrollText
  }, 
];
