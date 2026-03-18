
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
  Eye,
  Trash2,
  Edit,
  MoreVertical,
  Layers
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFirestore, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ActivityReport } from "@/lib/types"

export default function LaporanKegiatanPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [selectedReport, setSelectedReport] = React.useState<ActivityReport | null>(null)
  const [editingReport, setEditingReport] = React.useState<ActivityReport | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [previewImage, setPreviewPreviewImage] = React.useState<{url: string, title: string} | null>(null)
  
  const [fileData, setFileData] = React.useState<{
    absensi: string;
    spanduk: string;
    fotoBersama: string;
    fotoPendukung: string[];
  }>({
    absensi: "",
    spanduk: "",
    fotoBersama: "",
    fotoPendukung: [],
  })

  const fileInputRefs = {
    absensi: React.useRef<HTMLInputElement>(null),
    spanduk: React.useRef<HTMLInputElement>(null),
    fotoBersama: React.useRef<HTMLInputElement>(null),
    fotoPendukung: React.useRef<HTMLInputElement>(null),
  }

  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const reportsRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "activity_reports")
  }, [firestore])

  const { data: reports, isLoading } = useCollection<ActivityReport>(reportsRef)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof fileData) => {
    const files = e.target.files
    if (!files) return

    if (field === 'fotoPendukung') {
      const selectedFiles = Array.from(files)
      selectedFiles.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFileData(prev => ({ 
            ...prev, 
            fotoPendukung: [...prev.fotoPendukung, reader.result as string] 
          }))
        }
        reader.readAsDataURL(file)
      })
      // Reset input value so same file can be selected again if needed
      if (fileInputRefs.fotoPendukung.current) {
        fileInputRefs.fotoPendukung.current.value = ""
      }
    } else {
      const file = files[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFileData(prev => ({ ...prev, [field]: reader.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleRemoveFile = (field: keyof typeof fileData, index?: number) => {
    if (field === 'fotoPendukung' && typeof index === 'number') {
      setFileData(prev => ({
        ...prev,
        fotoPendukung: prev.fotoPendukung.filter((_, i) => i !== index)
      }))
    } else {
      setFileData(prev => ({ ...prev, [field as any]: "" }))
      if ((fileInputRefs as any)[field]?.current) {
        (fileInputRefs as any)[field].current!.value = ""
      }
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
      status: editingReport?.status || "Submitted",
      absensiFile: fileData.absensi,
      spandukFile: fileData.spanduk,
      fotoBersamaFile: fileData.fotoBersama,
      fotoPendukungFiles: fileData.fotoPendukung,
      updatedAt: new Date().toISOString(),
    }

    if (editingReport) {
      updateDocumentNonBlocking(doc(firestore, "activity_reports", editingReport.id), data)
      toast({ title: "Laporan Diperbarui", description: `Laporan "${title}" telah berhasil diperbarui.` })
    } else {
      const newData = { ...data, createdAt: new Date().toISOString() }
      addDocumentNonBlocking(collection(firestore, "activity_reports"), newData)
      toast({ title: "Laporan Terkirim", description: `Laporan "${title}" telah berhasil disimpan ke sistem.` })
    }

    setIsCreateOpen(false)
    setEditingReport(null)
    setFileData({ absensi: "", spanduk: "", fotoBersama: "", fotoPendukung: [] })
  }

  const handleDelete = (id: string, title: string) => {
    if (!firestore) return
    deleteDocumentNonBlocking(doc(firestore, "activity_reports", id))
    toast({ title: "Laporan Dihapus", description: `Laporan "${title}" telah dihapus dari sistem.` })
    if (selectedReport?.id === id) setSelectedReport(null)
  }

  const handleOpenEdit = (report: ActivityReport) => {
    setEditingReport(report)
    setFileData({
      absensi: report.absensiFile || "",
      spanduk: report.spandukFile || "",
      fotoBersama: report.fotoBersamaFile || "",
      fotoPendukung: report.fotoPendukungFiles || [],
    })
    setIsCreateOpen(true)
    setSelectedReport(null)
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
            setEditingReport(null)
            setFileData({ absensi: "", spanduk: "", fotoBersama: "", fotoPendukung: [] })
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
              className="group rounded-[2rem] hover:shadow-xl transition-all cursor-pointer border border-border/50 overflow-hidden bg-white relative"
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
                <div className="flex-1 min-w-0 pr-6">
                  <p className="text-sm font-black text-primary truncate uppercase tracking-tight" title={report.title}>{report.title}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase mt-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(report.reportDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                
                <div className="absolute top-6 right-4" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl p-2 w-40">
                      <DropdownMenuItem onClick={() => setSelectedReport(report)} className="rounded-xl text-xs font-bold cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" /> Lihat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenEdit(report)} className="rounded-xl text-xs font-bold cursor-pointer text-blue-600">
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(report.id, report.title)} className="rounded-xl text-xs font-bold cursor-pointer text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        <DialogContent className="w-[95vw] md:max-w-[750px] max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-[2.5rem]">
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

                <div className="space-y-6">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileCheck className="h-4 w-4" /> Dokumentasi Utama
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { label: "Foto Absensi", file: selectedReport.absensiFile },
                      { label: "Foto Spanduk", file: selectedReport.spandukFile },
                      { label: "Foto Bersama", file: selectedReport.fotoBersamaFile }
                    ].map((item, idx) => (
                      <div key={idx} className={cn(
                        "flex flex-col gap-2 p-4 rounded-2xl border transition-colors",
                        item.file ? "bg-green-50 border-green-100" : "bg-muted/20 border-dashed opacity-50"
                      )}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-primary uppercase leading-tight">{item.label}</span>
                          {item.file && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-green-600 hover:bg-green-100 rounded-full"
                              onClick={() => setPreviewPreviewImage({ url: item.file!, title: item.label })}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        {item.file ? (
                          <div className="aspect-video w-full rounded-lg overflow-hidden border">
                            <img src={item.file} alt={item.label} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-video w-full rounded-lg bg-muted/20 flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedReport.fotoPendukungFiles && selectedReport.fotoPendukungFiles.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Layers className="h-4 w-4" /> Dokumentasi Pendukung ({selectedReport.fotoPendukungFiles.length})
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {selectedReport.fotoPendukungFiles.map((file, idx) => (
                          <div 
                            key={idx} 
                            className="aspect-square rounded-xl border bg-muted/10 overflow-hidden group relative cursor-pointer"
                            onClick={() => setPreviewPreviewImage({ url: file, title: `Dokumentasi Pendukung ${idx + 1}` })}
                          >
                            <img src={file} alt={`Pendukung ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ExternalLink className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-muted-foreground uppercase font-black tracking-[0.2em]">Status</span>
                      <Badge className={cn("mt-1 font-black text-[9px] uppercase", selectedReport.status === 'Approved' ? "bg-green-500" : "bg-amber-500")}>
                        {selectedReport.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 font-black text-[10px] uppercase tracking-widest px-6"
                      onClick={() => handleOpenEdit(selectedReport!)}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit Data
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none rounded-full border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest px-6"
                      onClick={() => handleDelete(selectedReport!.id, selectedReport!.title)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </Button>
                    <Button onClick={() => setSelectedReport(null)} className="flex-1 sm:flex-none rounded-full px-8 bg-primary font-black text-[10px] uppercase tracking-widest shadow-lg">
                      Tutup
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Buat/Edit Laporan */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => {
        setIsCreateOpen(open)
        if (!open) setEditingReport(null)
      }}>
        <DialogContent className="w-[95vw] md:max-w-[750px] max-h-[95vh] overflow-y-auto rounded-[2.5rem] p-0 border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-8 bg-primary text-white">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                {editingReport ? "Edit Laporan" : "Buat Laporan"}
              </DialogTitle>
              <DialogDescription className="text-white/80 font-medium text-xs">Dokumentasikan kegiatan operasional partai.</DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tanggal</Label>
                  <Input 
                    name="reportDate" 
                    type="date" 
                    required 
                    defaultValue={editingReport ? editingReport.reportDate.split('T')[0] : ""} 
                    className="rounded-2xl h-12 font-bold" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Lokasi</Label>
                  <Input 
                    name="location" 
                    placeholder="Lokasi..." 
                    required 
                    defaultValue={editingReport?.location}
                    className="rounded-2xl h-12 font-bold uppercase" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Judul Kegiatan</Label>
                <Input 
                  name="title" 
                  placeholder="Contoh: Musyawarah Ranting..." 
                  required 
                  defaultValue={editingReport?.title}
                  className="rounded-2xl h-12 font-black uppercase" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Deskripsi</Label>
                <Textarea 
                  name="description" 
                  placeholder="Detail kegiatan..." 
                  defaultValue={editingReport?.description}
                  className="min-h-[120px] rounded-2xl font-bold uppercase" 
                  required 
                />
              </div>

              <div className="space-y-6 p-6 bg-muted/20 rounded-[2rem] border border-dashed">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Dokumentasi Utama
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "absensi", label: "1. Foto Absensi", field: "absensi" as const },
                      { id: "spanduk", label: "2. Foto Spanduk", field: "spanduk" as const },
                      { id: "fotoBersama", label: "3. Foto Bersama", field: "fotoBersama" as const }
                    ].map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[8px] font-black uppercase flex items-center gap-1">
                            {item.label}
                            {fileData[item.field] && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                          </Label>
                          {fileData[item.field] && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-5 w-5 text-red-500 hover:bg-red-50 rounded-full"
                              onClick={() => handleRemoveFile(item.field)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        {fileData[item.field] ? (
                          <div className="aspect-video w-full rounded-xl overflow-hidden border bg-white relative group">
                            <img src={fileData[item.field]} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button type="button" variant="ghost" className="text-white text-[8px] font-bold" onClick={() => (fileInputRefs as any)[item.field].current?.click()}>UBAH</Button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="aspect-video w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 bg-white cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={() => (fileInputRefs as any)[item.field].current?.click()}
                          >
                            <FileUp className="h-5 w-5 text-muted-foreground/40" />
                            <span className="text-[7px] font-black text-muted-foreground uppercase">Upload</span>
                          </div>
                        )}
                        <Input 
                          id={item.id} 
                          type="file" 
                          ref={(fileInputRefs as any)[item.field]}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, item.field)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-muted/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <Layers className="h-4 w-4" /> Dokumentasi Pendukung (Dapat > 1)
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full h-8 text-[9px] font-black uppercase border-primary/20"
                      onClick={() => fileInputRefs.fotoPendukung.current?.click()}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Tambah Foto
                    </Button>
                  </div>

                  {fileData.fotoPendukung.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {fileData.fotoPendukung.map((file, idx) => (
                        <div key={idx} className="aspect-square rounded-xl border bg-white overflow-hidden relative group">
                          <img src={file} className="w-full h-full object-cover" />
                          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="icon" 
                              className="h-6 w-6 rounded-full"
                              onClick={() => handleRemoveFile('fotoPendukung', idx)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div 
                        className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 bg-white/50 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => fileInputRefs.fotoPendukung.current?.click()}
                      >
                        <Plus className="h-5 w-5 text-muted-foreground/40" />
                        <span className="text-[7px] font-black text-muted-foreground uppercase">Tambah</span>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-full p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 bg-white/30 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => fileInputRefs.fotoPendukung.current?.click()}
                    >
                      <FileUp className="h-6 w-6 text-muted-foreground/40" />
                      <span className="text-[9px] font-black text-muted-foreground uppercase">Upload Dokumentasi Tambahan</span>
                    </div>
                  )}
                  <Input 
                    id="fotoPendukung" 
                    type="file" 
                    multiple
                    ref={fileInputRefs.fotoPendukung}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'fotoPendukung')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 bg-muted/30 gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-full font-bold h-12">Batal</Button>
              <Button type="submit" className="flex-1 bg-secondary text-white rounded-full font-black text-xs uppercase shadow-lg h-12">
                {editingReport ? "Simpan Perubahan" : "Simpan & Kirim"}
              </Button>
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
