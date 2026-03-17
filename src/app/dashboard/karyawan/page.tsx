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
  X,
  Image as ImageIcon
} from "lucide-react"
import { toPng } from 'html-to-image'
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

// Helper function to convert number to Indonesian words
function terbilang(n: number): string {
  if (n < 0) return "Minus " + terbilang(Math.abs(n));
  if (n === 0) return "Nol";
  
  const unit = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
  let res = "";
  
  if (n < 12) res = unit[n];
  else if (n < 20) res = terbilang(n - 10) + " Belas";
  else if (n < 100) res = terbilang(Math.floor(n / 10)) + " Puluh " + terbilang(n % 10);
  else if (n < 1000) res = terbilang(Math.floor(n / 100)) + " Ratus " + terbilang(n % 100);
  else if (n < 1000000) res = terbilang(Math.floor(n / 1000)) + " Ribu " + terbilang(n % 1000);
  else if (n < 1000000000) res = terbilang(Math.floor(n / 1000000)) + " Juta " + terbilang(n % 1000000);
  
  return res.replace(/\s+/g, ' ').trim();
}

export default function KaryawanPage() {
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const slipRef = React.useRef<HTMLDivElement>(null)

  const [isStaffDialogOpen, setIsStaffDialogOpen] = React.useState(false)
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = React.useState(false)
  const [isSlipDialogOpen, setIsSlipDialogOpen] = React.useState(false)
  const [isImageGenerating, setIsImageGenerating] = React.useState(false)
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

  const handleDownloadImage = async () => {
    if (slipRef.current === null || !selectedStaff) return
    setIsImageGenerating(true)
    
    const fileName = `Slip-Gaji-${selectedStaff.fullName}-${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}.png`

    try {
      // First attempt with full features (including fonts)
      const dataUrl = await toPng(slipRef.current, { 
        cacheBust: true, 
        pixelRatio: 3, 
        backgroundColor: '#ffffff'
      })
      
      const link = document.createElement('a')
      link.download = fileName
      link.href = dataUrl
      link.click()
      
      toast({
        title: "Gambar Berhasil Dibuat",
        description: "Slip gaji telah diunduh sebagai file gambar PNG.",
      })
    } catch (err) {
      console.warn("Initial image generation failed, trying fallback:", err)
      try {
        // Fallback: skip fonts which is the common cause of SecurityError with cross-origin stylesheets
        const dataUrl = await toPng(slipRef.current, { 
          skipFonts: true,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        })
        
        const link = document.createElement('a')
        link.download = fileName
        link.href = dataUrl
        link.click()
        
        toast({
          title: "Gambar Berhasil Dibuat (Mode Kompatibilitas)",
          description: "Slip gaji diunduh tanpa font khusus karena batasan keamanan browser.",
        })
      } catch (fallbackErr) {
        console.error("Critical error generating image:", fallbackErr)
        toast({
          variant: "destructive",
          title: "Gagal Membuat Gambar",
          description: "Terjadi kesalahan keamanan browser saat mengonversi slip gaji menjadi gambar.",
        })
      }
    } finally {
      setIsImageGenerating(false)
    }
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
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #slip-gaji-print, #slip-gaji-print * {
            visibility: visible;
          }
          #slip-gaji-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

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
                              <Printer className="mr-2 h-4 w-4" /> Cetak / Unduh Slip Gaji
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

      {/* Slip Gaji Dialog - A5 Size (14.8 x 21 cm) */}
      <Dialog open={isSlipDialogOpen} onOpenChange={setIsSlipDialogOpen}>
        <DialogContent className="max-w-[650px] w-full p-0 border-none rounded-none overflow-hidden shadow-2xl max-h-[98vh] flex flex-col bg-white print:fixed print:inset-0 print:z-[100] print:m-0 print:p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Slip Gaji Hanura</DialogTitle>
            <DialogDescription>Rincian Gaji Karyawan DPC Hanura Kota Tanjungpinang</DialogDescription>
          </DialogHeader>
          
          {selectedStaff && (
            <div className="flex flex-col h-full bg-white font-body text-slate-900">
              {/* Toolbar */}
              <header className="h-12 bg-slate-100 flex items-center justify-between px-6 shrink-0 border-b print-hidden">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-wider">Pratinjau Slip Gaji (14.8 x 21 cm)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDownloadImage} 
                    className="h-8 rounded-full border-accent text-accent hover:bg-accent hover:text-white"
                    disabled={isImageGenerating}
                  >
                    {isImageGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                    Unduh Gambar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint} className="h-8 rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                    <Printer className="mr-2 h-4 w-4" /> Cetak Slip
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSlipDialogOpen(false)} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>

              {/* Document Container */}
              <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-200 print:bg-white print:p-0">
                <div 
                  id="slip-gaji-print" 
                  ref={slipRef}
                  className="bg-white w-full max-w-[148mm] min-h-[210mm] p-8 flex flex-col shadow-lg border border-slate-300 print:shadow-none print:border-none print:max-w-none print:w-full"
                >
                  
                  {/* Header Teks */}
                  <div className="text-center space-y-1 mb-6 border-b pb-4">
                    <h1 className="text-xl font-black uppercase tracking-tight">HANURA KOTA TANJUNGPINANG</h1>
                    <p className="text-[10px] font-medium text-slate-600">Jl Gatot Subroto ( Depan Gerbang Rawasari ) , Tanjungpinang</p>
                  </div>

                  {/* Judul Dokumen */}
                  <div className="text-center space-y-1 mb-6">
                    <h2 className="text-lg font-black uppercase tracking-[0.2em] border-y-2 border-black py-1">SLIP GAJI KARYAWAN</h2>
                    <p className="text-[11px] font-bold mt-2">Periode {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
                  </div>

                  {/* Informasi Staf */}
                  <div className="grid grid-cols-[100px_1fr] gap-y-1 text-xs mb-6 px-2">
                    <span className="font-bold">NIK</span>
                    <span className="uppercase">: {selectedStaff.id.slice(0, 10).toUpperCase()}</span>
                    <span className="font-bold">Nama</span>
                    <span className="uppercase">: {selectedStaff.fullName}</span>
                    <span className="font-bold">Pengurus</span>
                    <span className="uppercase">: {selectedStaff.position}</span>
                    <span className="font-bold">Status</span>
                    <span className="uppercase">: Karyawan Tetap</span>
                  </div>

                  {/* Tabel Utama Penghasilan & Potongan */}
                  <div className="grid grid-cols-2 border-2 border-black mb-6">
                    {/* Kolom Penghasilan */}
                    <div className="border-r-2 border-black">
                      <div className="bg-slate-100 py-1.5 px-3 border-b-2 border-black font-black text-xs uppercase tracking-wider">
                        PENGHASILAN
                      </div>
                      <div className="p-3 space-y-2 text-[11px] min-h-[140px]">
                        <div className="flex justify-between">
                          <span>Gaji Pokok</span>
                          <span>Rp {selectedStaff.baseSalary.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tunjangan Jabatan</span>
                          <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tunjangan Makan</span>
                          <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bonus Kinerja</span>
                          <span>Rp 0</span>
                        </div>
                      </div>
                      <div className="border-t-2 border-black py-1.5 px-3 bg-slate-50 font-black text-[11px] flex justify-between">
                        <span>Total Penghasilan (A)</span>
                        <span>{selectedStaff.baseSalary.toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    {/* Kolom Potongan */}
                    <div>
                      <div className="bg-slate-100 py-1.5 px-3 border-b-2 border-black font-black text-xs uppercase tracking-wider">
                        POTONGAN
                      </div>
                      <div className="p-3 space-y-2 text-[11px] min-h-[140px]">
                        <div className="flex justify-between">
                          <span>Potongan Kasbon</span>
                          <span className="text-red-600">Rp {getOutstandingKasbon(selectedStaff.id).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>BPJS Kesehatan</span>
                          <span>Rp 0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>BPJS Ketenagakerjaan</span>
                          <span>Rp 0</span>
                        </div>
                      </div>
                      <div className="border-t-2 border-black py-1.5 px-3 bg-slate-50 font-black text-[11px] flex justify-between">
                        <span>Total Potongan (B)</span>
                        <span className="text-red-600">{getOutstandingKasbon(selectedStaff.id).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Penerimaan Bersih */}
                  <div className="border-2 border-black p-3 mb-4 bg-slate-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm uppercase">Penerimaan Bersih (A-B)</span>
                      <span className="font-black text-lg">Rp {(selectedStaff.baseSalary - getOutstandingKasbon(selectedStaff.id)).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="text-[10px] italic flex gap-2">
                      <span className="font-bold whitespace-nowrap">Terbilang:</span>
                      <span className="capitalize">{terbilang(selectedStaff.baseSalary - getOutstandingKasbon(selectedStaff.id))} Rupiah</span>
                    </div>
                  </div>

                  {/* Footer Tanda Tangan */}
                  <div className="mt-auto grid grid-cols-2 pt-10 px-4">
                    <div className="text-center space-y-16">
                      <p className="text-[10px] font-bold">Penerima,</p>
                      <p className="text-[10px] font-black underline uppercase">{selectedStaff.fullName}</p>
                    </div>
                    <div className="text-center space-y-16">
                      <p className="text-[10px] font-bold">Bendahara,</p>
                      <p className="text-[10px] font-black underline uppercase">ENDANG WIRNANTO</p>
                    </div>
                  </div>

                  <div className="mt-10 text-center">
                    <p className="text-[8px] text-slate-400 font-mono">Dihasilkan oleh SITU HANURA System • {new Date().toLocaleString('id-ID')}</p>
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