
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
  ArrowRight
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const firestore = useFirestore()

  // Real-time Queries
  const lettersRef = useMemoFirebase(() => collection(firestore, "correspondences"), [firestore])
  const reportsRef = useMemoFirebase(() => collection(firestore, "activity_reports"), [firestore])
  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const usersRef = useMemoFirebase(() => collection(firestore, "users"), [firestore])

  const { data: letters, isLoading: loadingLetters } = useCollection(lettersRef)
  const { data: reports, isLoading: loadingReports } = useCollection(reportsRef)
  const { data: transactions, isLoading: loadingTrans } = useCollection(transRef)
  const { data: users, isLoading: loadingUsers } = useCollection(usersRef)

  // Calculate Stats
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

  // Combine recent activities from different sources
  const recentActivities = React.useMemo(() => {
    const all = [
      ...(letters || []).map(l => ({ ...l, actType: 'Surat', displayTitle: l.subject, time: l.createdAt })),
      ...(reports || []).map(r => ({ ...r, actType: 'Laporan', displayTitle: r.title, time: r.createdAt })),
      ...(transactions || []).map(t => ({ ...t, actType: 'Keuangan', displayTitle: t.description, time: t.createdAt }))
    ]
    return all
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5)
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
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground">Ringkasan status operasional SITU HANURA secara real-time hari ini.</p>
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
        {/* Main Status */}
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> Progres Operasional
            </CardTitle>
            <CardDescription>Estimasi penyelesaian target administrasi bulan ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Penyelesaian Laporan</span>
                <span>{Math.min(100, Math.round((laporanCount / 20) * 100))}%</span>
              </div>
              <Progress value={Math.min(100, (laporanCount / 20) * 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Registrasi Surat Masuk</span>
                <span>{Math.min(100, Math.round((suratMasukCount / 50) * 100))}%</span>
              </div>
              <Progress value={Math.min(100, (suratMasukCount / 50) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" /> Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{activity.displayTitle}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{activity.actType} • {new Date(activity.time).toLocaleTimeString()}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0">{activity.status}</Badge>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Belum ada aktivitas tercatat.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-start gap-4">
          <div className="p-2 bg-accent/20 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="font-bold text-primary">Sistem SITU HANURA Aktif</h4>
            <p className="text-sm text-muted-foreground">Koneksi database real-time berjalan normal.</p>
          </div>
        </div>
        {pendingUsers > 0 && (
          <Link href="/dashboard/users" className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4 hover:bg-amber-100 transition-colors">
            <div className="p-2 bg-amber-200 rounded-full">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-700">{pendingUsers} User Menunggu Verifikasi</h4>
              <p className="text-sm text-amber-600/80">Segera berikan akses pendaftar baru di Manajemen User.</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}
