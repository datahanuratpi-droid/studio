"use client"

import * as React from "react"
import { Info, MessageSquare, Code, Heart, MapPin, Phone, Mail, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-2">
          <Info className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-primary leading-tight">
          Selamat datang di SITU HANURA
        </h1>
        <p className="text-sm md:text-base text-muted-foreground uppercase tracking-widest font-bold">
          Sistem Informasi Terpadu Hanura Kota Tanjungpinang
        </p>
      </div>

      <Card className="border-none shadow-2xl overflow-visible bg-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
            <div className="p-8 md:p-12 space-y-6 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-primary">Tentang Aplikasi</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Aplikasi ini dibuat dan dikembangkan untuk digunakan di sekretariat dalam pengelolaan data baik laporan maupun surat menyurat.
              </p>
              <div className="pt-4 space-y-4">
                <div className="flex gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="p-3 bg-white rounded-xl text-primary h-fit shadow-sm">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Kritik & Saran</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Aplikasi ini masih perlu banyak pengembangan. Kritik dan saran sangat diharapkan untuk kemajuan sistem ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-primary p-8 md:p-12 text-white flex flex-col justify-center space-y-8 md:rounded-r-2xl">
              <div className="space-y-3">
                <h3 className="text-xl font-bold uppercase tracking-wider border-b border-white/20 pb-2">Informasi Sistem</h3>
                <p className="text-primary-foreground/90 font-medium text-lg">
                  Digitalisasi Administrasi <br />
                  <span className="font-bold">DPC HANURA KOTA TANJUNGPINANG</span>
                </p>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Code className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold tracking-wide">Versi 2.0</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-sm leading-snug">Jalan Gatot Subroto Km 5 Tanjungpinang</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Heart className="h-5 w-5 fill-white" />
                  </div>
                  <span className="text-sm leading-tight font-medium">
                    Dibuat dan dikembangkan oleh Sekretariat DPC Hanura Kota Tanjungpinang
                  </span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="lg" className="w-full font-bold shadow-lg h-12 rounded-xl">
                    Kritik Saran Ke Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">Kontak Admin</DialogTitle>
                    <DialogDescription className="font-medium">
                      Silakan hubungi Admin untuk bantuan teknis.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border">
                      <div className="p-3 bg-primary rounded-xl text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Administrator</p>
                        <p className="text-lg font-bold text-primary">AGUS SURIYADI</p>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <a href="https://wa.me/62817319885" target="_blank" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors border">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Phone className="h-5 w-5" /></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">WhatsApp</span>
                          <span className="text-sm font-bold">0817 319 885</span>
                        </div>
                      </a>
                      <a href="mailto:agussuriyadipunya@gmail.com" className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors border">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Mail className="h-5 w-5" /></div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Email</span>
                          <span className="text-sm font-bold">agussuriyadipunya@gmail.com</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center pt-12 pb-8 text-xs font-bold text-muted-foreground border-t uppercase tracking-[0.2em]">
        © 2026 SITU HANURA - DPC Partai Hanura Kota Tanjungpinang
      </footer>
    </div>
  )
}