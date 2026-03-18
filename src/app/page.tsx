
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function RootPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center flex flex-col items-center space-y-6">
        <Logo iconOnly className="w-24 h-24 animate-in zoom-in-50 duration-700" />
        <div className="space-y-1">
          <p className="text-2xl font-black font-headline text-primary uppercase tracking-tighter">SITU HANURA</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">Sistem Informasi Terpadu Partai Hanura</p>
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-[0.3em]">Kota Tanjungpinang</p>
          </div>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    </div>
  );
}
