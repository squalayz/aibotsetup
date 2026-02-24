import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaymentSchema, insertBookingSchema, insertSignupSchema } from "@shared/schema";
import { z } from "zod";
import nodemailer from "nodemailer";

const ADMIN_PIN = process.env.ADMIN_PIN || "4455";
const NOTIFY_EMAIL = "diamondautob@gmail.com";

const gmailTransport = process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NOTIFY_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

async function sendSignupNotification(name: string, email: string, phone: string, type: string, message?: string | null) {
  if (!gmailTransport) return;
  const typeLabels: Record<string, { label: string; color: string }> = {
    general: { label: "AI Agent Inquiry", color: "#00f0ff" },
    trading: { label: "AI Trading Agent Inquiry", color: "#22ff88" },
    team: { label: "Team / Commission Application", color: "#c026d3" },
  };
  const info = typeLabels[type] || typeLabels.general;
  try {
    await gmailTransport.sendMail({
      from: `"AI Bot Setup" <${NOTIFY_EMAIL}>`,
      to: NOTIFY_EMAIL,
      subject: `${info.label}: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #0a0a1a; color: #e0e0e0; border-radius: 8px;">
          <h2 style="color: ${info.color}; margin-top: 0;">${info.label}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; width: 80px;">Name:</td>
              <td style="padding: 8px 0; color: #fff; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Email:</td>
              <td style="padding: 8px 0; color: #fff; font-weight: bold;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Phone:</td>
              <td style="padding: 8px 0; color: #fff; font-weight: bold;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;">Type:</td>
              <td style="padding: 8px 0; color: ${info.color}; font-weight: bold;">${info.label}</td>
            </tr>
            ${message ? `<tr>
              <td style="padding: 8px 0; color: #888; vertical-align: top;">Details:</td>
              <td style="padding: 8px 0; color: #fff;">${message}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #888;">Time:</td>
              <td style="padding: 8px 0; color: #aaa;">${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}</td>
            </tr>
          </table>
          <p style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #222; color: #666; font-size: 12px;">
            Sent from aibotsetup.com
          </p>
        </div>
      `,
    });
    console.log(`${info.label} notification sent for ${email}`);
  } catch (err) {
    console.error("Failed to send inquiry notification:", err);
  }
}
const WALLET = "0x00468c1B22451ed9Fabc9DA32E6aEa28DC03a216".toLowerCase();
const ETH_RPC_URLS = [
  "https://cloudflare-eth.com",
  "https://rpc.ankr.com/eth",
  "https://eth.llamarpc.com",
];

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.isAdmin) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

async function rpcCall(method: string, params: unknown[]): Promise<unknown> {
  for (const rpcUrl of ETH_RPC_URLS) {
    try {
      const res = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      const data = await res.json();
      if (data.result !== undefined) return data.result;
    } catch {
      continue;
    }
  }
  return null;
}

interface TxData {
  to?: string;
  value?: string;
  blockNumber?: string;
}

interface TxReceipt {
  status?: string;
  to?: string;
  blockNumber?: string;
}

async function verifyTransactionOnChain(txHash: string, expectedAmountUsd: number): Promise<{
  verified: boolean;
  status: "pending" | "confirmed" | "failed" | "not_found";
  details?: string;
}> {
  try {
    const txData = await rpcCall("eth_getTransactionByHash", [txHash]) as TxData | null;

    if (!txData) {
      return { verified: false, status: "not_found", details: "Transaction not found on chain" };
    }

    if (txData.to && txData.to.toLowerCase() !== WALLET) {
      return { verified: false, status: "failed", details: "Transaction was not sent to the correct wallet" };
    }

    if (!txData.blockNumber) {
      return { verified: false, status: "pending", details: "Transaction is pending confirmation" };
    }

    const receipt = await rpcCall("eth_getTransactionReceipt", [txHash]) as TxReceipt | null;

    if (!receipt) {
      return { verified: false, status: "pending", details: "Transaction receipt not available yet" };
    }

    if (receipt.status === "0x0") {
      return { verified: false, status: "failed", details: "Transaction failed on chain" };
    }

    if (receipt.to && receipt.to.toLowerCase() !== WALLET) {
      return { verified: false, status: "failed", details: "Transaction recipient does not match" };
    }

    const currentBlockHex = await rpcCall("eth_blockNumber", []) as string | null;
    if (currentBlockHex && txData.blockNumber) {
      const currentBlock = parseInt(currentBlockHex, 16);
      const txBlock = parseInt(txData.blockNumber, 16);
      const confirmations = currentBlock - txBlock;
      if (confirmations < 1) {
        return { verified: false, status: "pending", details: "Waiting for block confirmations" };
      }
    }

    return { verified: true, status: "confirmed" };
  } catch {
    return { verified: false, status: "pending", details: "Unable to verify on chain, will retry" };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const CRAWLER_UA = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|iMessageLinkPreview|applebot/i;

  app.get("/", (req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    if (!CRAWLER_UA.test(ua)) return next();

    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host || "";
    const baseUrl = `${protocol}://${host}`;

    res.status(200).set({ "Content-Type": "text/html" }).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>AI Bot Setup - Custom AI Agents Built in 30 Minutes</title>
<meta name="description" content="We build custom AI agents that answer calls, book appointments, close sales, trade crypto & stocks, and scale your business — built in under 30 minutes."/>
<meta property="og:type" content="website"/>
<meta property="og:url" content="${baseUrl}/"/>
<meta property="og:title" content="AI Bot Setup - AI Agents That Run Your Empire"/>
<meta property="og:description" content="Custom AI agents built in 30 minutes. Answer calls, book appointments, close sales, trade crypto & stocks — 24/7 with zero burnout."/>
<meta property="og:image" content="${baseUrl}/og-image.png"/>
<meta property="og:image:width" content="1024"/>
<meta property="og:image:height" content="576"/>
<meta property="og:image:alt" content="AI Bot Setup - Custom AI Agents Built in 30 Minutes"/>
<meta property="og:site_name" content="AI Bot Setup"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="AI Bot Setup - AI Agents That Run Your Empire"/>
<meta name="twitter:description" content="Custom AI agents built in 30 minutes. Answer calls, close sales, trade crypto — 24/7 with zero burnout."/>
<meta name="twitter:image" content="${baseUrl}/og-image.png"/>
<meta name="theme-color" content="#050510"/>
<link rel="icon" type="image/png" href="${baseUrl}/favicon-new.png"/>
</head>
<body></body>
</html>`);
  });

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

      const existing = await storage.getPaymentByTxHash(txHash);
      if (existing) {
        return res.status(400).json({ message: "This transaction hash has already been used" });
      }

      const chainResult = await verifyTransactionOnChain(txHash, expectedAmount);
      const verified = chainResult.verified;

      const payment = await storage.createPayment({
        txHash,
        tier,
        amount: expectedAmount,
        verified,
      });

      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  app.get("/api/payments/:id/status", async (req, res) => {
    try {
      const payment = await storage.getPaymentById(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      if (payment.verified) {
        return res.json(payment);
      }

      const chainResult = await verifyTransactionOnChain(payment.txHash, payment.amount);
      if (chainResult.verified) {
        const updated = await storage.updatePaymentVerified(payment.id, true);
        return res.json(updated);
      }

      res.json({ ...payment, chainStatus: chainResult.status, chainDetails: chainResult.details });
    } catch {
      res.status(500).json({ message: "Failed to check payment status" });
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

  app.post("/api/signups", async (req, res) => {
    try {
      const data = insertSignupSchema.parse(req.body);

      const name = data.name.trim();
      const email = data.email.trim().toLowerCase();
      const phone = data.phone.trim();
      const message = data.message?.trim() || null;

      if (!name || name.length < 2) {
        return res.status(400).json({ message: "Please enter your name" });
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      if (!phone || phone.length < 7) {
        return res.status(400).json({ message: "Please enter a valid phone number" });
      }

      const type = (data as any).type || "general";
      const validTypes = ["general", "trading", "team"];
      const signupType = validTypes.includes(type) ? type : "general";

      const signup = await storage.createSignup({ name, email, phone, message, type: signupType });

      sendSignupNotification(name, email, phone, signupType, message);

      res.json(signup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to submit inquiry" });
    }
  });

  app.get("/api/admin/signups", requireAdmin, async (_req, res) => {
    try {
      const allSignups = await storage.getSignups();
      res.json(allSignups);
    } catch {
      res.status(500).json({ message: "Failed to fetch signups" });
    }
  });

  app.delete("/api/admin/signups/:id", requireAdmin, async (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await storage.deleteSignup(id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete signup" });
    }
  });

  app.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await storage.deleteBooking(id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  return httpServer;
}
