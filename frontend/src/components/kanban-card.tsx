"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  GripVertical,
  User,
  Calendar,
  AlertTriangle,
  Minus,
  ArrowDown,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface KanbanCardProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    dueDate: string | Date | null;
    assignee: { id: string; name: string; email: string } | null;
    project: { id: string; name: string };
  };
  isDragging?: boolean;
}

const priorityConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  HIGH: {
    icon: <AlertTriangle className="h-3 w-3" />,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  MEDIUM: {
    icon: <Minus className="h-3 w-3" />,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  LOW: {
    icon: <ArrowDown className="h-3 w-3" />,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
};

export function KanbanCard({ task, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-background p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing",
        (isDragging || isSortableDragging) &&
          "opacity-90 shadow-lg ring-2 ring-primary/30 rotate-2 scale-105"
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 mt-0.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium leading-snug line-clamp-2">
              {task.title}
            </h4>
            <span
              className={cn(
                "shrink-0 flex items-center gap-0.5 text-xs rounded-full px-1.5 py-0.5",
                config.color,
                config.bg
              )}
            >
              {config.icon}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] h-5">
              {task.project.name}
            </Badge>
            {task.assignee && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <User className="h-2.5 w-2.5" />
                {task.assignee.name}
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(task.dueDate), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
