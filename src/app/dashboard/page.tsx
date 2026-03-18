"use client"

import * as React from "react"
import { 
  FileText, 
  Wallet, 
  TrendingUp, 
  Clock,
  RefreshCw,
  Loader2,
  Inbox,
  ArrowRight,
  AlertCircle,
  Library,
  Users,
  User as UserIcon,
  ShieldCheck,
  MapPin,
  Calendar,
  CreditCard,
  UserCheck
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

// Custom Female Child Icon
const GirlIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M12 11c-3.5 0-6 2.5-6 6v2h12v-2c0-3.5-2.5-6-6-6z" />
    <path d="M9 4.5a2 2 0 0 1 6 0" />
    <path d="M7 9l-1 2" />
    <path d="M17 9l1 2" />
  </svg>
);

// Custom Male Child Icon
const BoyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M12 11c-3.5 0-6 2.5-6 6v2h12v-2c0-3.5-2.5-6-6-6z" />
    <path d="M10 3.5c1 0 3 0 4 0" />
  </svg>
);

export default function DashboardPage() {
  const firestore = useFirestore()
  const [isReniDetailOpen, setIsReniDetailOpen] = React.useState(false)
  const [isBeriDetailOpen, setIsBeriDetailOpen] = React.useState(false)
  const [isEndangDetailOpen, setIsEndangDetailOpen] = React.useState(false)

  const lettersRef = useMemoFirebase(() => collection(firestore, "correspondences"), [firestore])
  const reportsRef = useMemoFirebase(() => collection(firestore, "activity_reports"), [firestore])
  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const usersRef = useMemoFirebase(() => collection(firestore, "users"), [firestore])
  const libraryRef = useMemoFirebase(() => collection(firestore, "library_items"), [firestore])

  const { data: letters, isLoading: loadingLetters } = useCollection(lettersRef)
  const { data: reports, isLoading: loadingReports } = useCollection(reportsRef)
  const { data: transactions, isLoading: loadingTrans } = useCollection(transRef)
  const { data: users, isLoading: loadingUsers } = useCollection(usersRef)
  const { data: library, isLoading: loadingLibrary } = useCollection(libraryRef)

  const suratMasukCount = letters?.filter(l => l.type === 'Incoming').length || 0
  const laporanCount = reports?.length || 0
  const pustakaCount = library?.length || 0
  const totalSaldo = transactions?.reduce((acc, curr) => {
    return curr.type === 'Receipt' ? acc + curr.amount : acc - curr.amount
  }, 0) || 0
  
  const pendingUsers = users?.filter(u => u.status === 'Pending Verification').length || 0

  const stats = [
    { label: "Surat Masuk", value: suratMasukCount.toString(), icon: <Inbox />, color: "text-blue-600", bg: "bg-blue-100", href: "/dashboard/surat/masuk" },
    { label: "Laporan Kegiatan", value: laporanCount.toString(), icon: <FileText />, color: "text-green-600", bg: "bg-green-100", href: "/dashboard/laporan" },
    { label: "Saldo Kas Office", value: `Rp ${totalSaldo.toLocaleString('id-ID')}`, icon: <Wallet />, color: "text-amber-600", bg: "bg-amber-100", href: "/dashboard/kas" },
    { label: "Pustaka Hanura", value: pustakaCount.toString(), icon: <Library />, color: "text-purple-600", bg: "bg-purple-100", href: "/dashboard/pustaka" },
  ]

  const recentActivities = React.useMemo(() => {
    const all = [
      ...(letters || []).map(l => ({ id: l.id, type: 'Surat', title: l.subject, time: l.createdAt, status: l.status })),
      ...(reports || []).map(r => ({ id: r.id, type: 'Laporan', title: r.title, time: r.createdAt, status: r.status })),
      ...(transactions || []).map(t => ({ id: t.id, type: 'Keuangan', title: t.description, time: t.createdAt, status: 'Recorded' })),
      ...(library || []).map(lib => ({ id: lib.id, type: 'Pustaka', title: lib.title, time: lib.createdAt, status: 'Added' }))
    ]
    return all
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6)
  }, [letters, reports, transactions, library])

  if (loadingLetters || loadingReports || loadingLetters || loadingUsers || loadingLibrary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitoring operasional SITU HANURA secara real-time.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 px-3 py-1 animate-pulse">
          <RefreshCw className="h-3 w-3" /> Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-2xl overflow-hidden h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                    {React.cloneElement(stat.icon as React.ReactElement, { className: cn("h-6 w-6", stat.color) })}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-bold text-primary truncate" title={stat.value}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Pengurus Card */}
        <Card className="lg:col-span-2 border-none shadow-md rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-primary text-white">
            <CardTitle className="font-headline font-bold flex items-center gap-2 text-lg md:text-xl">
              <Users className="h-5 w-5" /> DPC HANURA KOTA TANJUNGPINANG
            </CardTitle>
            <CardDescription className="text-white/70 text-[10px] uppercase tracking-[0.2em] font-bold">Struktur Organisasi Inti</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div 
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl bg-muted/10 border border-border/50 group hover:border-primary transition-all hover:bg-white hover:shadow-xl cursor-pointer"
                onClick={() => setIsReniDetailOpen(true)}
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <GirlIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ketua</p>
                  <p className="text-sm font-black text-primary uppercase">RENI, SE</p>
                  <p className="text-[9px] text-accent font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk detail</p>
                </div>
              </div>

              <div 
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl bg-muted/10 border border-border/50 group hover:border-primary transition-all hover:bg-white hover:shadow-xl cursor-pointer"
                onClick={() => setIsBeriDetailOpen(true)}
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <BoyIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sekretaris</p>
                  <p className="text-sm font-black text-primary uppercase">BERI KURNIAWAN</p>
                  <p className="text-[9px] text-accent font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk detail</p>
                </div>
              </div>

              <div 
                className="flex flex-col items-center text-center space-y-4 p-6 rounded-3xl bg-muted/10 border border-border/50 group hover:border-primary transition-all hover:bg-white hover:shadow-xl cursor-pointer"
                onClick={() => setIsEndangDetailOpen(true)}
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <BoyIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bendahara</p>
                  <p className="text-sm font-black text-primary uppercase">ENDANG WIRNANTO</p>
                  <p className="text-[9px] text-accent font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Klik untuk detail</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card */}
        <Card className="border-none shadow-md rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/10">
            <CardTitle className="font-headline font-bold flex items-center gap-2 text-lg md:text-xl">
              <Clock className="h-5 w-5 text-accent" /> Aktivitas
            </CardTitle>
            <CardDescription className="text-xs">Rekaman aktivitas terbaru sistem.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    {activity.type === 'Surat' ? <Inbox className="h-4 w-4 text-blue-500" /> : 
                     activity.type === 'Laporan' ? <FileText className="h-4 w-4 text-green-500" /> : 
                     activity.type === 'Pustaka' ? <Library className="h-4 w-4 text-purple-500" /> :
                     <Wallet className="h-4 w-4 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-primary">{activity.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                      {activity.type} • {new Date(activity.time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[8px] uppercase font-bold shrink-0 py-0 px-1.5 h-5">{activity.status}</Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="p-12 text-center text-xs text-muted-foreground opacity-50">
                  Belum ada aktivitas.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingUsers > 0 && (
        <Link href="/dashboard/users" className="block animate-in zoom-in duration-500">
          <div className="p-4 md:p-6 bg-amber-50 rounded-2xl border-l-4 border-l-amber-500 shadow-sm flex items-center gap-4 hover:bg-amber-100 transition-all group">
            <div className="p-3 bg-amber-200 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-amber-900 text-sm md:text-base">{pendingUsers} User Baru Menunggu Verifikasi</h4>
              <p className="text-xs text-amber-700/80 truncate">Segera beri akses pendaftar untuk menggunakan sistem.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* Dialog Detail Reni, SE */}
      <Dialog open={isReniDetailOpen} onOpenChange={setIsReniDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <DialogHeader className="p-8 bg-primary text-white text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <GirlIcon />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-headline font-bold">RENI, SE</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase text-[10px] tracking-widest">
                  Ketua DPC Hanura Kota Tanjungpinang
                </DialogDescription>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-bold text-primary">Reni</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jenis Kelamin</p>
                <p className="font-bold text-primary">Perempuan</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No KTA</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-accent" />
                  <p className="font-mono text-sm font-bold text-primary">21.72.04.1005.000003</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NIK</p>
                <p className="font-mono text-sm font-bold text-primary">2172036010850001</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempat / Tgl Lahir</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <p className="font-bold text-primary">Tanjungpinang, 20 Oktober 1985</p>
                </div>
              </div>
            </div>

            <Separator className="bg-muted" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agama</p>
                <p className="font-bold text-primary">Buddha</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status Perkawinan</p>
                <p className="font-bold text-primary">Belum Menikah</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Penerbit KTA</p>
                <p className="font-bold text-primary">Kota Tanjungpinang</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tanggal Disahkan</p>
                <p className="font-bold text-primary">21 Juni 2023</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alamat</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-accent mt-0.5" />
                  <p className="font-bold text-primary leading-relaxed text-sm">Jalan Rawasari No 73</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Data Terverifikasi SITU</span>
            </div>
            <button 
              onClick={() => setIsReniDetailOpen(false)}
              className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail BERI KURNIAWAN */}
      <Dialog open={isBeriDetailOpen} onOpenChange={setIsBeriDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <DialogHeader className="p-8 bg-primary text-white text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <BoyIcon />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-headline font-bold uppercase">BERI KURNIAWAN</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase text-[10px] tracking-widest">
                  Sekretaris DPC Hanura Kota Tanjungpinang
                </DialogDescription>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-bold text-primary uppercase">Beri Kurniawan</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jenis Kelamin</p>
                <p className="font-bold text-primary">Laki-Laki</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No KTA</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-accent" />
                  <p className="font-mono text-sm font-bold text-primary">21.72.04.1005.000071</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NIK</p>
                <p className="font-mono text-sm font-bold text-primary">217203230188001</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempat / Tgl Lahir</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <p className="font-bold text-primary">Tanjungpinang, 23 Januari 1988</p>
                </div>
              </div>
            </div>

            <Separator className="bg-muted" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agama</p>
                <p className="font-bold text-primary">Islam</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status Perkawinan</p>
                <p className="font-bold text-primary">Belum Menikah</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Penerbit KTA</p>
                <p className="font-bold text-primary">Kota Tanjungpinang</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tanggal Disahkan</p>
                <p className="font-bold text-primary">07 April 2023</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alamat</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-accent mt-0.5" />
                  <p className="font-bold text-primary leading-relaxed text-sm">Kampung Bugis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Data Terverifikasi SITU</span>
            </div>
            <button 
              onClick={() => setIsBeriDetailOpen(false)}
              className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail ENDANG WIRNANTO */}
      <Dialog open={isEndangDetailOpen} onOpenChange={setIsEndangDetailOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 border-none rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <DialogHeader className="p-8 bg-primary text-white text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <BoyIcon />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-headline font-bold uppercase">ENDANG WIRNANTO</DialogTitle>
                <DialogDescription className="text-white/80 font-bold uppercase text-[10px] tracking-widest">
                  Bendahara DPC Hanura Kota Tanjungpinang
                </DialogDescription>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck className="w-32 h-32" />
            </div>
          </DialogHeader>

          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-bold text-primary uppercase">Endang Wirnanto</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jenis Kelamin</p>
                <p className="font-bold text-primary">Laki-Laki</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No KTA</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-accent" />
                  <p className="font-mono text-sm font-bold text-primary">21.72.04.1005.000131</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NIK</p>
                <p className="font-mono text-sm font-bold text-primary">2172012002680002</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tempat / Tgl Lahir</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-accent" />
                  <p className="font-bold text-primary">Kota Berapak, 20 Februari 1968</p>
                </div>
              </div>
            </div>

            <Separator className="bg-muted" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agama</p>
                <p className="font-bold text-primary">Islam</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status Perkawinan</p>
                <p className="font-bold text-primary">Menikah</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Penerbit KTA</p>
                <p className="font-bold text-primary">Kota Tanjungpinang</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tanggal Disahkan</p>
                <p className="font-bold text-primary">07 April 2023</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Alamat</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-accent mt-0.5" />
                  <p className="font-bold text-primary leading-relaxed text-sm">Jalan Pantai Impian Gg Lumba-Lumba IV no 103</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-muted/20 border-t flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Data Terverifikasi SITU</span>
            </div>
            <button 
              onClick={() => setIsEndangDetailOpen(false)}
              className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
