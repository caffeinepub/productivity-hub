import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Priority } from "../backend.d";
import { useActor } from "./useActor";

export function useUserData() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUserData();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTasks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      priority,
      dueDate,
    }: { title: string; priority: Priority; dueDate?: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTask(title, priority, dueDate ?? null);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleTaskCompletion(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useNotes() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: { title: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createNote(title, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useUpdateNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
    }: { id: bigint; title: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).updateNote(id, title, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteNote(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
}

export function useHabits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHabits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createHabit(name, color);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useToggleHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleHabitCompletion(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useDeleteHabit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteHabit(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["habits"] }),
  });
}

export function useQuickLinks() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["quickLinks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuickLinks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddQuickLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      url,
      emoji,
    }: { title: string; url: string; emoji: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.addQuickLink(title, url, emoji);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quickLinks"] }),
  });
}

export function useDeleteQuickLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteQuickLink(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quickLinks"] }),
  });
}

export function usePomodoroStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pomodoroStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getPomodoroStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLogPomodoro() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (duration: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.logPomodoro(duration);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pomodoroStats"] }),
  });
}
