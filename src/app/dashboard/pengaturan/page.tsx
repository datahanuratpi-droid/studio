
"use client"

import * as React from "react"
import { Save, User, Sun, Moon, Shield, Loader2, Key, Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, updateDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AppThemeColor } from "@/lib/types"

export default function PengaturanPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = React.useState(false)

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, 'users', user.uid)
  }, [firestore, user?.uid])

  const { data: profile, isLoading } = useDoc(userDocRef)

  // Apply light/dark mode
  const toggleTheme = (checked: boolean) => {
    const theme = checked ? 'dark' : 'light'
    if (userDocRef) {
      updateDocumentNonBlocking(userDocRef, { themePreference: theme })
      document.documentElement.classList.toggle('dark', checked)
    }
  }

  // Apply primary color palette
  const updateThemeColor = (color: AppThemeColor) => {
    if (!userDocRef) return
    
    updateDocumentNonBlocking(userDocRef, { themeColor: color })
    
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'theme-red', 'theme-blue', 'theme-orange', 
      'theme-magenta', 'theme-purple', 'theme-yellow'
    )
    
    // Add the new theme class
    document.documentElement.classList.add(`theme-${color}`)
    
    toast({ 
      title: "Warna Tema Diperbarui", 
      description: `Aplikasi sekarang menggunakan tema warna ${color.charAt(0).toUpperCase() + color.slice(1)}.` 
    })
  }

  const handleUpdateProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!userDocRef) return

    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    
    updateDocumentNonBlocking(userDocRef, {
      fullName: formData.get("fullName") as string,
      phoneNumber: formData.get("phone") as string,
      updatedAt: new Date().toISOString()
    })

    setTimeout(() => {
      setIsSaving(false)
      toast({ title: "Profil Diperbarui", description: "Data diri Anda telah berhasil disimpan." })
    }, 500)
  }

  const handleChangePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!userDocRef) return

    const formData = new FormData(e.currentTarget)
    const newPass = formData.get("new-pass") as string
    const confirmPass = formData.get("confirm-pass") as string

    if (newPass !== confirmPass) {
      toast({ variant: "destructive", title: "Error", description: "Konfirmasi password tidak cocok." })
      return
    }

    if (newPass.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "Password minimal 6 karakter." })
      return
    }

    updateDocumentNonBlocking(userDocRef, {
      passwordDisplay: newPass,
      updatedAt: new Date().toISOString()
    })

    toast({ title: "Password Diperbarui", description: "Password baru Anda telah tersimpan dan disinkronkan." })
    e.currentTarget.reset()
  }

  const colors: { name: AppThemeColor; class: string; label: string }[] = [
    { name: 'red', class: 'bg-red-500', label: 'Merah' },
    { name: 'blue', class: 'bg-blue-600', label: 'Biru' },
    { name: 'orange', class: 'bg-orange-500', label: 'Oren' },
    { name: 'magenta', class: 'bg-pink-500', label: 'Magenta' },
    { name: 'purple', class: 'bg-purple-600', label: 'Ungu' },
    { name: 'yellow', class: 'bg-yellow-500', label: 'Kuning' },
  ]

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Pengaturan SITU HANURA</h1>
        <p className="text-muted-foreground">Kelola profil, tema aplikasi, dan keamanan akun Anda.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border rounded-2xl p-1 h-12">
          <TabsTrigger value="profile" className="flex items-center gap-2 rounded-xl hover:text-black dark:hover:text-white"><User className="h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2 rounded-xl hover:text-black dark:hover:text-white"><Palette className="h-4 w-4" /> Tema</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 rounded-xl hover:text-black dark:hover:text-white"><Shield className="h-4 w-4" /> Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleUpdateProfile}>
            <Card className="border-none shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/10">
                <CardTitle className="text-lg">Informasi Profil</CardTitle>
                <CardDescription>Update data diri Anda yang tersimpan di sistem DPC Partai Hanura.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
                    <Input id="fullName" name="fullName" defaultValue={profile?.fullName || ""} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email / Username</Label>
                    <Input id="email" value={profile?.email || ""} disabled className="bg-muted/50 h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nomor WhatsApp</Label>
                    <Input id="phone" name="phone" defaultValue={profile?.phoneNumber || ""} placeholder="0812..." className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Jabatan</Label>
                    <div className="h-11 flex items-center px-4 border rounded-xl bg-muted/30 text-sm font-bold text-primary">
                      {profile?.role || "Pending"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 bg-muted/5">
                <Button type="submit" className="bg-primary text-white rounded-full px-8 h-11" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Perubahan
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="border-none shadow-md rounded-3xl overflow-hidden">
            <CardHeader className="bg-muted/10">
              <CardTitle className="text-lg">Tampilan Aplikasi</CardTitle>
              <CardDescription>Sesuaikan visual SITU HANURA sesuai kenyamanan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 pt-8">
              {/* Dark Mode Switch */}
              <div className="flex items-center justify-between p-6 rounded-2xl border bg-muted/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    {profile?.themePreference === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Mode Gelap (Dark Mode)</Label>
                    <p className="text-sm text-muted-foreground">Aktifkan untuk kenyamanan mata di malam hari.</p>
                  </div>
                </div>
                <Switch 
                  checked={profile?.themePreference === 'dark'} 
                  onCheckedChange={toggleTheme}
                />
              </div>

              {/* Color Palette */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold">Palet Warna Utama</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => updateThemeColor(color.name)}
                      className={cn(
                        "group relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-lg",
                        profile?.themeColor === color.name 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50 bg-white"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-full shadow-inner flex items-center justify-center", color.class)}>
                        {profile?.themeColor === color.name && <Check className="h-5 w-5 text-white" />}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        profile?.themeColor === color.name ? "text-primary" : "text-muted-foreground"
                      )}>
                        {color.label}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight text-center bg-muted/30 py-2 rounded-lg">
                  Pilihan warna akan mengubah warna tombol, ikon, dan aksen di seluruh aplikasi.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handleChangePassword}>
            <Card className="border-none shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/10">
                <CardTitle className="text-lg">Keamanan Akun</CardTitle>
                <CardDescription>Ganti kata sandi Anda secara berkala untuk menjaga keamanan data.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 max-w-sm">
                  <div className="space-y-2">
                    <Label htmlFor="new-pass" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Kata Sandi Baru</Label>
                    <Input id="new-pass" name="new-pass" type="password" required placeholder="Minimal 6 karakter" className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Konfirmasi Kata Sandi</Label>
                    <Input id="confirm-pass" name="confirm-pass" type="password" required placeholder="Ulangi kata sandi" className="h-11 rounded-xl" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 bg-muted/5">
                <Button type="submit" className="bg-accent text-white hover:bg-accent/90 rounded-full px-8 h-11">
                  <Key className="mr-2 h-4 w-4" /> Perbarui Kata Sandi
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
