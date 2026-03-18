
'use client'

import * as React from "react"
import { Search, Shield, User, Mail, MoreVertical, Loader2, UserCheck, UserX, Briefcase, Key, Hash, MonitorOff, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/avatar"
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserProfile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function UserManagementPage() {
  const firestore = useFirestore()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, 'users')
  }, [firestore])

  const { data: users, isLoading } = useCollection<UserProfile>(usersRef)

  const handleVerify = (userId: string, role: 'Admin' | 'KSB' | 'Staff') => {
    if (!firestore) return

    updateDocumentNonBlocking(doc(firestore, 'users', userId), {
      status: 'Active',
      role: role,
      updatedAt: new Date().toISOString()
    })

    if (role === 'Admin') {
      setDocumentNonBlocking(doc(firestore, 'roles_admin', userId), { active: true }, { merge: true })
    } else if (role === 'KSB') {
      setDocumentNonBlocking(doc(firestore, 'roles_ksb', userId), { active: true }, { merge: true })
    } else if (role === 'Staff') {
      setDocumentNonBlocking(doc(firestore, 'roles_staff', userId), { active: true }, { merge: true })
    }

    toast({ title: "User Diverifikasi", description: `User sekarang aktif sebagai ${role}.` })
  }

  const handleDeactivate = (userId: string) => {
    if (!firestore) return
    updateDocumentNonBlocking(doc(firestore, 'users', userId), {
      status: 'Inactive',
      updatedAt: new Date().toISOString()
    })
    toast({ title: "User Dinonaktifkan", description: "Akses user telah dicabut." })
  }

  const handleResetDeviceId = (userId: string, fullName: string) => {
    if (!firestore) return
    updateDocumentNonBlocking(doc(firestore, 'users', userId), {
      deviceId: null,
      updatedAt: new Date().toISOString()
    })
    toast({ 
      title: "ID Perangkat Direset", 
      description: `User ${fullName} sekarang dapat login dari perangkat lain.` 
    })
  }

  const filteredUsers = users?.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      <div className="px-1">
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-primary uppercase">Manajemen User</h1>
        <p className="text-xs md:text-sm text-muted-foreground">Kelola akses, verifikasi, dan pantau keamanan perangkat pengguna.</p>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari nama atau email..." 
          className="pl-11 h-12 rounded-full bg-white border shadow-sm text-sm md:max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-border/50 overflow-hidden shadow-sm mx-1">
        <div className="overflow-x-auto no-scrollbar w-full">
          <Table className="w-full min-w-[500px] md:min-w-full">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-none">
                <TableHead className="font-black text-[9px] uppercase py-4 pl-6">User</TableHead>
                <TableHead className="font-black text-[9px] uppercase py-4">Role</TableHead>
                <TableHead className="font-black text-[9px] uppercase py-4">Keamanan</TableHead>
                <TableHead className="font-black text-[9px] uppercase py-4">Status</TableHead>
                <TableHead className="text-right font-black text-[9px] uppercase py-4 pr-6">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/5 transition-colors border-border/30">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase shadow-sm border border-primary/5">
                        {u.fullName?.charAt(0) || u.email?.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-black text-primary text-[11px] uppercase tracking-tight truncate max-w-[100px] md:max-w-[200px]">{u.fullName}</span>
                        <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest truncate max-w-[100px] md:max-w-[200px]">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/20 text-primary">
                      {u.role === 'Admin' ? <Shield className="h-2 w-2 mr-1" /> : <User className="h-2 w-2 mr-1" />}
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.deviceId ? (
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-[8px] font-black uppercase flex items-center gap-1 w-fit">
                        <MonitorOff className="h-2 w-2" /> Terkunci
                      </Badge>
                    ) : (
                      <Badge variant="ghost" className="text-muted-foreground/40 text-[8px] font-black uppercase">
                        Terbuka
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn("text-[8px] font-black uppercase tracking-widest border-none px-2 py-0.5", 
                        u.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        u.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700' : 
                        'bg-red-100 text-red-700'
                      )}
                    >
                      {u.status === 'Active' ? 'Aktif' : 'Tertunda'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-none">
                        {u.status === 'Pending Verification' && (
                          <>
                            <DropdownMenuItem onClick={() => handleVerify(u.id, 'Staff')} className="text-green-600 font-bold text-xs rounded-xl cursor-pointer">
                              <UserCheck className="mr-2 h-4 w-4" /> Verifikasi (Staff)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVerify(u.id, 'KSB')} className="text-amber-600 font-bold text-xs rounded-xl cursor-pointer">
                              <Briefcase className="mr-2 h-4 w-4" /> Verifikasi (KSB)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVerify(u.id, 'Admin')} className="text-blue-600 font-bold text-xs rounded-xl cursor-pointer">
                              <Shield className="mr-2 h-4 w-4" /> Verifikasi (Admin)
                            </DropdownMenuItem>
                          </>
                        )}
                        {u.status === 'Active' && (
                          <>
                            {u.deviceId && (
                              <DropdownMenuItem onClick={() => handleResetDeviceId(u.id, u.fullName)} className="text-blue-600 font-bold text-xs rounded-xl cursor-pointer">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Reset ID Perangkat
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDeactivate(u.id)} className="text-destructive font-bold text-xs rounded-xl cursor-pointer">
                              <UserX className="mr-2 h-4 w-4" /> Nonaktifkan
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem className="text-xs font-bold rounded-xl cursor-pointer">
                           <Key className="mr-2 h-4 w-4" /> Reset Password
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
