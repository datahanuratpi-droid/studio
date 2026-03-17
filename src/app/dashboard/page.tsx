
"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  LayoutGrid, 
  List, 
  Bell, 
  User,
  Settings,
  LogOut,
  ClipboardList,
  Calendar,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTasks } from "@/hooks/use-tasks"
import { TaskCard } from "@/components/task-card"
import { TaskDialog } from "@/components/task-dialog"
import { Task } from "@/lib/types"

export default function DashboardPage() {
  const { tasks, isLoaded, addTask, updateTask, deleteTask, toggleSubTask } = useTasks()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | undefined>()
  const [filterStatus, setFilterStatus] = React.useState<string>("All")

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "All" || task.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To Do').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    done: tasks.filter(t => t.status === 'Done').length,
  }

  const handleCreateTask = (data: any) => {
    addTask(data)
  }

  const handleUpdateTask = (data: any) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
      setEditingTask(undefined)
    }
  }

  const openEditDialog = (task: Task) => {
    setEditingTask(task)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingTask(undefined)
    setIsDialogOpen(true)
  }

  if (!isLoaded) return null

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-headline font-bold text-primary">TaskFlow Pro</span>
          </div>

          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-accent bg-accent/10" onClick={() => setFilterStatus("All")}>
              <LayoutGrid className="mr-2 h-4 w-4" /> Overview
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setFilterStatus("To Do")}>
              <ClipboardList className="mr-2 h-4 w-4" /> To Do
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setFilterStatus("In Progress")}>
              <Calendar className="mr-2 h-4 w-4" /> In Progress
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => setFilterStatus("Done")}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
            </Button>
          </nav>

          <div className="mt-10">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">Quick Stats</h4>
            <div className="space-y-3 px-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-bold text-primary">{stats.todo + stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-bold text-green-500">{stats.done}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t">
          <Button variant="outline" className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-10 bg-background/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 rounded-full border border-border">
                   <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">JD</div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><LogOut className="mr-2 h-4 w-4" /> Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-headline font-bold text-primary">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, John! Here's what's on your plate today.</p>
            </div>
            <Button onClick={openCreateDialog} className="bg-accent hover:bg-accent/90 text-white rounded-full px-6 shadow-lg shadow-accent/20">
              <Plus className="mr-2 h-4 w-4" /> Create Task
            </Button>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-white border">
                <TabsTrigger value="grid" className="data-[state=active]:bg-primary data-[state=active]:text-white"><LayoutGrid className="h-4 w-4 mr-2" /> Grid</TabsTrigger>
                <TabsTrigger value="list" className="data-[state=active]:bg-primary data-[state=active]:text-white"><List className="h-4 w-4 mr-2" /> List</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white">
                      <Filter className="h-4 w-4 mr-2" /> {filterStatus}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterStatus("All")}>All Tasks</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("To Do")}>To Do</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("In Progress")}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("Done")}>Completed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="grid" className="mt-0">
              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onEdit={openEditDialog}
                      onDelete={deleteTask}
                      onStatusChange={(id, status) => updateTask(id, { status })}
                      onToggleSubtask={toggleSubTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-2xl border border-dashed border-border">
                  <div className="p-4 bg-muted rounded-full">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="max-w-xs space-y-2">
                    <h3 className="font-headline text-lg font-bold">No tasks found</h3>
                    <p className="text-muted-foreground text-sm">Create a new task to get started or adjust your filters.</p>
                    <Button onClick={openCreateDialog} variant="outline" className="mt-4">Create Task</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-0">
               <div className="bg-white rounded-2xl border overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-muted/30 border-b">
                     <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                       <th className="px-6 py-4">Task</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4">Priority</th>
                       <th className="px-6 py-4">Due Date</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {filteredTasks.map(task => (
                       <tr key={task.id} className="hover:bg-muted/10 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="font-semibold text-primary">{task.title}</span>
                             <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-[10px]">{task.status}</Badge>
                         </td>
                         <td className="px-6 py-4">
                            <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
                         </td>
                         <td className="px-6 py-4 text-sm text-muted-foreground">
                            {format(new Date(task.dueDate), "MMM d, yyyy")}
                         </td>
                         <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm" onClick={() => openEditDialog(task)}>Edit</Button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <TaskDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        task={editingTask}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
      />
    </div>
  )
}
