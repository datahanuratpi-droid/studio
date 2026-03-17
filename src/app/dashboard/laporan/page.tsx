
"use client"

import * as React from "react"
import { Plus, FileText, Upload, Calendar, Send, CheckCircle2, MoreVertical, Loader2, MapPin, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function LaporanKegiatanPage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const firestore = useFirestore()
  const { user } = useUser()

  const reportsRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "activity_reports")
  }, [firestore])

  const { data: reports, isLoading } = useCollection(reportsRef)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    
    // In a real app, you would upload files to Firebase Storage first.
    // For this prototype, we'll store the file names to simulate the connection.
    const data = {
      title: formData.get("title") as string,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      reportDate: formData.get("reportDate") as string || new Date().toISOString(),
      reporterId: user.uid,
      status: "Submitted",
      absensiFile: (formData.get("absensi") as File)?.name || "",
      spandukFile: (formData.get("spanduk") as File)?.name || "",
      fotoBersamaFile: (formData.get("fotoBersama") as File)?.name || "",
      fotoPendukungFile: (formData.get("fotoPendukung") as File)?.name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "activity_reports"), data)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Laporan Kegiatan</h1>
          <p className="text-muted-foreground">Input rincian kegiatan dan dokumentasi petugas lapangan.</p>
        </div>
        <Button 
          className="bg-accent hover:bg-accent/90 text-white rounded-full px-6"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Laporan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports?.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge className={cn("text-[10px]", 
                    report.status === 'Approved' ? "bg-green-100 text-green-700" : 
                    report.status === 'Submitted' ? "bg-blue-100 text-blue-700" : 
                    "bg-muted text-muted-foreground"
                  )}>
                    {report.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-headline font-bold mt-2">{report.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(report.reportDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{report.location}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {report.absensiFile && <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-tight">Absensi</Badge>}
                  {report.spandukFile && <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-tight">Spanduk</Badge>}
                  {report.fotoBersamaFile && <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-tight">Foto Bersama</Badge>}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs">Lihat Detail</Button>
              </CardFooter>
            </Card>
          ))}
          {!isLoading && (!reports || reports.length === 0) && (
            <div className="col-span-full py-24 text-center space-y-4">
              <div className="p-4 bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                <FileText className="h-8 w-8" />
              </div>
              <p className="text-muted-foreground font-medium">Belum ada laporan kegiatan yang tercatat.</p>
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Buat Laporan Kegiatan</DialogTitle>
              <DialogDescription>Input rincian kegiatan dan unggah dokumentasi yang diperlukan.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reportDate">Tanggal Kegiatan</Label>
                  <Input id="reportDate" name="reportDate" type="date" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Lokasi Kegiatan</Label>
                  <Input id="location" name="location" placeholder="Contoh: Kantor DPC / Kelurahan..." required />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Kegiatan</Label>
                <Input id="title" name="title" placeholder="Contoh: Musyawarah Ranting Tanjungpinang Barat" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi Kegiatan</Label>
                <Textarea id="description" name="description" placeholder="Ceritakan detail kegiatan, agenda, dan hasil..." className="min-h-[120px]" required />
              </div>

              <div className="grid gap-4 p-4 bg-muted/20 rounded-xl border border-dashed">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <FileUp className="h-4 w-4" /> Unggah Berkas (PDF / Gambar)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="absensi" className="text-xs">Absensi</Label>
                    <Input id="absensi" name="absensi" type="file" className="h-8 text-[11px] py-1" accept=".pdf,image/*" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="spanduk" className="text-xs">Foto Spanduk</Label>
                    <Input id="spanduk" name="spanduk" type="file" className="h-8 text-[11px] py-1" accept="image/*" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="fotoBersama" className="text-xs">Foto Bersama</Label>
                    <Input id="fotoBersama" name="fotoBersama" type="file" className="h-8 text-[11px] py-1" accept="image/*" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="fotoPendukung" className="text-xs">Foto Pendukung</Label>
                    <Input id="fotoPendukung" name="fotoPendukung" type="file" className="h-8 text-[11px] py-1" accept="image/*" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-primary text-white">Simpan & Submit Laporan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
