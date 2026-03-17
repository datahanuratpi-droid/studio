
'use client'

import * as React from "react"
import { Search, Shield, User, Mail, MoreVertical, Loader2, UserCheck, UserX, Briefcase, Key } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserProfile } from "@/lib/types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function UserManagementPage() {
  const firestore = useFirestore()
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
  }

  const handleDeactivate = (userId: string) => {
    if (!firestore) return
    updateDocumentNonBlocking(doc(firestore, 'users', userId), {
      status: 'Inactive',
      updatedAt: new Date().toISOString()
    })
  }

  const filteredUsers = users?.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Manajemen User</h1>
        <p className="text-muted-foreground">Kelola akses, verifikasi, dan pantau kata sandi pengguna.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau email..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role & Kontak</TableHead>
              <TableHead>Kata Sandi (Admin Only)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredUsers?.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {u.fullName?.charAt(0) || u.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm truncate">{u.fullName}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{u.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {u.role === 'Admin' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                        {u.role}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{u.phoneNumber || "-"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-xs font-mono bg-muted/30 px-2 py-1 rounded cursor-help">
                          <Key className="h-3 w-3 text-muted-foreground" />
                          <span>{u.passwordDisplay ? "••••••••" : "Belum diatur"}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs">Password: {u.passwordDisplay || "N/A"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={u.status === 'Active' ? 'default' : u.status === 'Pending Verification' ? 'secondary' : 'destructive'} 
                    className="text-[9px] uppercase font-bold tracking-widest"
                  >
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {u.status === 'Pending Verification' && (
                        <>
                          <DropdownMenuItem onClick={() => handleVerify(u.id, 'Staff')} className="text-green-600 font-medium">
                            <UserCheck className="mr-2 h-4 w-4" /> Verifikasi (Staff)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(u.id, 'KSB')} className="text-amber-600 font-medium">
                            <Briefcase className="mr-2 h-4 w-4" /> Verifikasi (KSB)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(u.id, 'Admin')} className="text-blue-600 font-medium">
                            <Shield className="mr-2 h-4 w-4" /> Verifikasi (Admin)
                          </DropdownMenuItem>
                        </>
                      )}
                      {u.status === 'Active' && (
                        <DropdownMenuItem onClick={() => handleDeactivate(u.id)} className="text-destructive font-medium">
                          <UserX className="mr-2 h-4 w-4" /> Nonaktifkan
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
