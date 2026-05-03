"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/projects
router.get("/", auth_1.requireAuth, async (req, res) => {
    try {
        const projects = await prisma_1.prisma.project.findMany({
            include: {
                createdBy: { select: { name: true } },
                _count: { select: { tasks: true } },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get projects" });
    }
});
// GET /api/projects/:id
router.get("/:id", auth_1.requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.prisma.project.findUnique({
            where: { id },
            include: {
                createdBy: { select: { name: true } },
                tasks: {
                    include: {
                        assignee: { select: { id: true, name: true, email: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
            },
        });
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get project" });
    }
});
// POST /api/projects
router.post("/", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await prisma_1.prisma.project.create({
            data: {
                name,
                description,
                createdById: req.user.id,
            },
        });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: "PROJECT_CREATED",
                details: `Created project "${name}"`,
                userId: req.user.id,
            },
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create project" });
    }
});
// DELETE /api/projects/:id
router.delete("/:id", auth_1.requireAuth, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma_1.prisma.project.findUnique({ where: { id } });
        if (!project)
            return res.status(404).json({ error: "Project not found" });
        await prisma_1.prisma.project.delete({ where: { id } });
        await prisma_1.prisma.auditLog.create({
            data: {
                action: "PROJECT_DELETED",
                details: `Deleted project "${project.name}"`,
                userId: req.user.id,
            },
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete project" });
    }
});
exports.default = router;
