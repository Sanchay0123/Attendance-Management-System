import { IStorage } from "./types";
import { User, Class, Attendance, Notification, InsertUser, InsertClass, InsertAttendance, InsertNotification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private classes: Map<number, Class>;
  private attendance: Map<number, Attendance>;
  private notifications: Map<number, Notification>;
  private currentId: { [key: string]: number };
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.classes = new Map();
    this.attendance = new Map();
    this.notifications = new Map();
    this.currentId = { users: 1, classes: 1, attendance: 1, notifications: 1 };
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = this.currentId.classes++;
    const class_ = { ...insertClass, id };
    this.classes.set(id, class_);
    return class_;
  }

  async getClassesByTeacher(teacherId: number): Promise<Class[]> {
    // If teacherId is -1, return all classes (for student/admin view)
    if (teacherId === -1) {
      return Array.from(this.classes.values());
    }
    // Otherwise, filter by the specific teacherId
    return Array.from(this.classes.values()).filter(
      (class_) => class_.teacherId === teacherId,
    );
  }

  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    const id = this.currentId.attendance++;
    const attendance = { ...insertAttendance, id };
    this.attendance.set(id, attendance);
    return attendance;
  }

  async getAttendanceByClass(classId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (attendance) => attendance.classId === classId,
    );
  }

  async getAttendanceByStudent(studentId: number): Promise<Attendance[]> {
    return Array.from(this.attendance.values()).filter(
      (attendance) => attendance.studentId === studentId,
    );
  }

  async checkExistingAttendance(studentId: number, classId: number, date: Date): Promise<boolean> {
    // Get attendance records for this student
    const studentAttendance = await this.getAttendanceByStudent(studentId);
    
    // Check if there's already an attendance record for this class on the same day
    return studentAttendance.some(record => {
      const recordDate = new Date(record.date);
      return record.classId === classId && 
             recordDate.getFullYear() === date.getFullYear() &&
             recordDate.getMonth() === date.getMonth() &&
             recordDate.getDate() === date.getDate();
    });
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentId.notifications++;
    const notification = { ...insertNotification, id };
    this.notifications.set(id, notification);
    return notification;
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId,
    );
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, read: true });
    }
  }
}

export const storage = new MemStorage();
