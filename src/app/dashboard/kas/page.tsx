"use client"

import * as React from "react"
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  MoreVertical,
  Calendar,
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
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Kas Office</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Catat Pemasukan dan Pengeluaran Operasional Kantor.</p>
      </div>

      <div className="flex flex-col gap-4">
        <Button 
          className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-full py-6 text-sm font-medium shadow-md"
          onClick={() => {
            setSelectedType("Payment")
            setIsDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Transaksi Kantor
        </Button>

        {isAdmin && isFirstDayOfMonth && (
          <Button 
            variant="outline" 
            className="w-full border-amber-500 text-amber-700 hover:bg-amber-50 rounded-full h-11"
            onClick={handleTutupBuku}
            disabled={isClosingBook}
          >
            {isClosingBook ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
            Tutup Buku Bulanan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Main Balance Card - Orange */}
        <Card className="bg-primary text-white border-none shadow-xl relative overflow-hidden rounded-[2rem] h-32 flex flex-col justify-center">
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Saldo Kas</span>
            </div>
            <p className="text-2xl md:text-3xl font-black font-headline">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          </CardContent>
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Wallet className="h-32 w-32 -mr-8 -mt-4" />
          </div>
        </Card>
        
        {/* Total Pemasukan Card */}
        <Card className="border-none shadow-sm bg-white rounded-3xl h-24 flex flex-col justify-center border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Pemasukan</span>
            </div>
            <p className="text-xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type === 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>

        {/* Total Pengeluaran Card */}
        <Card className="border-none shadow-sm bg-white rounded-3xl h-24 flex flex-col justify-center border border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                <TrendingDown className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Pengeluaran</span>
            </div>
            <p className="text-xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type !== 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-white border p-1 rounded-full shadow-sm h-12 w-full grid grid-cols-3">
          <TabsTrigger value="all" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white text-[11px] font-bold">Semua</TabsTrigger>
          <TabsTrigger value="pemasukkan" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white text-[11px] font-bold">Pemasukkan</TabsTrigger>
          <TabsTrigger value="pengeluaran" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-white text-[11px] font-bold">Pengeluaran</TabsTrigger>
        </TabsList>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari transaksi..." 
            className="pl-11 h-12 rounded-full bg-white border shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2rem] border border-border/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <Table className="min-w-[650px] md:min-w-full">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="font-black text-[9px] uppercase py-4 pl-6">Tanggal</TableHead>
                  <TableHead className="font-black text-[9px] uppercase py-4">Keterangan</TableHead>
                  <TableHead className="font-black text-[9px] uppercase py-4">Jumlah</TableHead>
                  <TableHead className="font-black text-[9px] uppercase py-4">Jenis</TableHead>
                  <TableHead className="text-right font-black text-[9px] uppercase py-4 pr-6">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></TableCell></TableRow>
                ) : sortedTransactions.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/5 transition-colors border-border/30">
                    <TableCell className="text-[11px] font-medium text-muted-foreground whitespace-nowrap pl-6">
                      {new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-[180px]">
                        <span className="font-bold text-primary text-xs uppercase tracking-tight">{t.description}</span>
                        {t.isClosed && <span className="text-[8px] text-green-600 font-black uppercase tracking-tighter flex items-center gap-1 mt-0.5"><CheckCircle2 className="h-2 w-2" /> Terkunci</span>}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className={cn("font-black text-xs", t.type === 'Receipt' ? "text-green-600" : "text-red-600")}>
                        {t.type === 'Receipt' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[8px] font-black px-2 py-0.5 rounded-md border-none", 
                        t.type === 'Receipt' ? "bg-green-100 text-green-700" : 
                        t.type === 'Payment' ? "bg-blue-100 text-blue-700" :
                        t.type === 'CashAdvance' ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"
                      )}>
                        {t.type === 'Receipt' ? 'MASUK' : t.type === 'Payment' ? 'KANTOR' : t.type === 'CashAdvance' ? 'KASBON' : 'GAJI'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl p-2">
                          <DropdownMenuItem onClick={() => setViewingTransaction(t)} className="cursor-pointer rounded-lg text-xs font-bold"><Activity className="mr-2 h-3.5 w-3.5" /> Detail</DropdownMenuItem>
                          {isAdmin && !t.isClosed && (
                            <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-red-600 cursor-pointer rounded-lg text-xs font-bold"><TrendingDown className="mr-2 h-3.5 w-3.5" /> Hapus</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedTransactions.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-muted-foreground text-xs uppercase tracking-widest font-bold opacity-30">
                      Tidak ada data ditemukan.
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
        <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden max-h-[95vh] flex flex-col border-none shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
            <DialogHeader className="p-6 md:p-8 bg-primary text-white shrink-0">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Catat Transaksi</DialogTitle>
              <DialogDescription className="text-white/80 text-xs font-medium">Input data operasional kantor Hanura.</DialogDescription>
            </DialogHeader>
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-muted-foreground tracking-[0.2em]">Jenis Transaksi</Label>
                <Select onValueChange={setSelectedType} value={selectedType}>
                  <SelectTrigger className="h-12 rounded-2xl text-sm border-muted-foreground/20"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Receipt" className="text-xs font-bold">Pemasukan (Dana/Donasi)</SelectItem>
                    <SelectItem value="Payment" className="text-xs font-bold">Pengeluaran Operasional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-muted-foreground tracking-[0.2em]">Jumlah (Rp)</Label>
                <Input name="amount" type="number" placeholder="0" required className="h-12 rounded-2xl font-black text-lg border-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-muted-foreground tracking-[0.2em]">Keterangan</Label>
                <Input name="description" placeholder="Keperluan..." required className="h-12 rounded-2xl text-sm border-muted-foreground/20 font-bold" />
              </div>
            </div>
            <DialogFooter className="p-6 md:p-8 bg-muted/30 gap-2 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-full text-xs font-bold">Batal</Button>
              <Button type="submit" className="flex-1 bg-secondary text-white rounded-full font-bold h-12 text-xs shadow-lg">Simpan Transaksi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Detail Transaksi */}
      <Dialog open={!!viewingTransaction} onOpenChange={() => setViewingTransaction(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
          {viewingTransaction && (
            <div className="bg-white flex flex-col h-full overflow-hidden">
              <DialogHeader className="p-6 bg-primary text-white relative shrink-0">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">Detail Transaksi</DialogTitle>
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

              <div className="px-6 py-8 space-y-8 overflow-y-auto flex-1">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-muted/30 rounded-[1.5rem]">
                    <Activity className={cn("h-6 w-6", viewingTransaction.type === 'Receipt' ? "text-green-600" : "text-red-600")} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Jumlah Transaksi</p>
                    <h3 className={cn("text-2xl font-black tracking-tighter", viewingTransaction.type === 'Receipt' ? "text-green-600" : "text-red-600")}>
                      {viewingTransaction.type === 'Receipt' ? '+' : '-'} Rp {viewingTransaction.amount.toLocaleString('id-ID')}
                    </h3>
                  </div>
                  <Badge variant="secondary" className="px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                    {viewingTransaction.type === 'Receipt' ? 'Pemasukkan' : 'Pengeluaran'}
                  </Badge>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Keterangan
                    </Label>
                    <div className="p-4 bg-muted/20 rounded-2xl border border-muted/50">
                      <p className="text-sm font-bold text-primary leading-relaxed uppercase">{viewingTransaction.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Tanggal</Label>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-primary opacity-60" />
                        {new Date(viewingTransaction.transactionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Status</Label>
                      <div className="flex items-center">
                        {viewingTransaction.isClosed ? (
                          <Badge className="bg-green-100 text-green-700 border-none text-[9px] font-black uppercase px-2 py-0.5">Terkunci</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20 text-primary px-2 py-0.5">Terbuka</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-dashed">
                  <p className="text-[8px] text-muted-foreground font-mono uppercase text-center tracking-widest">
                    Dicatat pada: {new Date(viewingTransaction.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <DialogFooter className="p-6 bg-muted/10 shrink-0">
                <Button onClick={() => setViewingTransaction(null)} className="w-full bg-primary text-white rounded-full font-black h-12 shadow-lg text-xs uppercase tracking-widest">
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}