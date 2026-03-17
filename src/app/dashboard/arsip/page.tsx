
"use client"

import * as React from "react"
import { Search, Archive, File, Download, ExternalLink, Filter, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

export default function ArsipPage() {
  const firestore = useFirestore()
  
  // Mengambil data surat secara real-time untuk dijadikan arsip digital
  const lettersRef = useMemoFirebase(() => collection(firestore, "correspondences"), [firestore])
  const { data: letters, isLoading } = useCollection(lettersRef)

  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredLetters = letters?.filter(letter => 
    letter.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    letter.correspondenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    letter.senderRecipientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Arsip Digital Real-time</h1>
        <p className="text-muted-foreground">Akses data surat menyurat yang telah tersimpan di sistem secara sinkron.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nomor surat, subjek, atau pengirim..." 
            className="pl-10 h-11" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 px-6"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Sinkronisasi data arsip...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredLetters?.map((letter) => (
            <Card key={letter.id} className="overflow-hidden group hover:border-accent transition-all hover:shadow-lg border-border/50">
              <div className="aspect-[4/3] bg-muted/30 flex flex-col items-center justify-center relative p-6 border-b">
                <div className="p-4 bg-white rounded-2xl shadow-sm mb-3">
                  <Mail className="h-10 w-10 text-primary/40" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-white">
                  {letter.type === 'Incoming' ? 'Masuk' : 'Keluar'}
                </Badge>
                
                <div className="absolute inset-0 bg-primary/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
                  <Button size="icon" variant="secondary" className="rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform"><Download className="h-4 w-4" /></Button>
                  <Button size="icon" variant="secondary" className="rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform"><ExternalLink className="h-4 w-4" /></Button>
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-accent uppercase tracking-tighter truncate">{letter.correspondenceNumber}</p>
                  <p className="text-sm font-bold text-primary line-clamp-1" title={letter.subject}>{letter.subject}</p>
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium pt-2 border-t border-border/50">
                  <span className="truncate max-w-[100px]">{letter.senderRecipientName}</span>
                  <span className="shrink-0">{new Date(letter.correspondenceDate).toLocaleDateString('id-ID')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredLetters?.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-2">
              <Archive className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground">Tidak ditemukan data arsip yang sesuai pencarian.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
