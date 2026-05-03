import { getProjects } from "@/actions/projects";
import { auth } from "@/lib/auth";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { ProjectActions } from "@/components/project-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ListTodo, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await getProjects();
  const isAdmin = session?.user?.role === "ADMIN";
  const userId = session?.user?.id;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team&apos;s projects
          </p>
        </div>
        {isAdmin && <CreateProjectDialog />}
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No projects yet
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {isAdmin
                ? "Create your first project to get started."
                : "Ask an admin to create a project."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => {
            const canManage = isAdmin && project.createdById === userId;

            return (
              <div key={project.id} className="relative group">
                <Link href={`/projects/${project.id}`} className="block h-full">
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px] py-0 px-2 h-5">
                            <ListTodo className="h-3 w-3 mr-1" />
                            {project._count.tasks}
                          </Badge>
                          {canManage && (
                            <ProjectActions project={project} />
                          )}
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                        {project.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(project.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {project.createdBy.name.charAt(0)}
                          </div>
                          by {project.createdBy.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
