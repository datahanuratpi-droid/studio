
"use client"

import * as React from "react"
import { Sparkles, Calendar as CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Task, TaskPriority, TaskStatus, SubTask } from "@/lib/types"
import { intelligentTaskDetailer } from "@/ai/flows/intelligent-task-detailer-flow"

const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["To Do", "In Progress", "Done"]),
  dueDate: z.date({
    required_error: "A due date is required.",
  }),
})

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSave: (task: any) => void
}

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const [isAiLoading, setIsAiLoading] = React.useState(false)
  const [subTasks, setSubTasks] = React.useState<SubTask[]>(task?.subTasks || [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "Medium",
      status: task?.status || "To Do",
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        description: task?.description || "",
        priority: task?.priority || "Medium",
        status: task?.status || "To Do",
        dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
      })
      setSubTasks(task?.subTasks || [])
    }
  }, [open, task, form])

  async function handleAiDetail() {
    const title = form.getValues("title")
    if (!title) return

    setIsAiLoading(true)
    try {
      const result = await intelligentTaskDetailer({ taskTitle: title })
      form.setValue("description", result.detailedDescription)
      const newSubTasks = result.subTasks.map(st => ({
        id: Math.random().toString(36).substr(2, 9),
        title: st,
        completed: false
      }))
      setSubTasks(newSubTasks)
    } catch (error) {
      console.error("AI Error:", error)
    } finally {
      setIsAiLoading(false)
    }
  }

  function addSubTask() {
    setSubTasks(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title: "", completed: false }])
  }

  function updateSubTask(id: string, title: string) {
    setSubTasks(prev => prev.map(st => st.id === id ? { ...st, title } : st))
  }

  function removeSubTask(id: string) {
    setSubTasks(prev => prev.filter(st => st.id !== id))
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave({
      ...values,
      dueDate: values.dueDate.toISOString(),
      subTasks,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          <DialogDescription>
            {task ? "Update your task details and track progress." : "Add a new task to your flow. Use AI to help with details."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex gap-2 items-end">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Finish quarterly report..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="mb-1 text-accent border-accent hover:bg-accent hover:text-white"
                onClick={handleAiDetail}
                disabled={isAiLoading || !form.watch("title")}
                title="Use AI to generate details"
              >
                {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add more context to this task..." 
                      className="min-h-[100px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="To Do">To Do</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0,0,0,0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Sub-tasks</FormLabel>
                <Button type="button" variant="ghost" size="sm" onClick={addSubTask} className="h-8">
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <div className="space-y-2">
                {subTasks.map((st) => (
                  <div key={st.id} className="flex gap-2 items-center">
                    <Input 
                      value={st.title} 
                      onChange={(e) => updateSubTask(st.id, e.target.value)}
                      placeholder="Enter sub-task..."
                      className="h-8"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeSubTask(st.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full sm:w-auto bg-primary text-white hover:bg-primary/90">
                {task ? "Save Changes" : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
