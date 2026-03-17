
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
  Clock
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

interface SidebarItemProps {
  href: string
  icon: React.ReactNode
  label: string
  active?: boolean
  subItems?: { href: string; label: string; icon: React.ReactNode }[]
}

function SidebarItem({ href, icon, label, active, subItems }: SidebarItemProps) {
  const [isOpen, setIsOpen] = React.useState(active || false)
  const pathname = usePathname()

  if (subItems) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between px-3 py-2 h-10 font-medium transition-colors hover:bg-accent/50",
              active && "bg-accent/10 text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span>{label}</span>
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 space-y-1 mt-1">
          {subItems.map((subItem) => (
            <Link key={subItem.href} href={subItem.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-start h-9 text-muted-foreground font-normal hover:text-primary",
                  pathname === subItem.href && "text-primary font-medium bg-accent/5"
                )}
              >
                {subItem.icon}
                <span className="ml-2">{subItem.label}</span>
              </Button>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link href={href} className="w-full">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-3 py-2 h-10 font-medium transition-colors hover:bg-accent/50",
          active && "bg-accent/10 text-primary border-r-2 border-primary rounded-none"
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
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
        <div className="p-4 bg-amber-100 rounded-full text-amber-600 animate-pulse">
          <Clock className="h-12 w-12" />
        </div>
        <div className="max-w-md space-y-2">
          <h1 className="text-2xl font-headline font-bold text-primary">Akun Menunggu Verifikasi</h1>
          <p className="text-muted-foreground">
            Terima kasih telah mendaftar, <strong>{user.email}</strong>. Saat ini akun Anda sedang dalam proses verifikasi oleh Admin SITU HANURA.
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            Anda akan bisa mengakses fitur aplikasi SITU HANURA setelah Admin memberikan peran (Role) pada akun Anda.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" /> Keluar
        </Button>
      </div>
    )
  }

  // Filter menu items based on roles
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
    { href: "/dashboard/pengaturan", icon: <Settings className="h-5 w-5" />, label: "Pengaturan", roles: ["Admin", "KSB"] },
    { href: "/dashboard/about", icon: <Info className="h-5 w-5" />, label: "About", roles: ["Admin", "KSB", "Staff"] },
  ].filter(item => profile && item.roles.includes(profile.role))

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-white hidden lg:flex flex-col sticky top-0 h-screen z-40">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-headline font-bold text-primary">SITU HANURA</span>
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
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Partai Hanura Tanjungpinang</p>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" /> Keluar
          </Button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white p-6 animate-in slide-in-from-left duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-headline font-bold text-primary">SITU HANURA</span>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
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
                  active={pathname === item.href || (item.subItems && pathname.startsWith(item.href))}
                  subItems={item.subItems}
                />
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen relative">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari data..." 
                className="pl-10 bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-accent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right mr-2">
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Kota Tanjungpinang</p>
            </div>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 rounded-full border border-border">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase">
                     {user?.email?.charAt(0) || 'U'}
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>Akun Saya</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/dashboard/pengaturan"><UserIcon className="mr-2 h-4 w-4" /> Profil</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard/pengaturan"><Settings className="mr-2 h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>
}
