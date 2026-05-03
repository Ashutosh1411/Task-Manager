"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// GET /api/tasks
router.get("/", auth_1.requireAuth, async (req, res) => {
    try {
        const { projectId, search, status, assignedTo, page = "1", pageSize = "10" } = req.query;
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        const skip = (pageNum - 1) * size;
        const where = {};
        if (projectId)
            where.projectId = projectId;
        if (search)
            where.title = { contains: search, mode: "insensitive" };
        if (status)
            where.status = status;
        if (assignedTo)
            where.assignedTo = assignedTo;
        // Members can only see their own tasks
        if (req.user.role === "MEMBER") {
            where.assignedTo = req.user.id;
        }
        const [tasks, total] = await Promise.all([
            prisma_1.prisma.task.findMany({
                where,
                include: {
                    assignee: { select: { id: true, name: true, email: true } },
                    project: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: size,
            }),
            prisma_1.prisma.task.count({ where }),
        ]);
        res.json({
            tasks,
            total,
            page: pageNum,
            pageSize: size,
            totalPages: Math.ceil(total / size),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get tasks" });
    }
});
// GET /api/tasks/project/:projectId
router.get("/project/:projectId", auth_1.requireAuth, async (req, res) => {
    try {
        const { projectId } = req.params;
        const where = { projectId };
        if (req.user.role === "MEMBER") {
            where.assignedTo = req.user.id;
        }
        const tasks = await prisma_1.prisma.task.findMany({
            where,
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get tasks by project" });
    }
});
// POST /api/tasks
router.post("/", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const data = req.body;
        const task = await prisma_1.prisma.task.create({
            data: {
                title: data.title,
                description: data.description,
                status: data.status || client_1.TaskStatus.TODO,
                priority: data.priority || client_1.Priority.MEDIUM,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                projectId: data.projectId,
                assignedTo: data.assignedTo || null,
            },
            include: {
                assignee: { select: { name: true } },
            },
        });
        const assigneeName = task.assignee?.name || "unassigned";
        await prisma_1.prisma.auditLog.create({
            data: {
                action: "TASK_CREATED",
                details: `Created task "${data.title}" assigned to ${assigneeName} in project`,
                userId: req.user.id,
            },
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create task" });
    }
});
// PATCH /api/tasks/:id/status
router.patch("/:id/status", auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const task = await prisma_1.prisma.task.findUnique({
            where: { id },
            include: { assignee: { select: { name: true } } },
        });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        if (req.user.role === "MEMBER" && task.assignedTo !== req.user.id) {
            return res.status(403).json({ error: "You can only update your own tasks" });
        }
        const updated = await prisma_1.prisma.task.update({
            where: { id },
            data: { status },
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: "STATUS_CHANGED",
                details: `Task "${task.title}" status changed from ${task.status} to ${status}`,
                userId: req.user.id,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update task status" });
    }
});
// PATCH /api/tasks/:id
router.patch("/:id", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const task = await prisma_1.prisma.task.findUnique({ where: { id } });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        const updateData = {};
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.dueDate !== undefined)
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.assignedTo !== undefined)
            updateData.assignedTo = data.assignedTo || null;
        const updated = await prisma_1.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                assignee: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true } },
            },
        });
        if (data.assignedTo !== undefined && data.assignedTo !== task.assignedTo) {
            const newAssignee = data.assignedTo
                ? await prisma_1.prisma.user.findUnique({
                    where: { id: data.assignedTo },
                    select: { name: true },
                })
                : null;
            await prisma_1.prisma.auditLog.create({
                data: {
                    action: "TASK_REASSIGNED",
                    details: `Task "${task.title}" reassigned to ${newAssignee?.name || "unassigned"}`,
                    userId: req.user.id,
                },
            });
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update task" });
    }
});
// DELETE /api/tasks/:id
router.delete("/:id", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma_1.prisma.task.findUnique({ where: { id } });
        if (!task)
            return res.status(404).json({ error: "Task not found" });
        await prisma_1.prisma.task.delete({ where: { id } });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: "TASK_DELETED",
                details: `Deleted task "${task.title}"`,
                userId: req.user.id,
            },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete task" });
    }
});
exports.default = router;
