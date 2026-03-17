
'use client'

import * as React from "react"
import { Search, Shield, User, Mail, MoreVertical, Loader2, UserCheck, UserX, Briefcase } from "lucide-react"
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

export default function UserManagementPage() {
  const firestore = useFirestore()
  
  const usersRef = useMemoFirebase(() => {
    if (!firestore) return null
    return collection(firestore, 'users')
  }, [firestore])

  const { data: users, isLoading } = useCollection<UserProfile>(usersRef)

  const handleVerify = (userId: string, role: 'Admin' | 'KSB' | 'Staff') => {
    if (!firestore) return

    // Update main profile status and role
    updateDocumentNonBlocking(doc(firestore, 'users', userId), {
      status: 'Active',
      role: role,
      updatedAt: new Date().toISOString()
    })

    // Create marker documents for security rules checks
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Manajemen User</h1>
        <p className="text-muted-foreground">Kelola akses dan verifikasi pendaftar aplikasi SITU HANURA.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau email..." className="pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </TableCell>
              </TableRow>
            ) : users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.fullName?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {user.role === 'Admin' ? <Shield className="h-3 w-3 text-primary" /> : <User className="h-3 w-3 text-muted-foreground" />}
                    <span className="text-sm">{user.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.status === 'Active' ? 'default' : user.status === 'Pending Verification' ? 'secondary' : 'destructive'} 
                    className="text-[10px]"
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {user.status === 'Pending Verification' && (
                        <>
                          <DropdownMenuItem onClick={() => handleVerify(user.id, 'Staff')} className="text-green-600">
                            <UserCheck className="mr-2 h-4 w-4" /> Verifikasi (Staff)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(user.id, 'KSB')} className="text-amber-600">
                            <Briefcase className="mr-2 h-4 w-4" /> Verifikasi (KSB)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(user.id, 'Admin')} className="text-blue-600">
                            <Shield className="mr-2 h-4 w-4" /> Verifikasi (Admin)
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.status === 'Active' && (
                        <DropdownMenuItem onClick={() => handleDeactivate(user.id)} className="text-destructive">
                          <UserX className="mr-2 h-4 w-4" /> Nonaktifkan
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && users?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Tidak ada user terdaftar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
