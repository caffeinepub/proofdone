import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Lock,
  Play,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { type Task, TaskStatus } from "../backend";
import { useDeleteTask } from "../hooks/useQueries";

interface Props {
  task: Task;
  index: number;
  onStartSession: (task: Task) => void;
  onViewProof: (task: Task) => void;
}

const statusConfig = {
  [TaskStatus.pending]: {
    label: "Pending",
    color: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  },
  [TaskStatus.locked]: {
    label: "In Progress",
    color: "bg-primary/10 text-primary border-primary/30",
    icon: Lock,
  },
  [TaskStatus.completed]: {
    label: "Completed",
    color: "bg-green-500/10 text-green-400 border-green-500/30",
    icon: CheckCircle2,
  },
};

export default function TaskCard({
  task,
  index,
  onStartSession,
  onViewProof,
}: Props) {
  const deleteTask = useDeleteTask();
  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <Card
      className="bg-card border-border shadow-card hover:border-primary/40 transition-colors"
      data-ocid={`task.item.${index}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-semibold text-foreground truncate">
                {task.title}
              </h3>
              <Badge
                className={`text-xs border rounded-full px-2 py-0.5 ${config.color}`}
              >
                <StatusIcon className="h-3 w-3 mr-1 inline" />
                {config.label}
              </Badge>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{Number(task.durationMinutes)} min focus session</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {task.status === TaskStatus.completed && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-pill gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => onViewProof(task)}
                data-ocid={`task.edit_button.${index}`}
              >
                <Eye className="h-4 w-4" />
                Proof
              </Button>
            )}

            {task.status === TaskStatus.pending && (
              <Button
                size="sm"
                className="rounded-pill gap-1.5"
                onClick={() => onStartSession(task)}
                data-ocid={`task.primary_button.${index}`}
              >
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}

            {task.status === TaskStatus.locked && (
              <Button
                size="sm"
                className="rounded-pill gap-1.5 animate-pulse"
                onClick={() => onStartSession(task)}
                data-ocid={`task.primary_button.${index}`}
              >
                <Lock className="h-4 w-4" />
                Resume
              </Button>
            )}

            {task.status !== TaskStatus.locked && (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full p-2 text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                data-ocid={`task.delete_button.${index}`}
              >
                {deleteTask.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
