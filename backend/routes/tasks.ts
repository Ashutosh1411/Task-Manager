import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";
import { TaskStatus, Priority } from "@prisma/client";

const router = Router();

// GET /api/tasks
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId, search, status, assignedTo, page = "1", pageSize = "10" } = req.query;
    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const skip = (pageNum - 1) * size;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    // Members can only see their own tasks
    if (req.user!.role === "MEMBER") {
      where.assignedTo = req.user!.id;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { dueDate: "asc" },
        skip,
        take: size,
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      tasks,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks" });
  }
});

// GET /api/tasks/project/:projectId
router.get("/project/:projectId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const where: any = { projectId };

    if (req.user!.role === "MEMBER") {
      where.assignedTo = req.user!.id;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to get tasks by project" });
  }
});

// POST /api/tasks
router.post("/", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || TaskStatus.TODO,
        priority: data.priority || Priority.MEDIUM,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        projectId: data.projectId,
        assignedTo: data.assignedTo || null,
      },
      include: {
        assignee: { select: { name: true } },
      },
    });

    const assigneeName = task.assignee?.name || "unassigned";
    await prisma.auditLog.create({
      data: {
        action: "TASK_CREATED",
        details: `Created task "${data.title}" assigned to ${assigneeName} in project`,
        userId: req.user!.id,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PATCH /api/tasks/:id/status
router.patch("/:id/status", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { assignee: { select: { name: true } } },
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    if (req.user!.role === "MEMBER" && task.assignedTo !== req.user!.id) {
      return res.status(403).json({ error: "You can only update your own tasks" });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "STATUS_CHANGED",
        details: `Task "${task.title}" status changed from ${task.status} to ${status}`,
        userId: req.user!.id,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task status" });
  }
});

// PATCH /api/tasks/:id
router.patch("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo || null;

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (data.assignedTo !== undefined && data.assignedTo !== task.assignedTo) {
      const newAssignee = data.assignedTo
        ? await prisma.user.findUnique({
            where: { id: data.assignedTo },
            select: { name: true },
          })
        : null;

      await prisma.auditLog.create({
        data: {
          action: "TASK_REASSIGNED",
          details: `Task "${task.title}" reassigned to ${newAssignee?.name || "unassigned"}`,
          userId: req.user!.id,
        },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });

    await prisma.task.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "TASK_DELETED",
        details: `Deleted task "${task.title}"`,
        userId: req.user!.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
