'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Mail, 
  FileText, 
  Archive, 
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
  Calendar
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { useUser, useAuth, useDoc, useFirestore, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { doc } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"

interface SidebarItemProps {
  href: string
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
              "w-full justify-between px-3 py-2 h-10 font-medium transition-all hover:bg-accent/10",
              active && "bg-accent/5 text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className="text-sm">{label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
          {subItems.map((subItem) => (
            <Link key={subItem.href} href={subItem.href} onClick={onClick}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-9 text-muted-foreground font-normal hover:text-primary hover:bg-accent/5",
                  pathname === subItem.href && "text-primary font-medium bg-accent/5"
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

  return (
    <Link href={href} className="w-full" onClick={onClick}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-3 py-2 h-10 font-medium transition-all hover:bg-accent/10",
          active && "bg-accent/10 text-primary border-r-2 border-primary rounded-none"
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      </Button>
    </Link>
  )
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
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
      <div className="flex h-screen flex-col items-center justify-center bg-background p-6 text-center space-y-6 animate-in fade-in duration-500">
        <div className="p-4 bg-amber-100 rounded-full text-amber-600 animate-pulse">
          <Clock className="h-12 w-12" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-headline font-bold text-primary">Akun Menunggu Verifikasi</h1>
          <p className="text-muted-foreground">
            Terima kasih telah mendaftar, <strong>{user.email}</strong>. Saat ini akun Anda sedang dalam proses verifikasi oleh Admin SITU HANURA.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 rounded-full">
          <LogOut className="h-4 w-4" /> Keluar
        </Button>
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
    { href: "/dashboard/arsip", icon: <Archive className="h-5 w-5" />, label: "Arsip", roles: ["Admin", "KSB", "Staff"] },
    { href: "/dashboard/kas", icon: <Wallet className="h-5 w-5" />, label: "Kas Office", roles: ["Admin", "KSB", "Staff"] },
    { href: "/dashboard/users", icon: <Users className="h-5 w-5" />, label: "Manajemen User", roles: ["Admin"] },
    { href: "/dashboard/pengaturan", icon: <Settings className="h-5 w-5" />, label: "Pengaturan", roles: ["Admin", "KSB", "Staff"] },
    { href: "/dashboard/about", icon: <Info className="h-5 w-5" />, label: "About", roles: ["Admin", "KSB", "Staff"] },
  ].filter(item => profile && item.roles.includes(profile.role))

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Sidebar Desktop */}
      <aside className="w-64 border-r bg-card hidden lg:flex flex-col sticky top-0 h-screen z-40 transition-all duration-300">
        <div className="p-6">
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-2 mb-10 text-center group">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xl font-headline font-bold text-primary tracking-tight">SITU HANURA</span>
              <div className="flex flex-col items-center leading-none mt-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {currentDateTime?.date || "..."}
                </span>
                <span className="text-[11px] font-bold text-primary mt-0.5">
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
                active={pathname === item.href || (item.subItems && pathname.startsWith(item.href))}
                subItems={item.subItems}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t text-center space-y-4">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">DPC Hanura Tanjungpinang</p>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" /> Keluar
          </Button>
        </div>
      </aside>

      {/* Sidebar Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-card p-6 shadow-2xl animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-headline font-bold text-primary">SITU HANURA</span>
                </div>
                <div className="flex flex-col items-start leading-none pl-10">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    {currentDateTime?.date || "..."}
                  </span>
                  <span className="text-[10px] font-bold text-primary mt-0.5">
                    {currentDateTime?.time || "00:00"}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.label}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  onClick={() => setIsMobileMenuOpen(false)}
                  active={pathname === item.href || (item.subItems && pathname.startsWith(item.href))}
                  subItems={item.subItems}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Header Responsif */}
        <header className="h-16 border-b bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-all duration-300">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden shrink-0" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="relative w-full max-w-xs md:max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari data..." 
                className="pl-10 h-9 bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-accent rounded-full transition-all focus:max-w-md"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 ml-2">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hidden sm:flex">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 rounded-full border border-border hover:bg-accent/5 transition-colors">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase text-xs">
                     {profile?.fullName?.charAt(0) || 'U'}
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl animate-in fade-in zoom-in duration-200">
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="truncate text-sm font-bold">{profile?.fullName}</span>
                    <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-tighter">{profile?.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard/pengaturan"><UserIcon className="mr-2 h-4 w-4" /> Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link href="/dashboard/pengaturan"><Settings className="mr-2 h-4 w-4" /> Pengaturan</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive font-bold rounded-xl cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Konten Utama Responsif */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>
}
