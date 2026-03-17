
"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  FileText,
  ShieldCheck,
  CheckCircle,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function DocumentReaderPage() {
  const searchParams = useSearchParams()
  const title = searchParams.get('title') || "Dokumen Arsip Digital"
  
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    toast({
      title: "Mengunduh Berkas",
      description: "Berkas sedang diproses untuk pengunduhan otomatis.",
    })
  }

  return (
    <div className="min-h-screen bg-[#525659] flex flex-col font-body animate-in fade-in duration-500">
      {/* Header / Toolbar Ala PDF Reader */}
      <header className="h-14 bg-[#323639] text-white flex items-center justify-between px-4 sticky top-0 z-50 shadow-lg print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.close()} className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded shadow-sm">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium truncate max-w-[200px] md:max-w-md">
              {title}.pdf
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 bg-black/20 p-1 rounded-lg">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white"><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-xs px-2 font-mono text-white/50 border-x border-white/10">100%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white"><ZoomIn className="h-4 w-4" /></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrint} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
            <Printer className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
            <Download className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto flex justify-center p-4 md:p-10">
        <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-12 md:p-20 flex flex-col relative print:shadow-none print:m-0 print:p-10">
          
          {/* Simulasi Kop Surat Resmi */}
          <div className="flex flex-col items-center text-center space-y-4 border-b-4 border-double border-primary pb-8 mb-10">
            <div className="flex items-center justify-center gap-6">
              {/* Logo Simulation */}
              <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-headline font-bold text-primary uppercase tracking-tight">PARTAI HATI NURANI RAKYAT</h1>
                <h2 className="text-lg font-bold text-primary uppercase">(HANURA)</h2>
                <h3 className="text-sm font-bold text-primary uppercase">DEWAN PIMPINAN CABANG KOTA TANJUNGPINANG</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase leading-relaxed max-w-lg">
              Jl. Gatot Subroto Km. 5 No. 12, Kel. Kampung Bulang, Kec. Tanjungpinang Timur <br />
              Kota Tanjungpinang, Provinsi Kepulauan Riau - Kode Pos 29124
            </p>
          </div>

          {/* Isi Dokumen Simulasi */}
          <div className="flex-1 space-y-8 text-sm md:text-base leading-relaxed text-slate-800">
            <div className="text-center space-y-1">
              <p className="font-bold underline uppercase">SURAT KEPUTUSAN</p>
              <p className="text-xs font-mono">NOMOR: 024/SK/DPC-HANURA/TPI/2026</p>
            </div>

            <div className="space-y-4">
              <p className="font-bold uppercase text-xs tracking-widest text-primary">Tentang:</p>
              <p className="font-bold text-center">PENGESAHAN ADMINISTRASI DIGITAL DAN ARSIP TERPADU <br /> SISTU HANURA KOTA TANJUNGPINANG</p>
            </div>

            <div className="space-y-6 pt-4">
              <p className="font-medium italic">Menimbang:</p>
              <ol className="list-decimal pl-6 space-y-3">
                <li>Bahwa untuk menjamin kelancaran administrasi di Sekretariat DPC Partai Hanura Kota Tanjungpinang perlu dilakukan digitalisasi arsip.</li>
                <li>Bahwa dokumen dengan judul <span className="font-bold">"{title}"</span> telah diverifikasi dan dinyatakan sah sebagai bagian dari arsip digital organisasi.</li>
              </ol>

              <p className="font-medium italic">Memutuskan:</p>
              <ol className="list-decimal pl-6 space-y-3">
                <li>Mengesahkan penyimpanan digital untuk dokumen tersebut dalam sistem SITU HANURA.</li>
                <li>Dokumen ini memiliki kekuatan hukum yang sama dengan dokumen fisik asli di dalam operasional harian partai.</li>
              </ol>
            </div>

            {/* Simulated Content Filler */}
            <div className="pt-10 space-y-4 opacity-70">
              <p>Demikian surat keputusan ini dibuat untuk dapat dipergunakan sebagaimana mestinya. Apabila terdapat kekeliruan di kemudian hari, maka akan dilakukan perbaikan sebagaimana mestinya.</p>
            </div>
          </div>

          {/* Footer / Tanda Tangan Simulasi */}
          <div className="mt-20 flex flex-col items-end">
            <div className="text-center w-64 space-y-16">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase">Ditetapkan di: Tanjungpinang</p>
                <p className="text-xs font-bold uppercase">Pada Tanggal: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              
              <div className="relative inline-block">
                {/* Simulated Digital Stamp */}
                <div className="absolute -top-12 -left-12 opacity-20 pointer-events-none rotate-12">
                   <div className="w-32 h-32 border-4 border-primary rounded-full flex items-center justify-center text-primary font-bold text-[10px] uppercase text-center p-2">
                     DPC HANURA <br /> TANJUNGPINANG <br /> VERIFIED
                   </div>
                </div>
                <p className="font-bold underline">AGUS SURIYADI, S.H.</p>
                <p className="text-xs font-medium text-muted-foreground uppercase">Ketua DPC Kota Tanjungpinang</p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="absolute bottom-10 left-10 flex items-center gap-2 opacity-50 select-none print:hidden">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Digital Archive Verified System</span>
          </div>

          {/* Watermark Simulation */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
            <div className="rotate-[-45deg] whitespace-nowrap text-[120px] font-bold text-primary uppercase">
              ASLI • SITU HANURA • ASLI • SITU HANURA
            </div>
          </div>
        </div>
      </main>

      {/* Floating Verification Indicator */}
      <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce print:hidden">
        <CheckCircle className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Dokumen Sah Secara Digital</span>
      </div>
    </div>
  )
}
