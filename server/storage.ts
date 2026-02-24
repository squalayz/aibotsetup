import {
  type User, type InsertUser,
  type Payment, type InsertPayment,
  type Booking, type InsertBooking,
  type Signup, type InsertSignup,
  type Visitor, type InsertVisitor,
  users, payments, bookings, signups, visitors,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(): Promise<Payment[]>;
  getPaymentByTxHash(txHash: string): Promise<Payment | undefined>;
  getPaymentById(id: string): Promise<Payment | undefined>;
  updatePaymentVerified(id: string, verified: boolean): Promise<Payment>;

  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  deleteBooking(id: string): Promise<void>;
  getBookingByDateAndHour(date: string, hour: number): Promise<Booking | undefined>;

  createSignup(signup: InsertSignup): Promise<Signup>;
  getSignups(): Promise<Signup[]>;
  getSignupByEmail(email: string): Promise<Signup | undefined>;
  deleteSignup(id: string): Promise<void>;

  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  getVisitors(): Promise<Visitor[]>;
  getVisitorStats(): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    locations: { country: string; city: string | null; count: number }[];
    byDay: { date: string; count: number }[];
    topPages: { page: string; count: number }[];
    topReferrers: { referrer: string; count: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(payment).returning();
    return result;
  }

  async getPayments(): Promise<Payment[]> {
    return db.select().from(payments);
  }

  async getPaymentByTxHash(txHash: string): Promise<Payment | undefined> {
    const [result] = await db.select().from(payments).where(eq(payments.txHash, txHash));
    return result;
  }

  async getPaymentById(id: string): Promise<Payment | undefined> {
    const [result] = await db.select().from(payments).where(eq(payments.id, id));
    return result;
  }

  async updatePaymentVerified(id: string, verified: boolean): Promise<Payment> {
    const [result] = await db.update(payments).set({ verified }).where(eq(payments.id, id)).returning();
    return result;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [result] = await db.insert(bookings).values(booking).returning();
    return result;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings);
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.date, date));
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async getBookingByDateAndHour(date: string, hour: number): Promise<Booking | undefined> {
    const [result] = await db.select().from(bookings).where(
      and(eq(bookings.date, date), eq(bookings.hour, hour), eq(bookings.status, "confirmed"))
    );
    return result;
  }

  async createSignup(signup: InsertSignup): Promise<Signup> {
    const [result] = await db.insert(signups).values(signup).returning();
    return result;
  }

  async getSignups(): Promise<Signup[]> {
    return db.select().from(signups).orderBy(desc(signups.createdAt));
  }

  async getSignupByEmail(email: string): Promise<Signup | undefined> {
    const [result] = await db.select().from(signups).where(eq(signups.email, email));
    return result;
  }

  async deleteSignup(id: string): Promise<void> {
    await db.delete(signups).where(eq(signups.id, id));
  }

  async createVisitor(visitor: InsertVisitor): Promise<Visitor> {
    const [result] = await db.insert(visitors).values(visitor).returning();
    return result;
  }

  async getVisitors(): Promise<Visitor[]> {
    return db.select().from(visitors).orderBy(desc(visitors.createdAt)).limit(200);
  }

  async getVisitorStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    const allVisitors = await db.select().from(visitors);
    const total = allVisitors.length;
    const today = allVisitors.filter(v => new Date(v.createdAt) >= todayStart).length;
    const thisWeek = allVisitors.filter(v => new Date(v.createdAt) >= weekStart).length;
    const thisMonth = allVisitors.filter(v => new Date(v.createdAt) >= monthStart).length;

    const locMap = new Map<string, { country: string; city: string | null; count: number }>();
    for (const v of allVisitors) {
      const key = `${v.country || "Unknown"}|${v.city || ""}`;
      const existing = locMap.get(key);
      if (existing) existing.count++;
      else locMap.set(key, { country: v.country || "Unknown", city: v.city || null, count: 1 });
    }
    const locations = Array.from(locMap.values()).sort((a, b) => b.count - a.count).slice(0, 20);

    const dayMap = new Map<string, number>();
    for (const v of allVisitors) {
      const d = new Date(v.createdAt).toISOString().split("T")[0];
      dayMap.set(d, (dayMap.get(d) || 0) + 1);
    }
    const byDay = Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    const pageMap = new Map<string, number>();
    for (const v of allVisitors) {
      pageMap.set(v.page, (pageMap.get(v.page) || 0) + 1);
    }
    const topPages = Array.from(pageMap.entries())
      .map(([page, count]) => ({ page, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const refMap = new Map<string, number>();
    for (const v of allVisitors) {
      if (v.referrer) {
        refMap.set(v.referrer, (refMap.get(v.referrer) || 0) + 1);
      }
    }
    const topReferrers = Array.from(refMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { total, today, thisWeek, thisMonth, locations, byDay, topPages, topReferrers };
  }
}

export const storage = new DatabaseStorage();
