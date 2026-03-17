
"use client"

import * as React from "react"
import { 
  Plus, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFirestore, useUser, addDocumentNonBlocking, useCollection, useMemoFirebase } from "@/firebase"
import { collection } from "firebase/firestore"

export default function KasOfficePage() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedType, setSelectedType] = React.useState<string>("Payment")
  const { firestore } = useFirestore()
  const { user } = useUser()

  const transRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, "financial_transactions")
  }, [firestore])

  const { data: transactions, isLoading } = useCollection(transRef)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !firestore) return

    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get("amount") as string)
    
    const data = {
      amount,
      transactionDate: new Date().toISOString(),
      description: formData.get("description") as string,
      type: selectedType,
      categoryId: "Routine", // Simplified for MVP
      recordedByUserId: user.uid,
      attachmentIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addDocumentNonBlocking(collection(firestore, "financial_transactions"), data)
    setIsDialogOpen(false)
  }

  const totalSaldo = transactions?.reduce((acc, curr) => {
    if (curr.type === 'Receipt') return acc + curr.amount
    return acc - curr.amount
  }, 0) || 0

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Kas Office</h1>
          <p className="text-muted-foreground">Kelola keuangan rutin, kasbon, dan slip gaji.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-full"><FileText className="mr-2 h-4 w-4" /> Slip Gaji</Button>
           <Button 
            className="bg-accent hover:bg-accent/90 text-white rounded-full"
            onClick={() => setIsDialogOpen(true)}
           >
            <Plus className="mr-2 h-4 w-4" /> Transaksi
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-white/20 rounded-lg"><Wallet className="h-6 w-6" /></div>
              <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Saldo</span>
            </div>
            <p className="text-3xl font-bold">Rp {totalSaldo.toLocaleString('id-ID')}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp className="h-6 w-6" /></div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pemasukan</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type === 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600"><TrendingDown className="h-6 w-6" /></div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pengeluaran</span>
            </div>
            <p className="text-3xl font-bold text-primary">
              Rp {transactions?.filter(t => t.type !== 'Receipt').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID') || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Jumlah (Rp)</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8"><Loader2 className="animate-spin h-6 w-6 mx-auto" /></TableCell>
                  </TableRow>
                ) : transactions?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs text-muted-foreground">{new Date(t.transactionDate).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{t.description}</TableCell>
                    <TableCell className="font-mono font-bold">{t.amount.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {t.type === 'Receipt' ? (
                          <ArrowUpRight className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-500" />
                        )}
                        <span className={t.type === 'Receipt' ? "text-green-600" : "text-red-600"}>
                          {t.type === 'Receipt' ? 'Income' : 'Expense'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Buka</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Catat Transaksi</DialogTitle>
              <DialogDescription>Input pemasukan atau pengeluaran kas kantor.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipe Transaksi</Label>
                <Select onValueChange={setSelectedType} defaultValue={selectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receipt">Pemasukan (Receipt)</SelectItem>
                    <SelectItem value="Payment">Pengeluaran (Payment)</SelectItem>
                    <SelectItem value="CashAdvance">Kasbon (Cash Advance)</SelectItem>
                    <SelectItem value="SalarySlip">Gaji (Salary Slip)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input id="amount" name="amount" type="number" placeholder="Contoh: 500000" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Keterangan</Label>
                <Input id="description" name="description" placeholder="Keperluan transaksi" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="bg-primary text-white">Simpan Transaksi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
