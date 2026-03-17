
"use client"

import * as React from "react"
import { Info, Shield, Zap, Heart, Code, Github } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl mb-4">
          <Info className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary">Tentang OfficeFlow</h1>
        <p className="text-xl text-muted-foreground">Sistem Manajemen Kantor Terintegrasi v1.0.0</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-headline font-bold text-primary">Visi Kami</h2>
          <p className="text-muted-foreground leading-relaxed">
            OfficeFlow dirancang untuk memodernisasi alur kerja perkantoran tradisional. Kami percaya bahwa setiap kantor berhak memiliki sistem yang efisien, transparan, dan mudah digunakan tanpa kerumitan teknologi yang berlebihan.
          </p>
          <div className="flex gap-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Keamanan Data</h4>
              <p className="text-sm text-muted-foreground">Data tersimpan aman di cloud dengan enkripsi tingkat lanjut.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold">Performa Cepat</h4>
              <p className="text-sm text-muted-foreground">Akses data instan dengan teknologi caching modern.</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold">Informasi Pengembang</h3>
            <p className="text-primary-foreground/80">Aplikasi ini dikembangkan oleh tim internal IT Support untuk meningkatkan produktivitas operasional kantor.</p>
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span className="text-sm">Built with Next.js & Firebase</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 fill-white" />
                <span className="text-sm">Made with passion for efficiency</span>
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-4">
              <Github className="mr-2 h-4 w-4" /> Hubungi Support
            </Button>
          </CardContent>
        </Card>
      </div>

      <footer className="text-center pt-12 text-sm text-muted-foreground">
        © 2024 OfficeFlow Management System. All rights reserved.
      </footer>
    </div>
  )
}
