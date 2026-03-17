
"use client"

import * as React from "react"
import { Plus, Search, Filter, Send, Calendar, User, MoreHorizontal, FileText } from "lucide-react"
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

export default function SuratKeluarPage() {
  const letters = [
    { id: "1", no: "002/ADM/OUT/2024", subject: "Balasan Kerjasama Vendor", recipient: "PT. Maju Bersama", date: "2024-03-21", status: "Sent" },
    { id: "2", no: "003/ORG/OUT/2024", subject: "Surat Tugas Monitoring", recipient: "Andi Wijaya", date: "2024-03-22", status: "Draft" },
    { id: "3", no: "005/ADM/OUT/2024", subject: "Pemberitahuan Cuti Bersama", recipient: "Seluruh Karyawan", date: "2024-03-23", status: "Reviewed" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Surat Keluar</h1>
          <p className="text-muted-foreground">Kelola dan tracking surat yang keluar dari kantor.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white rounded-full">
          <Plus className="mr-2 h-4 w-4" /> Buat Surat Keluar
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
              <TableHead>Penerima</TableHead>
              <TableHead>Tanggal Kirim</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.map((letter) => (
              <TableRow key={letter.id}>
                <TableCell className="font-mono text-xs">{letter.no}</TableCell>
                <TableCell className="font-medium">{letter.subject}</TableCell>
                <TableCell>{letter.recipient}</TableCell>
                <TableCell>{letter.date}</TableCell>
                <TableCell>
                  <Badge variant={letter.status === 'Sent' ? 'default' : letter.status === 'Draft' ? 'outline' : 'secondary'}>
                    {letter.status}
                  </Badge>
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
