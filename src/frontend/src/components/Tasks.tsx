import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Priority } from "../backend.d";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useToggleTask,
} from "../hooks/useQueries";

const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.high]: "destructive",
  [Priority.medium]: "secondary",
  [Priority.low]: "outline",
};

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>(Priority.medium);
  const [dueDate, setDueDate] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) return;
    const dueDateBigInt = dueDate
      ? BigInt(new Date(dueDate).getTime()) * 1000000n
      : undefined;
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        priority,
        dueDate: dueDateBigInt,
      });
      setTitle("");
      setDueDate("");
      toast.success("Task added!");
    } catch {
      toast.error("Failed to add task");
    }
  };

  const incomplete = tasks?.filter((t) => !t.completed) ?? [];
  const completed = tasks?.filter((t) => t.completed) ?? [];

  return (
    <div className="p-8 animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">My Tasks</h1>

      {/* Add form */}
      <Card className="shadow-card border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Add New Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label htmlFor="task-title" className="text-xs font-medium">
                Title
              </Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="What needs to be done?"
                className="mt-1"
                data-ocid="todo.input"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label className="text-xs font-medium">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as Priority)}
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="tasks.priority.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.high}>High</SelectItem>
                    <SelectItem value={Priority.medium}>Medium</SelectItem>
                    <SelectItem value={Priority.low}>Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="task-due" className="text-xs font-medium">
                  Due Date (optional)
                </Label>
                <Input
                  id="task-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <Button
              onClick={handleAdd}
              disabled={!title.trim() || createTask.isPending}
              className="w-full rounded-full"
              data-ocid="todo.add_button"
            >
              {createTask.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="tasks.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : incomplete.length === 0 && completed.length === 0 ? (
        <div className="text-center py-16" data-ocid="tasks.empty_state">
          <p className="text-muted-foreground text-sm">
            No tasks yet — add one above!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {incomplete.map((task, i) => (
            <div
              key={String(task.id)}
              className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-card group"
              data-ocid={`todo.item.${i + 1}`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask.mutate(task.id)}
                data-ocid={`todo.checkbox.${i + 1}`}
                id={`task-${i}`}
              />
              <label
                htmlFor={`task-${i}`}
                className="flex-1 text-sm font-medium text-foreground cursor-pointer"
              >
                {task.title}
              </label>
              <Badge
                variant={PRIORITY_COLORS[task.priority] as any}
                className="text-[11px] capitalize"
              >
                {task.priority}
              </Badge>
              {task.dueDate && (
                <span className="text-[11px] text-muted-foreground">
                  {new Date(
                    Number(task.dueDate) / 1000000,
                  ).toLocaleDateString()}
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => {
                  deleteTask.mutate(task.id);
                  toast.success("Task deleted");
                }}
                data-ocid={`todo.delete_button.${i + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}

          {completed.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-4 pb-2">
                Completed
              </p>
              {completed.map((task, i) => (
                <div
                  key={String(task.id)}
                  className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-card opacity-60 group"
                  data-ocid={`todo.item.${incomplete.length + i + 1}`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask.mutate(task.id)}
                    data-ocid={`todo.checkbox.${incomplete.length + i + 1}`}
                    id={`task-done-${i}`}
                  />
                  <label
                    htmlFor={`task-done-${i}`}
                    className="flex-1 text-sm text-muted-foreground line-through cursor-pointer"
                  >
                    {task.title}
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      deleteTask.mutate(task.id);
                      toast.success("Task deleted");
                    }}
                    data-ocid={`todo.delete_button.${incomplete.length + i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
