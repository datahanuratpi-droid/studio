
"use client"

import * as React from "react"
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function KasOfficePage() {
  const transactions = [
    { id: "1", date: "2024-03-20", desc: "Bayar Token Listrik", amount: "500.000", type: "Expense", category: "Operasional" },
    { id: "2", date: "2024-03-19", desc: "Dana Takis Project A", amount: "2.500.000", type: "Income", category: "Project" },
    { id: "3", date: "2024-03-18", desc: "Kasbon: Rian Syah", amount: "1.000.000", type: "Expense", category: "Kasbon" },
    { id: "4", date: "2024-03-01", desc: "Gaji Maret - John Doe", amount: "7.500.000", type: "Expense", category: "Salary" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Kas Office</h1>
          <p className="text-muted-foreground">Kelola keuangan rutin, kasbon, dan slip gaji.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full"><FileText className="mr-2 h-4 w-4" /> Slip Gaji</Button>
           <Button className="bg-accent hover:bg-accent/90 text-white rounded-full"><Plus className="mr-2 h-4 w-4" /> Transaksi</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-white/20 rounded-lg"><Wallet className="h-6 w-6" /></div>
              <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Saldo</span>
            </div>
            <p className="text-3xl font-bold">Rp 45.250.000</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp className="h-6 w-6" /></div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pemasukan (Bulan ini)</span>
            </div>
            <p className="text-3xl font-bold text-primary">Rp 12.000.000</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600"><TrendingDown className="h-6 w-6" /></div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pengeluaran (Bulan ini)</span>
            </div>
            <p className="text-3xl font-bold text-primary">Rp 8.450.000</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
            <TabsTrigger value="kasbon">Kasbon</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Jumlah (Rp)</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                    <TableCell className="font-medium">{t.desc}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono font-bold">{t.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {t.type === 'Income' ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        <span className={t.type === 'Income' ? "text-green-600" : "text-red-600"}>{t.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Buka</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
