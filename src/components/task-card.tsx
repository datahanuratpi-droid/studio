
"use client"

import * as React from "react"
import { MoreVertical, Calendar, CheckCircle2, Circle, Clock, Trash2, Edit } from "lucide-react"
import { format } from "date-fns"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Task, SubTask } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Task['status']) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange, onToggleSubtask }: TaskCardProps) {
  const completedSubtasks = task.subTasks.filter(st => st.completed).length
  const totalSubtasks = task.subTasks.length
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const priorityColors = {
    Low: "bg-green-100 text-green-700 border-green-200",
    Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    High: "bg-red-100 text-red-700 border-red-200",
  }

  const statusIcons = {
    "To Do": <Circle className="h-4 w-4 text-muted-foreground" />,
    "In Progress": <Clock className="h-4 w-4 text-accent" />,
    "Done": <CheckCircle2 className="h-4 w-4 text-green-500" />,
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-300 border-border/50">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge className={cn("text-[10px] font-bold px-2 py-0.5", priorityColors[task.priority])} variant="outline">
            {task.priority}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(task.id, task.status === 'Done' ? 'To Do' : 'Done')}
              >
                {task.status === 'Done' ? <Circle className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {task.status === 'Done' ? 'Mark as To Do' : 'Mark as Done'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className={cn("font-headline text-lg font-semibold leading-tight mt-2", task.status === 'Done' && "line-through text-muted-foreground")}>
          {task.title}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        {totalSubtasks > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
              <span>Tasks: {completedSubtasks}/{totalSubtasks}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <div className="max-h-24 overflow-y-auto space-y-1 mt-2">
              {task.subTasks.map(st => (
                <div key={st.id} className="flex items-center gap-2 group/st">
                  <Checkbox 
                    id={st.id} 
                    checked={st.completed} 
                    onCheckedChange={() => onToggleSubtask(task.id, st.id)}
                    className="h-3 w-3"
                  />
                  <label 
                    htmlFor={st.id} 
                    className={cn("text-xs cursor-pointer select-none", st.completed && "line-through text-muted-foreground")}
                  >
                    {st.title}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <Calendar className="h-3 w-3" />
          <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/20 mt-2">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {statusIcons[task.status]}
          <span>{task.status}</span>
        </div>
        <div className="flex -space-x-2">
           <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] text-white border-2 border-white">JD</div>
        </div>
      </CardFooter>
    </Card>
  )
}
