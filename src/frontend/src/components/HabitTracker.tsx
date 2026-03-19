import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateHabit,
  useDeleteHabit,
  useHabits,
  useToggleHabit,
} from "../hooks/useQueries";

const HABIT_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
];

function getWeeklyPct(completionDates: bigint[]) {
  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weekAgo = BigInt(now - weekMs) * 1000000n;
  const count = completionDates.filter((d) => d >= weekAgo).length;
  return Math.round((count / 7) * 100);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekDays() {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function HabitTracker() {
  const { data: habits, isLoading } = useHabits();
  const createHabit = useCreateHabit();
  const toggleHabit = useToggleHabit();
  const deleteHabit = useDeleteHabit();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(HABIT_COLORS[0]);

  const weekDays = getWeekDays();

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createHabit.mutateAsync({ name: name.trim(), color });
      setName("");
      setOpen(false);
      toast.success("Habit created!");
    } catch {
      toast.error("Failed to create habit");
    }
  };

  const isDoneOnDay = (completionDates: bigint[], day: Date) => {
    const start =
      BigInt(
        new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime(),
      ) * 1000000n;
    const end = start + BigInt(24 * 60 * 60 * 1000) * 1000000n;
    return completionDates.some((d) => d >= start && d < end);
  };

  return (
    <div className="p-8 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-foreground">
          Habit Tracker
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full"
              data-ocid="habits.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-2" /> New Habit
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="habits.dialog">
            <DialogHeader>
              <DialogTitle>Create Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="habit-name" className="text-xs font-medium">
                  Habit Name
                </Label>
                <Input
                  id="habit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. Morning run, Read 30 min"
                  className="mt-1"
                  data-ocid="habits.input"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Color</Label>
                <div className="flex gap-2 mt-2">
                  {HABIT_COLORS.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  data-ocid="habits.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!name.trim() || createHabit.isPending}
                  data-ocid="habits.submit_button"
                >
                  {createHabit.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="habits.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : !habits || habits.length === 0 ? (
        <div className="text-center py-20" data-ocid="habits.empty_state">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-muted-foreground">
            No habits yet — start building great ones!
          </p>
        </div>
      ) : (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <div className="w-40" />
              <div className="flex-1 grid grid-cols-7 text-center">
                {weekDays.map((d) => (
                  <div
                    key={d.toISOString().slice(0, 10)}
                    className="text-[11px] font-semibold text-muted-foreground"
                  >
                    {DAYS[d.getDay()]}
                  </div>
                ))}
              </div>
              <div className="w-24 text-center text-[11px] font-semibold text-muted-foreground">
                Weekly
              </div>
              <div className="w-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {habits.map((habit, i) => {
              const pct = getWeeklyPct(habit.completionDates);
              return (
                <div
                  key={String(habit.id)}
                  className="flex items-center py-2 border-b border-border last:border-0 group"
                  data-ocid={`habits.item.${i + 1}`}
                >
                  <div className="w-40 flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span className="text-sm font-medium text-foreground truncate">
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex-1 grid grid-cols-7 text-center">
                    {weekDays.map((day, di) => {
                      const done = isDoneOnDay(habit.completionDates, day);
                      const isToday = di === 6;
                      return (
                        <button
                          type="button"
                          key={day.toISOString().slice(0, 10)}
                          onClick={() =>
                            isToday && toggleHabit.mutate(habit.id)
                          }
                          disabled={!isToday}
                          data-ocid={
                            isToday ? `habits.toggle.${i + 1}` : undefined
                          }
                          className={`mx-auto w-6 h-6 rounded-full transition-all ${
                            done ? "opacity-100" : "opacity-20 bg-border"
                          } ${isToday ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
                          style={done ? { backgroundColor: habit.color } : {}}
                        />
                      );
                    })}
                  </div>
                  <div className="w-24 flex items-center gap-2 px-2">
                    <Progress value={pct} className="flex-1 h-1.5" />
                    <span className="text-xs text-muted-foreground w-7 text-right">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-8 flex items-center justify-end gap-1">
                    {Number(habit.streak) > 0 && (
                      <span className="flex items-center text-[11px] text-warning font-semibold">
                        <Flame className="w-3 h-3" />
                        {habit.streak.toString()}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        deleteHabit.mutate(habit.id);
                        toast.success("Habit deleted");
                      }}
                      data-ocid={`habits.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
