
"use client"

import * as React from "react"
import { Save, User, Bell, Shield, Laptop, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PengaturanPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Pengaturan</h1>
        <p className="text-muted-foreground">Kelola profil Anda dan konfigurasi aplikasi.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Notifikasi</TabsTrigger>
          <TabsTrigger value="security">Keamanan</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>Update data diri Anda yang terlihat di sistem.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="john@office.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input id="phone" defaultValue="+62 812 3456 7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue="Administrator" disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="bg-primary text-white"><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Notifikasi</CardTitle>
              <CardDescription>Atur bagaimana sistem memberi tahu Anda tentang aktivitas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifikasi</Label>
                  <p className="text-sm text-muted-foreground">Terima ringkasan surat masuk via email.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Browser Notification</Label>
                  <p className="text-sm text-muted-foreground">Tampilkan notifikasi di pojok layar.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Laporan Bulanan</Label>
                  <p className="text-sm text-muted-foreground">Dapatkan file PDF rekap kas bulanan otomatis.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>Ganti password dan atur autentikasi dua faktor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-pass">Password Saat Ini</Label>
                <Input id="current-pass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-pass">Password Baru</Label>
                <Input id="new-pass" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-pass">Konfirmasi Password Baru</Label>
                <Input id="confirm-pass" type="password" />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="bg-primary text-white">Ganti Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Konfigurasi Sistem</CardTitle>
              <CardDescription>Pengaturan spesifik aplikasi OfficeFlow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Hanya Admin yang bisa login saat mode ini aktif.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Ubah tema aplikasi menjadi gelap.</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
