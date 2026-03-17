"use client"

import * as React from "react"
import { Save, User, Sun, Moon, Shield, Loader2, Key, Palette, Check, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, updateDocumentNonBlocking, useDoc, useMemoFirebase, useAuth } from "@/firebase"
import { doc } from "firebase/firestore"
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AppThemeColor } from "@/lib/types"

export default function PengaturanPage() {
  const { user } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, 'users', user.uid)
  }, [firestore, user?.uid])

  const { data: profile, isLoading } = useDoc(userDocRef)

  const toggleTheme = (checked: boolean) => {
    const theme = checked ? 'dark' : 'light'
    if (userDocRef) {
      updateDocumentNonBlocking(userDocRef, { themePreference: theme })
      document.documentElement.classList.toggle('dark', checked)
    }
  }

  const updateThemeColor = (color: AppThemeColor) => {
    if (!userDocRef) return
    updateDocumentNonBlocking(userDocRef, { themeColor: color })
    document.documentElement.classList.remove('theme-red', 'theme-blue', 'theme-orange', 'theme-magenta', 'theme-purple', 'theme-yellow')
    document.documentElement.classList.add(`theme-${color}`)
    localStorage.setItem('themeColor', color)
    toast({ title: "Warna Tema Diperbarui", description: `Aplikasi sekarang menggunakan tema warna ${color}.` })
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
      toast({ title: "Profil Diperbarui", description: "Data Anda telah disimpan." })
    }, 500)
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !auth || !userDocRef) return

    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Gagal", description: "Konfirmasi kata sandi baru tidak cocok." })
      return
    }

    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Gagal", description: "Kata sandi baru minimal 6 karakter." })
      return
    }

    setIsUpdatingPassword(true)

    try {
      // Re-autentikasi untuk keamanan
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Update password di Firebase Auth
      await updatePassword(user, newPassword)
      
      // Update passwordDisplay di Firestore UserProfile untuk sinkronisasi sistem (Admin view)
      updateDocumentNonBlocking(userDocRef, {
        passwordDisplay: newPassword,
        updatedAt: new Date().toISOString()
      })

      toast({ title: "Kata Sandi Berhasil Diperbarui", description: "Silakan gunakan kata sandi baru untuk login berikutnya." })
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      console.error("Change password error:", err)
      let message = "Terjadi kesalahan saat mengganti kata sandi."
      if (err.code === 'auth/wrong-password') {
        message = "Kata sandi lama yang Anda masukkan salah."
      }
      toast({ variant: "destructive", title: "Perubahan Gagal", description: message })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const colors: { name: AppThemeColor; class: string; label: string }[] = [
    { name: 'red', class: 'bg-red-500', label: 'Merah' },
    { name: 'blue', class: 'bg-blue-600', label: 'Biru' },
    { name: 'orange', class: 'bg-orange-500', label: 'Oren' },
    { name: 'magenta', class: 'bg-pink-500', label: 'Magenta' },
    { name: 'purple', class: 'bg-purple-600', label: 'Ungu' },
    { name: 'yellow', class: 'bg-yellow-500', label: 'Kuning' },
  ]

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-primary">Pengaturan SITU HANURA</h1>
        <p className="text-muted-foreground">Kelola profil, tema, dan keamanan akun Anda.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border rounded-2xl p-1 h-12 shadow-sm">
          <TabsTrigger value="profile" className="flex items-center gap-2 rounded-xl"><User className="h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2 rounded-xl"><Palette className="h-4 w-4" /> Tema</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 rounded-xl"><Shield className="h-4 w-4" /> Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleUpdateProfile}>
            <Card className="border-none shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/10">
                <CardTitle className="text-lg">Informasi Profil</CardTitle>
                <CardDescription>Update data diri Anda yang tersimpan di sistem.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
                    <Input name="fullName" defaultValue={profile?.fullName || ""} required className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Nomor WhatsApp</Label>
                    <Input name="phone" defaultValue={profile?.phoneNumber || ""} className="h-11 rounded-xl" />
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
              <CardDescription>Sesuaikan visual SITU HANURA sesuai keinginan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 pt-8">
              <div className="flex items-center justify-between p-6 rounded-2xl border bg-muted/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    {profile?.themePreference === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Mode Gelap</Label>
                    <p className="text-sm text-muted-foreground">Aktifkan mode gelap untuk kenyamanan mata.</p>
                  </div>
                </div>
                <Switch checked={profile?.themePreference === 'dark'} onCheckedChange={toggleTheme} />
              </div>
              <div className="space-y-6">
                <h3 className="text-base font-bold flex items-center gap-2"><Palette className="h-5 w-5" /> Palet Warna Utama</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => updateThemeColor(color.name)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all hover:shadow-lg",
                        profile?.themeColor === color.name ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-white"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", color.class)}>
                        {profile?.themeColor === color.name && <Check className="h-5 w-5 text-white" />}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{color.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handleChangePassword}>
            <Card className="border-none shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" /> Pengaturan Keamanan
                </CardTitle>
                <CardDescription>Ganti kata sandi login Anda secara berkala untuk menjaga keamanan akun.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" title="Kata sandi yang saat ini Anda gunakan" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                    Kata Sandi Lama
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="currentPassword" 
                      name="currentPassword" 
                      type="password" 
                      placeholder="Masukkan kata sandi lama" 
                      required 
                      className="h-11 pl-10 rounded-xl bg-muted/20 border-none" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Kata Sandi Baru
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type="password" 
                        placeholder="Minimal 6 karakter" 
                        required 
                        className="h-11 pl-10 rounded-xl bg-muted/20 border-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                      Konfirmasi Kata Sandi Baru
                    </Label>
                    <div className="relative">
                      <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password" 
                        placeholder="Ulangi kata sandi baru" 
                        required 
                        className="h-11 pl-10 rounded-xl bg-muted/20 border-none" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 bg-muted/5">
                <Button type="submit" className="bg-primary text-white rounded-full px-8 h-11" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Kata Sandi Baru
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
