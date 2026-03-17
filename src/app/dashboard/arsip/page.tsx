
"use client"

import * as React from "react"
import { Search, Archive, File, Download, ExternalLink, Filter, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ArsipPage() {
  const files = [
    { id: "1", name: "SOP_Keamanan_2024.pdf", size: "1.2 MB", type: "PDF", category: "Internal" },
    { id: "2", name: "Daftar_Asset_Kantor.xlsx", size: "450 KB", type: "XLSX", category: "Inventaris" },
    { id: "3", name: "Foto_Kegiatan_Gathering.jpg", size: "3.4 MB", type: "JPG", category: "Dokumentasi" },
    { id: "4", name: "Template_Surat_Resmi.docx", size: "85 KB", type: "DOCX", category: "Template" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Arsip Digital</h1>
        <p className="text-muted-foreground">Cari dan unduh file arsip yang diupload oleh Admin.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama file, kategori, atau tipe..." className="pl-10 h-11" />
        </div>
        <Button variant="outline" className="h-11 px-6"><Filter className="mr-2 h-4 w-4" /> Kategori</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden group hover:border-accent transition-colors">
            <div className="aspect-video bg-muted flex items-center justify-center relative">
              <File className="h-12 w-12 text-muted-foreground/50" />
              <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="rounded-full"><Download className="h-4 w-4" /></Button>
                <Button size="icon" variant="secondary" className="rounded-full"><ExternalLink className="h-4 w-4" /></Button>
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-bold text-primary truncate flex-1" title={file.name}>{file.name}</p>
                <Badge variant="outline" className="text-[9px] shrink-0">{file.type}</Badge>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{file.category}</span>
                <span>{file.size}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
