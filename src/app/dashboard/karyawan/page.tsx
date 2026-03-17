
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
  Download
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
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gaji Pokok (Rp)</Label>
                <Input name="baseSalary" type="number" defaultValue={editingStaff?.baseSalary} required className="rounded-xl h-11 font-bold" />
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

      {/* Slip Gaji Floating Dialog */}
      <Dialog open={isSlipDialogOpen} onOpenChange={setIsSlipDialogOpen}>
        <DialogContent className="max-w-[850px] w-full p-0 border-none rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col bg-[#525659] print:bg-white print:max-h-none print:shadow-none print:fixed print:inset-0 print:z-[100] print:rounded-none">
          {selectedStaff && (
            <div className="flex flex-col h-full print:h-auto print:block">
              {/* Toolbar */}
              <header className="h-14 bg-[#323639] text-white flex items-center justify-between px-6 shrink-0 print:hidden">
                <div className="flex items-center gap-4">
                  <div className="p-1.5 bg-primary rounded shadow-sm">
                    <Banknote className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">Pratinjau Slip Gaji - {selectedStaff.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handlePrint} className="text-white hover:bg-white/10 rounded-full">
                    <Printer className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSlipDialogOpen(false)} className="text-white hover:bg-white/10 rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </header>

              {/* Printable Content Container */}
              <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center print:p-0 print:overflow-visible print:block">
                <div className="bg-white w-full max-w-[800px] shadow-2xl p-10 md:p-16 flex flex-col min-h-[1000px] print:shadow-none print:p-8 print:min-h-0 print:w-full print:m-0">
                  
                  {/* Kop Surat */}
                  <div className="flex flex-col items-center text-center space-y-4 border-b-4 border-double border-primary pb-6 mb-8">
                    <div className="flex items-center justify-center gap-5">
                      <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex flex-col items-center">
                        <h1 className="text-lg font-headline font-bold text-primary uppercase tracking-tight">PARTAI HATI NURANI RAKYAT</h1>
                        <h2 className="text-sm font-bold text-primary uppercase">(HANURA)</h2>
                        <h3 className="text-[10px] font-bold text-primary uppercase">DEWAN PIMPINAN CABANG KOTA TANJUNGPINANG</h3>
                      </div>
                    </div>
                    <p className="text-[8px] font-medium text-muted-foreground uppercase leading-relaxed max-w-md">
                      Jl. Gatot Subroto Km. 5 No. 12, Kel. Kampung Bulang, Kec. Tanjungpinang Timur <br />
                      Kota Tanjungpinang, Provinsi Kepulauan Riau - Kode Pos 29124
                    </p>
                  </div>

                  {/* Judul Dokumen */}
                  <div className="text-center space-y-1 mb-8">
                    <h2 className="text-base font-black underline uppercase tracking-widest">SLIP GAJI KARYAWAN</h2>
                    <p className="text-[9px] font-mono font-bold text-muted-foreground">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  </div>

                  {/* Data Karyawan */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-10 border p-5 rounded-xl bg-muted/5">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Nama Karyawan</p>
                      <p className="text-xs font-bold text-primary uppercase">{selectedStaff.fullName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Jabatan</p>
                      <p className="text-xs font-bold text-primary uppercase">{selectedStaff.position}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Bank / No Rekening</p>
                      <p className="text-[11px] font-medium text-slate-700">{selectedStaff.bankName || "-"} / {selectedStaff.accountNumber || "-"}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Status Pembayaran</p>
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-[8px] font-bold px-2 py-0">DIGITAL PAID</Badge>
                    </div>
                  </div>

                  {/* Rincian Finansial */}
                  <div className="flex-1 space-y-6">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-y-2 border-primary bg-primary/5">
                          <th className="text-left py-2 px-4 font-black uppercase text-[9px]">Deskripsi Pendapatan / Potongan</th>
                          <th className="text-right py-2 px-4 font-black uppercase text-[9px]">Jumlah (IDR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4 font-bold">Gaji Pokok Bulanan</td>
                          <td className="py-3 px-4 text-right font-mono">Rp {selectedStaff.baseSalary.toLocaleString('id-ID')}</td>
                        </tr>
                        {getOutstandingKasbon(selectedStaff.id) > 0 && (
                          <tr className="border-b text-red-600 bg-red-50/30">
                            <td className="py-3 px-4 font-bold flex items-center gap-2">
                              <Calculator className="h-3 w-3" />
                              Potongan Kasbon (Outstanding)
                            </td>
                            <td className="py-3 px-4 text-right font-mono">- Rp {getOutstandingKasbon(selectedStaff.id).toLocaleString('id-ID')}</td>
                          </tr>
                        )}
                        <tr className="bg-slate-50">
                          <td className="py-3 px-4 font-black text-primary uppercase">Total Gaji Bersih (Net Salary)</td>
                          <td className="py-3 px-4 text-right font-mono font-black text-primary text-base">
                            Rp {(selectedStaff.baseSalary - getOutstandingKasbon(selectedStaff.id)).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-muted-foreground/30 text-[9px] leading-relaxed italic text-muted-foreground">
                      Catatan: Slip gaji ini dihasilkan secara otomatis oleh Sistem Informasi Terpadu (SITU) Hanura. Potongan kasbon dihitung berdasarkan saldo pinjaman yang belum lunas pada saat slip ini dicetak.
                    </div>
                  </div>

                  {/* Tanda Tangan */}
                  <div className="mt-16 flex justify-between items-end">
                     <div className="text-center w-40 space-y-12">
                        <p className="text-[9px] font-bold uppercase">Penerima,</p>
                        <div className="border-b border-slate-400 pb-1">
                           <p className="font-bold text-[10px] uppercase">{selectedStaff.fullName}</p>
                        </div>
                     </div>

                     <div className="text-center w-56 space-y-12">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold uppercase">Ditetapkan di: Tanjungpinang</p>
                        <p className="text-[9px] font-bold uppercase">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      </div>
                      
                      <div className="relative inline-block">
                        <div className="absolute -top-10 -left-10 opacity-20 pointer-events-none rotate-12">
                           <div className="w-24 h-24 border-4 border-primary rounded-full flex items-center justify-center text-primary font-bold text-[8px] uppercase text-center p-2">
                             DPC HANURA <br /> TANJUNGPINANG <br /> TREASURY
                           </div>
                        </div>
                        <p className="font-bold underline text-xs uppercase">ENDANG WIRNANTO</p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase">Bendahara DPC Tanjungpinang</p>
                      </div>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div className="mt-auto pt-8 flex items-center gap-2 opacity-40 select-none">
                    <ShieldCheck className="h-3 w-3 text-green-600" />
                    <span className="text-[7px] font-mono font-bold uppercase text-slate-400">Payroll Digital Verified System</span>
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
