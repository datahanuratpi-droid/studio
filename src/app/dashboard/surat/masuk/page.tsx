
"use client"

import * as React from "react"
import { Plus, Search, Filter, Mail, Calendar, User, MoreHorizontal, FileText } from "lucide-react"
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

export default function SuratMasukPage() {
  const letters = [
    { id: "1", no: "001/ADM/2024", subject: "Undangan Sosialisasi Pajak", sender: "Kantor Pajak", date: "2024-03-20", status: "Received" },
    { id: "2", no: "045/ORG/2024", subject: "Permohonan Kerjasama Event", sender: "Komunitas Kreatif", date: "2024-03-19", status: "Reviewed" },
    { id: "3", no: "122/DEP/2024", subject: "Laporan Bulanan Divisi", sender: "Kepala Divisi IT", date: "2024-03-18", status: "Archived" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Surat Masuk</h1>
          <p className="text-muted-foreground">Kelola dan tracking surat yang masuk ke kantor.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white rounded-full">
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
              <TableHead>Tanggal Terma</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.map((letter) => (
              <TableRow key={letter.id}>
                <TableCell className="font-mono text-xs">{letter.no}</TableCell>
                <TableCell className="font-medium">{letter.subject}</TableCell>
                <TableCell>{letter.sender}</TableCell>
                <TableCell>{letter.date}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{letter.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
