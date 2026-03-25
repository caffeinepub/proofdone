import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Lock, Plus, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { type Task, TaskStatus } from "./backend";
import CreateTaskForm from "./components/CreateTaskForm";
import LockScreen from "./components/LockScreen";
import LoginButton from "./components/LoginButton";
import ProofViewer from "./components/ProofViewer";
import TaskCard from "./components/TaskCard";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetMyTasks } from "./hooks/useQueries";

const queryClient = new QueryClient();

function AppContent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: tasks = [], isLoading } = useGetMyTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewProofTask, setViewProofTask] = useState<Task | null>(null);

  const handleStartSession = (task: Task) => {
    setActiveTask(task);
  };

  const handleUnlocked = () => {
    setActiveTask(null);
  };

  const pendingTasks = tasks.filter((t) => t.status === TaskStatus.pending);
  const lockedTasks = tasks.filter((t) => t.status === TaskStatus.locked);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.completed);

  // If there's an active lock session, show full screen
  if (activeTask) {
    return <LockScreen task={activeTask} onUnlocked={handleUnlocked} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground tracking-tight">
              ProofDone
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Button
                size="sm"
                className="rounded-pill gap-2"
                onClick={() => setShowCreate(true)}
                data-ocid="task.open_modal_button"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            )}
            <LoginButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {!isAuthenticated ? (
          /* Login CTA */
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Prove you're done.
              </h1>
              <p className="text-muted-foreground max-w-xs leading-relaxed">
                Create tasks, lock your screen, and only unlock after you submit
                real proof of completion.
              </p>
            </div>
            <LoginButton />
          </motion.div>
        ) : isLoading ? (
          /* Loading skeleton */
          <div className="space-y-3" data-ocid="task.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg bg-muted" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-5"
            data-ocid="task.empty_state"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-xl font-semibold text-foreground">
                No tasks yet
              </h2>
              <p className="text-muted-foreground text-sm">
                Create your first focus task to get started.
              </p>
            </div>
            <Button
              className="rounded-pill gap-2"
              onClick={() => setShowCreate(true)}
              data-ocid="task.primary_button"
            >
              <Plus className="h-4 w-4" />
              Create First Task
            </Button>
          </motion.div>
        ) : (
          /* Task list */
          <div className="space-y-8">
            {lockedTasks.length > 0 && (
              <Section title="In Progress" accent>
                {lockedTasks.map((t, i) => (
                  <TaskCard
                    key={t.id.toString()}
                    task={t}
                    index={i + 1}
                    onStartSession={handleStartSession}
                    onViewProof={setViewProofTask}
                  />
                ))}
              </Section>
            )}
            {pendingTasks.length > 0 && (
              <Section title="Pending">
                {pendingTasks.map((t, i) => (
                  <TaskCard
                    key={t.id.toString()}
                    task={t}
                    index={i + 1}
                    onStartSession={handleStartSession}
                    onViewProof={setViewProofTask}
                  />
                ))}
              </Section>
            )}
            {completedTasks.length > 0 && (
              <Section title="Completed">
                {completedTasks.map((t, i) => (
                  <TaskCard
                    key={t.id.toString()}
                    task={t}
                    index={i + 1}
                    onStartSession={handleStartSession}
                    onViewProof={setViewProofTask}
                  />
                ))}
              </Section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <CreateTaskForm open={showCreate} onClose={() => setShowCreate(false)} />

      <ProofViewer
        task={viewProofTask}
        onClose={() => setViewProofTask(null)}
      />

      <Toaster />
    </div>
  );
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className={`font-display text-sm font-semibold uppercase tracking-widest mb-3 ${
          accent ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
