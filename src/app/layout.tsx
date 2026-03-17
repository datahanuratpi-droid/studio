
import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'SITU HANURA | Sistem Informasi Terpadu Partai Hanura Kota Tanjungpinang',
  description: 'Sistem Informasi Terpadu Partai Hanura Kota Tanjungpinang untuk efisiensi alur kerja operasional.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              // Handle Theme Preference (Dark/Light)
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }

              // Handle Theme Color
              const savedColor = localStorage.getItem('themeColor');
              if (savedColor) {
                document.documentElement.classList.add('theme-' + savedColor);
              }
            } catch (_) {}
          `,
        }} />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground transition-colors duration-300">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
