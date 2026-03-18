"use client"

import * as React from "react"
import { 
  FileText, 
  Wallet, 
  Clock,
  RefreshCw,
  Loader2,
  Inbox,
  ArrowRight,
  AlertCircle,
  Library,
  Users,
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
    { label: "Surat Masuk", value: suratMasukCount.toString(), icon: <Inbox />, color: "text-blue-600", bg: "bg-blue-50", href: "/dashboard/surat/masuk" },
    { label: "Laporan Kegiatan", value: laporanCount.toString(), icon: <FileText />, color: "text-green-600", bg: "bg-green-50", href: "/dashboard/laporan" },
    { label: "Saldo Kas Office", value: `Rp ${totalSaldo.toLocaleString('id-ID')}`, icon: <Wallet />, color: "text-amber-600", bg: "bg-amber-50", href: "/dashboard/kas" },
    { label: "Pustaka Hanura", value: pustakaCount.toString(), icon: <Library />, color: "text-purple-600", bg: "bg-purple-50", href: "/dashboard/pustaka" },
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
      .slice(0, 5)
  }, [letters, reports, transactions, library])

  if (loadingLetters || loadingReports || loadingTrans || loadingUsers || loadingLibrary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black font-headline text-primary uppercase tracking-tighter">Dashboard Utama</h1>
          <p className="text-sm font-medium text-muted-foreground/80 mt-1">Monitoring operasional SITU HANURA secara real-time.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 px-4 py-1.5 animate-pulse rounded-full font-black text-[10px] uppercase tracking-widest">
          <RefreshCw className="h-3 w-3" /> System Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer group rounded-[2rem] overflow-hidden h-full bg-white/80 backdrop-blur-sm">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className={cn("p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6", stat.bg)}>
                    {React.cloneElement(stat.icon as React.ReactElement, { className: cn("h-7 w-7", stat.color) })}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-muted/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-xl md:text-2xl font-black text-primary truncate tracking-tighter" title={stat.value}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Struktur Organisasi Card */}
        <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary p-8 text-white">
            <CardTitle className="font-black font-headline flex items-center gap-3 text-xl uppercase tracking-tight">
              <Users className="h-6 w-6" /> Struktur Pengurus DPC
            </CardTitle>
            <CardDescription className="text-white/70 text-[10px] uppercase tracking-[0.3em] font-black mt-2">Dewan Pimpinan Cabang Kota Tanjungpinang</CardDescription>
          </CardHeader>
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
              <div 
                className="flex flex-col items-center text-center space-y-5 p-8 rounded-[2rem] bg-muted/5 border border-transparent group hover:border-primary/20 transition-all duration-500 hover:bg-white hover:shadow-2xl cursor-pointer"
                onClick={() => setIsReniDetailOpen(true)}
              >
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner font-black text-3xl uppercase">
                  R
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ketua</p>
                  <p className="text-sm font-black text-primary uppercase tracking-tight">RENI, SE</p>
                  <Badge variant="ghost" className="text-[8px] text-accent font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">Lihat Profil</Badge>
                </div>
              </div>

              <div 
                className="flex flex-col items-center text-center space-y-5 p-8 rounded-[2rem] bg-muted/5 border border-transparent group hover:border-primary/20 transition-all duration-500 hover:bg-white hover:shadow-2xl cursor-pointer"
                onClick={() => setIsBeriDetailOpen(true)}
              >
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner font-black text-3xl uppercase">
                  B
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sekretaris</p>
                  <p className="text-sm font-black text-primary uppercase tracking-tight">BERI KURNIAWAN</p>
                  <Badge variant="ghost" className="text-[8px] text-accent font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">Lihat Profil</Badge>
                </div>
              </div>

              <div 
                className="flex flex-col items-center text-center space-y-5 p-8 rounded-[2rem] bg-muted/5 border border-transparent group hover:border-primary/20 transition-all duration-500 hover:bg-white hover:shadow-2xl cursor-pointer"
                onClick={() => setIsEndangDetailOpen(true)}
              >
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner font-black text-3xl uppercase">
                  E
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Bendahara</p>
                  <p className="text-sm font-black text-primary uppercase tracking-tight">ENDANG WIRNANTO</p>
                  <Badge variant="ghost" className="text-[8px] text-accent font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all duration-300 mt-2">Lihat Profil</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktivitas Terkini Card */}
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col bg-white">
          <CardHeader className="bg-muted/10 p-7 border-b">
            <CardTitle className="font-black font-headline flex items-center gap-2 text-lg uppercase tracking-tight">
              <Clock className="h-5 w-5 text-accent" /> Aktivitas Terbaru
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest mt-1">Sistem Log Operasional</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/30 max-h-[450px] overflow-y-auto custom-scrollbar">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-5 p-6 hover:bg-primary/5 transition-all duration-300 group">
                  <div className="h-11 w-11 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {activity.type === 'Surat' ? <Inbox className="h-5 w-5 text-blue-500" /> : 
                     activity.type === 'Laporan' ? <FileText className="h-5 w-5 text-green-500" /> : 
                     activity.type === 'Pustaka' ? <Library className="h-5 w-5 text-purple-500" /> :
                     <Wallet className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate text-primary uppercase tracking-tight">{activity.title}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                      {activity.type} • {new Date(activity.time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase shrink-0 py-0.5 px-2 h-5 border-primary/20 text-primary">{activity.status}</Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 text-center opacity-30">
                  <RefreshCw className="h-10 w-10 mb-4 animate-spin-slow" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Belum ada aktivitas.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {pendingUsers > 0 && (
        <Link href="/dashboard/users" className="block animate-in zoom-in-95 duration-500">
          <div className="p-6 md:p-8 bg-amber-50 rounded-[2rem] border-2 border-amber-200 shadow-lg flex items-center gap-6 hover:bg-amber-100 transition-all group overflow-hidden relative">
            <div className="p-5 bg-amber-200 rounded-2xl text-amber-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 z-10">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="flex-1 min-w-0 z-10">
              <h4 className="font-black text-amber-900 text-lg uppercase tracking-tight">{pendingUsers} User Baru Menunggu Verifikasi</h4>
              <p className="text-xs font-bold text-amber-700/80 uppercase tracking-widest mt-1">Segera berikan akses akses kepada pendaftar baru.</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-200/50 flex items-center justify-center group-hover:translate-x-2 transition-all duration-500 z-10">
              <ArrowRight className="h-6 w-6 text-amber-600" />
            </div>
            {/* Background Decorative Element */}
            <Users className="absolute -right-8 -bottom-8 h-40 w-40 text-amber-200/20 rotate-12" />
          </div>
        </Link>
      )}

      {/* Dialog Detail Rincian Pengurus (Reni, SE) */}
      <Dialog open={isReniDetailOpen} onOpenChange={setIsReniDetailOpen}>
        <DialogContent className="w-[90vw] sm:max-w-[500px] p-0 border-none rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
          <DialogHeader className="p-10 bg-primary text-white text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md font-black text-2xl text-white uppercase shadow-lg">
                R
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">RENI, SE</DialogTitle>
                <DialogDescription className="text-white/80 font-black uppercase text-[10px] tracking-[0.2em] mt-1">
                  Ketua DPC Hanura Tanjungpinang
                </DialogDescription>
              </div>
            </div>
            <ShieldCheck className="absolute top-0 right-0 p-8 opacity-10 w-48 h-48 pointer-events-none" />
          </DialogHeader>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-black text-primary text-sm uppercase">Reni</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Jenis Kelamin</p>
                <p className="font-black text-primary text-sm uppercase">Perempuan</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">No KTA Partai</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <p className="font-mono text-sm font-black text-primary tracking-tighter">21.72.04.1005.000003</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">NIK KTP</p>
                <p className="font-mono text-sm font-black text-primary tracking-tighter">2172036010850001</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tempat / Tgl Lahir</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <p className="font-black text-primary text-sm uppercase">Tanjungpinang, 20 Oktober 1985</p>
                </div>
              </div>
            </div>

            <Separator className="bg-muted/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Agama</p>
                <p className="font-black text-primary text-sm uppercase">Buddha</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status Perkawinan</p>
                <p className="font-black text-primary text-sm uppercase">Belum Menikah</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Alamat Lengkap</p>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <p className="font-black text-primary leading-relaxed text-sm uppercase">Jalan Rawasari No 73, Kota Tanjungpinang</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Profil Terverifikasi SITU</span>
            </div>
            <button 
              onClick={() => setIsReniDetailOpen(false)}
              className="w-full sm:w-auto px-10 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Sekretaris (Beri Kurniawan) */}
      <Dialog open={isBeriDetailOpen} onOpenChange={setIsBeriDetailOpen}>
        <DialogContent className="w-[90vw] sm:max-w-[500px] p-0 border-none rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
          <DialogHeader className="p-10 bg-primary text-white text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md font-black text-2xl text-white uppercase shadow-lg">
                B
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">BERI KURNIAWAN</DialogTitle>
                <DialogDescription className="text-white/80 font-black uppercase text-[10px] tracking-[0.2em] mt-1">
                  Sekretaris DPC Hanura Tanjungpinang
                </DialogDescription>
              </div>
            </div>
            <ShieldCheck className="absolute top-0 right-0 p-8 opacity-10 w-48 h-48 pointer-events-none" />
          </DialogHeader>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-black text-primary text-sm uppercase">Beri Kurniawan</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Jenis Kelamin</p>
                <p className="font-black text-primary text-sm uppercase">Laki-Laki</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">No KTA Partai</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <p className="font-mono text-sm font-black text-primary tracking-tighter">21.72.04.1005.000071</p>
                </div>
              </div>
            </div>

            <Separator className="bg-muted/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Agama</p>
                <p className="font-black text-primary text-sm uppercase">Islam</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lahir</p>
                <p className="font-black text-primary text-sm uppercase">23 Januari 1988</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Profil Terverifikasi SITU</span>
            </div>
            <button 
              onClick={() => setIsBeriDetailOpen(false)}
              className="w-full sm:w-auto px-10 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Bendahara (Endang Wirnanto) */}
      <Dialog open={isEndangDetailOpen} onOpenChange={setIsEndangDetailOpen}>
        <DialogContent className="w-[90vw] sm:max-w-[500px] p-0 border-none rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
          <DialogHeader className="p-10 bg-primary text-white text-left relative overflow-hidden">
            <div className="relative z-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md font-black text-2xl text-white uppercase shadow-lg">
                E
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">ENDANG WIRNANTO</DialogTitle>
                <DialogDescription className="text-white/80 font-black uppercase text-[10px] tracking-[0.2em] mt-1">
                  Bendahara DPC Hanura Tanjungpinang
                </DialogDescription>
              </div>
            </div>
            <ShieldCheck className="absolute top-0 right-0 p-8 opacity-10 w-48 h-48 pointer-events-none" />
          </DialogHeader>

          <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                <p className="font-black text-primary text-sm uppercase">Endang Wirnanto</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">No KTA Partai</p>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-accent" />
                  <p className="font-mono text-sm font-black text-primary tracking-tighter">21.72.04.1005.000131</p>
                </div>
              </div>
            </div>
            
            <Separator className="bg-muted/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tempat / Tgl Lahir</p>
                <p className="font-black text-primary text-sm uppercase">Kota Berapak, 20 Feb 1968</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Agama</p>
                <p className="font-black text-primary text-sm uppercase">Islam</p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-muted/20 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Profil Terverifikasi SITU</span>
            </div>
            <button 
              onClick={() => setIsEndangDetailOpen(false)}
              className="w-full sm:w-auto px-10 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl"
            >
              Tutup
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
