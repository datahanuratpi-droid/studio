"use client"

import * as React from "react"
import { Info, Shield, Zap, Heart, Code, Github, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
          <Info className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">Tentang SITU HANURA</h1>
        <p className="text-xl text-muted-foreground">Sistem Informasi Terpadu Partai Hanura Kota Tanjungpinang</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-headline font-bold text-primary">Visi & Misi</h2>
          <p className="text-muted-foreground leading-relaxed">
            SITU HANURA adalah platform digital yang dirancang khusus untuk mengelola administrasi, keuangan, dan pelaporan kegiatan Partai Hanura di wilayah Kota Tanjungpinang. Kami berkomitmen mewujudkan transparansi dan efisiensi dalam tata kelola organisasi partai.
          </p>
          <div className="flex gap-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Kerahasiaan Data</h4>
              <p className="text-sm text-muted-foreground">Sistem keamanan enkripsi untuk melindungi data internal partai.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Lokalitas</h4>
              <p className="text-sm text-muted-foreground">Disesuaikan dengan kebutuhan operasional DPC Hanura Kota Tanjungpinang.</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold">Informasi Sistem</h3>
            <p className="text-primary-foreground/80">Aplikasi ini merupakan bagian dari upaya digitalisasi infrastruktur partai untuk mendukung koordinasi yang lebih cepat dan akurat.</p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="text-sm">Versi 1.1.0 (Digitalized Infrastructure)</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 fill-white" />
                <span className="text-sm">Made for Hanura Tanjungpinang</span>
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-4">
               Hubungi Sekretariat
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center pt-12 text-sm text-muted-foreground">
        © 2024 SITU HANURA - DPC Partai Hanura Kota Tanjungpinang. All rights reserved.
      </footer>
    </div>
  )
}
