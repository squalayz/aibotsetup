import {
  type User, type InsertUser,
  type Payment, type InsertPayment,
  type Booking, type InsertBooking,
  users, payments, bookings,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createPayment(payment: InsertPayment): Promise<Payment>;
  getPayments(): Promise<Payment[]>;
  getPaymentByTxHash(txHash: string): Promise<Payment | undefined>;

  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  deleteBooking(id: string): Promise<void>;
  getBookingByDateAndHour(date: string, hour: number): Promise<Booking | undefined>;
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
}

export const storage = new DatabaseStorage();
