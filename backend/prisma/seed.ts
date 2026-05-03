import { PrismaClient, Role, TaskStatus, Priority } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@taskmanager.com",
      password: hashSync("admin123", 10),
      role: Role.ADMIN,
    },
  });

  const ashutosh = await prisma.user.create({
    data: {
      name: "Ashutosh Sharma",
      email: "ashutosh@taskmanager.com",
      password: hashSync("member123", 10),
      role: Role.MEMBER,
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: "Rahul",
      email: "rahul@taskmanager.com",
      password: hashSync("member123", 10),
      role: Role.MEMBER,
    },
  });

  console.log("✅ Users created:", admin.name, ashutosh.name, rahul.name);

  // Create Projects
  const projectAlpha = await prisma.project.create({
    data: {
      name: "Project Alpha",
      description:
        "A flagship product launch with comprehensive marketing and development milestones.",
      createdById: admin.id,
    },
  });

  const projectBeta = await prisma.project.create({
    data: {
      name: "Project Beta",
      description:
        "Internal tooling overhaul to improve developer experience and CI/CD pipelines.",
      createdById: admin.id,
    },
  });

  console.log("✅ Projects created:", projectAlpha.name, projectBeta.name);

  // Create Tasks for Project Alpha
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Design landing page mockups",
        description:
          "Create high-fidelity mockups for the new product landing page in Figma.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: new Date("2026-05-15"),
        projectId: projectAlpha.id,
        assignedTo: ashutosh.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Set up CI/CD pipeline",
        description:
          "Configure GitHub Actions for automated testing, linting, and deployment.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        dueDate: new Date("2026-05-20"),
        projectId: projectAlpha.id,
        assignedTo: rahul.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Write API documentation",
        description:
          "Document all REST API endpoints using OpenAPI/Swagger specification.",
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        dueDate: new Date("2026-05-25"),
        projectId: projectAlpha.id,
        assignedTo: ashutosh.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement user authentication",
        description:
          "Build login, register, and password reset flows with JWT tokens.",
        status: TaskStatus.DONE,
        priority: Priority.HIGH,
        dueDate: new Date("2026-05-10"),
        projectId: projectAlpha.id,
        assignedTo: rahul.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Database schema optimization",
        description:
          "Review and optimize database indexes for frequently queried columns.",
        status: TaskStatus.TODO,
        priority: Priority.LOW,
        dueDate: new Date("2026-06-01"),
        projectId: projectBeta.id,
        assignedTo: ashutosh.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Refactor notification service",
        description:
          "Migrate notification service from polling to WebSocket-based real-time updates.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        dueDate: new Date("2026-05-28"),
        projectId: projectBeta.id,
        assignedTo: rahul.id,
      },
    }),
  ]);

  console.log(`✅ ${tasks.length} tasks created`);

  // Create Audit Logs
  await Promise.all([
    prisma.auditLog.create({
      data: {
        action: "PROJECT_CREATED",
        details: `Created project "${projectAlpha.name}"`,
        userId: admin.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "PROJECT_CREATED",
        details: `Created project "${projectBeta.name}"`,
        userId: admin.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "TASK_CREATED",
        details: `Created task "Design landing page mockups" and assigned to Ashutosh Sharma`,
        userId: admin.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "STATUS_CHANGED",
        details: `Task "Implement user authentication" status changed to DONE`,
        userId: rahul.id,
      },
    }),
    prisma.auditLog.create({
      data: {
        action: "TASK_ASSIGNED",
        details: `Task "Set up CI/CD pipeline" assigned to Rahul`,
        userId: admin.id,
      },
    }),
  ]);

  console.log("✅ Audit logs created");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
