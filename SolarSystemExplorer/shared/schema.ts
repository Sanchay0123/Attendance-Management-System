import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type Role = "student" | "teacher" | "admin";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<Role>(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: integer("teacher_id").notNull(),
  schedule: text("schedule").notNull(), // JSON string of schedule
  room: text("room").notNull(),
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  studentId: integer("student_id").notNull(),
  date: timestamp("date").notNull(),
  status: text("status").notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
  email: true,
});

export const insertClassSchema = createInsertSchema(classes);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const insertNotificationSchema = createInsertSchema(notifications);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClass = z.infer<typeof insertClassSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type User = typeof users.$inferSelect;
export type Class = typeof classes.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
