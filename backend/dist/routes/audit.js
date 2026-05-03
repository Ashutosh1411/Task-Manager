"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/audit
router.get("/", auth_1.requireAuth, async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const logs = await prisma_1.prisma.auditLog.findMany({
            include: {
                user: { select: { name: true, email: true } },
            },
            orderBy: { timestamp: "desc" },
            take: limit,
        });
        res.json(logs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get audit logs" });
    }
});
// GET /api/audit/stats
router.get("/stats", auth_1.requireAuth, async (req, res) => {
    try {
        const where = req.user.role === "MEMBER" ? { assignedTo: req.user.id } : {};
        const [totalTasks, todoTasks, inProgressTasks, doneTasks, totalProjects, totalUsers] = await Promise.all([
            prisma_1.prisma.task.count({ where }),
            prisma_1.prisma.task.count({ where: { ...where, status: "TODO" } }),
            prisma_1.prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
            prisma_1.prisma.task.count({ where: { ...where, status: "DONE" } }),
            prisma_1.prisma.project.count(),
            prisma_1.prisma.user.count(),
        ]);
        res.json({
            totalTasks,
            todoTasks,
            inProgressTasks,
            doneTasks,
            totalProjects,
            totalUsers,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get stats" });
    }
});
// GET /api/audit/users
router.get("/users", auth_1.requireAuth, async (req, res) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true },
            orderBy: { name: "asc" },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get users" });
    }
});
exports.default = router;
