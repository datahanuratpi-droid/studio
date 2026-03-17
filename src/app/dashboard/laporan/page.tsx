
"use client"

import * as React from "react"
import { Plus, FileText, Upload, Calendar, Send, CheckCircle2, MoreVertical, Loader2 } from "lucide-react"
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
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      reportDate: new Date().toISOString(),
      reporterId: user.uid,
      status: "Submitted",
      attachmentIds: [],
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
          <p className="text-muted-foreground">Input dan monitoring laporan kegiatan petugas.</p>
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
                  <span>{new Date(report.reportDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground line-clamp-2">
                  <p>{report.description}</p>
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs">Detail</Button>
                {report.status === 'Draft' && (
                  <Button size="sm" className="bg-primary text-xs">Submit</Button>
                )}
              </CardFooter>
            </Card>
          ))}
          {!isLoading && (!reports || reports.length === 0) && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              Belum ada laporan kegiatan yang tercatat.
            </div>
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Buat Laporan Kegiatan</DialogTitle>
              <DialogDescription>Input rincian kegiatan yang telah dilakukan petugas lapangan.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Judul Kegiatan</Label>
                <Input id="title" name="title" placeholder="Contoh: Pemeliharaan AC Kantor" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Deskripsi Detail</Label>
                <Textarea id="description" name="description" placeholder="Ceritakan detail kegiatan, temuan, dan tindakan..." className="min-h-[120px]" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-primary text-white">Simpan Laporan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
