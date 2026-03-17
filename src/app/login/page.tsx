'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, UserPlus, LogIn, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { auth } = useAuth();
  const { firestore } = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const formatEmail = (input: string) => {
    const email = input.trim();
    return email.includes('@') ? email : `${email.toLowerCase()}@hanura.id`;
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const emailInput = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const email = formatEmail(emailInput);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Login Gagal', description: "Email/Username atau password salah." });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const emailInput = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const email = formatEmail(emailInput);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Special check for primary admin AGUS
      const isAdminAgus = email.toLowerCase() === 'agus@hanura.id';

      const userProfile = {
        id: newUser.uid,
        email: newUser.email,
        fullName: isAdminAgus ? 'AGUS (Super Admin)' : emailInput.split('@')[0],
        role: isAdminAgus ? 'Admin' : 'Employee',
        status: isAdminAgus ? 'Active' : 'Pending Verification',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDocumentNonBlocking(doc(firestore, 'users', newUser.uid), userProfile, { merge: true });
      
      if (isAdminAgus) {
        setDocumentNonBlocking(doc(firestore, 'roles_admin', newUser.uid), { active: true }, { merge: true });
        toast({ 
          title: 'Akun Admin Berhasil Dibuat', 
          description: 'Selamat datang, Bapak Agus. Anda memiliki akses penuh.' 
        });
      } else {
        toast({ 
          title: 'Akun Berhasil Dibuat', 
          description: 'Mohon tunggu admin memverifikasi akun Anda sebelum bisa masuk.' 
        });
      }
      setLoading(false);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Pendaftaran Gagal', description: err.message });
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-xl">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-headline font-bold text-primary">SITU HANURA</h1>
          <div className="mt-2 space-y-1">
            <p className="text-muted-foreground font-medium">Sistem Informasi Terpadu Partai Hanura</p>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">Kota Tanjungpinang</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Masuk</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Selamat Datang Kembali</CardTitle>
                <CardDescription>Gunakan Username atau Email untuk masuk.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Username / Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="email" name="email" placeholder="Contoh: AGUS" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                    Masuk ke Sistem
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>Buat Akun Baru</CardTitle>
                <CardDescription>Daftarkan diri Anda untuk akses aplikasi.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Pilih Username / Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="reg-email" name="email" placeholder="Contoh: AGUS" className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password Baru</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="reg-password" name="password" type="password" placeholder="Minimal 6 karakter" className="pl-10" required />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent text-white hover:bg-accent/90" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    Daftar Akun
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
