import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaymentSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

const ADMIN_PIN = process.env.ADMIN_PIN || "4455";
const DEMO_CODE = "DEMO2026";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/payments", async (req, res) => {
    try {
      const body = req.body;
      const txHash = body.txHash?.trim();
      const tier = body.tier;
      const amount = body.amount;

      if (!txHash || !tier || !amount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      if (tier !== "self" && tier !== "vip") {
        return res.status(400).json({ message: "Invalid tier" });
      }

      const expectedAmount = tier === "vip" ? 799 : 199;
      if (amount !== expectedAmount) {
        return res.status(400).json({ message: "Invalid amount for tier" });
      }

      const isDemo = txHash.toUpperCase() === DEMO_CODE;

      const existing = await storage.getPaymentByTxHash(txHash);
      if (existing) {
        return res.status(400).json({ message: "This transaction hash has already been used" });
      }

      const payment = await storage.createPayment({
        txHash,
        tier,
        amount: expectedAmount,
        verified: isDemo ? false : true,
      });

      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.get("/api/bookings", async (_req, res) => {
    try {
      const allBookings = await storage.getBookings();
      res.json(allBookings);
    } catch {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);

      const existing = await storage.getBookingByDateAndHour(data.date, data.hour);
      if (existing) {
        return res.status(400).json({ message: "This time slot is already booked" });
      }

      const booking = await storage.createBooking(data);
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const { pin } = req.body;
    if (pin === ADMIN_PIN) {
      req.session.isAdmin = true;
      return res.json({ success: true });
    }
    res.status(401).json({ message: "Invalid PIN" });
  });

  app.get("/api/admin/bookings", requireAdmin, async (_req, res) => {
    try {
      const allBookings = await storage.getBookings();
      res.json(allBookings);
    } catch {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/admin/payments", requireAdmin, async (_req, res) => {
    try {
      const allPayments = await storage.getPayments();
      res.json(allPayments);
    } catch {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBooking(req.params.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  return httpServer;
}
