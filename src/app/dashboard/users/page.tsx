
"use client"

import * as React from "react"
import { Search, UserCheck, UserX, Shield, User, Mail, MoreVertical } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserManagementPage() {
  const users = [
    { id: "1", name: "John Doe", email: "john@office.com", role: "Admin", status: "Active" },
    { id: "2", name: "Siti Fatimah", email: "siti@office.com", role: "Officer", status: "Active" },
    { id: "3", name: "Ahmad Dani", email: "ahmad@gmail.com", role: "Employee", status: "Pending Verification" },
    { id: "4", name: "Maria Rosa", email: "maria@office.com", role: "Officer", status: "Inactive" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold text-primary">Manajemen User</h1>
        <p className="text-muted-foreground">Kelola akses dan verifikasi pendaftar aplikasi.</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari nama atau email..." className="pl-10" />
        </div>
        <Button className="bg-primary text-white">Tambah User</Button>
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{user.role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Pending Verification' ? 'secondary' : 'destructive'} className="text-[10px]">
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {user.status === 'Pending Verification' && (
                    <Button size="sm" variant="outline" className="h-8 text-xs border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700">Verifikasi</Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
