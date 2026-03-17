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
  AlertCircle
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

  const lettersRef = useMemoFirebase(() => collection(firestore, "correspondences"), [firestore])
  const reportsRef = useMemoFirebase(() => collection(firestore, "activity_reports"), [firestore])
  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const usersRef = useMemoFirebase(() => collection(firestore, "users"), [firestore])

  const { data: letters, isLoading: loadingLetters } = useCollection(lettersRef)
  const { data: reports, isLoading: loadingReports } = useCollection(reportsRef)
  const { data: transactions, isLoading: loadingTrans } = useCollection(transRef)
  const { data: users, isLoading: loadingUsers } = useCollection(usersRef)

  const suratMasukCount = letters?.filter(l => l.type === 'Incoming').length || 0
  const laporanCount = reports?.length || 0
  const totalSaldo = transactions?.reduce((acc, curr) => {
    return curr.type === 'Receipt' ? acc + curr.amount : acc - curr.amount
  }, 0) || 0
  
  const pendingUsers = users?.filter(u => u.status === 'Pending Verification').length || 0

  const stats = [
    { label: "Surat Masuk", value: suratMasukCount.toString(), icon: <Inbox />, color: "text-blue-600", bg: "bg-blue-100", href: "/dashboard/surat/masuk" },
    { label: "Laporan Kegiatan", value: laporanCount.toString(), icon: <FileText />, color: "text-green-600", bg: "bg-green-100", href: "/dashboard/laporan" },
    { label: "Saldo Kas Office", value: `Rp ${totalSaldo.toLocaleString('id-ID')}`, icon: <Wallet />, color: "text-amber-600", bg: "bg-amber-100", href: "/dashboard/kas" },
  ]

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group rounded-2xl overflow-hidden">
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
        <Card className="lg:col-span-2 border-none shadow-md rounded-3xl overflow-hidden">
          <CardHeader className="bg-muted/10">
            <CardTitle className="font-headline font-bold flex items-center gap-2 text-lg md:text-xl">
              <TrendingUp className="h-5 w-5 text-accent" /> Progres Operasional
            </CardTitle>
            <CardDescription className="text-xs">Pencapaian target administrasi bulan ini.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2 text-primary"><FileText className="h-4 w-4" /> Laporan</span>
                <span>{laporanCount} / 20</span>
              </div>
              <Progress value={Math.min(100, (laporanCount / 20) * 100)} className="h-3 rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="flex items-center gap-2 text-primary"><Inbox className="h-4 w-4" /> Registrasi Surat</span>
                <span>{suratMasukCount} / 50</span>
              </div>
              <Progress value={Math.min(100, (suratMasukCount / 50) * 100)} className="h-3 rounded-full" />
            </div>
          </CardContent>
        </Card>

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
    </div>
  )
}
