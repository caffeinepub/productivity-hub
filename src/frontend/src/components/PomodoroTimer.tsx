import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Pause, Play, RotateCcw, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLogPomodoro, usePomodoroStats } from "../hooks/useQueries";

type Mode = "focus" | "short" | "long";

const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  focus: "Focus",
  short: "Short Break",
  long: "Long Break",
};

export default function PomodoroTimer() {
  const { data: stats } = usePomodoroStats();
  const logPomodoro = useLogPomodoro();

  const [mode, setMode] = useState<Mode>("focus");
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modeRef = useRef<Mode>("focus");

  const switchMode = (m: Mode) => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    modeRef.current = m;
    setTimeLeft(DURATIONS[m]);
  };

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (modeRef.current === "focus") {
              logPomodoro.mutate(BigInt(DURATIONS.focus * 1000));
              toast.success("🍅 Pomodoro complete! Great work!");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, logPomodoro]);

  const reset = () => {
    setRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  const progress = (1 - timeLeft / DURATIONS[mode]) * 100;
  const circumference = 2 * Math.PI * 90;

  return (
    <div className="p-8 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-extrabold text-foreground mb-6">
        Pomodoro Timer
      </h1>

      {/* Mode selector */}
      <div className="flex gap-2 mb-8">
        {(["focus", "short", "long"] as Mode[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            className="rounded-full"
            onClick={() => switchMode(m)}
            data-ocid={`pomodoro.${m}.tab`}
          >
            {m === "focus" ? (
              <Zap className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Coffee className="w-3.5 h-3.5 mr-1.5" />
            )}
            {MODE_LABELS[m]}
          </Button>
        ))}
      </div>

      <div className="flex gap-8">
        {/* Timer circle */}
        <Card className="shadow-card border-border flex-1">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="relative">
              <svg
                width="220"
                height="220"
                className="-rotate-90"
                role="img"
                aria-label="Pomodoro timer progress"
              >
                <title>Pomodoro timer progress</title>
                <circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke="oklch(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="90"
                  fill="none"
                  stroke="oklch(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - progress / 100)}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1">
                  <Badge
                    variant={running ? "default" : "secondary"}
                    className="text-[10px]"
                  >
                    {running ? "Active" : timeLeft === 0 ? "Done" : "Idle"}
                  </Badge>
                </div>
                <p
                  className="text-5xl font-extrabold tabular-nums text-foreground mt-2"
                  data-ocid="pomodoro.editor"
                >
                  {minutes}:{seconds}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {MODE_LABELS[mode]}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={reset}
                data-ocid="pomodoro.reset.button"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="rounded-full px-10"
                onClick={() => setRunning((r) => !r)}
                data-ocid="pomodoro.primary_button"
              >
                {running ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" /> Start
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex flex-col gap-4 w-48">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-foreground">
                {stats ? String(stats.today) : "0"}
              </p>
              <p className="text-xs text-muted-foreground">
                sessions completed
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                All Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-extrabold text-foreground">
                {stats ? String(stats.allTime) : "0"}
              </p>
              <p className="text-xs text-muted-foreground">total sessions</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-extrabold text-foreground">
                {stats
                  ? `${Math.floor((Number(stats.today) * 25) / 60)}h ${(Number(stats.today) * 25) % 60}m`
                  : "0m"}
              </p>
              <p className="text-xs text-muted-foreground">today</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
