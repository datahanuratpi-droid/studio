"use client"

import * as React from "react"
import { Search, Archive, FileText, Download, Filter, Loader2, Plus, FileUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"
import { DigitalArchive } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ArsipPage() {
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null)

  // Mengambil data arsip digital umum secara real-time
  const archivesRef = useMemoFirebase(() => collection(firestore, "digital_archives"), [firestore])
  const { data: archives, isLoading } = useCollection<DigitalArchive>(archivesRef)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFileName(file.name)
    }
  }

  const handleAddArchive = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const file = formData.get("file") as File

    const data = {
      archiveTitle: title,
      fileName: file?.name || selectedFileName || "dokumen_arsip.pdf",
      uploadedByUserId: user.uid,
      createdAt: new Date().toISOString()
    }

    addDocumentNonBlocking(collection(firestore, "digital_archives"), data)
    setIsCreateOpen(false)
    setSelectedFileName(null)
    toast({
      title: "Arsip Berhasil Disimpan",
      description: `Dokumen "${title}" telah diarsipkan ke sistem.`,
    })
  }

  const filteredArchives = archives?.filter(archive => 
    archive.archiveTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Arsip Digital SITU</h1>
          <p className="text-muted-foreground">Kelola dan simpan dokumen penting secara digital dan aman.</p>
        </div>
        <Button 
          className="bg-accent hover:bg-accent/90 text-white rounded-full px-6"
          onClick={() => {
            setSelectedFileName(null)
            setIsCreateOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Tambah Arsip Baru
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari judul arsip..." 
            className="pl-10 h-11 bg-white rounded-xl" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 px-6 bg-white rounded-xl"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Menyinkronkan Arsip...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredArchives?.map((archive) => (
            <Card key={archive.id} className="overflow-hidden group hover:border-accent transition-all hover:shadow-xl border-border/50 bg-white rounded-2xl">
              <div className="aspect-square bg-muted/20 flex flex-col items-center justify-center relative p-6 border-b">
                <div className="p-4 bg-white rounded-3xl shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <FileText className="h-12 w-12 text-primary/60" />
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-white">
                  PDF DOCUMENT
                </Badge>
                
                <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <Button variant="secondary" className="rounded-full shadow-lg font-bold text-xs">
                    <Download className="mr-2 h-4 w-4" /> Buka Arsip
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-primary line-clamp-2 leading-tight" title={archive.archiveTitle}>
                    {archive.archiveTitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {new Date(archive.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {(!filteredArchives || filteredArchives.length === 0) && (
            <div className="col-span-full py-24 text-center space-y-4 bg-muted/5 rounded-3xl border-2 border-dashed border-border/50">
              <Archive className="h-16 w-16 mx-auto text-muted-foreground/20" />
              <div className="space-y-1">
                <p className="text-muted-foreground font-bold">Belum Ada Arsip Digital</p>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Klik tombol di atas untuk mengunggah arsip pertama Anda.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog Tambah Arsip */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl">
          <form onSubmit={handleAddArchive}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold text-primary">Tambah Arsip Digital</DialogTitle>
              <DialogDescription>
                Unggah dokumen penting ke dalam sistem arsip digital SITU HANURA.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-bold text-sm">Judul Arsip</Label>
                <Input id="title" name="title" placeholder="Contoh: SK Pengurus DPC 2024" required className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-sm">Unggah Berkas (PDF)</Label>
                <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer relative group min-h-[160px]">
                  {selectedFileName ? (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-green-600 truncate max-w-[200px]">{selectedFileName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Klik untuk mengganti berkas</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors" />
                      <div className="text-center">
                        <p className="text-xs font-bold text-primary">Klik untuk memilih file</p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-1">Hanya mendukung format PDF</p>
                      </div>
                    </>
                  )}
                  {/* Hidden input overlaying the whole area */}
                  <input 
                    id="file" 
                    name="file" 
                    type="file" 
                    accept=".pdf" 
                    required 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-full">Batal</Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/90 rounded-full px-8">
                Simpan Arsip
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}