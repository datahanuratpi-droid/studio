
"use client"

import * as React from "react"
import { 
  Mail, 
  FileText, 
  Archive, 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  Send
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const stats = [
    { label: "Surat Masuk", value: "24", icon: <Inbox />, color: "text-blue-600", bg: "bg-blue-100", trend: "+12%" },
    { label: "Laporan Baru", value: "8", icon: <FileText />, color: "text-green-600", bg: "bg-green-100", trend: "+5%" },
    { label: "Arsip Total", value: "1.248", icon: <Archive />, color: "text-purple-600", bg: "bg-purple-100", trend: "+2" },
    { label: "Saldo Kas", value: "Rp 12.5M", icon: <Wallet />, color: "text-amber-600", bg: "bg-amber-100", trend: "-Rp 500k" },
  ]

  const recentActivities = [
    { type: "Surat", title: "Undangan Rapat Dinas", time: "2 jam yang lalu", status: "Received" },
    { type: "Laporan", title: "Laporan Mingguan IT", time: "5 jam yang lalu", status: "Submitted" },
    { type: "Keuangan", title: "Pembayaran Listrik Kantor", time: "1 hari yang lalu", status: "Paid" },
    { type: "User", title: "User Baru: Ahmad Yani", time: "2 hari yang lalu", status: "Pending" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Dashboard Overview</h1>
        <p className="text-muted-foreground">Ringkasan status operasional sistem OfficeFlow hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-lg", stat.bg)}>
                  {React.cloneElement(stat.icon as React.ReactElement, { className: cn("h-6 w-6", stat.color) })}
                </div>
                <Badge variant="secondary" className="text-[10px]">{stat.trend}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts / Status */}
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" /> Status Kegiatan
            </CardTitle>
            <CardDescription>Ringkasan progres pekerjaan kantor bulan ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Penyelesaian Laporan</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Verifikasi Surat Keluar</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Update Arsip Digital</span>
                <span>40%</span>
              </div>
              <Progress value={40} className="h-2" />
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
            <div className="divide-y">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{activity.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access or Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 flex items-start gap-4">
          <div className="p-2 bg-accent/20 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h4 className="font-bold text-primary">Semua sistem normal</h4>
            <p className="text-sm text-muted-foreground">Tidak ada gangguan server yang dilaporkan dalam 24 jam terakhir.</p>
          </div>
        </div>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4">
          <div className="p-2 bg-amber-200 rounded-full">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-700">3 User Menunggu Verifikasi</h4>
            <p className="text-sm text-amber-600/80">Segera cek menu Manajemen User untuk menyetujui akses pendaftar baru.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
