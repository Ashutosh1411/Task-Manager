import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/audit
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to get audit logs" });
  }
});

// GET /api/audit/stats
router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const where = req.user!.role === "MEMBER" ? { assignedTo: req.user!.id } : {};

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, totalProjects, totalUsers] =
      await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: "TODO" } }),
        prisma.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
        prisma.task.count({ where: { ...where, status: "DONE" } }),
        prisma.project.count(),
        prisma.user.count(),
      ]);

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      totalProjects,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /api/audit/users
router.get("/users", requireAuth, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true,
        _count: {
          select: {
            tasks: true,
          }
        },
      },
      orderBy: { name: "asc" },
    });
    
    // Also get done tasks count separately since prisma _count doesn't support nested filtering easily here
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const doneTasks = await prisma.task.count({
        where: { assignedTo: user.id, status: "DONE" }
      });
      return {
        ...user,
        tasksCount: user._count.tasks,
        doneTasksCount: doneTasks
      };
    }));

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
