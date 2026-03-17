
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
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Hash,
  Activity
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
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase, deleteDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc, writeBatch } from "firebase/firestore"
import { FinancialTransaction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function KasOfficePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>("Payment")
  const [activeTab, setActiveTab] = React.useState("all")
  const [viewingTransaction, setViewingTransaction] = React.useState<FinancialTransaction | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isClosingBook, setIsClosingBook] = React.useState(false)
  
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, 'users', user.uid)
  }, [firestore, user?.uid])
  const { data: profile } = useDoc(userDocRef)

  const isAdmin = profile?.role === 'Admin'

  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const { data: transactions, isLoading } = useCollection<FinancialTransaction>(transRef)

  const isFirstDayOfMonth = new Date().getDate() === 1;

  const handleTutupBuku = async () => {
    if (!firestore || !transactions) return
    setIsClosingBook(true)
    
    const batch = writeBatch(firestore)
    const openTransactions = transactions.filter(t => !t.isClosed)
    
    openTransactions.forEach(t => {
      const tRef = doc(firestore, "financial_transactions", t.id)
      batch.update(tRef, { isClosed: true })
    })

    await batch.commit()
    setIsClosingBook(false)
    toast({ 
      title: "Tutup Buku Berhasil", 
      description: `Seluruh transaksi periode sebelumnya telah diarsipkan secara otomatis.` 
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    
    const data = {
      amount: amount,
      transactionDate: new Date().toISOString(),
      description: description,
      type: selectedType as any,
      recordedByUserId: user.uid,
      isClosed: false,
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "financial_transactions"), data)
    setIsDialogOpen(false)
    toast({ title: "Berhasil", description: "Transaksi kantor telah dicatat." })
  }

  const handleDelete = (id: string) => {
    if (!firestore) return
    deleteDocumentNonBlocking(doc(firestore, "financial_transactions", id))
    toast({ title: "Terhapus", description: "Transaksi telah dihapus." })
  }

  const totalSaldo = transactions?.reduce((acc, curr) => {
    if (curr.type === 'Receipt') return acc + curr.amount
    return acc - curr.amount
  }, 0) || 0

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return []
    let filtered = transactions
    
    if (!isAdmin) {
      filtered = filtered.filter(t => t.type === 'Receipt' || t.type === 'Payment')
    }

    if (activeTab === "pemasukkan") {
      filtered = filtered.filter(t => t.type === 'Receipt')
    } else if (activeTab === "pengeluaran") {
      filtered = filtered.filter(t => t.type !== 'Receipt')
    }

    if (searchQuery) {
      filtered = filtered.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return filtered
  }, [transactions, activeTab, searchQuery, isAdmin])

  const sortedTransactions = [...filteredTransactions].sort((a, b) => 
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  )

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary">Kas Office</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Catat Pemasukan dan Pengeluaran Operasional Kantor.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
           {isAdmin && isFirstDayOfMonth && (
             <Button 
               variant="outline" 
               className="border-amber-500 text-amber-700 hover:bg-amber-50 h-10 md:h-11 px-6 rounded-full w-full sm:w-auto"
               onClick={handleTutupBuku}
               disabled={isClosingBook}
             >
               {isClosingBook ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
               Tutup Buku Bulanan
             </Button>
           )}
           <Button 
            className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 shadow-lg h-10 md:h-11 w-full sm:w-auto"
            onClick={() => {
              setSelectedType("Payment")
              setIsDialogOpen(true)
            }}
           >
            <Plus className="mr-2 h-4 w-4" /> Transaksi Kantor
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-primary text-white border-none shadow-xl relative overflow-hidden group">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-2.5 bg-white/20 rounded-xl group-hover:scale-110 transition-transform"><Wallet className="h-5 w-5 md:h-6 md:h-6" /></div>
              <span className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest">Total Saldo Kas</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold font-headline">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          </CardContent>
          <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 pointer-events-none"><Wallet className="h-16 w-16 md:h-24 md:w-24" /></div>
        </Card>
        
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-2.5 bg-green-50 rounded-xl text-green-600"><TrendingUp className="h-5 w-5 md:h-6 md:h-6" /></div>
              <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Pemasukan</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type === 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="p-2.5 bg-red-50 rounded-xl text-red-600"><TrendingDown className="h-5 w-5 md:h-6 md:h-6" /></div>
              <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Pengeluaran</span>
            </div>
            <p className="text-xl md:text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type !== 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="bg-white border p-1 rounded-2xl shadow-sm h-11 md:h-12 w-full flex sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-none rounded-xl px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[11px] md:text-xs">Semua</TabsTrigger>
              <TabsTrigger value="pemasukkan" className="flex-1 sm:flex-none rounded-xl px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[11px] md:text-xs">Pemasukkan</TabsTrigger>
              <TabsTrigger value="pengeluaran" className="flex-1 sm:flex-none rounded-xl px-4 md:px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[11px] md:text-xs">Pengeluaran</TabsTrigger>
            </TabsList>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari transaksi..." 
              className="pl-9 h-10 md:h-11 rounded-2xl bg-white text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table className="min-w-[600px] md:min-w-full">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-bold text-[10px] uppercase py-4">Tanggal</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase py-4">Keterangan</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase py-4">Jumlah</TableHead>
                  <TableHead className="font-bold text-[10px] uppercase py-4">Jenis</TableHead>
                  <TableHead className="text-right font-bold text-[10px] uppercase py-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></TableCell></TableRow>
                ) : sortedTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/5">
                    <TableCell className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                      {new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-[150px]">
                        <span className="font-bold text-primary text-xs md:text-sm line-clamp-1">{t.description}</span>
                        {t.isClosed && <span className="text-[9px] text-green-600 font-bold uppercase tracking-tighter flex items-center gap-1"><CheckCircle2 className="h-2 w-2" /> Terkunci</span>}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={cn("font-bold text-xs md:text-sm", t.type === 'Receipt' ? "text-green-600" : "text-red-600")}>
                        {t.type === 'Receipt' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {t.type === 'Receipt' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[8px] md:text-[9px] px-1.5 py-0">MASUK</Badge>}
                        {t.type === 'Payment' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[8px] md:text-[9px] px-1.5 py-0">KANTOR</Badge>}
                        {t.type === 'CashAdvance' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[8px] md:text-[9px] px-1.5 py-0">KASBON</Badge>}
                        {t.type === 'SalarySlip' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[8px] md:text-[9px] px-1.5 py-0">GAJI</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 md:w-48 rounded-xl p-2">
                          <DropdownMenuItem onClick={() => setViewingTransaction(t)} className="cursor-pointer rounded-lg text-xs"><Eye className="mr-2 h-3.5 w-3.5" /> Detail</DropdownMenuItem>
                          {isAdmin && !t.isClosed && (
                            <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-red-600 cursor-pointer rounded-lg text-xs"><Trash2 className="mr-2 h-3.5 w-3.5" /> Hapus</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTransactions.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground text-xs uppercase tracking-widest font-medium opacity-50">
                      Tidak ada data transaksi ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Tabs>

      {/* Input Dialog Kantor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden max-h-[95vh] flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-5 md:p-6 bg-primary text-white shrink-0">
              <DialogTitle className="text-xl md:text-2xl font-headline font-bold">Catat Transaksi Kantor</DialogTitle>
              <DialogDescription className="text-white/80 text-xs">Input data pemasukan atau pengeluaran operasional.</DialogDescription>
            </DialogHeader>
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Jenis Transaksi</Label>
                <Select onValueChange={setSelectedType} value={selectedType}>
                  <SelectTrigger className="h-10 md:h-11 rounded-xl text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Receipt" className="text-xs">Pemasukan (Dana/Donasi)</SelectItem>
                    <SelectItem value="Payment" className="text-xs">Pengeluaran Operasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Jumlah (Rp)</Label>
                <Input name="amount" type="number" placeholder="0" required className="h-10 md:h-11 rounded-xl font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-[10px] uppercase text-muted-foreground tracking-widest">Keterangan</Label>
                <Input name="description" placeholder="Keperluan..." required className="h-10 md:h-11 rounded-xl text-sm" />
              </div>
            </div>
            <DialogFooter className="p-5 md:p-6 bg-muted/20 gap-2 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-full text-xs">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white rounded-full font-bold h-10 md:h-11 text-xs">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Transaksi */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
          {viewingTransaction && (
            <div className="bg-white flex flex-col h-full overflow-hidden">
              <DialogHeader className="p-5 bg-primary text-white relative shrink-0">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <DialogTitle className="text-lg md:text-xl font-headline font-black uppercase tracking-tight">Rincian Kas</DialogTitle>
                    <div className="flex items-center gap-1.5 opacity-70">
                      <Hash className="h-3 w-3" />
                      <span className="text-[9px] font-mono font-bold tracking-widest">{viewingTransaction.id.slice(0, 12).toUpperCase()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setViewingTransaction(null)} className="h-8 w-8 text-white hover:bg-white/20 rounded-full shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="px-5 py-6 md:px-6 md:py-8 space-y-6 md:space-y-8 overflow-y-auto flex-1">
                {/* Amount Section */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-2.5 bg-muted/30 rounded-2xl">
                    <Activity className={cn("h-5 w-5 md:h-6 md:w-6", viewingTransaction.type === 'Receipt' ? "text-green-600" : "text-red-600")} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Jumlah Transaksi</p>
                    <h3 className={cn("text-2xl md:text-3xl font-black font-headline tracking-tighter", viewingTransaction.type === 'Receipt' ? "text-green-600" : "text-red-600")}>
                      {viewingTransaction.type === 'Receipt' ? '+' : '-'} Rp {viewingTransaction.amount.toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="px-3 py-0.5 text-[8px] md:text-[9px] font-bold uppercase tracking-widest rounded-full">
                    {viewingTransaction.type === 'Receipt' ? 'Pemasukkan' : 'Pengeluaran'}
                  </Badge>
                </div>

                {/* Details Grid */}
                <div className="grid gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Keterangan
                    </Label>
                    <div className="p-3.5 md:p-4 bg-muted/20 rounded-2xl border border-muted/50">
                      <p className="text-xs md:text-sm font-bold text-primary leading-relaxed">{viewingTransaction.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Tanggal</Label>
                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-700">
                        <Calendar className="h-3 w-3 text-primary opacity-60" />
                        {new Date(viewingTransaction.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] md:text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Status Buku</Label>
                      <div className="flex items-center">
                        {viewingTransaction.isClosed ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-[8px] md:text-[9px] font-black uppercase py-0 px-1.5">Terkunci</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[8px] md:text-[9px] font-black uppercase border-primary/20 text-primary py-0 px-1.5">Terbuka</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Timestamp */}
                <div className="pt-5 border-t border-dashed">
                  <p className="text-[8px] text-muted-foreground font-mono uppercase text-center tracking-widest">
                    Dicatat pada: {new Date(viewingTransaction.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <DialogFooter className="p-4 bg-muted/10 shrink-0">
                <Button onClick={() => setViewingTransaction(null)} className="w-full bg-primary text-white rounded-full font-bold h-10 md:h-11 shadow-lg hover:bg-primary/90 transition-transform active:scale-[0.98] text-xs">
                  Tutup Rincian
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
