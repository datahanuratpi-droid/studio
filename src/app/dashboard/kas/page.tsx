
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
  AlertTriangle
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
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc, query, where, getDocs, writeBatch } from "firebase/firestore"
import { FinancialTransaction, StaffMember } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function KasOfficePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>("Payment")
  const [activeTab, setActiveTab] = React.useState("all")
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>("")
  const [viewingSlip, setViewingSlip] = React.useState<FinancialTransaction | null>(null)
  const [viewingTransaction, setViewingTransaction] = React.useState<FinancialTransaction | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isClosingBook, setIsClosingBook] = React.useState(false)
  
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const { data: transactions, isLoading } = useCollection<FinancialTransaction>(transRef)

  const staffRef = useMemoFirebase(() => collection(firestore, "staff_members"), [firestore])
  const { data: staffList } = useCollection<StaffMember>(staffRef)

  const selectedStaff = staffList?.find(s => s.id === selectedStaffId)

  const outstandingKasbon = React.useMemo(() => {
    if (!selectedStaffId || !transactions) return 0
    return transactions
      .filter(t => t.type === 'CashAdvance' && t.involvedStaffId === selectedStaffId && !t.isClosed)
      .reduce((acc, curr) => acc + curr.amount, 0)
  }, [selectedStaffId, transactions])

  const isFirstDayOfMonth = new Date().getDate() === 1;

  const handleTutupBuku = async () => {
    if (!firestore || !transactions) return
    setIsClosingBook(true)
    
    const batch = writeBatch(firestore)
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    
    // Cari transaksi bulan sebelumnya yang belum ditutup
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
    const amountInput = parseFloat(formData.get("amount") as string)
    const baseDescription = formData.get("description") as string
    
    let finalDescription = baseDescription
    let finalAmount = amountInput
    let involvedId = selectedStaffId

    if (selectedType === 'SalarySlip' && selectedStaff) {
      if (outstandingKasbon > 0) {
        finalAmount = selectedStaff.baseSalary - outstandingKasbon
        finalDescription = `Slip Gaji: ${selectedStaff.fullName} (Potongan Kasbon: Rp ${outstandingKasbon.toLocaleString('id-ID')}) - ${baseDescription}`
      } else {
        finalAmount = selectedStaff.baseSalary
        finalDescription = `Slip Gaji: ${selectedStaff.fullName} - ${baseDescription}`
      }
    } else if (selectedType === 'CashAdvance' && selectedStaff) {
      finalDescription = `Kasbon: ${selectedStaff.fullName} - ${baseDescription}`
    }

    const data = {
      amount: finalAmount,
      transactionDate: new Date().toISOString(),
      description: finalDescription,
      type: selectedType as any,
      categoryId: "Routine",
      recordedByUserId: user.uid,
      involvedStaffId: involvedId,
      isClosed: false,
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "financial_transactions"), data)
    setIsDialogOpen(false)
    setSelectedStaffId("")
    toast({ title: "Berhasil", description: "Transaksi telah dicatat." })
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

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-primary">Kas Office</h1>
          <p className="text-sm text-muted-foreground">Otomasi Slip Gaji, Kasbon, dan Tutup Buku Bulanan.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
           {isFirstDayOfMonth && (
             <Button 
               variant="outline" 
               className="border-amber-500 text-amber-700 hover:bg-amber-50 h-11 px-6 rounded-full"
               onClick={handleTutupBuku}
               disabled={isClosingBook}
             >
               {isClosingBook ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
               Tutup Buku Bulanan
             </Button>
           )}
           <Button 
            className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 shadow-lg h-11 flex-1 lg:flex-none"
            onClick={() => {
              setSelectedType("Payment")
              setSelectedStaffId("")
              setIsDialogOpen(true)
            }}
           >
            <Plus className="mr-2 h-4 w-4" /> Transaksi Baru
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-xl relative overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform"><Wallet className="h-6 w-6" /></div>
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest">Total Saldo Kas</span>
            </div>
            <p className="text-3xl font-bold font-headline">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          </CardContent>
          <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="h-24 w-24" /></div>
        </Card>
        
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pemasukan</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type === 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown className="h-6 w-6" /></div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pengeluaran</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type !== 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <TabsList className="bg-white border p-1 rounded-2xl shadow-sm h-12 w-full sm:w-auto">
            <TabsTrigger value="all" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Semua</TabsTrigger>
            <TabsTrigger value="rutin" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Operasional</TabsTrigger>
            <TabsTrigger value="kasbon" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Kasbon</TabsTrigger>
            <TabsTrigger value="gaji" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">Gaji</TabsTrigger>
          </TabsList>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Cari transaksi..." 
              className="pl-9 h-11 rounded-2xl bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold text-[10px] uppercase py-5">Tanggal</TableHead>
                <TableHead className="font-bold text-[10px] uppercase py-5">Keterangan</TableHead>
                <TableHead className="font-bold text-[10px] uppercase py-5">Jumlah</TableHead>
                <TableHead className="font-bold text-[10px] uppercase py-5">Status</TableHead>
                <TableHead className="text-right font-bold text-[10px] uppercase py-5">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></TableCell></TableRow>
              ) : sortedTransactions.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/5">
                  <TableCell className="text-xs font-medium text-muted-foreground">
                    {new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-primary text-sm">{t.description}</span>
                      {t.isClosed && <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter flex items-center gap-1"><CheckCircle2 className="h-2 w-2" /> Sudah Tutup Buku</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn("font-bold text-sm", t.type === 'Receipt' ? "text-green-600" : "text-red-600")}>
                      {t.type === 'Receipt' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {t.type === 'Receipt' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[9px]">MASUK</Badge>}
                      {t.type === 'Payment' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[9px]">KANTOR</Badge>}
                      {t.type === 'CashAdvance' && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[9px]">KASBON</Badge>}
                      {t.type === 'SalarySlip' && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-[9px]">GAJI</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                        <DropdownMenuItem onClick={() => setViewingTransaction(t)} className="cursor-pointer rounded-lg"><Eye className="mr-2 h-4 w-4" /> Detail</DropdownMenuItem>
                        {t.type === 'SalarySlip' && (
                          <DropdownMenuItem onClick={() => setViewingSlip(t)} className="cursor-pointer rounded-lg"><Printer className="mr-2 h-4 w-4" /> Cetak Slip</DropdownMenuItem>
                        )}
                        {!t.isClosed && (
                          <DropdownMenuItem onClick={() => handleDelete(t.id)} className="text-red-600 cursor-pointer rounded-lg"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Tabs>

      {/* Input Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-2xl font-headline font-bold">Catat Transaksi</DialogTitle>
              <DialogDescription className="text-white/80">Otomasi sistem kasbon dan penggajian.</DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Jenis Transaksi</Label>
                <Select onValueChange={setSelectedType} value={selectedType}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Receipt">Pemasukan (Donasi/Dana)</SelectItem>
                    <SelectItem value="Payment">Pengeluaran Kantor</SelectItem>
                    <SelectItem value="CashAdvance">Pinjaman Karyawan (Kasbon)</SelectItem>
                    <SelectItem value="SalarySlip">Slip Gaji Karyawan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(selectedType === 'SalarySlip' || selectedType === 'CashAdvance') && (
                <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">Pilih Karyawan</Label>
                  <Select onValueChange={setSelectedStaffId} value={selectedStaffId}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Pilih Nama..." /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {staffList?.map(s => <SelectItem key={s.id} value={s.id}>{s.fullName} - {s.position}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedType === 'SalarySlip' && selectedStaff && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Banknote className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-xs font-bold text-purple-800">
                    Gaji Pokok: Rp {selectedStaff.baseSalary.toLocaleString('id-ID')}
                    {outstandingKasbon > 0 && <span className="block text-red-600">Terdeteksi Kasbon: - Rp {outstandingKasbon.toLocaleString('id-ID')}</span>}
                    {outstandingKasbon > 0 && <span className="block border-t mt-1 pt-1">Total Bersih: Rp {(selectedStaff.baseSalary - outstandingKasbon).toLocaleString('id-ID')}</span>}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Jumlah (Rp)</Label>
                <Input name="amount" type="number" placeholder="0" required className="h-11 rounded-xl font-bold" 
                  defaultValue={selectedType === 'SalarySlip' && selectedStaff ? (selectedStaff.baseSalary - outstandingKasbon) : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Keterangan</Label>
                <Input name="description" placeholder="Keperluan..." required className="h-11 rounded-xl" />
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/20 gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-full">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white rounded-full font-bold h-11">Simpan Transaksi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
