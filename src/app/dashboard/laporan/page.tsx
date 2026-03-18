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
  CheckCircle2,
  X,
  Search,
  Eye
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
import { useToast } from "@/hooks/use-toast"

export default function LaporanKegiatanPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [selectedReport, setSelectedReport] = React.useState<any>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [previewImage, setPreviewPreviewImage] = React.useState<{url: string, title: string} | null>(null)
  
  const [fileData, setFileData] = React.useState({
    absensi: "",
    spanduk: "",
    fotoBersama: "",
    fotoPendukung: "",
  })

  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const reportsRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "activity_reports")
  }, [firestore])

  const { data: reports, isLoading } = useCollection(reportsRef)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof fileData) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFileData(prev => ({ ...prev, [field]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    
    const data = {
      title: title,
      location: formData.get("location") as string,
      description: formData.get("description") as string,
      reportDate: formData.get("reportDate") as string || new Date().toISOString(),
      reporterId: user.uid,
      status: "Submitted",
      absensiFile: fileData.absensi,
      spandukFile: fileData.spanduk,
      fotoBersamaFile: fileData.fotoBersama,
      fotoPendukungFile: fileData.fotoPendukung,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "activity_reports"), data)
    setIsCreateOpen(false)
    setFileData({ absensi: "", spanduk: "", fotoBersama: "", fotoPendukung: "" })
    toast({
      title: "Laporan Terkirim",
      description: `Laporan "${title}" telah berhasil disimpan ke sistem.`,
    })
  }

  const filteredReports = React.useMemo(() => {
    if (!reports) return []
    return reports
      .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime())
  }, [reports, searchQuery])

  return (
    <div className="space-y-6 md:space-y-8 pb-10 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Laporan Kegiatan</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Arsip digital laporan kegiatan operasional partai.</p>
      </div>

      <div className="px-1">
        <Button 
          className="w-full bg-secondary hover:bg-secondary/90 text-white rounded-full py-6 text-sm font-bold shadow-md md:max-w-xs h-12"
          onClick={() => {
            setFileData({ absensi: "", spanduk: "", fotoBersama: "", fotoPendukung: "" })
            setIsCreateOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Buat Laporan Baru
        </Button>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari judul laporan..." 
          className="pl-11 h-12 rounded-full bg-white border shadow-sm text-sm md:max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Memuat arsip...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-1">
          {filteredReports.map((report) => (
            <Card 
              key={report.id} 
              className="group rounded-[2rem] hover:shadow-xl transition-all cursor-pointer border border-border/50 overflow-hidden bg-white"
              onClick={() => setSelectedReport(report)}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="relative p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="absolute -top-1 -right-1">
                    <div className={cn("h-3 w-3 rounded-full border-2 border-white shadow-sm", 
                      report.status === 'Approved' ? "bg-green-500" : "bg-amber-500"
                    )} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-primary truncate uppercase tracking-tight" title={report.title}>{report.title}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.reportDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredReports.length === 0 && !isLoading && (
            <div className="col-span-full py-32 text-center space-y-4 bg-white/50 rounded-[2.5rem] border-2 border-dashed">
              <div className="p-5 bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto text-muted-foreground/30 shadow-sm border">
                <ClipboardList className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-black uppercase text-xs tracking-widest opacity-50">Belum Ada Laporan</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog Detail Laporan */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="w-[95vw] md:max-w-[650px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-[2.5rem]">
          {selectedReport && (
            <>
              <div className="bg-primary p-8 text-white relative">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-none text-[9px] uppercase font-black tracking-widest px-3">
                    Laporan Kegiatan
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)} className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <DialogHeader className="p-0 text-left">
                  <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tight leading-tight">
                    {selectedReport.title}
                  </DialogTitle>
                  <DialogDescription className="sr-only">Rincian lengkap laporan kegiatan operasional.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-wrap gap-4 pt-6 text-white/80 text-[10px] font-bold uppercase tracking-widest">
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

              <div className="p-8 space-y-8 bg-white">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Deskripsi Kegiatan
                  </Label>
                  <div className="p-5 bg-muted/20 rounded-2xl text-xs font-bold leading-relaxed text-slate-700 border border-border/50 whitespace-pre-wrap uppercase">
                    {selectedReport.description}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileCheck className="h-4 w-4" /> Dokumentasi
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "Foto Absensi", file: selectedReport.absensiFile },
                      { label: "Foto Spanduk", file: selectedReport.spandukFile },
                      { label: "Foto Bersama", file: selectedReport.fotoBersamaFile },
                      { label: "Foto Pendukung", file: selectedReport.fotoPendukungFile }
                    ].map((item, idx) => (
                      <div key={idx} className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                        item.file ? "bg-green-50 border-green-100" : "bg-muted/20 border-dashed opacity-50"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl", item.file ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground")}>
                            <ImageIcon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase leading-tight">{item.label}</span>
                            <span className="text-[8px] font-mono text-muted-foreground truncate max-w-[100px] mt-0.5">
                              {item.file ? "BERKAS TERSEDIA" : "KOSONG"}
                            </span>
                          </div>
                        </div>
                        {item.file && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600 hover:bg-green-100 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPreviewImage({ url: item.file!, title: item.label });
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">Status</span>
                    <Badge className={cn("mt-1 font-black text-[9px] uppercase", selectedReport.status === 'Approved' ? "bg-green-500" : "bg-amber-500")}>
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <Button onClick={() => setSelectedReport(null)} className="rounded-full px-8 bg-primary font-black text-xs uppercase shadow-lg">
                    Tutup
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Buat Laporan */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[95vw] md:max-w-[600px] max-h-[95vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 bg-primary text-white">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">Buat Laporan</DialogTitle>
              <DialogDescription className="text-white/80 font-medium text-xs">Dokumentasikan kegiatan operasional partai.</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tanggal</Label>
                  <Input name="reportDate" type="date" required className="rounded-2xl h-12 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Lokasi</Label>
                  <Input name="location" placeholder="Lokasi..." required className="rounded-2xl h-12 font-bold uppercase" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Judul Kegiatan</Label>
                <Input name="title" placeholder="Contoh: Musyawarah Ranting..." required className="rounded-2xl h-12 font-black uppercase" />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Deskripsi</Label>
                <Textarea name="description" placeholder="Detail kegiatan..." className="min-h-[120px] rounded-2xl font-bold uppercase" required />
              </div>

              <div className="space-y-4 p-6 bg-muted/20 rounded-[2rem] border border-dashed">
                <Label className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <FileUp className="h-4 w-4" /> Unggah Foto Dokumentasi
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "absensi", label: "1. Foto Absensi", field: "absensi" as const },
                    { id: "spanduk", label: "2. Foto Spanduk", field: "spanduk" as const },
                    { id: "fotoBersama", label: "3. Foto Bersama", field: "fotoBersama" as const },
                    { id: "fotoPendukung", label: "4. Foto Pendukung", field: "fotoPendukung" as const }
                  ].map((item) => (
                    <div key={item.id} className="space-y-1.5">
                      <Label className="text-[8px] font-black uppercase flex items-center justify-between pl-1">
                        {item.label}
                        {fileData[item.field] && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                      </Label>
                      <Input 
                        id={item.id} 
                        name={item.id} 
                        type="file" 
                        className={cn("h-10 text-[10px] p-2 rounded-xl cursor-pointer bg-white", fileData[item.field] && "border-green-500")}
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, item.field)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 bg-muted/30 gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-full font-bold h-12">Batal</Button>
              <Button type="submit" className="flex-1 bg-secondary text-white rounded-full font-black text-xs uppercase shadow-lg h-12">Simpan & Kirim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Preview Gambar */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-3xl bg-black/90">
          <DialogHeader className="sr-only">
            <DialogTitle>Pratinjau Dokumentasi</DialogTitle>
            <DialogDescription>Melihat foto bukti kegiatan.</DialogDescription>
          </DialogHeader>
          <div className="relative flex items-center justify-center p-2 min-h-[300px]">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setPreviewPreviewImage(null)} 
              className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full z-50 h-10 w-10"
            >
              <X className="h-6 w-6" />
            </Button>
            {previewImage && (
              <img 
                src={previewImage.url} 
                alt={previewImage.title} 
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
              />
            )}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <Badge className="bg-white/20 text-white backdrop-blur-md border-none px-4 py-1.5 uppercase font-black text-[10px] tracking-widest">
                {previewImage?.title}
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
