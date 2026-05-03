"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks } from "@/actions/tasks";
import { getUsers } from "@/actions/audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  AlertTriangle,
  Minus,
  ArrowDown,
  X,
  ListFilter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { TaskStatus } from "@/types";

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

type TaskWithRelations = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | Date | null;
  createdAt: string | Date;
  assignee: { id: string; name: string; email: string } | null;
  project: { id: string; name: string };
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, assigneeFilter]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTasks({
        search: debouncedSearch || undefined,
        status: (statusFilter as TaskStatus) || undefined,
        assignedTo: assigneeFilter || undefined,
        page,
        pageSize: 10,
      });
      setTasks(result.tasks as unknown as TaskWithRelations[]);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, assigneeFilter, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    getUsers().then((u) => setUsers(u));
  }, []);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setAssigneeFilter("");
    setPage(1);
  };

  const hasFilters = search || statusFilter || assigneeFilter;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground mt-1">
          Search, filter, and manage all tasks
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="ml-auto h-7 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} task{total !== 1 ? "s" : ""} found
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20 ml-auto" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <ListFilter className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              {hasFilters 
                ? "We couldn't find any tasks matching your current filters. Try clearing them to see more." 
                : "You don't have any tasks yet. Ask an admin to assign one to you or create a new project."}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-6">
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: any) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
            
            return (
              <Card
                key={task.id}
                className={`border-border/50 hover:border-border transition-all duration-200 ${isOverdue ? "border-l-4 border-l-red-500 shadow-sm" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {task.title}
                        </h3>
                        <Badge variant="secondary" className="shrink-0 text-[10px] h-4 uppercase tracking-wider">
                          {task.project.name}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
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
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge className={`${statusColors[task.status] || ""} text-[10px] py-0 px-2`}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      <span
                        className={`flex items-center gap-1 text-[11px] font-medium ${priorityConfig[task.priority]?.color || ""}`}
                      >
                        {priorityConfig[task.priority]?.icon}
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className="w-8 h-8 p-0"
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
