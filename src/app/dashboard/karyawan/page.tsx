
"use client"

import * as React from "react"
import { Plus, Users, Search, Edit, Trash2, Loader2, Banknote, UserPlus, Phone, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { StaffMember } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

export default function KaryawanPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingStaff, setEditingStaff] = React.useState<StaffMember | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const staffRef = useMemoFirebase(() => collection(firestore, "staff_members"), [firestore])
  const { data: staff, isLoading } = useCollection<StaffMember>(staffRef)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
    
    setIsDialogOpen(false)
    setEditingStaff(null)
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
          <p className="text-muted-foreground">Kelola data SDM, gaji pokok, dan informasi rekening sekretariat.</p>
        </div>
        <Button 
          className="bg-primary text-white rounded-full px-6 shadow-lg h-11"
          onClick={() => {
            setEditingStaff(null)
            setIsDialogOpen(true)
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
                <TableHead className="font-bold py-5">Gaji Pokok</TableHead>
                <TableHead className="font-bold py-5">Rekening</TableHead>
                <TableHead className="font-bold py-5">Kontak</TableHead>
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
              ) : filteredStaff?.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/5">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">{s.fullName}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> {s.position}
                      </span>
                    </div>
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
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {s.phoneNumber || "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-8 w-8 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setEditingStaff(s)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-8 w-8 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredStaff || filteredStaff.length === 0) && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                    Belum ada data karyawan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden animate-in zoom-in duration-300">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-6 bg-primary text-white">
              <DialogTitle className="text-2xl font-headline font-bold">
                {editingStaff ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Input rincian data diri dan finansial karyawan sekretariat.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
                  <Input id="fullName" name="fullName" defaultValue={editingStaff?.fullName} required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Jabatan</Label>
                  <Input id="position" name="position" defaultValue={editingStaff?.position} required className="rounded-xl h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseSalary" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Gaji Pokok (Rp)</Label>
                <Input id="baseSalary" name="baseSalary" type="number" defaultValue={editingStaff?.baseSalary} required className="rounded-xl h-11 font-bold" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Bank</Label>
                  <Input id="bankName" name="bankName" defaultValue={editingStaff?.bankName} placeholder="Contoh: BCA" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No. Rekening</Label>
                  <Input id="accountNumber" name="accountNumber" defaultValue={editingStaff?.accountNumber} className="rounded-xl h-11" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No. WhatsApp</Label>
                <Input id="phone" name="phone" defaultValue={editingStaff?.phoneNumber} className="rounded-xl h-11" />
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/20 gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="flex-1 rounded-full font-bold">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full font-bold shadow-lg h-11">
                {editingStaff ? "Simpan Perubahan" : "Tambah Karyawan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
