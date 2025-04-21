import { User, Class, Attendance, Notification } from "@shared/schema";
import type { InsertUser, InsertClass, InsertAttendance, InsertNotification } from "@shared/schema";
import type { Store } from "express-session";

export interface IStorage {
  sessionStore: Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Class operations
  getClass(id: number): Promise<Class | undefined>;
  createClass(class_: InsertClass): Promise<Class>;
  getClassesByTeacher(teacherId: number): Promise<Class[]>;

  // Attendance operations
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByClass(classId: number): Promise<Attendance[]>;
  getAttendanceByStudent(studentId: number): Promise<Attendance[]>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
}
