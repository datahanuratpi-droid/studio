
"use client"

import * as React from "react"
import { Save, User, Sun, Moon, Shield, Loader2, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, updateDocumentNonBlocking, useDoc, useMemoFirebase } from "@/firebase"
import { doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

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

  // Apply theme change locally
  const toggleTheme = (checked: boolean) => {
    const theme = checked ? 'dark' : 'light'
    if (userDocRef) {
      updateDocumentNonBlocking(userDocRef, { themePreference: theme })
      document.documentElement.classList.toggle('dark', checked)
    }
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

    // Update password display in Firestore for Admin visibility
    updateDocumentNonBlocking(userDocRef, {
      passwordDisplay: newPass,
      updatedAt: new Date().toISOString()
    })

    toast({ title: "Password Diperbarui", description: "Password baru Anda telah tersimpan dan disinkronkan." })
    e.currentTarget.reset()
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Pengaturan SITU HANURA</h1>
        <p className="text-muted-foreground">Kelola profil, tema aplikasi, dan keamanan akun Anda.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="profile" className="flex items-center gap-2"><User className="h-4 w-4" /> Profil</TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2"><Sun className="h-4 w-4" /> Tema</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2"><Shield className="h-4 w-4" /> Keamanan</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleUpdateProfile}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>Update data diri Anda yang tersimpan di sistem DPC Partai Hanura.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" name="fullName" defaultValue={profile?.fullName || ""} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email / Username</Label>
                    <Input id="email" value={profile?.email || ""} disabled className="bg-muted/50" />
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Email tidak dapat diubah</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                    <Input id="phone" name="phone" defaultValue={profile?.phoneNumber || ""} placeholder="Contoh: 0812..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role Pengguna</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted/30 text-sm font-bold text-primary">
                      {profile?.role || "Pending"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" className="bg-primary text-white" disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Simpan Perubahan Profil
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="theme">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Tema Aplikasi</CardTitle>
              <CardDescription>Sesuaikan tampilan visual SITU HANURA sesuai kenyamanan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <form onSubmit={handleChangePassword}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Keamanan & Kata Sandi</CardTitle>
                <CardDescription>Ganti kata sandi Anda. Data akan disinkronkan untuk pemantauan Admin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 max-w-sm">
                  <div className="space-y-2">
                    <Label htmlFor="new-pass">Kata Sandi Baru</Label>
                    <Input id="new-pass" name="new-pass" type="password" required placeholder="Minimal 6 karakter" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Konfirmasi Kata Sandi Baru</Label>
                    <Input id="confirm-pass" name="confirm-pass" type="password" required placeholder="Ulangi kata sandi" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button type="submit" className="bg-accent text-white hover:bg-accent/90">
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
