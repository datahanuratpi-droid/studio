
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
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
    const email = input.trim().toLowerCase();
    return email.includes('@') ? email : `${email}@hanura.id`;
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!auth) {
      toast({ variant: 'destructive', title: 'Sistem Belum Siap', description: 'Silakan muat ulang halaman.' });
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const emailInput = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    
    if (!emailInput || !password) {
      toast({ variant: 'destructive', title: 'Input Kosong', description: 'Silakan isi username dan password.' });
      setLoading(false);
      return;
    }

    const email = formatEmail(emailInput);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login Berhasil', description: 'Mengarahkan Anda ke Dashboard...' });
    } catch (err: any) {
      console.error("Login error:", err);
      let message = "Username atau password salah.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = "Kredensial tidak valid. Periksa kembali username/password.";
      }
      
      toast({ variant: 'destructive', title: 'Gagal Masuk', description: message });
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Sistem Belum Siap', description: 'Silakan muat ulang halaman.' });
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const emailInput = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    
    if (!emailInput || !password) {
      toast({ variant: 'destructive', title: 'Input Kosong', description: 'Silakan isi username dan password baru.' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast({ variant: 'destructive', title: 'Password Lemah', description: 'Password minimal harus 6 karakter.' });
      setLoading(false);
      return;
    }

    const email = formatEmail(emailInput);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      const isAdminAgus = emailInput.toUpperCase() === 'AGUS';

      const userProfile = {
        id: newUser.uid,
        email: newUser.email,
        fullName: isAdminAgus ? 'AGUS (Super Admin)' : emailInput,
        role: isAdminAgus ? 'Admin' : 'Staff',
        status: isAdminAgus ? 'Active' : 'Pending Verification',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDocumentNonBlocking(doc(firestore, 'users', newUser.uid), userProfile, { merge: true });
      
      if (isAdminAgus) {
        setDocumentNonBlocking(doc(firestore, 'roles_admin', newUser.uid), { active: true }, { merge: true });
        toast({ 
          title: 'Akun Admin Aktif', 
          description: 'Selamat datang Pak Agus. Akun Anda telah otomatis diverifikasi.' 
        });
      } else {
        toast({ 
          title: 'Pendaftaran Berhasil', 
          description: 'Akun Anda sedang menunggu verifikasi dari Admin.' 
        });
      }
      
      setTimeout(() => setLoading(false), 1000);
    } catch (err: any) {
      console.error("Signup error:", err);
      let message = "Terjadi kesalahan saat mendaftar.";
      if (err.code === 'auth/email-already-in-use') {
        message = "Username ini sudah terdaftar. Silakan gunakan menu Masuk.";
      }
      
      toast({ variant: 'destructive', title: 'Pendaftaran Gagal', description: message });
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center flex flex-col items-center">
          <Logo iconOnly className="w-16 h-16 mb-6" />
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tighter">SITU HANURA</h1>
          <div className="mt-2 space-y-1">
            <p className="text-muted-foreground font-medium">Sistem Informasi Terpadu Partai Hanura</p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.2em] text-center">Kota Tanjungpinang</p>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-md rounded-xl">
            <TabsTrigger value="login" className="rounded-lg font-bold">Masuk</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg font-bold">Daftar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl rounded-[2rem]">
              <CardHeader>
                <CardTitle className="font-black">Selamat Datang Kembali</CardTitle>
                <CardDescription>Gunakan Username atau Email untuk masuk.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Username / Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="email" 
                        name="email" 
                        placeholder="Contoh: AGUS" 
                        className="pl-10 h-11 rounded-xl bg-background/50 border-none font-medium" 
                        required 
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" title="Password keamanan Anda" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 rounded-xl bg-background/50 border-none" 
                        required 
                        disabled={loading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary text-white h-12 rounded-full font-black text-xs uppercase tracking-widest shadow-lg hover:bg-primary/90 transition-all" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Masuk ke Sistem
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl rounded-[2rem]">
              <CardHeader>
                <CardTitle className="font-black">Buat Akun Baru</CardTitle>
                <CardDescription>Daftarkan diri Anda untuk akses aplikasi SITU HANURA.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Pilih Username / Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="reg-email" 
                        name="email" 
                        placeholder="Contoh: AGUS" 
                        className="pl-10 h-11 rounded-xl bg-background/50 border-none font-medium" 
                        required 
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" title="Pilih password minimal 6 karakter" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Password Baru</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        id="reg-password" 
                        name="password" 
                        type="password" 
                        placeholder="Minimal 6 karakter" 
                        className="pl-10 h-11 rounded-xl bg-background/50 border-none" 
                        required 
                        disabled={loading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 rounded-full font-black text-xs uppercase tracking-widest shadow-lg transition-all" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mendaftarkan...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Daftar Akun
                      </>
                    )}
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
