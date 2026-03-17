
"use client"

import * as React from "react"
import { Plus, Search, Filter, Mail, Calendar, User, MoreHorizontal, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Textarea } from "@/components/ui/textarea"
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase"
import { collection, serverTimestamp } from "firebase/firestore"

export default function SuratMasukPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const { firestore } = useFirestore()
  const { user } = useUser()

  const lettersRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "correspondences")
  }, [firestore])

  const { data: letters, isLoading } = useCollection(lettersRef)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const data = {
      subject: formData.get("subject") as string,
      body: formData.get("body") as string,
      type: "Incoming",
      correspondenceNumber: formData.get("no") as string,
      correspondenceDate: new Date().toISOString(),
      senderRecipientName: formData.get("sender") as string,
      status: "Received",
      createdByUserId: user.uid,
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "correspondences"), data)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Surat Masuk</h1>
          <p className="text-muted-foreground">Kelola dan tracking surat yang masuk ke kantor.</p>
        </div>
        <Button 
          className="bg-accent hover:bg-accent/90 text-white rounded-full"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Registrasi Surat
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nomor atau subjek..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button variant="outline" size="sm">Export CSV</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Surat</TableHead>
              <TableHead>Subjek</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Tanggal Terima</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : letters?.filter(l => l.type === 'Incoming').map((letter) => (
              <TableRow key={letter.id}>
                <TableCell className="font-mono text-xs">{letter.correspondenceNumber}</TableCell>
                <TableCell className="font-medium">{letter.subject}</TableCell>
                <TableCell>{letter.senderRecipientName}</TableCell>
                <TableCell>{new Date(letter.correspondenceDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{letter.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && (!letters || letters.filter(l => l.type === 'Incoming').length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada data surat masuk.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrasi Surat Masuk</DialogTitle>
              <DialogDescription>Input detail surat masuk untuk diarsipkan ke dalam sistem.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="no">Nomor Surat</Label>
                <Input id="no" name="no" placeholder="Contoh: 001/ADM/2024" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sender">Pengirim</Label>
                <Input id="sender" name="sender" placeholder="Nama Instansi/Orang" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subjek</Label>
                <Input id="subject" name="subject" placeholder="Perihal Surat" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="body">Ringkasan Isi</Label>
                <Textarea id="body" name="body" placeholder="Ringkasan atau catatan isi surat..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-primary text-white">Simpan Data</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
