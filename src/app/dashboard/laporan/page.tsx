
"use client"

import * as React from "react"
import { Plus, FileText, Upload, Calendar, Send, CheckCircle2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LaporanKegiatanPage() {
  const reports = [
    { id: "1", title: "Pemeliharaan AC Kantor", reporter: "Budi Santoso", date: "2024-03-15", status: "Approved" },
    { id: "2", title: "Monitoring Jaringan Bulanan", reporter: "Siti Aminah", date: "2024-03-18", status: "Submitted" },
    { id: "3", title: "Stok Opname Alat Tulis", reporter: "Andi Wijaya", date: "2024-03-20", status: "Draft" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Laporan Kegiatan</h1>
          <p className="text-muted-foreground">Input dan monitoring laporan kegiatan petugas.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-white rounded-full px-6">
          <Plus className="mr-2 h-4 w-4" /> Buat Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
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
                <span>{report.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Pelapor: {report.reporter}</span>
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
      </div>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}
