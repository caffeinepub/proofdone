import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Task, TaskId } from "../backend";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useGetMyTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["myTasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTasks();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      description,
      durationMinutes,
    }: {
      title: string;
      description: string;
      durationMinutes: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTask(title, description, BigInt(durationMinutes));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myTasks"] }),
  });
}

export function useStartFocusSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: TaskId) => {
      if (!actor) throw new Error("Not connected");
      return actor.startFocusSession(taskId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myTasks"] }),
  });
}

export function useSubmitProof() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      proofText,
      proofImage,
    }: {
      taskId: TaskId;
      proofText: string | null;
      proofImage: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitProof(taskId, proofText, proofImage);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myTasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: TaskId) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTask(taskId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myTasks"] }),
  });
}
