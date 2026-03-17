
"use client"

import Link from 'next/link'
import { FileText, ArrowRight, Shield, Layout, PieChart, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">OfficeFlow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="/dashboard">
            <Button className="bg-primary text-white hover:bg-primary/90 rounded-full px-6">
              Masuk ke Dashboard
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent border border-accent/20 mb-4">
                Sistem Manajemen Kantor Terintegrasi v1.0
              </div>
              <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary max-w-4xl">
                Kelola Operasional Kantor dengan <span className="text-accent">Efisien</span> dan Modern
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-body mt-4">
                OfficeFlow membantu Anda mengelola surat menyurat, laporan kegiatan, kas kantor, dan arsip digital dalam satu platform yang aman dan mudah digunakan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link href="/dashboard">
                  <Button size="lg" className="rounded-full px-8 bg-primary text-white hover:bg-primary/90 h-12 text-md shadow-lg">
                    Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="rounded-full px-8 border-primary text-primary h-12 text-md">
                  Pelajari Fitur
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-headline font-bold text-primary sm:text-4xl">Solusi Lengkap Manajemen Kantor</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Fitur yang dirancang khusus untuk kebutuhan administrasi perkantoran modern.</p>
            </div>
            <div className="grid gap-12 lg:grid-cols-3 md:grid-cols-2">
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Surat Menyurat</h3>
                <p className="text-muted-foreground">
                  Kelola surat masuk dan keluar secara digital dengan sistem penomoran otomatis dan tracking status yang jelas.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Kas & Keuangan</h3>
                <p className="text-muted-foreground">
                  Pantau pemasukan, pengeluaran rutin, kasbon, hingga pembuatan slip gaji secara transparan dan akurat.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Laporan Kegiatan</h3>
                <p className="text-muted-foreground">
                  Input laporan kegiatan lapangan dengan mudah, lengkap dengan upload dokumentasi foto dan file pendukung.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Arsip Aman</h3>
                <p className="text-muted-foreground">
                  Penyimpanan dokumen digital terpusat yang memudahkan pencarian data dan menjaga keamanan informasi kantor.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <UserCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Manajemen Akses</h3>
                <p className="text-muted-foreground">
                  Verifikasi pengguna baru oleh Admin untuk memastikan hanya personel yang berwenang yang dapat mengakses data.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-3 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-headline font-bold text-primary">Dashboard Informatif</h3>
                <p className="text-muted-foreground">
                  Ringkasan seluruh aktivitas kantor dalam satu layar untuk memudahkan pengambilan keputusan cepat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-white">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl mb-6">
              Siap Meningkatkan Produktivitas Kantor?
            </h2>
            <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl mb-10">
              Gunakan OfficeFlow sekarang dan rasakan kemudahan mengelola administrasi dalam satu sistem terintegrasi.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="rounded-full bg-accent text-white hover:bg-accent/90 h-12 px-10 shadow-xl">
                Akses Dashboard Sekarang
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2024 OfficeFlow Management System. Hak Cipta Dilindungi.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Syarat & Ketentuan</Link>
            <Link className="text-xs hover:underline underline-offset-4 text-muted-foreground" href="#">Kebijakan Privasi</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
