import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Image as ImageIcon } from "lucide-react";
import type { Task } from "../backend";

interface Props {
  task: Task | null;
  onClose: () => void;
}

export default function ProofViewer({ task, onClose }: Props) {
  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="proof_viewer.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Proof: {task.title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {task.proofText && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Written Proof</span>
              </div>
              <p className="text-foreground bg-muted rounded-lg p-4 text-sm leading-relaxed">
                {task.proofText}
              </p>
            </div>
          )}
          {task.proofImage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>Photo Proof</span>
              </div>
              <img
                src={task.proofImage.getDirectURL()}
                alt="Completion proof"
                className="w-full rounded-lg object-cover max-h-64 border border-border"
              />
            </div>
          )}
          {!task.proofText && !task.proofImage && (
            <p className="text-muted-foreground text-sm text-center py-4">
              No proof details recorded.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
