"use client"

import * as React from "react"
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Filter,
  Loader2,
  Banknote,
  Receipt,
  Info,
  Printer,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  User as UserIcon,
  Search
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { FinancialTransaction } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function KasOfficePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>("Payment")
  const [activeTab, setActiveTab] = React.useState("all")
  const [recipientName, setRecipientName] = React.useState("")
  const [viewingSlip, setViewingSlip] = React.useState<FinancialTransaction | null>(null)
  const [viewingTransaction, setViewingTransaction] = React.useState<FinancialTransaction | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const transRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "financial_transactions")
  }, [firestore])

  const { data: transactions, isLoading } = useCollection<FinancialTransaction>(transRef)

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
    toast({ title: "Berhasil", description: "Transaksi telah dicatat." })
  }

  const handleDelete = (id: string) => {
    if (!firestore) return
    deleteDocumentNonBlocking(doc(firestore, "financial_transactions", id))
    toast({ title: "Terhapus", description: "Transaksi telah dihapus dari sistem." })
  }

  const totalSaldo = transactions?.reduce((acc, curr) => {
    if (curr.type === 'Receipt') return acc + curr.amount
    return acc - curr.amount
  }, 0) || 0

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return []
    let filtered = transactions
    
    if (activeTab === "rutin") filtered = transactions.filter(t => t.type === 'Receipt' || t.type === 'Payment')
    else if (activeTab === "kasbon") filtered = transactions.filter(t => t.type === 'CashAdvance')
    else if (activeTab === "gaji") filtered = transactions.filter(t => t.type === 'SalarySlip')

    if (searchQuery) {
      filtered = filtered.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return filtered
  }, [transactions, activeTab, searchQuery])

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  )

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 md:space-y-8 print:p-0 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 print:hidden">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">Kas Office</h1>
          <p className="text-sm text-muted-foreground">Monitoring Slip Gaji, Transaksi Rutin, dan Kasbon Sekretariat.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
           <Button 
            variant="outline"
            className="flex-1 lg:flex-none rounded-full px-4 md:px-6 border-primary text-primary hover:bg-primary/5 h-11"
            onClick={() => {
              setSelectedType("SalarySlip")
              setRecipientName("")
              setIsDialogOpen(true)
            }}
           >
            <Printer className="mr-2 h-4 w-4" /> Slip Gaji
           </Button>
           <Button 
            className="flex-1 lg:flex-none bg-accent hover:bg-accent/90 text-white rounded-full px-4 md:px-6 shadow-lg h-11"
            onClick={() => {
              setSelectedType("Payment")
              setRecipientName("")
              setIsDialogOpen(true)
            }}
           >
            <Plus className="mr-2 h-4 w-4" /> Catat Transaksi
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 print:hidden">
        <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><Wallet className="h-6 w-6" /></div>
              <span className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest">Total Saldo Kas</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold font-headline">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          </CardContent>
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="h-20 w-20 md:h-24 md:w-24" />
          </div>
        </Card>
        
        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
              <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Pemasukan</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type === 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="h-6 w-6" /></div>
              <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Pengeluaran</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type !== 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full print:hidden">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white border p-1 rounded-2xl shadow-sm h-12 w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="all" className="rounded-xl flex-1 sm:flex-none px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Semua</TabsTrigger>
              <TabsTrigger value="rutin" className="rounded-xl flex-1 sm:flex-none px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Rutin</TabsTrigger>
              <TabsTrigger value="kasbon" className="rounded-xl flex-1 sm:flex-none px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Kasbon</TabsTrigger>
              <TabsTrigger value="gaji" className="rounded-xl flex-1 sm:flex-none px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Gaji</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:max-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari transaksi..." 
                className="pl-9 h-11 rounded-2xl bg-white border-muted shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between px-2">
            <Badge variant="outline" className="bg-white text-[10px] font-bold py-1 uppercase tracking-widest px-3">
              {sortedTransactions.length} Rekod Ditemukan
            </Badge>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 whitespace-nowrap">Tanggal</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 min-w-[200px]">Keterangan</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 whitespace-nowrap">Jumlah</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase tracking-widest py-5 whitespace-nowrap">Tipe</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest py-5">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin h-10 w-10 text-primary" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sinkronisasi Data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedTransactions.length > 0 ? (
                  sortedTransactions.map((t) => (
                    <TableRow key={t.id} className="hover:bg-muted/5 transition-colors">
                      <TableCell className="text-[10px] md:text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-primary text-xs md:text-sm line-clamp-1">{t.description}</p>
                      </TableCell>
                      <TableCell>
                        <span className={cn("font-bold text-xs md:text-sm", t.type === 'Receipt' ? "text-green-600" : "text-red-600")}>
                          {t.type === 'Receipt' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {t.type === 'Receipt' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[9px] px-2">MASUK</Badge>}
                          {t.type === 'Payment' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[9px] px-2">RUTIN</Badge>}
                          {t.type === 'CashAdvance' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[9px] px-2">KASBON</Badge>}
                          {t.type === 'SalarySlip' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none text-[9px] px-2">GAJI</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl">
                            <DropdownMenuItem onClick={() => setViewingTransaction(t)} className="cursor-pointer rounded-lg">
                              <Eye className="mr-2 h-4 w-4 text-blue-500" /> Lihat Detail
                            </DropdownMenuItem>
                            {t.type === 'SalarySlip' && (
                              <DropdownMenuItem onClick={() => setViewingSlip(t)} className="cursor-pointer rounded-lg">
                                <Printer className="mr-2 h-4 w-4 text-purple-500" /> Cetak Slip
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-red-600 cursor-pointer rounded-lg">
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                      <div className="flex flex-col items-center gap-4 opacity-30">
                        <Receipt className="h-12 w-12" />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Data tidak ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Preview Slip Gaji - Responsive */}
      <Dialog open={!!viewingSlip} onOpenChange={() => setViewingSlip(null)}>
        <DialogContent className="sm:max-w-[650px] p-0 border-none rounded-3xl overflow-hidden print:shadow-none animate-in zoom-in duration-300">
          <DialogHeader className="sr-only">
            <DialogTitle>Pratinjau Slip Gaji</DialogTitle>
            <DialogDescription>Rincian slip gaji karyawan untuk dicetak.</DialogDescription>
          </DialogHeader>
          {viewingSlip && (
            <div className="bg-white overflow-y-auto max-h-[90vh]">
              <div className="p-4 md:p-8 space-y-6 md:space-y-8 print:p-0">
                <div className="flex flex-col items-center text-center space-y-2 border-b-2 border-primary pb-6">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-2xl flex items-center justify-center mb-2">
                     <FileText className="h-8 w-8 md:h-10 md:w-10 text-white" />
                   </div>
                   <h2 className="text-xl md:text-2xl font-headline font-bold text-primary">SLIP GAJI KARYAWAN</h2>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">DPC PARTAI HANURA KOTA TANJUNGPINANG</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 text-xs md:text-sm">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Penerima</p>
                      <p className="font-bold text-primary text-base md:text-lg">{viewingSlip.description.split(' - ')[0].replace('Slip Gaji: ', '')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Tanggal</p>
                      <p className="font-medium">{new Date(viewingSlip.transactionDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                  <div className="space-y-4 md:text-right">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">ID Transaksi</p>
                      <p className="font-mono text-[10px] uppercase">{viewingSlip.id.substring(0, 12)}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[9px] font-bold">LUNAS</Badge>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-4 md:p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-white pb-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Item</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">Gaji Pokok</span>
                    </div>
                    <span className="font-bold">Rp {(viewingSlip.amount + (viewingSlip.description.includes('Potongan Kasbon') ? parseInt(viewingSlip.description.match(/Rp ([\d.]+)/)?.[1].replace(/\./g, '') || "0") : 0)).toLocaleString('id-ID')}</span>
                  </div>

                  {viewingSlip.description.includes('Potongan Kasbon') && (
                    <div className="flex justify-between items-center text-red-600 text-xs md:text-sm">
                      <span className="font-bold">Potongan Kasbon</span>
                      <span className="font-bold">- Rp {viewingSlip.description.match(/Rp ([\d.]+)/)?.[1] || "0"}</span>
                    </div>
                  )}

                  <div className="pt-4 border-t-2 border-primary flex justify-between items-center">
                    <span className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">TOTAL BERSIH</span>
                    <span className="text-xl md:text-2xl font-headline font-bold text-primary">Rp {viewingSlip.amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6 md:pt-12 text-center text-[10px] md:text-xs">
                  <div className="space-y-12 md:space-y-16">
                    <p className="font-bold text-muted-foreground uppercase">Penerima,</p>
                    <p className="font-bold border-b border-primary inline-block min-w-[100px] md:min-w-[150px]">{viewingSlip.description.split(' (')[0].replace('Slip Gaji: ', '').split(' - ')[0]}</p>
                  </div>
                  <div className="space-y-12 md:space-y-16">
                    <p className="font-bold text-muted-foreground uppercase">Bendahara,</p>
                    <p className="font-bold border-b border-primary inline-block min-w-[100px] md:min-w-[150px]">BENDAHARA DPC</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="bg-muted/20 p-4 md:p-6 print:hidden">
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={() => setViewingSlip(null)} className="flex-1 rounded-full">Tutup</Button>
                  <Button onClick={handlePrint} className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full font-bold">
                    <Printer className="mr-2 h-4 w-4" /> Cetak
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Input Transaksi Dialog - Responsive */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-xl md:text-2xl font-headline font-bold">Catat Transaksi</DialogTitle>
              <DialogDescription className="text-white/80">Input data keuangan sekretariat.</DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4 md:space-y-5">
              <div className="space-y-2">
                <Label htmlFor="type" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Kategori</Label>
                <Select onValueChange={setSelectedType} value={selectedType}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Receipt">Pemasukan (Receipt)</SelectItem>
                    <SelectItem value="Payment">Pengeluaran (Payment)</SelectItem>
                    <SelectItem value="CashAdvance">Pinjaman (Kasbon)</SelectItem>
                    <SelectItem value="SalarySlip">Gaji (Salary Slip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedType === 'SalarySlip' || selectedType === 'CashAdvance') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="recipientName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
                    <Input 
                      id="recipientName" 
                      name="recipientName" 
                      placeholder="Nama Penerima" 
                      required 
                      className="h-11 rounded-xl"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Jabatan</Label>
                    <Input id="position" name="position" placeholder="Contoh: Staff" required className="h-11 rounded-xl" />
                  </div>
                </div>
              )}

              {selectedType === 'SalarySlip' && recipientName && outstandingKasbon > 0 && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 p-3 rounded-xl">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-[10px] leading-relaxed">
                    Terdeteksi kasbon sebesar <strong>Rp {outstandingKasbon.toLocaleString('id-ID')}</strong>. 
                    Gaji akan dikurangi otomatis.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Jumlah (Rp)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                  <Input id="amount" name="amount" type="number" placeholder="0" required className="h-11 pl-12 rounded-xl font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Keterangan</Label>
                <Input id="description" name="description" placeholder="Keperluan..." required className="h-11 rounded-xl" />
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/20 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-full">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full font-bold">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
