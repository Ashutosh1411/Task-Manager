import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/projects
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to get projects" });
  }
});

// GET /api/projects/:id
router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { name: true } },
        tasks: {
          where: req.user!.role === "MEMBER" ? { assignedTo: req.user!.id } : {},
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to get project" });
  }
});

// POST /api/projects
router.post("/", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user!.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PROJECT_CREATED",
        details: `Created project "${name}"`,
        userId: req.user!.id,
      },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PATCH /api/projects/:id
router.patch("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const updated = await prisma.project.update({
      where: { id },
      data: { name, description },
    });

    await prisma.auditLog.create({
      data: {
        action: "PROJECT_UPDATED",
        details: `Updated project "${name}"`,
        userId: req.user!.id,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id
router.delete("/:id", requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    await prisma.project.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: "PROJECT_DELETED",
        details: `Deleted project "${project.name}"`,
        userId: req.user!.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
