import { getDashboardStats, getAuditLogs } from "@/actions/audit";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  FolderKanban,
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const actionIcons: Record<string, string> = {
  PROJECT_CREATED: "🗂️",
  PROJECT_DELETED: "🗑️",
  TASK_CREATED: "✅",
  TASK_DELETED: "❌",
  STATUS_CHANGED: "🔄",
  TASK_REASSIGNED: "👤",
  TASK_UPDATED: "✏️",
};

export default async function DashboardPage() {
  const session = await auth();
  const [stats, logs] = await Promise.all([
    getDashboardStats(),
    getAuditLogs(15),
  ]);

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.doneTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name}. Here&apos;s your overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 hover:border-border transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-chart-4/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              To Do
            </CardTitle>
            <Clock className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-4">
              {stats.todoTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending tasks</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-chart-1/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-1">
              {stats.inProgressTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active tasks
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 hover:border-chart-2/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-2">
              {stats.doneTasks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/projects">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/team">
          <Card className="border-border/50 hover:border-primary/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Activity Feed */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>
            Latest actions across your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet. Start by creating a project or task.
            </p>
          ) : (
            <div className="space-y-4">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-lg mt-0.5 shrink-0">
                    {actionIcons[log.action] || "📋"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{log.user.name}</span>{" "}
                      <span className="text-muted-foreground">
                        {log.details}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
