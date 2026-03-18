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
  LogOut,
  User as UserIcon,
  Inbox,
  Send,
  Menu,
  X,
  Loader2,
  Clock,
  Library,
  Briefcase,
  MonitorOff,
  UserCheck,
  Calendar as CalendarIcon
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
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"

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
              "w-full justify-between px-3 py-2 h-10 font-bold transition-all hover:bg-primary/10 hover:text-primary rounded-xl",
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
                  "w-full justify-start h-9 text-muted-foreground font-medium transition-all hover:text-primary hover:bg-primary/5 rounded-xl",
                  pathname === subItem.href && "bg-primary text-white hover:bg-primary hover:text-white shadow-sm font-bold"
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
        "w-full justify-start px-3 py-2 h-10 font-bold transition-all hover:bg-primary/10 hover:text-primary rounded-xl",
        active && "bg-primary text-white hover:bg-primary hover:text-white shadow-md shadow-primary/20"
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
  const { toast } = useToast()
  
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

  // Device Security Check
  React.useEffect(() => {
    if (!isUserLoading && !isProfileLoading && user && profile && profile.status === 'Active') {
      const storedDeviceId = localStorage.getItem('situ_device_id');
      if (profile.deviceId && storedDeviceId !== profile.deviceId) {
        toast({
          variant: "destructive",
          title: "Sesi Tidak Valid",
          description: "Akun Anda terdeteksi digunakan di perangkat lain atau ID perangkat telah direset. Silakan login kembali."
        });
        signOut(auth).then(() => router.push('/login'));
      }
    }
  }, [profile, isUserLoading, isProfileLoading, user, auth, router, toast]);

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
      <div className="flex h-screen items-center justify-center bg-transparent">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (user && profile && profile.status !== 'Active') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-transparent p-6 text-center space-y-6">
        <div className="p-4 bg-amber-100 rounded-full text-amber-600">
          <Clock className="h-12 w-12" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-bold text-primary">Akun Menunggu Verifikasi</h1>
          <p className="text-muted-foreground font-medium">Akun Anda sedang diverifikasi oleh Admin.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="rounded-full px-8 h-12 font-bold">Keluar</Button>
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
    <div className="flex h-screen text-foreground max-w-full overflow-hidden bg-background">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-white/40 backdrop-blur-xl hidden md:flex flex-col h-full sticky top-0 z-40 print:hidden shadow-2xl">
        {/* Sidebar Header - FIXED */}
        <div className="p-6 pb-4 border-b bg-transparent shrink-0">
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 text-center group">
            <Logo iconOnly className="w-12 h-12 group-hover:scale-105 transition-transform duration-300" />
            <div className="flex flex-col items-center mt-2">
              <span className="text-xl font-black text-primary uppercase tracking-tighter leading-none">SITU HANURA</span>
              <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mt-1">Kota Tanjungpinang</span>
            </div>
          </Link>
        </div>

        {/* Sidebar Navigation - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 pt-4 space-y-1">
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
        </div>

        {/* Sidebar Footer - FIXED WITH LOGIN INFO */}
        <div className="mt-auto p-6 border-t space-y-4 shrink-0 bg-white/50 backdrop-blur-sm">
          {/* Info Login Section */}
          <div className="space-y-4">
             <div className="space-y-1">
               <div className="flex items-center gap-1.5">
                 <MonitorOff className="h-3 w-3 text-muted-foreground/60" />
                 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">User ID (Device)</span>
               </div>
               <span className="text-[9px] font-mono font-bold text-primary truncate block leading-none" title={profile?.deviceId || 'No ID'}>
                 {profile?.deviceId || 'NOT_LINKED'}
               </span>
             </div>
             
             <div className="space-y-1">
               <div className="flex items-center gap-1.5">
                 <UserCheck className="h-3 w-3 text-muted-foreground/60" />
                 <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest">Username</span>
               </div>
               <span className="text-[10px] font-black text-slate-700 truncate block uppercase leading-none">
                 {profile?.fullName || 'N/A'}
               </span>
             </div>
             
             <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
               <div className="space-y-1">
                 <div className="flex items-center gap-1">
                   <CalendarIcon className="h-2.5 w-2.5 text-muted-foreground/60" />
                   <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">Tanggal</span>
                 </div>
                 <span className="text-[9px] font-bold text-slate-700 block leading-none">
                   {currentDateTime?.date || '...'}
                 </span>
               </div>
               <div className="space-y-1">
                 <div className="flex items-center gap-1">
                   <Clock className="h-2.5 w-2.5 text-muted-foreground/60" />
                   <span className="text-[7px] font-black text-muted-foreground/60 uppercase tracking-widest">Jam</span>
                 </div>
                 <span className="text-[9px] font-black text-primary block leading-none">
                   {currentDateTime?.time || '00:00'}
                 </span>
               </div>
             </div>
          </div>
        </div>
      </aside>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden print:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-[85vw] max-w-[320px] h-full bg-card/95 backdrop-blur-md p-6 shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8 shrink-0">
              <Logo className="w-auto h-12" />
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full bg-muted/20"><X className="h-5 w-5 text-primary" /></Button>
            </div>
            <nav className="space-y-1 overflow-y-auto no-scrollbar flex-1 pr-2">
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
               <Button variant="ghost" className="w-full justify-start text-destructive font-black rounded-xl hover:bg-destructive/10" onClick={handleLogout}>
                <LogOut className="mr-3 h-5 w-5" /> KELUAR
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Top Header - FIXED */}
        <header className="h-14 bg-white/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 shrink-0 z-30 print:hidden border-b w-full shadow-sm sticky top-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="md:hidden h-9 w-9 hover:bg-primary/5 rounded-full">
              <Menu className="h-5 w-5 text-primary" />
            </Button>
            <h2 className="hidden md:block text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">Sistem Informasi Terpadu</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-primary/5 rounded-full hidden sm:flex">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0.5 rounded-full h-10 w-10 overflow-hidden bg-primary/10 hover:bg-primary/20 transition-all duration-300">
                   <div className="w-full h-full flex items-center justify-center text-primary font-black text-sm uppercase">
                     {profile?.fullName?.charAt(0)}
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-none animate-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-black text-primary uppercase tracking-tight">{profile?.fullName}</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{profile?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="mx-2 my-1" />
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl font-bold text-xs p-3"><Link href="/dashboard/pengaturan"><UserIcon className="mr-2 h-4 w-4" /> Profil Saya</Link></DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-xl font-bold text-xs p-3"><Link href="/dashboard/pengaturan"><Settings className="mr-2 h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                <DropdownMenuSeparator className="mx-2 my-1" />
                <DropdownMenuItem className="text-destructive font-black text-xs cursor-pointer rounded-xl p-3 hover:bg-destructive/10" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> KELUAR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content - SCROLLABLE */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar print:p-0 print:overflow-visible w-full bg-muted/5">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 print:max-w-none">
            {children}
          </div>
        </main>
      </div>

      {/* ABOUT DIALOG - INTERACTIVE & FLOATING */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent className="w-[90vw] sm:max-w-[380px] p-0 border-none rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 print:hidden bg-white fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] focus-visible:outline-none focus:outline-none">
          <DialogHeader className="sr-only">
            <DialogTitle>TENTANG APLIKASI</DialogTitle>
            <DialogDescription>Informasi mengenai sistem dan pengembang aplikasi SITU HANURA.</DialogDescription>
          </DialogHeader>
          <div className="relative p-8 pt-14 space-y-8 flex flex-col items-center">
            {/* Elegant Close Button */}
            <button 
              onClick={() => setIsAboutOpen(false)} 
              className="absolute right-6 top-6 h-10 w-10 rounded-full flex items-center justify-center text-primary/60 border border-primary/10 hover:bg-primary/5 hover:text-primary transition-all duration-300 hover:rotate-90"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6 w-full flex flex-col items-center">
              {/* Header Title with Primary Color */}
              <div className="relative">
                <h1 className="text-2xl font-black text-primary uppercase tracking-tight text-center relative z-10">
                  TENTANG APLIKASI
                </h1>
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-primary/10 rounded-full"></div>
              </div>
              
              {/* Welcome Description */}
              <div className="text-slate-600 leading-relaxed text-sm font-medium text-center px-4">
                <p>
                  Selamat datang di Aplikasi <span className="text-primary font-black">SITU HANURA</span> versi 2.0. 
                  Aplikasi ini dikembangkan dan dirancang untuk mempermudah pengecekkan dan penginputan data. 
                  Aplikasi ini masih perlu pengembangan kedepannya.
                </p>
              </div>

              {/* Enhanced Notice Box */}
              <div className="w-full p-4 bg-[#fffcf0] border border-[#fff3bf] rounded-[1.5rem] shadow-sm flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-[#fff3bf] rounded-full shrink-0">
                   <Clock className="h-3.5 w-3.5 text-[#e67e22]" />
                </div>
                <p className="text-[#e67e22] font-black text-[10px] leading-relaxed uppercase">
                  Proses Verifikasi Admin maksimal 1x24jam kerja jika berkas telah lengkap dan jelas terbaca.
                </p>
              </div>

              {/* Contact Info Section */}
              <div className="w-full p-6 bg-[#f5faff] rounded-[2rem] border border-blue-100 shadow-inner group transition-all hover:shadow-md">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <div className="w-4 h-px bg-slate-300"></div> KONTAK & SARAN
                </h4>
                <div className="space-y-5">
                  <div className="group/item cursor-pointer">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 group-hover/item:text-primary transition-colors">EMAIL:</span>
                    <p className="text-sm font-black text-slate-700 hover:text-primary transition-colors truncate">agussuriyadipunya@gmail.com</p>
                  </div>
                  <div className="group/item cursor-pointer">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 group-hover/item:text-primary transition-colors">WHATSAPP:</span>
                    <p className="text-sm font-black text-slate-700 hover:text-primary transition-colors">0817319885</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refined Italicized Footer */}
            <footer className="text-center w-full pt-4 opacity-60">
              <p className="text-[11px] font-bold italic text-slate-400">
                Terima kasih atas kontribusi Anda membangun SITU.
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
