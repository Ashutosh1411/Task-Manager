"use client";

import { useState, useEffect, useCallback } from "react";
import { getTasks, updateTaskStatus } from "@/actions/tasks";
import { getProjects } from "@/actions/projects";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/kanban-column";
import { KanbanCard } from "@/components/kanban-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Columns3 } from "lucide-react";
import { toast } from "sonner";
import { TaskStatus } from "@/types";

type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | Date | null;
  assignee: { id: string; name: string; email: string } | null;
  project: { id: string; name: string };
};

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: TaskStatus.TODO, title: "To Do", color: "border-t-yellow-500" },
  { id: TaskStatus.IN_PROGRESS, title: "In Progress", color: "border-t-blue-500" },
  { id: TaskStatus.DONE, title: "Done", color: "border-t-green-500" },
];

export default function KanbanPage() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projectsData, tasksData] = await Promise.all([
        getProjects(),
        getTasks({
          projectId: selectedProject || undefined,
          pageSize: 100,
        }),
      ]);
      setProjects(projectsData.map((p: any) => ({ id: p.id, name: p.name })));
      setTasks(tasksData.tasks as unknown as KanbanTask[]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine which column it was dropped on
    let newStatus: TaskStatus | null = null;

    // Check if dropped on a column directly
    if (columns.find((c) => c.id === over.id)) {
      newStatus = over.id as TaskStatus;
    } else {
      // Dropped on another task — find that task's column
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status as TaskStatus;
      }
    }

    if (!newStatus || newStatus === task.status) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus as string } : t
      )
    );

    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
    } catch (error) {
      // Revert on failure
      setTasks(previousTasks);
      toast.error(
        error instanceof Error ? error.message : "Failed to update task status"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop tasks between columns
          </p>
        </div>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.id} className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Columns3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              No tasks to display
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create some tasks to see them on the board.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-6 min-h-[600px]">
            {columns.map((col) => {
              const columnTasks = getTasksByStatus(col.id);
              return (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  count={columnTasks.length}
                  color={col.color}
                >
                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {columnTasks.map((task) => (
                      <KanbanCard key={task.id} task={task} />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && <KanbanCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
