'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  Wallet, 
  Users, 
  Settings, 
  Info,
  ChevronDown,
  Bell,
  Search,
  LogOut,
  User as UserIcon,
  Inbox,
  Send,
  Menu,
  X,
  Loader2,
  Clock,
  MessageSquare,
  MapPin,
  Heart,
  Code,
  Phone,
  Mail as MailIcon,
  Library,
  Briefcase
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { doc } from "firebase/firestore"

interface SidebarItemProps {
  href?: string
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  subItems?: { href: string; label: string; icon: React.ReactNode }[]
}

function SidebarItem({ href, icon, label, active, onClick, subItems }: SidebarItemProps) {
  const [isOpen, setIsOpen] = React.useState(active || false)
  const pathname = usePathname()

  if (subItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between px-3 py-2 h-10 font-bold transition-all hover:bg-primary/5 hover:text-primary",
              active && "bg-primary/5 text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className="text-sm">{label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
          {subItems.map((subItem) => (
            <Link key={subItem.href} href={subItem.href} onClick={onClick}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-9 text-muted-foreground font-medium transition-all hover:text-primary hover:bg-primary/5",
                  pathname === subItem.href && "bg-primary text-white hover:bg-primary hover:text-white rounded-xl shadow-sm font-bold"
                )}
              >
                {subItem.icon}
                <span className="ml-2 text-xs">{subItem.label}</span>
              </Button>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const content = (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start px-3 py-2 h-10 font-bold transition-all hover:bg-primary/5 hover:text-primary",
        active && "bg-primary text-white hover:bg-primary hover:text-white rounded-xl shadow-md shadow-primary/20"
      )}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    </Button>
  )

  if (href) {
    return (
      <Link href={href} className="w-full" onClick={onClick}>
        {content}
      </Link>
    )
  }

  return content
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isAboutOpen, setIsAboutOpen] = React.useState(false)
  const [currentDateTime, setCurrentDateTime] = React.useState<{date: string, time: string} | null>(null)

  React.useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setCurrentDateTime({
        date: now.toLocaleDateString('id-ID', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        }),
        time: now.toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        })
      })
    }
    updateDateTime()
    const timer = setInterval(updateDateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null
    return doc(firestore, 'users', user.uid)
  }, [firestore, user?.uid])

  const { data: profile, isLoading: isProfileLoading } = useDoc(userDocRef)

  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  }

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user && profile && profile.status !== 'Active') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background p-6 text-center space-y-6">
        <div className="p-4 bg-amber-100 rounded-full text-amber-600">
          <Clock className="h-12 w-12" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold text-primary">Akun Menunggu Verifikasi</h1>
          <p className="text-muted-foreground">Akun Anda sedang diverifikasi oleh Admin.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="rounded-full">Keluar</Button>
      </div>
    )
  }

  const menuItems = [
    { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", roles: ["Admin", "KSB", "Staff"] },
    { 
      href: "/dashboard/surat", 
      icon: <Mail className="h-5 w-5" />, 
      label: "Surat Menyurat",
      roles: ["Admin", "KSB", "Staff"],
      subItems: [
        { href: "/dashboard/surat/masuk", label: "Surat Masuk", icon: <Inbox className="h-4 w-4" /> },
        { href: "/dashboard/surat/keluar", label: "Surat Keluar", icon: <Send className="h-4 w-4" /> },
      ]
    },
    { href: "/dashboard/laporan", icon: <FileText className="h-5 w-5" />, label: "Laporan Kegiatan", roles: ["Admin", "KSB", "Staff"] },
    { href: "/dashboard/kas", icon: <Wallet className="h-5 w-5" />, label: "Kas Office", roles: ["Admin", "KSB", "Staff"] },
    { href: "/dashboard/karyawan", icon: <Briefcase className="h-5 w-5" />, label: "Karyawan", roles: ["Admin"] },
    { href: "/dashboard/pustaka", icon: <Library className="h-5 w-5" />, label: "Pustaka Hanura", roles: ["Admin", "KSB", "Staff"] },
    { href: "/dashboard/users", icon: <Users className="h-5 w-5" />, label: "Manajemen User", roles: ["Admin"] },
    { href: "/dashboard/pengaturan", icon: <Settings className="h-5 w-5" />, label: "Pengaturan", roles: ["Admin", "KSB", "Staff"] },
    { 
      label: "About", 
      icon: <Info className="h-5 w-5" />, 
      roles: ["Admin", "KSB", "Staff"],
      onClick: () => setIsAboutOpen(true)
    },
  ].filter(item => profile && item.roles.includes(profile.role))

  return (
    <div className="flex min-h-screen bg-background text-foreground max-w-full overflow-x-hidden">
      <aside className="w-64 border-r bg-card hidden md:flex flex-col sticky top-0 h-screen z-40 print:hidden shadow-sm">
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 mb-8 text-center group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col items-center mt-2">
              <span className="text-xl font-bold text-primary uppercase tracking-tighter">SITU HANURA</span>
              <div className="flex flex-col items-center leading-none mt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {currentDateTime?.date || "..."}
                </span>
                <span className="text-[11px] font-bold text-primary">
                  {currentDateTime?.time || "00:00"}
                </span>
              </div>
            </div>
          </Link>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={item.href ? (pathname === item.href || (item.subItems && pathname.startsWith(item.href))) : (item.label === 'About' && isAboutOpen)}
                subItems={item.subItems}
                onClick={item.onClick}
              />
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t text-center shrink-0">
          <Button variant="ghost" className="w-full justify-start text-destructive font-bold hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" /> Keluar
          </Button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden print:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-card p-6 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 shrink-0">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-primary">SITU HANURA</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">{currentDateTime?.date} {currentDateTime?.time}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </div>
            <nav className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={item.href ? (pathname === item.href || (item.subItems && pathname.startsWith(item.href))) : false}
                  subItems={item.subItems}
                  onClick={() => {
                    if (item.onClick) item.onClick()
                    if (!item.subItems) setIsMobileMenuOpen(false)
                  }}
                />
              ))}
            </nav>
            <div className="mt-auto pt-6 border-t shrink-0">
               <Button variant="ghost" className="w-full justify-start text-destructive font-bold" onClick={handleLogout}>
                <LogOut className="mr-3 h-5 w-5" /> Keluar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <header className="h-14 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 print:hidden border-b w-full">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="md:hidden h-9 w-9 hover:bg-primary/5">
            <Menu className="h-5 w-5 text-primary" />
          </Button>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hidden sm:flex h-9 w-9 hover:bg-primary/5">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0.5 rounded-full h-9 w-9 overflow-hidden bg-primary/10 hover:bg-primary/20 transition-colors">
                   <div className="w-full h-full flex items-center justify-center text-primary font-black text-xs uppercase">
                     {profile?.fullName?.charAt(0)}
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-none">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-black text-primary uppercase tracking-tight">{profile?.fullName}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{profile?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2 my-1" />
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl font-bold text-xs"><Link href="/dashboard/pengaturan"><UserIcon className="mr-2 h-4 w-4" /> Profil Saya</Link></DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl font-bold text-xs"><Link href="/dashboard/pengaturan"><Settings className="mr-2 h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2 my-1" />
                <DropdownMenuItem className="text-destructive font-black text-xs cursor-pointer rounded-xl" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0 print:overflow-visible w-full">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500 print:max-w-none">
            {children}
          </div>
        </main>
      </div>

      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="w-[90vw] sm:max-w-[380px] p-0 border-none rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 print:hidden bg-[#f8f9fb]">
          <DialogHeader className="sr-only">
            <DialogTitle>Tentang Aplikasi SITU HANURA</DialogTitle>
            <DialogDescription>Informasi mengenai sistem dan pengembang aplikasi.</DialogDescription>
          </DialogHeader>
          <div className="relative p-8 pt-14 space-y-8 flex flex-col items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAboutOpen(false)} 
              className="absolute right-6 top-6 h-10 w-10 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors shadow-sm"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="space-y-6 w-full">
              <h1 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight text-center">
                TENTANG APLIKASI
              </h1>
              
              <div className="text-slate-600 leading-relaxed text-sm font-medium text-center px-2">
                <p>
                  Selamat datang di Aplikasi SITU HANURA versi 2.0. 
                  Aplikasi ini dikembangkan dan dirancang untuk mempermudah dalam pengecekkan dan penginputan data. 
                  Aplikasi ini masih perlu pengembangan kedepannya, kritik dan saran sangat diperlukan.
                </p>
              </div>

              {/* Yellow Verification Box */}
              <div className="p-5 bg-[#fff9db] border border-[#fff3bf] rounded-[1.5rem]">
                <p className="text-[#e67e22] font-bold text-[11px] leading-relaxed text-center">
                  - Proses Verifikasi Admin maksimal 1x24jam kerja jika berkas telah lengkap dan jelas terbaca
                </p>
              </div>

              {/* Contact Area */}
              <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">KONTAK & SARAN:</h4>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email:</span>
                    <p className="text-sm font-black text-primary">agussuriyadipunya@gmail.com</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Whatsapp:</span>
                    <p className="text-sm font-black text-primary">0817319885</p>
                  </div>
                </div>
              </div>
            </div>

            <footer className="text-center w-full pt-4 pb-2">
              <p className="text-[9px] font-medium italic text-slate-400">
                Terima kasih atas kontribusi Anda.
              </p>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>
}
