
"use client"

import * as React from "react"
import { Search, Library, Plus, ExternalLink, Trash2, Loader2, Info, FolderOpen, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking, deleteDocumentNonBlocking, useDoc } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { LibraryItem } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function PustakaHanuraPage() {
  const firestore = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Get user profile to check role
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, 'users', user.uid)
  }, [firestore, user?.uid])
  const { data: profile } = useDoc(userDocRef)

  const itemsRef = useMemoFirebase(() => collection(firestore, "library_items"), [firestore])
  const { data: items, isLoading } = useCollection<LibraryItem>(itemsRef)

  const isAdmin = profile?.role === 'Admin'

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const driveUrl = formData.get("driveUrl") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string

    const data = {
      title,
      driveUrl,
      description,
      category: category || "Umum",
      addedByUserId: user.uid,
      createdAt: new Date().toISOString()
    }

    addDocumentNonBlocking(collection(firestore, "library_items"), data)
    setIsCreateOpen(false)
    toast({
      title: "Item Berhasil Ditambahkan",
      description: `"${title}" telah ditambahkan ke Pustaka Hanura.`,
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!firestore) return
    deleteDocumentNonBlocking(doc(firestore, "library_items", id))
    toast({
      title: "Item Dihapus",
      description: `"${title}" telah dihapus dari pustaka.`,
    })
  }

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank')
    toast({
      title: "Membuka Berkas",
      description: "Mengarahkan Anda ke Google Drive...",
    })
  }

  const filteredItems = items?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Pustaka Hanura</h1>
          <p className="text-muted-foreground">Kumpulan berkas administrasi dan referensi partai di Google Drive.</p>
        </div>
        {isAdmin && (
          <Button 
            className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 h-11 shadow-lg w-full sm:w-auto"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Berkas Drive
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari judul atau kategori..." 
            className="pl-10 h-11 bg-white rounded-xl shadow-sm border-muted" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Menyinkronkan Pustaka...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems?.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:border-primary transition-all hover:shadow-2xl border-border/50 bg-white rounded-2xl flex flex-col h-full">
              <CardHeader className="p-5 pb-0">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] uppercase font-bold tracking-widest px-2.5">
                    {item.category || "Umum"}
                  </Badge>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                      onClick={() => handleDelete(item.id, item.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-base font-bold text-primary line-clamp-2 leading-tight group-hover:text-accent transition-colors">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-3 flex-1">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                  {item.description || "Tidak ada deskripsi berkas."}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                  <FolderOpen className="h-3 w-3" />
                  Ditambahkan: {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button 
                  className="w-full bg-primary text-white hover:bg-primary/90 rounded-full font-bold text-xs h-10 group-hover:bg-accent transition-colors"
                  onClick={() => handleOpenLink(item.driveUrl)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Buka di Google Drive
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {(!filteredItems || filteredItems.length === 0) && (
            <div className="col-span-full py-24 text-center space-y-4 bg-muted/5 rounded-3xl border-2 border-dashed border-border/50">
              <Library className="h-16 w-16 mx-auto text-muted-foreground/20" />
              <div className="space-y-1">
                <p className="text-muted-foreground font-bold">Belum Ada Berkas di Pustaka</p>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
                  {isAdmin ? "Silakan tambahkan tautan Google Drive melalui tombol di atas." : "Hanya Admin yang dapat menambahkan berkas ke pustaka."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog Tambah Item Pustaka - Fixed Cut Off Issues */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
          <form onSubmit={handleAddItem} className="flex flex-col overflow-hidden">
            <DialogHeader className="p-6 bg-primary text-white shrink-0">
              <DialogTitle className="text-2xl font-headline font-bold">Tambah Pustaka Hanura</DialogTitle>
              <DialogDescription className="text-white/70">
                Masukkan judul dan tautan Google Drive untuk berkas administrasi.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Judul Berkas</Label>
                <Input id="title" name="title" placeholder="Contoh: AD/ART Partai Hanura 2024" required className="h-11 rounded-xl bg-muted/20 border-none" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driveUrl" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Tautan Google Drive (URL)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input id="driveUrl" name="driveUrl" type="url" placeholder="https://drive.google.com/..." required className="h-11 pl-10 rounded-xl bg-muted/20 border-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Kategori</Label>
                  <Input id="category" name="category" placeholder="Contoh: Regulasi" className="h-11 rounded-xl bg-muted/20 border-none" />
                </div>
                <div className="grid gap-2">
                   <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Informasi</Label>
                   <div className="flex items-center min-h-[44px] text-[10px] text-muted-foreground bg-muted/10 px-3 rounded-xl border border-dashed italic leading-relaxed">
                     Pastikan link Google Drive bersifat 'Publik' atau 'Dapat Dilihat'.
                   </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Deskripsi Singkat</Label>
                <Textarea id="description" name="description" placeholder="Penjelasan singkat isi berkas..." className="min-h-[100px] rounded-xl bg-muted/20 border-none" />
              </div>
            </div>
            <DialogFooter className="p-6 bg-muted/20 gap-2 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} className="flex-1 rounded-full font-bold">Batal</Button>
              <Button type="submit" className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-full font-bold px-8 shadow-lg">
                Simpan ke Pustaka
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
