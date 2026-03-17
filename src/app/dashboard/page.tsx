
"use client"

import * as React from "react"
import { 
  FileText, 
  Archive, 
  Wallet, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ArrowRight,
  RefreshCw,
  Loader2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import Link from "next/link"

export default function DashboardPage() {
  const firestore = useFirestore()

  // Real-time Queries: Mendengarkan perubahan data secara langsung dari semua user
  const lettersRef = useMemoFirebase(() => collection(firestore, "correspondences"), [firestore])
  const reportsRef = useMemoFirebase(() => collection(firestore, "activity_reports"), [firestore])
  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const usersRef = useMemoFirebase(() => collection(firestore, "users"), [firestore])

  const { data: letters, isLoading: loadingLetters } = useCollection(lettersRef)
  const { data: reports, isLoading: loadingReports } = useCollection(reportsRef)
  const { data: transactions, isLoading: loadingTrans } = useCollection(transRef)
  const { data: users, isLoading: loadingUsers } = useCollection(usersRef)

  // Hitung Statistik secara dinamis dari data real-time
  const suratMasukCount = letters?.filter(l => l.type === 'Incoming').length || 0
  const laporanCount = reports?.length || 0
  const arsipCount = letters?.length || 0
  const totalSaldo = transactions?.reduce((acc, curr) => {
    return curr.type === 'Receipt' ? acc + curr.amount : acc - curr.amount
  }, 0) || 0
  
  const pendingUsers = users?.filter(u => u.status === 'Pending Verification').length || 0

  const stats = [
    { label: "Surat Masuk", value: suratMasukCount.toString(), icon: <Inbox />, color: "text-blue-600", bg: "bg-blue-100", href: "/dashboard/surat/masuk" },
    { label: "Laporan Kegiatan", value: laporanCount.toString(), icon: <FileText />, color: "text-green-600", bg: "bg-green-100", href: "/dashboard/laporan" },
    { label: "Total Arsip", value: arsipCount.toString(), icon: <Archive />, color: "text-purple-600", bg: "bg-purple-100", href: "/dashboard/arsip" },
    { label: "Saldo Kas", value: `Rp ${totalSaldo.toLocaleString('id-ID')}`, icon: <Wallet />, color: "text-amber-600", bg: "bg-amber-100", href: "/dashboard/kas" },
  ]

  // Gabungkan aktivitas terbaru dari semua koleksi untuk monitoring real-time
  const recentActivities = React.useMemo(() => {
    const all = [
      ...(letters || []).map(l => ({ id: l.id, type: 'Surat', title: l.subject, time: l.createdAt, status: l.status })),
      ...(reports || []).map(r => ({ id: r.id, type: 'Laporan', title: r.title, time: r.createdAt, status: r.status })),
      ...(transactions || []).map(t => ({ id: t.id, type: 'Keuangan', title: t.description, time: t.createdAt, status: 'Recorded' }))
    ]
    return all
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 6)
  }, [letters, reports, transactions])

  if (loadingLetters || loadingReports || loadingTrans || loadingUsers) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitoring operasional SITU HANURA secara real-time antar pengguna.</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 bg-green-50 text-green-700 border-green-200 px-3 py-1">
          <RefreshCw className="h-3 w-3 animate-spin-slow" /> Tersinkronisasi
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-none shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg", stat.bg)}>
                    {React.cloneElement(stat.icon as React.ReactElement, { className: cn("h-6 w-6", stat.color) })}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline font-bold flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-accent" /> Progres Operasional Real-time
            </CardTitle>
            <CardDescription>Visualisasi pencapaian target administrasi kantor bulan ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Laporan Kegiatan</span>
                <span className="text-primary">{laporanCount} / 20</span>
              </div>
              <Progress value={Math.min(100, (laporanCount / 20) * 100)} className="h-3" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="flex items-center gap-2"><Inbox className="h-4 w-4 text-primary" /> Registrasi Surat</span>
                <span className="text-primary">{suratMasukCount} / 50</span>
              </div>
              <Progress value={Math.min(100, (suratMasukCount / 50) * 100)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline font-bold flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-accent" /> Aktivitas Terkini
            </CardTitle>
            <CardDescription>Input terbaru dari seluruh petugas.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[420px] overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    {activity.type === 'Surat' ? <Inbox className="h-5 w-5 text-blue-500" /> : 
                     activity.type === 'Laporan' ? <FileText className="h-5 w-5 text-green-500" /> : 
                     <Wallet className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-primary">{activity.title}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {activity.type} • {new Date(activity.time).toLocaleTimeString('id-ID')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold shrink-0">{activity.status}</Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  <Archive className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  Belum ada aktivitas tercatat hari ini.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-xl border-l-4 border-l-accent shadow-sm flex items-start gap-4">
          <div className="p-2 bg-accent/10 rounded-full">
            <CheckCircle2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h4 className="font-bold text-primary">Server SITU HANURA Online</h4>
            <p className="text-sm text-muted-foreground">Seluruh data tersinkronisasi antar user secara real-time.</p>
          </div>
        </div>
        {pendingUsers > 0 && (
          <Link href="/dashboard/users" className="p-5 bg-amber-50 rounded-xl border-l-4 border-l-amber-400 shadow-sm flex items-start gap-4 hover:bg-amber-100 transition-colors group">
            <div className="p-2 bg-amber-200 rounded-full animate-pulse">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-700">{pendingUsers} User Baru Menunggu Verifikasi</h4>
              <p className="text-sm text-amber-600/80">Klik di sini untuk memberikan akses ke pendaftar baru.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-amber-400 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}
      </div>
    </div>
  )
}
