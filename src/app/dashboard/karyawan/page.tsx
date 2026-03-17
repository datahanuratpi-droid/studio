
"use client"

import * as React from "react"
import { Plus, Users, Search, Edit, Trash2, Loader2, Banknote, UserPlus, Phone, Briefcase, Wallet, Receipt, Calculator, MoreVertical, Printer } from "lucide-react"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { StaffMember, FinancialTransaction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function KaryawanPage() {
  const [isStaffDialogOpen, setIsStaffDialogOpen] = React.useState(false)
  const [isFinanceDialogOpen, setIsFinanceDialogOpen] = React.useState(false)
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null)
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null)
  const [financeType, setFinanceType] = React.useState<'CashAdvance' | 'SalarySlip'>('CashAdvance')
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

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

  const filteredStaff = staff?.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
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

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border shadow-sm">
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

      <Card className="border-none shadow-md overflow-hidden rounded-3xl">
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
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
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
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden">
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
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden">
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
    </div>
  )
}
