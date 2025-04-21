import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertClassSchema, insertAttendanceSchema, insertNotificationSchema } from "@shared/schema";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/classes", requireAuth, async (req, res) => {
    if (req.user!.role === "teacher") {
      const classes = await storage.getClassesByTeacher(req.user!.id);
      res.json(classes);
    } else if (req.user!.role === "admin") {
      // Admin can see all classes
      const classes = await storage.getClassesByTeacher(-1);
      res.json(classes);
    } else {
      res.status(403).json({ message: "Forbidden" });
    }
  });

  app.post("/api/classes", requireAuth, requireRole(["teacher", "admin"]), async (req, res) => {
    try {
      const data = insertClassSchema.parse(req.body);
      const class_ = await storage.createClass(data);
      res.status(201).json(class_);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post("/api/attendance", requireAuth, requireRole(["student"]), async (req, res) => {
    try {
      const data = insertAttendanceSchema.parse({
        ...req.body,
        studentId: req.user!.id,
        date: new Date(),
      });
      const attendance = await storage.createAttendance(data);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/attendance/student", requireAuth, requireRole(["student"]), async (req, res) => {
    const attendance = await storage.getAttendanceByStudent(req.user!.id);
    res.json(attendance);
  });

  app.get("/api/attendance/class/:classId", requireAuth, requireRole(["teacher", "admin"]), async (req, res) => {
    const attendance = await storage.getAttendanceByClass(parseInt(req.params.classId));
    res.json(attendance);
  });

  app.post("/api/notifications", requireAuth, requireRole(["teacher", "admin"]), async (req, res) => {
    try {
      const data = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(data);
      res.status(201).json(notification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid request data" });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get("/api/notifications", requireAuth, async (req, res) => {
    const notifications = await storage.getNotificationsByUser(req.user!.id);
    res.json(notifications);
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationAsRead(parseInt(req.params.id));
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
