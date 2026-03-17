"use client"

import * as React from "react"
import { Info, MessageSquare, Code, Heart, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
          <Info className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">Tentang SITU HANURA</h1>
        <p className="text-xl text-muted-foreground uppercase tracking-wider font-medium">Sistem Informasi Terpadu Hanura Kota Tanjungpinang</p>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 space-y-6">
              <h2 className="text-2xl font-headline font-bold text-primary">Selamat datang di SITU HANURA</h2>
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
                    <p className="text-sm text-muted-foreground">Aplikasi ini masih perlu banyak pengembangan. Kritik dan saran sangat diharapkan untuk kemajuan sistem ini.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary p-8 md:p-12 text-white flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Informasi Sistem</h3>
                <p className="text-primary-foreground/80">Digitalisasi administrasi DPC Partai Hanura Kota Tanjungpinang.</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Code className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Versi 1.2.0 (Stable)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Tanjungpinang, Kepulauan Riau</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Heart className="h-4 w-4 fill-white" />
                  </div>
                  <span className="text-sm">Dibuat khusus untuk Hanura Tanjungpinang</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full font-bold">
                Kirim Saran ke Admin
              </Button>
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
