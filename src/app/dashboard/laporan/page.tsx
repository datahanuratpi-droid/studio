"use client"

import * as React from "react"
import { 
  Plus, 
  FileText, 
  Calendar, 
  Loader2, 
  MapPin, 
  FileUp, 
  ExternalLink,
  ClipboardList,
  Image as ImageIcon,
  FileCheck,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [selectedReport, setSelectedReport] = React.useState<any>(null)
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
    setIsCreateOpen(false)
  }

  const sortedReports = React.useMemo(() => {
    return reports?.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
  }, [reports])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Laporan Kegiatan</h1>
          <p className="text-muted-foreground">Arsip digital laporan kegiatan operasional partai.</p>
        </div>
        <Button 
          className="bg-accent hover:bg-accent/90 text-white rounded-full px-6"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Laporan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Memuat arsip laporan...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {sortedReports?.map((report) => (
            <div 
              key={report.id} 
              className="group flex flex-col items-center space-y-3 p-4 rounded-2xl transition-all hover:bg-white hover:shadow-xl cursor-pointer border border-transparent hover:border-border/50"
              onClick={() => setSelectedReport(report)}
            >
              <div className="relative p-6 bg-primary/5 rounded-3xl group-hover:bg-primary/10 transition-colors">
                <FileText className="h-12 w-12 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <Badge className={cn("h-5 w-5 rounded-full p-0 flex items-center justify-center border-2 border-background", 
                    report.status === 'Approved' ? "bg-green-500" : "bg-amber-500"
                  )}>
                    <div className="h-1 w-1 rounded-full bg-white" />
                  </Badge>
                </div>
              </div>
              <div className="text-center space-y-1 w-full">
                <p className="text-sm font-bold text-primary truncate px-2" title={report.title}>{report.title}</p>
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                  <Calendar className="h-3 w-3" />
                  {new Date(report.reportDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
          
          {(!sortedReports || sortedReports.length === 0) && (
            <div className="col-span-full py-32 text-center space-y-4 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
              <div className="p-5 bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30 shadow-sm">
                <ClipboardList className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-bold">Belum Ada Laporan</p>
                <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto uppercase tracking-widest">Silakan buat laporan baru untuk mendokumentasikan kegiatan.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog Detail Laporan */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Detail Laporan Kegiatan</DialogTitle>
            <DialogDescription>Rincian lengkap mengenai laporan kegiatan operasional.</DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <>
              <div className="bg-primary p-8 text-white relative">
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none text-[10px] uppercase font-bold tracking-widest px-3">
                    Detail Laporan Kegiatan
                  </Badge>
                  <h2 className="text-3xl font-headline font-bold">{selectedReport.title}</h2>
                  <div className="flex flex-wrap gap-4 pt-4 text-primary-foreground/80 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedReport.reportDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedReport.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-white">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Deskripsi Kegiatan
                  </h4>
                  <div className="p-5 bg-muted/30 rounded-2xl text-sm leading-relaxed text-muted-foreground border border-border/50 whitespace-pre-wrap">
                    {selectedReport.description}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <FileCheck className="h-4 w-4" /> Lampiran Berkas & Dokumentasi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Absensi Kegiatan", file: selectedReport.absensiFile, type: "PDF" },
                      { label: "Foto Spanduk", file: selectedReport.spandukFile, type: "IMG" },
                      { label: "Foto Bersama", file: selectedReport.fotoBersamaFile, type: "IMG" },
                      { label: "Dokumentasi Pendukung", file: selectedReport.fotoPendukungFile, type: "IMG" }
                    ].map((item, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-colors",
                        item.file ? "bg-green-50 border-green-100" : "bg-muted/30 border-dashed border-muted-foreground/20 opacity-60"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", item.file ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground")}>
                            {item.type === "PDF" ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-primary leading-tight">{item.label}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                              {item.file || "Belum diunggah"}
                            </span>
                          </div>
                        </div>
                        {item.file && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100 rounded-full">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Status Laporan</span>
                    <Badge className={cn("mt-1", selectedReport.status === 'Approved' ? "bg-green-500" : "bg-amber-500")}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedReport(null)} className="rounded-full px-6">
                    Tutup Detail
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Buat Laporan */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
                    <Label htmlFor="absensi" className="text-xs font-bold">1. Absensi (PDF)</Label>
                    <Input id="absensi" name="absensi" type="file" className="h-8 text-[11px] py-1 cursor-pointer" accept=".pdf" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="spanduk" className="text-xs font-bold">2. Foto Spanduk</Label>
                    <Input id="spanduk" name="spanduk" type="file" className="h-8 text-[11px] py-1 cursor-pointer" accept="image/*" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="fotoBersama" className="text-xs font-bold">3. Foto Bersama</Label>
                    <Input id="fotoBersama" name="fotoBersama" type="file" className="h-8 text-[11px] py-1 cursor-pointer" accept="image/*" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="fotoPendukung" className="text-xs font-bold">4. Dokumentasi Pendukung</Label>
                    <Input id="fotoPendukung" name="fotoPendukung" type="file" className="h-8 text-[11px] py-1 cursor-pointer" accept="image/*, .pdf" />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90">Simpan & Submit Laporan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
