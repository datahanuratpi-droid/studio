
"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  ShieldCheck, 
  CheckCircle,
  Download,
  Wallet,
  Calculator,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useDoc, useMemoFirebase, useCollection } from "@/firebase"
import { doc, collection } from "firebase/firestore"
import { StaffMember, FinancialTransaction } from "@/lib/types"

export default function SalarySlipReaderPage() {
  const searchParams = useSearchParams()
  const staffId = searchParams.get('id')
  const firestore = useFirestore()

  const staffRef = useMemoFirebase(() => {
    if (!firestore || !staffId) return null
    return doc(firestore, "staff_members", staffId)
  }, [firestore, staffId])
  
  const { data: staff, isLoading: isStaffLoading } = useDoc<StaffMember>(staffRef)

  const transRef = useMemoFirebase(() => collection(firestore, "financial_transactions"), [firestore])
  const { data: transactions, isLoading: isTransLoading } = useCollection<FinancialTransaction>(transRef)

  const outstandingKasbon = React.useMemo(() => {
    if (!transactions || !staffId) return 0
    return transactions
      .filter(t => t.involvedStaffId === staffId && t.type === 'CashAdvance' && !t.isClosed)
      .reduce((acc, curr) => acc + curr.amount, 0)
  }, [transactions, staffId])

  const handlePrint = () => {
    window.print()
  }

  if (isStaffLoading || isTransLoading) {
    return (
      <div className="min-h-screen bg-[#525659] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#525659] flex items-center justify-center text-white">
        Data Karyawan Tidak Ditemukan
      </div>
    )
  }

  const netSalary = staff.baseSalary - outstandingKasbon

  return (
    <div className="min-h-screen bg-[#525659] flex flex-col font-body animate-in fade-in duration-500">
      {/* Toolbar Ala PDF Reader */}
      <header className="h-14 bg-[#323639] text-white flex items-center justify-between px-4 sticky top-0 z-50 shadow-lg print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.close()} className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded shadow-sm">
              <Banknote className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">
              Slip Gaji - {staff.fullName}.pdf
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrint} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
            <Printer className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto flex justify-center p-4 md:p-10">
        <div className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-12 md:p-20 flex flex-col relative print:shadow-none print:m-0 print:p-10">
          
          {/* Kop Surat Resmi */}
          <div className="flex flex-col items-center text-center space-y-4 border-b-4 border-double border-primary pb-8 mb-10">
            <div className="flex items-center justify-center gap-6">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-xl font-headline font-bold text-primary uppercase tracking-tight">PARTAI HATI NURANI RAKYAT</h1>
                <h2 className="text-md font-bold text-primary uppercase">(HANURA)</h2>
                <h3 className="text-xs font-bold text-primary uppercase">DEWAN PIMPINAN CABANG KOTA TANJUNGPINANG</h3>
              </div>
            </div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase leading-relaxed max-w-lg">
              Jl. Gatot Subroto Km. 5 No. 12, Kel. Kampung Bulang, Kec. Tanjungpinang Timur <br />
              Kota Tanjungpinang, Provinsi Kepulauan Riau - Kode Pos 29124
            </p>
          </div>

          {/* Judul Dokumen */}
          <div className="text-center space-y-1 mb-10">
            <h2 className="text-lg font-black underline uppercase tracking-widest">SLIP GAJI KARYAWAN</h2>
            <p className="text-[10px] font-mono font-bold text-muted-foreground">Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Data Karyawan */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-12 border p-6 rounded-2xl bg-muted/5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Karyawan</p>
              <p className="font-bold text-primary uppercase">{staff.fullName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jabatan</p>
              <p className="font-bold text-primary uppercase">{staff.position}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bank / No Rekening</p>
              <p className="font-medium text-slate-700">{staff.bankName || "-"} / {staff.accountNumber || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status Pembayaran</p>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-[9px] font-bold">DIGITAL PAID</Badge>
            </div>
          </div>

          {/* Rincian Finansial */}
          <div className="flex-1 space-y-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-y-2 border-primary bg-primary/5">
                  <th className="text-left py-3 px-4 font-black uppercase text-[10px]">Deskripsi Pendapatan / Potongan</th>
                  <th className="text-right py-3 px-4 font-black uppercase text-[10px]">Jumlah (IDR)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 px-4 font-bold">Gaji Pokok Bulanan</td>
                  <td className="py-4 px-4 text-right font-mono">Rp {staff.baseSalary.toLocaleString('id-ID')}</td>
                </tr>
                {outstandingKasbon > 0 && (
                  <tr className="border-b text-red-600 bg-red-50/30">
                    <td className="py-4 px-4 font-bold flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Potongan Kasbon (Outstanding)
                    </td>
                    <td className="py-4 px-4 text-right font-mono">- Rp {outstandingKasbon.toLocaleString('id-ID')}</td>
                  </tr>
                )}
                <tr className="bg-slate-50">
                  <td className="py-4 px-4 font-black text-primary uppercase">Total Gaji Bersih (Net Salary)</td>
                  <td className="py-4 px-4 text-right font-mono font-black text-primary text-lg">Rp {netSalary.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>

            <div className="p-4 bg-muted/20 rounded-xl border border-dashed border-muted-foreground/30 text-[10px] leading-relaxed italic text-muted-foreground">
              Catatan: Slip gaji ini dihasilkan secara otomatis oleh Sistem Informasi Terpadu (SITU) Hanura. Potongan kasbon dihitung berdasarkan saldo pinjaman yang belum lunas pada saat slip ini dicetak.
            </div>
          </div>

          {/* Tanda Tangan */}
          <div className="mt-20 flex justify-between items-end">
             <div className="text-center w-48 space-y-16">
                <p className="text-[10px] font-bold uppercase">Penerima,</p>
                <div className="border-b border-slate-400 pb-1">
                   <p className="font-bold text-xs uppercase">{staff.fullName}</p>
                </div>
             </div>

             <div className="text-center w-64 space-y-16">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase">Ditetapkan di: Tanjungpinang</p>
                <p className="text-[10px] font-bold uppercase">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              
              <div className="relative inline-block">
                {/* Simulated Digital Stamp */}
                <div className="absolute -top-12 -left-12 opacity-20 pointer-events-none rotate-12">
                   <div className="w-32 h-32 border-4 border-primary rounded-full flex items-center justify-center text-primary font-bold text-[10px] uppercase text-center p-2">
                     DPC HANURA <br /> TANJUNGPINANG <br /> TREASURY
                   </div>
                </div>
                <p className="font-bold underline text-sm uppercase">ENDANG WIRNANTO</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Bendahara DPC Tanjungpinang</p>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="absolute bottom-10 left-10 flex items-center gap-2 opacity-40 select-none print:hidden">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-[8px] font-mono font-bold uppercase text-slate-400">Payroll Digital Verified System</span>
          </div>
        </div>
      </main>

      {/* Floating Verification Indicator */}
      <div className="fixed bottom-6 right-6 bg-primary text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce print:hidden">
        <CheckCircle className="h-4 w-4" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Slip Gaji Sah Secara Digital</span>
      </div>
    </div>
  )
}
