import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob, type TaskId } from "../backend";
import { useSubmitProof } from "../hooks/useQueries";

interface Props {
  open: boolean;
  taskId: TaskId;
  onSuccess: () => void;
  onClose: () => void;
}

export default function ProofModal({
  open,
  taskId,
  onSuccess,
  onClose,
}: Props) {
  const [proofText, setProofText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const submitProof = useSubmitProof();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim() && !imageFile) {
      toast.error("Please add proof text or upload an image");
      return;
    }
    try {
      let blob: ExternalBlob | null = null;
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        blob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      }
      await submitProof.mutateAsync({
        taskId,
        proofText: proofText.trim() || null,
        proofImage: blob,
      });
      toast.success("Proof submitted! Task complete 🎉");
      onSuccess();
    } catch {
      toast.error("Failed to submit proof");
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="proof_modal.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Submit Your Proof
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">
              What did you accomplish?
            </Label>
            <Textarea
              placeholder="Describe what you completed..."
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              rows={4}
              className="bg-muted border-border resize-none"
              data-ocid="proof_modal.textarea"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-sm">
              Proof Photo (optional)
            </Label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={imagePreview}
                  alt="Proof preview"
                  className="w-full max-h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                data-ocid="proof_modal.upload_button"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Click to upload a photo</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {submitProof.isPending && uploadProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 rounded-pill"
              onClick={onClose}
              disabled={submitProof.isPending}
              data-ocid="proof_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-pill gap-2"
              disabled={submitProof.isPending}
              data-ocid="proof_modal.submit_button"
            >
              {submitProof.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {submitProof.isPending ? "Submitting..." : "Submit Proof"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
