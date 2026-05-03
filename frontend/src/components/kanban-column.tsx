"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
}

export function KanbanColumn({
  id,
  title,
  count,
  color,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border-t-2 bg-card/50 border border-border/50 transition-all duration-200",
        color,
        isOver && "ring-2 ring-primary/30 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="font-semibold text-sm">{title}</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-2 min-h-[200px]">
        {children}
      </div>
    </div>
  );
}
