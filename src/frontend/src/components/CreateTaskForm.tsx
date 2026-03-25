import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateTask } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateTaskForm({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(25);
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        durationMinutes: duration,
      });
      toast.success("Task created!");
      setTitle("");
      setDescription("");
      setDuration(25);
      onClose();
    } catch {
      toast.error("Failed to create task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="create_task.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            New Focus Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="task-title"
              className="text-muted-foreground text-sm"
            >
              Task Title *
            </Label>
            <Input
              id="task-title"
              placeholder="e.g. Write chapter 3 of my report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-muted border-border"
              data-ocid="create_task.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="task-desc"
              className="text-muted-foreground text-sm"
            >
              Description (optional)
            </Label>
            <Textarea
              id="task-desc"
              placeholder="What does done look like?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-muted border-border resize-none"
              data-ocid="create_task.textarea"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="task-duration"
              className="text-muted-foreground text-sm"
            >
              Lock Duration (minutes)
            </Label>
            <Input
              id="task-duration"
              type="number"
              min={1}
              max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-muted border-border w-32"
              data-ocid="create_task.select"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-pill"
              onClick={onClose}
              data-ocid="create_task.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-pill gap-2"
              disabled={createTask.isPending || !title.trim()}
              data-ocid="create_task.submit_button"
            >
              {createTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
