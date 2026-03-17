"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Banknote, 
  UserPlus, 
  Phone, 
  Briefcase, 
  Wallet, 
  Receipt, 
  Calculator, 
  MoreVertical, 
  Printer, 
  FileText,
  ArrowLeft,
  ShieldCheck,
  CheckCircle,
  Download,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { StaffMember, FinancialTransaction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function KaryawanPage() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [isStaffDialogOpen, setIsStaffDialogOpen] = React.useState(false)
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = React.useState(false)
  const [isSlipDialogOpen, setIsSlipDialogOpen] = React.useState(false)
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null)
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null)
  const [financeType, setFinanceType] = React.useState<'CashAdvance' | 'SalarySlip'>('CashAdvance')
  const [searchQuery, setSearchQuery] = React.useState("")

  // Role Protection
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, 'users', user.uid)
  }, [firestore, user?.uid])
  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef)

  React.useEffect(() => {
    if (!isUserLoading && !isProfileLoading && profile && profile.role !== 'Admin') {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Hanya Admin yang dapat mengakses menu Karyawan."
      })
      router.replace("/dashboard")
    }
  }, [profile, isUserLoading, isProfileLoading, router, toast])

  // Fetch Staff
  const staffRef = useMemoFirebase(() => collection(firestore, "staff_members"), [firestore])
  const { data: staff, isLoading } = useCollection<StaffMember>(staffRef)

  // Fetch Transactions to calculate outstanding kasbon
  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const { data: transactions } = useCollection<FinancialTransaction>(transRef)

  const getOutstandingKasbon = (staffId: string) => {
    if (!transactions) return 0
    return transactions
      .filter(t => t.involvedStaffId === staffId && t.type === 'CashAdvance' && !t.isClosed)
      .reduce((acc, curr) => acc + curr.amount, 0)
  }

  const handleStaffSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!firestore) return

    const formData = new FormData(e.currentTarget)
    const data = {
      fullName: formData.get("fullName") as string,
      position: formData.get("position") as string,
      baseSalary: parseFloat(formData.get("baseSalary") as string),
      dailyRate: parseFloat(formData.get("dailyRate") as string) || 0,
      bankName: formData.get("bankName") as string,
      accountNumber: formData.get("accountNumber") as string,
      phoneNumber: formData.get("phone") as string,
      createdAt: editingStaff?.createdAt || new Date().toISOString(),
    }

    if (editingStaff) {
      updateDocumentNonBlocking(doc(firestore, "staff_members", editingStaff.id), data)
      toast({ title: "Berhasil", description: "Data karyawan diperbarui." })
    } else {
      addDocumentNonBlocking(collection(firestore, "staff_members"), data)
      toast({ title: "Berhasil", description: "Karyawan baru ditambahkan." })
    }
    
    setIsStaffDialogOpen(false)
    setEditingStaff(null)
  }

  const handleFinanceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore || !selectedStaff) return

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get("amount") as string)
    const description = formData.get("description") as string
    const outstanding = getOutstandingKasbon(selectedStaff.id)

    const data = {
      amount: amount,
      transactionDate: new Date().toISOString(),
      description: financeType === 'SalarySlip' 
        ? `Slip Gaji: ${selectedStaff.fullName} ${outstanding > 0 ? `(Potong Kasbon: Rp ${outstanding.toLocaleString('id-ID')})` : ""} - ${description}`
        : `Kasbon: ${selectedStaff.fullName} - ${description}`,
      type: financeType,
      recordedByUserId: user.uid,
      involvedStaffId: selectedStaff.id,
      isClosed: false,
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "financial_transactions"), data)
    setIsFinanceDialogOpen(false)
    toast({ 
      title: "Berhasil", 
      description: `Transaksi ${financeType === 'SalarySlip' ? "Gaji" : "Kasbon"} telah dicatat.` 
    })
  }

  const handleDelete = (id: string) => {
    if (!firestore) return
    deleteDocumentNonBlocking(doc(firestore, "staff_members", id))
    toast({ title: "Terhapus", description: "Karyawan telah dihapus dari sistem." })
  }

  const handlePrint = () => {
    window.print()
  }

  const filteredStaff = staff?.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isUserLoading || isProfileLoading || (profile && profile.role !== 'Admin')) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Manajemen Karyawan</h1>
          <p className="text-muted-foreground">Kelola SDM, Kasbon, dan Penggajian Terintegrasi.</p>
        </div>
        <Button 
          className="bg-primary text-white rounded-full px-6 shadow-lg h-11"
          onClick={() => {
            setEditingStaff(null)
            setIsStaffDialogOpen(true)
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" /> Tambah Karyawan
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau jabatan..." 
            className="pl-10 h-11 bg-background/50 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden rounded-3xl print:hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold py-5">Nama & Jabatan</TableHead>
                <TableHead className="font-bold py-5 text-center">Outstanding Kasbon</TableHead>
                <TableHead className="font-bold py-5">Gaji Pokok</TableHead>
                <TableHead className="font-bold py-5">Rekening</TableHead>
                <TableHead className="text-right font-bold py-5">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredStaff?.map((s) => {
                const outstanding = getOutstandingKasbon(s.id)
                return (
                  <TableRow key={s.id} className="hover:bg-muted/5">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{s.fullName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> {s.position}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={outstanding > 0 ? "destructive" : "outline"} className="font-mono">
                        Rp {outstanding.toLocaleString('id-ID')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      Rp {s.baseSalary.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium">{s.bankName || "-"}</span>
                        <span className="text-muted-foreground">{s.accountNumber || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedStaff(s)
                                setIsSlipDialogOpen(true)
                              }}
                              className="cursor-pointer text-green-700 font-bold"
                            >
                              <Printer className="mr-2 h-4 w-4" /> Cetak Slip Gaji
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedStaff(s)
                                setFinanceType('CashAdvance')
                                setIsFinanceDialogOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Wallet className="mr-2 h-4 w-4 text-amber-600" /> Catat Kasbon
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedStaff(s)
                                setFinanceType('SalarySlip')
                                setIsFinanceDialogOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Banknote className="mr-2 h-4 w-4 text-purple-600" /> Input Gaji
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingStaff(s)
                                setIsStaffDialogOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-blue-600" /> Edit Data
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(s.id)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {(!filteredStaff || filteredStaff.length === 0) && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    Belum ada data karyawan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff Management Dialog */}
      <Dialog open={isStaffDialogOpen} onOpenChange={setIsStaffDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden print:hidden">
          <form onSubmit={handleStaffSubmit}>
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-2xl font-headline font-bold">
                {editingStaff ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
              </DialogTitle>
              <DialogDescription className="text-white/70">Input rincian data diri dan finansial karyawan.</DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
                  <Input name="fullName" defaultValue={editingStaff?.fullName} required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Jabatan</Label>
                  <Input name="position" defaultValue={editingStaff?.position} required className="rounded-xl h-11" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gaji Sebulan (Rp)</Label>
                  <Input name="baseSalary" type="number" defaultValue={editingStaff?.baseSalary} required className="rounded-xl h-11 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gaji Per Hari (Rp)</Label>
                  <Input name="dailyRate" type="number" defaultValue={editingStaff?.dailyRate} required className="rounded-xl h-11 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Bank</Label>
                  <Input name="bankName" defaultValue={editingStaff?.bankName} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No. Rekening</Label>
                  <Input name="accountNumber" defaultValue={editingStaff?.accountNumber} className="rounded-xl h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No. WhatsApp</Label>
                <Input name="phone" defaultValue={editingStaff?.phoneNumber} className="rounded-xl h-11" />
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/20 gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsStaffDialogOpen(false)} className="flex-1 rounded-full">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white rounded-full font-bold shadow-lg h-11">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Finance Action Dialog */}
      <Dialog open={isFinanceDialogOpen} onOpenChange={setIsFinanceDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden print:hidden">
          <form onSubmit={handleFinanceSubmit}>
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-2xl font-headline font-bold">
                {financeType === 'SalarySlip' ? "Input Gaji Karyawan" : "Catat Kasbon Baru"}
              </DialogTitle>
              <DialogDescription className="text-white/80">Karyawan: {selectedStaff?.fullName}</DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4">
              {financeType === 'SalarySlip' && selectedStaff && (
                <Alert className="bg-purple-50 border-purple-200">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-xs font-bold text-purple-800">
                    Gaji Pokok: Rp {selectedStaff.baseSalary.toLocaleString('id-ID')}
                    {getOutstandingKasbon(selectedStaff.id) > 0 && (
                      <>
                        <span className="block text-red-600 mt-1">Potongan Kasbon: - Rp {getOutstandingKasbon(selectedStaff.id).toLocaleString('id-ID')}</span>
                        <span className="block border-t mt-1 pt-1 font-black text-sm">Sisa Bersih: Rp {(selectedStaff.baseSalary - getOutstandingKasbon(selectedStaff.id)).toLocaleString('id-ID')}</span>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Jumlah Transaksi (Rp)</Label>
                <Input 
                  name="amount" 
                  type="number" 
                  required 
                  className="h-11 rounded-xl font-bold" 
                  defaultValue={financeType === 'SalarySlip' && selectedStaff ? (selectedStaff.baseSalary - getOutstandingKasbon(selectedStaff.id)) : ""}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Keterangan Tambahan</Label>
                <Input name="description" placeholder="Catatan..." required className="h-11 rounded-xl" />
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/20 gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFinanceDialogOpen(false)} className="flex-1 rounded-full">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white rounded-full font-bold h-11">Proses Transaksi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Slip Gaji Redesigned Dialog */}
      <Dialog open={isSlipDialogOpen} onOpenChange={setIsSlipDialogOpen}>
        <DialogContent className="max-w-[950px] w-full p-0 border-none rounded-none overflow-hidden shadow-2xl max-h-[95vh] flex flex-col bg-white print:fixed print:inset-0 print:z-[100] print:m-0 print:p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Slip Gaji Hanura</DialogTitle>
            <DialogDescription>Rincian Gaji Karyawan DPC Hanura Kota Tanjungpinang</DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="flex flex-col h-full bg-white font-body text-slate-900">
              {/* Toolbar */}
              <header className="h-12 bg-slate-100 flex items-center justify-between px-6 shrink-0 border-b print:hidden">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pratinjau Slip Gaji Resmi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                    <Printer className="mr-2 h-4 w-4" /> Cetak Slip
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSlipDialogOpen(false)} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              {/* Document Container */}
              <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-50 print:bg-white print:p-0">
                <div className="bg-white w-full max-w-[850px] p-8 md:p-12 flex flex-col shadow-lg border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full">
                  
                  {/* Top Header Section */}
                  <div className="flex justify-between items-start mb-8">
                    {/* Logo simulation based on image */}
                    <div className="flex flex-col">
                       <div className="border-2 border-black p-2 flex items-center justify-center bg-white mb-2" style={{ width: '150px' }}>
                          <div className="flex flex-col items-center">
                             <span className="text-red-600 font-black text-2xl leading-none">HANURA</span>
                             <span className="text-[7px] font-bold uppercase tracking-tighter">PARTAI HATI NURANI RAKYAT</span>
                          </div>
                       </div>
                       <div className="text-[10px] space-y-0.5 uppercase">
                          <p className="font-bold">HANURA KOTA TANJUNGPINANG</p>
                          <p>Jalan Gatot Subroto</p>
                          <p>Tanjungpinang, Kepulauan Riau</p>
                       </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                       <h1 className="text-5xl font-black uppercase mb-4">Slip Gaji</h1>
                       <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-1 text-xs text-left w-full max-w-sm">
                          <span className="font-bold">NAMA</span>
                          <span className="uppercase text-right">{selectedStaff.fullName} / {selectedStaff.id.slice(0, 10).toUpperCase()}</span>
                          <span className="font-bold">JABATAN</span>
                          <span className="uppercase text-right">{selectedStaff.position}</span>
                          <span className="font-bold">Periode Gaji</span>
                          <span className="text-right">{new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                       </div>
                    </div>
                  </div>

                  {/* Tables Section */}
                  <div className="grid grid-cols-2 border-y-2 border-black mb-6">
                    {/* Pendapatan Column */}
                    <div className="border-r-2 border-black">
                       <div className="bg-slate-200 py-1 px-4 border-b-2 border-black">
                          <span className="font-bold text-sm uppercase">Pendapatan</span>
                       </div>
                       <div className="p-4 space-y-2 text-sm min-h-[140px]">
                          <div className="flex justify-between">
                             <span>Gaji</span>
                             <span className="font-mono">{selectedStaff.baseSalary.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Tambahan</span>
                             <span className="font-mono">-</span>
                          </div>
                          <div className="flex justify-between">
                             <span className="italic">* Kegiatan DPC 2026</span>
                             <span className="font-mono">-</span>
                          </div>
                       </div>
                       <div className="border-t-2 border-black py-2 px-4 flex justify-between bg-white font-bold text-sm uppercase">
                          <span>Total Pendapatan</span>
                          <span className="font-mono">{selectedStaff.baseSalary.toLocaleString('id-ID')}</span>
                       </div>
                    </div>

                    {/* Potongan Column */}
                    <div>
                       <div className="bg-slate-200 py-1 px-4 border-b-2 border-black">
                          <span className="font-bold text-sm uppercase">Potongan</span>
                       </div>
                       <div className="p-4 space-y-2 text-sm min-h-[140px]">
                          <div className="flex justify-between">
                             <span>Pembayaran Hutang (Kasbon)</span>
                             <span className="font-mono text-red-600">{getOutstandingKasbon(selectedStaff.id).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Iuran BPJS</span>
                             <span className="font-mono">-</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Iuran Koperasi</span>
                             <span className="font-mono">-</span>
                          </div>
                       </div>
                       <div className="border-t-2 border-black py-2 px-4 flex justify-between bg-white font-bold text-sm uppercase">
                          <span>Total Potongan</span>
                          <span className="font-mono text-red-600">{getOutstandingKasbon(selectedStaff.id).toLocaleString('id-ID')}</span>
                       </div>
                    </div>
                  </div>

                  {/* Calculation Details Section */}
                  <div className="border-2 border-black mb-10 overflow-hidden">
                     <div className="bg-slate-200 py-1 px-4 border-b-2 border-black">
                        <span className="font-bold text-sm uppercase">Rincian Perhitungan Gaji Harian</span>
                     </div>
                     <div className="p-4 space-y-3 text-sm">
                        <div className="flex justify-between border-b border-slate-200 pb-1">
                           <span>Hari Kerja</span>
                           <span>25 Hari</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                           <span>Gaji Per Hari</span>
                           <div className="flex items-center gap-10">
                              <span className="text-[10px] text-slate-400">x</span>
                              <span className="font-mono w-24 text-right">{(selectedStaff.dailyRate || 0).toLocaleString('id-ID')}</span>
                           </div>
                        </div>
                        <div className="flex justify-between font-bold border-y-2 border-black py-1">
                           <span>Total Gaji</span>
                           <span className="font-mono">{( (selectedStaff.dailyRate || 0) * 25 ).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                           <span>Ketidakhadiran</span>
                           <div className="flex items-center gap-4">
                              <span>0 Hari</span>
                              <span className="text-[10px] text-slate-400">x</span>
                              <span className="font-mono w-24 text-right">{(selectedStaff.dailyRate || 0).toLocaleString('id-ID')}</span>
                              <span className="text-[10px] text-slate-400">=</span>
                              <span className="font-mono w-24 text-right">-</span>
                           </div>
                        </div>
                        <div className="flex justify-between font-bold border-t-2 border-black pt-1">
                           <span>Total Gaji Bersih</span>
                           <span className="font-mono">{selectedStaff.baseSalary.toLocaleString('id-ID')}</span>
                        </div>
                     </div>
                  </div>

                  {/* Final Total Box */}
                  <div className="mt-auto flex justify-end">
                     <div className="border-4 border-black p-6 w-full max-w-sm text-center space-y-2 bg-white">
                        <p className="font-bold text-sm uppercase tracking-widest">Total Penerimaan Bulan Ini</p>
                        <p className="text-6xl font-black font-mono">
                           {(selectedStaff.baseSalary - getOutstandingKasbon(selectedStaff.id)).toLocaleString('id-ID')}
                        </p>
                     </div>
                  </div>

                  {/* Footer note */}
                  <div className="mt-8 text-[9px] text-slate-400 italic">
                    Dokumen ini sah dihasilkan secara elektronik oleh Sistem Informasi Terpadu (SITU) DPC HANURA Kota Tanjungpinang.
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
