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
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
          <Info className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary leading-tight">
          Selamat datang di SITU HANURA
        </h1>
        <p className="text-xl text-muted-foreground uppercase tracking-wider font-medium">
          Sistem Informasi Terpadu Hanura Kota Tanjungpinang
        </p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6">
              <h2 className="text-2xl font-headline font-bold text-primary">Tentang Aplikasi</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Aplikasi ini dibuat dan dikembangkan untuk digunakan di sekretariat dalam pengelolaan data baik laporan maupun surat menyurat.
              </p>
              <div className="pt-4 space-y-4">
                <div className="flex gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent h-fit">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Kritik & Saran</h4>
                    <p className="text-sm text-muted-foreground">
                      Aplikasi ini masih perlu banyak pengembangan. Kritik dan saran sangat diharapkan untuk kemajuan sistem ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary p-8 md:p-12 text-white flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold uppercase tracking-wide">Informasi Sistem</h3>
                <p className="text-primary-foreground/90 font-medium">
                  Digitalisasi Administrasi <br />
                  DPC HANURA KOTA TANJUNGPINANG
                </p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Code className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">Versi 2.0</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Jalan Gatot Subroto Km 5 Tanjungpinang</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Heart className="h-4 w-4 fill-white" />
                  </div>
                  <span className="text-sm leading-tight">
                    Dibuat dan dikembangkan oleh Sekretariat DPC Hanura Kota Tanjungpinang
                  </span>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="w-full font-bold shadow-lg">
                    Kritik Saran Ke Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold text-primary">Kontak Admin</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                      Silakan hubungi Admin untuk bantuan teknis atau menyampaikan saran.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                      <div className="p-3 bg-primary rounded-xl text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                        <p className="text-lg font-bold text-primary">AGUS SURIYADI</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:scale-110 transition-transform">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">WhatsApp</span>
                          <span className="text-sm font-bold">0817 319 885</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-xl transition-colors cursor-pointer group">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                          <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Email</span>
                          <span className="text-sm font-bold">agussuriyadipunya@gmail.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button variant="outline" className="rounded-full" asChild>
                      <a href="https://wa.me/62817319885" target="_blank" rel="noopener noreferrer">
                        Hubungi via WhatsApp
                      </a>
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="text-center pt-8 text-sm text-muted-foreground border-t">
        © 2024 SITU HANURA - DPC Partai Hanura Kota Tanjungpinang. All rights reserved.
      </footer>
    </div>
  )
}
