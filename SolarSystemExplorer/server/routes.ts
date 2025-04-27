import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { insertClassSchema, insertAttendanceSchema, insertNotificationSchema } from "@shared/schema";
import type { Express, Request, Response, NextFunction } from "express";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/classes", requireAuth, async (req, res) => {
    console.log(`Fetching classes for user role: ${req.user!.role}, user id: ${req.user!.id}`);
    let classes = [];
    
    if (req.user!.role === "teacher") {
      classes = await storage.getClassesByTeacher(req.user!.id);
    } else if (req.user!.role === "admin") {
      // Admin can see all classes
      classes = await storage.getClassesByTeacher(-1);
    } else if (req.user!.role === "student") {
      // Students can see all classes for scanning attendance
      classes = await storage.getClassesByTeacher(-1);
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    console.log(`Returning ${classes.length} classes`);
    res.json(classes);
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
      // Check for duplicate attendance first
      const studentId = req.user!.id;
      const classId = parseInt(req.body.classId);
      const today = new Date();
      
      // Check if student already has attendance for this class today
      const exists = await storage.checkExistingAttendance(studentId, classId, today);
      if (exists) {
        console.log(`Student ${studentId} already has attendance for class ${classId} today`);
        return res.status(400).json({ 
          message: "You have already marked attendance for this class today" 
        });
      }
      
      const data = insertAttendanceSchema.parse({
        ...req.body,
        studentId: studentId,
        date: today,
      });
      
      const attendance = await storage.createAttendance(data);
      res.status(201).json(attendance);
    } catch (error) {
      // Error handling...
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
