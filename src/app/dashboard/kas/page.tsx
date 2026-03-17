
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
  Filter,
  Loader2,
  Banknote,
  Receipt,
  AlertCircle,
  Info,
  Printer,
  ChevronRight,
  Download,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { FinancialTransaction } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export default function KasOfficePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>("Payment")
  const [activeTab, setActiveTab] = React.useState("all")
  const [recipientName, setRecipientName] = React.useState("")
  const [viewingSlip, setViewingSlip] = React.useState<FinancialTransaction | null>(null)
  
  const firestore = useFirestore()
  const { user } = useUser()

  const transRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "financial_transactions")
  }, [firestore])

  const { data: transactions, isLoading } = useCollection<FinancialTransaction>(transRef)

  // Hitung total kasbon aktif untuk nama tertentu
  const outstandingKasbon = React.useMemo(() => {
    if (!recipientName || !transactions) return 0
    return transactions
      .filter(t => t.type === 'CashAdvance' && t.description.toLowerCase().includes(recipientName.toLowerCase()))
      .reduce((acc, curr) => acc + curr.amount, 0)
  }, [recipientName, transactions])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get("amount") as string)
    const baseDescription = formData.get("description") as string
    const personName = formData.get("recipientName") as string
    const personPosition = formData.get("position") as string
    
    let finalDescription = baseDescription
    let finalAmount = amount

    if (selectedType === 'SalarySlip') {
      // Jika ada kasbon, kurangi otomatis
      if (outstandingKasbon > 0) {
        finalAmount = amount - outstandingKasbon
        finalDescription = `Slip Gaji: ${personName} (${personPosition}) - ${baseDescription} (Potongan Kasbon: Rp ${outstandingKasbon.toLocaleString('id-ID')})`
      } else {
        finalDescription = `Slip Gaji: ${personName} (${personPosition}) - ${baseDescription}`
      }
    } else if (selectedType === 'CashAdvance') {
      finalDescription = `Kasbon: ${personName} (${personPosition}) - ${baseDescription}`
    }

    const data = {
      amount: finalAmount,
      transactionDate: new Date().toISOString(),
      description: finalDescription,
      type: selectedType as any,
      categoryId: "Routine",
      recordedByUserId: user.uid,
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "financial_transactions"), data)
    setIsDialogOpen(false)
    setRecipientName("")
  }

  const totalSaldo = transactions?.reduce((acc, curr) => {
    if (curr.type === 'Receipt') return acc + curr.amount
    return acc - curr.amount
  }, 0) || 0

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return []
    if (activeTab === "all") return transactions
    if (activeTab === "rutin") return transactions.filter(t => t.type === 'Receipt' || t.type === 'Payment')
    if (activeTab === "kasbon") return transactions.filter(t => t.type === 'CashAdvance')
    if (activeTab === "gaji") return transactions.filter(t => t.type === 'SalarySlip')
    return transactions
  }, [transactions, activeTab])

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  )

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Kas Office</h1>
          <p className="text-muted-foreground">Monitoring Slip Gaji, Transaksi Rutin, dan Kasbon Sekretariat.</p>
        </div>
        <div className="flex gap-2">
           <Button 
            variant="outline"
            className="rounded-full px-6 border-primary text-primary hover:bg-primary/5"
            onClick={() => {
              setSelectedType("SalarySlip")
              setRecipientName("")
              setIsDialogOpen(true)
            }}
           >
            <Printer className="mr-2 h-4 w-4" /> Buat Slip Gaji
           </Button>
           <Button 
            className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 shadow-lg transition-transform hover:scale-105"
            onClick={() => {
              setSelectedType("Payment")
              setRecipientName("")
              setIsDialogOpen(true)
            }}
           >
            <Plus className="mr-2 h-4 w-4" /> Catat Transaksi Baru
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><Wallet className="h-6 w-6" /></div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Saldo Kas</span>
            </div>
            <p className="text-3xl font-bold font-headline">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          </CardContent>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="h-24 w-24" />
          </div>
        </Card>
        
        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Pemasukan</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type === 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="h-6 w-6" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Pengeluaran</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type !== 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <TabsList className="bg-white border p-1 rounded-2xl shadow-sm h-12">
            <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Semua</TabsTrigger>
            <TabsTrigger value="rutin" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Transaksi Rutin</TabsTrigger>
            <TabsTrigger value="kasbon" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Kasbon</TabsTrigger>
            <TabsTrigger value="gaji" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Slip Gaji</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-white text-[10px] font-bold py-1.5 uppercase tracking-widest px-4">
              {sortedTransactions.length} Data Ditemukan
            </Badge>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Tanggal</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Keterangan Transaksi</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Jumlah (Rp)</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-widest py-5">Kategori / Tipe</TableHead>
                  <TableHead className="text-right font-bold text-xs uppercase tracking-widest py-5">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sinkronisasi Data Kas...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedTransactions.length > 0 ? (
                  sortedTransactions.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/10 transition-colors">
                      <TableCell className="text-xs font-medium text-muted-foreground">
                        {new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-primary">{t.description}</p>
                      </TableCell>
                      <TableCell>
                        <span className={t.type === 'Receipt' ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                          {t.type === 'Receipt' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {t.type === 'Receipt' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">PEMASUKAN</Badge>}
                          {t.type === 'Payment' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px]">RUTIN</Badge>}
                          {t.type === 'CashAdvance' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px]">KASBON</Badge>}
                          {t.type === 'SalarySlip' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none text-[10px]">GAJI</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.type === 'SalarySlip' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-full text-[10px] font-bold uppercase tracking-tighter border-primary text-primary hover:bg-primary/10 h-8"
                            onClick={() => setViewingSlip(t)}
                          >
                            <Printer className="mr-1.5 h-3 w-3" /> Cetak Slip
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-bold uppercase tracking-tighter h-8">Buka Detail</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-32 text-muted-foreground">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Receipt className="h-16 w-16" />
                        <p className="font-bold uppercase tracking-widest text-xs">Belum ada data di kategori ini</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Preview Slip Gaji */}
      <Dialog open={!!viewingSlip} onOpenChange={() => setViewingSlip(null)}>
        <DialogContent className="sm:max-w-[650px] p-0 border-none rounded-3xl overflow-hidden print:shadow-none">
          {viewingSlip && (
            <div className="bg-white">
              <div className="p-8 space-y-8 print:p-0">
                <div className="flex flex-col items-center text-center space-y-2 border-b-2 border-primary pb-6">
                   <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
                     <FileText className="h-10 w-10 text-white" />
                   </div>
                   <h2 className="text-2xl font-headline font-bold text-primary">SLIP GAJI KARYAWAN</h2>
                   <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">DPC PARTAI HANURA KOTA TANJUNGPINANG</p>
                   <p className="text-[10px] text-muted-foreground">Jalan Gatot Subroto Km 5 Tanjungpinang</p>
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Detail Penerima</p>
                      <p className="font-bold text-primary text-lg">{viewingSlip.description.split(' - ')[0].replace('Slip Gaji: ', '')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Tanggal Pembayaran</p>
                      <p className="font-medium">{new Date(viewingSlip.transactionDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                  <div className="space-y-4 text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ID Transaksi</p>
                      <p className="font-mono text-xs uppercase">{viewingSlip.id.substring(0, 8)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Status</p>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[9px] font-bold">LUNAS / DIBAYARKAN</Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white pb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Keterangan Item</span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Jumlah</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">Gaji Pokok & Tunjangan</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{viewingSlip.description.split(' - ')[1]?.split(' (Potongan')[0] || "Periode Berjalan"}</span>
                    </div>
                    <span className="font-bold">Rp {(viewingSlip.amount + (viewingSlip.description.includes('Potongan Kasbon') ? parseInt(viewingSlip.description.match(/Rp ([\d.]+)/)?.[1].replace(/\./g, '') || "0") : 0)).toLocaleString('id-ID')}</span>
                  </div>

                  {viewingSlip.description.includes('Potongan Kasbon') && (
                    <div className="flex justify-between items-center text-red-600">
                      <div className="flex flex-col">
                        <span className="font-bold">Potongan Kasbon / Pinjaman</span>
                        <span className="text-[10px] opacity-70 uppercase">Pengurangan Otomatis</span>
                      </div>
                      <span className="font-bold">- Rp {viewingSlip.description.match(/Rp ([\d.]+)/)?.[1] || "0"}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-primary flex justify-between items-center">
                    <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">Total Gaji Bersih (Take Home Pay)</span>
                    <span className="text-2xl font-headline font-bold text-primary">Rp {viewingSlip.amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
                  <div className="space-y-16">
                    <p className="font-bold text-muted-foreground uppercase tracking-widest">Penerima,</p>
                    <div className="space-y-1">
                      <p className="font-bold border-b border-primary inline-block min-w-[150px]">{viewingSlip.description.split(' (')[0].replace('Slip Gaji: ', '').split(' - ')[0]}</p>
                      <p className="text-[10px] text-muted-foreground">Petugas Terkait</p>
                    </div>
                  </div>
                  <div className="space-y-16">
                    <p className="font-bold text-muted-foreground uppercase tracking-widest">Bendahara DPC,</p>
                    <div className="space-y-1">
                      <p className="font-bold border-b border-primary inline-block min-w-[150px]">BENDAHARA DPC</p>
                      <p className="text-[10px] text-muted-foreground">Hanura Tanjungpinang</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <p className="text-[9px] text-muted-foreground font-medium italic">"Terima kasih atas dedikasi Anda untuk kemajuan Partai Hanura Kota Tanjungpinang."</p>
                </div>
              </div>
              <DialogFooter className="bg-muted/20 p-6 print:hidden">
                <Button variant="outline" onClick={() => setViewingSlip(null)} className="rounded-full">Tutup</Button>
                <Button onClick={handlePrint} className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 font-bold">
                  <Printer className="mr-2 h-4 w-4" /> Cetak Sekarang
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-primary">Catat Transaksi Kas</DialogTitle>
              <DialogDescription>
                Input data keuangan untuk Slip Gaji, Transaksi Rutin, atau Kasbon.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="type" className="font-bold text-sm">Kategori Transaksi</Label>
                <Select onValueChange={setSelectedType} value={selectedType}>
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Receipt">Pemasukan (Receipt)</SelectItem>
                    <SelectItem value="Payment">Pengeluaran Rutin (Payment)</SelectItem>
                    <SelectItem value="CashAdvance">Pinjaman / Kasbon (Cash Advance)</SelectItem>
                    <SelectItem value="SalarySlip">Pembayaran Gaji (Salary Slip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedType === 'SalarySlip' || selectedType === 'CashAdvance') && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid gap-2">
                    <Label htmlFor="recipientName" className="font-bold text-sm">Nama Lengkap</Label>
                    <Input 
                      id="recipientName" 
                      name="recipientName" 
                      placeholder="Nama Penerima" 
                      required 
                      className="h-12 rounded-2xl"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="position" className="font-bold text-sm">Jabatan</Label>
                    <Input id="position" name="position" placeholder="Contoh: Staff IT" required className="h-12 rounded-2xl" />
                  </div>
                </div>
              )}

              {selectedType === 'SalarySlip' && recipientName && outstandingKasbon > 0 && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 animate-in zoom-in duration-300">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="font-bold text-xs uppercase tracking-wider">Deteksi Kasbon Aktif</AlertTitle>
                  <AlertDescription className="text-xs">
                    Ditemukan pinjaman sebesar <strong>Rp {outstandingKasbon.toLocaleString('id-ID')}</strong> untuk {recipientName}. 
                    Jumlah ini akan <strong>dikurangi secara otomatis</strong> dari total gaji saat disimpan.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="amount" className="font-bold text-sm">
                  {selectedType === 'SalarySlip' ? "Total Gaji Kotor (Rp)" : "Jumlah (Rp)"}
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                  <Input id="amount" name="amount" type="number" placeholder="0" required className="h-12 pl-12 rounded-2xl font-bold" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-bold text-sm">Keterangan Keperluan</Label>
                <Input id="description" name="description" placeholder="Contoh: Gaji Bulan Januari / Keperluan Mendesak" required className="h-12 rounded-2xl" />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full px-6">Batal</Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 font-bold">
                Simpan Transaksi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
