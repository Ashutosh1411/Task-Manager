import { getProject } from "@/actions/projects";
import { getUsers } from "@/actions/audit";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  User,
  AlertTriangle,
  Minus,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  TODO: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DONE: "bg-green-500/10 text-green-500 border-green-500/20",
};

const priorityConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  HIGH: { icon: <AlertTriangle className="h-3 w-3" />, color: "text-red-500" },
  MEDIUM: { icon: <Minus className="h-3 w-3" />, color: "text-yellow-500" },
  LOW: { icon: <ArrowDown className="h-3 w-3" />, color: "text-green-500" },
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const [project, users] = await Promise.all([
    getProject(id),
    getUsers(),
  ]);

  if (!project) {
    redirect("/projects");
  }

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.description || "No description"}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created{" "}
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
            <span>by {project.createdBy.name}</span>
          </div>
        </div>
        {isAdmin && (
          <CreateTaskDialog projectId={project.id} users={users} />
        )}
      </div>

      {/* Tasks */}
      {project.tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium text-muted-foreground">
              No tasks yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {isAdmin
                ? "Create your first task for this project."
                : "No tasks assigned to you in this project."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {project.tasks.map((task: any) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
            
            return (
              <Card
                key={task.id}
                className={`border-border/50 hover:border-border transition-all duration-200 ${isOverdue ? "border-l-4 border-l-red-500 shadow-sm" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <Badge className={`${statusColors[task.status]} text-[10px] py-0 px-2`}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <span
                        className={`flex items-center gap-1 text-[11px] font-medium ${priorityConfig[task.priority].color}`}
                      >
                        {priorityConfig[task.priority].icon}
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.assignee && (
                      <span className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {task.assignee.name.charAt(0)}
                        </div>
                        {task.assignee.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className={`flex items-center gap-1.5 ${isOverdue ? "text-red-500 font-medium" : ""}`}>
                        <Calendar className="h-3.5 w-3.5" />
                        {isOverdue ? "Overdue" : "Due"}{" "}
                        {formatDistanceToNow(new Date(task.dueDate), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
