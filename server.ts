import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { sendEmail } from "./server/mailService.js";
import torrentSearch from "torrent-search-api";
import { RealDebridService } from "./server/realDebridService.js";
import axios from "axios";
import crypto from "crypto";

dotenv.config();

// Configure Torrent Search
torrentSearch.enablePublicProviders();

const rdService = process.env.REAL_DEBRID_API_KEY ? new RealDebridService(process.env.REAL_DEBRID_API_KEY) : null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

if (admin.apps.length === 0) {
  try {
    // Standard initialization for AI Studio / Google Cloud environments
    console.log(`[Firebase Admin] Initializing for Project ID: ${firebaseConfig.projectId}`);
    
    // Check if we are in a local environment or Cloud Run
    const isLocal = !process.env.K_SERVICE && !process.env.VERCEL;
    
    if (isLocal && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.warn("[Firebase Admin] No GOOGLE_APPLICATION_CREDENTIALS found in local environment.");
    }

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: firebaseConfig.projectId,
    });
    console.log("[Firebase Admin] Initialized successfully with applicationDefault");
  } catch (error: any) {
    console.error("[Firebase Admin] Initialization failed:", error.message);
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
}

// Ensure we are using the correct database ID
const databaseId = firebaseConfig.firestoreDatabaseId;
const firestore = databaseId && databaseId !== "(default)"
  ? getFirestore(databaseId)
  : getFirestore();

console.log(`Firebase environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Using Project ID: ${firebaseConfig.projectId}`);
console.log(`Using Firestore Database ID: ${databaseId || "(default)"}`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  
  // Custom headers and CSP
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Allow framing and general sources
    res.setHeader(
      "Content-Security-Policy",
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
      "frame-src *; " +
      "script-src * 'unsafe-inline' 'unsafe-eval'; " +
      "connect-src *;"
    );
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // Grant temporary access after "watching ad"
  app.post("/api/access/ad-reward", async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      // Attempt backend update
      try {
        const userRef = firestore.collection("users").doc(userId);
        await userRef.set({
          temporaryAccessUntil: expiresAt.toISOString(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        console.log(`Backend: Granted 1 hour access to user: ${userId}`);
      } catch (dbError) {
        console.warn("Backend Firestore update failed (permission issue), client will handle it:", dbError);
      }
      
      res.json({ 
        success: true, 
        message: "Access granted for 1 hour",
        expiresAt: expiresAt.toISOString() 
      });
    } catch (error) {
      console.error("Error in ad-reward endpoint:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/info/location", (req, res) => {
    console.log("Req: GET /api/info/location");
    const country = req.headers["x-vercel-ip-country"] || "Egypt";
    const city = req.headers["x-vercel-ip-city"] || "Cairo";
    const timezone = req.headers["x-vercel-ip-timezone"] || "Africa/Cairo";
    
    res.json({
      timezone,
      country,
      city,
      ip: req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress,
      source: "express-server"
    });
  });

  // Notifications: New Movie Release
  app.post("/api/notifications/new-release", async (req, res) => {
    const { movieTitle, releaseDate, posterPath } = req.body;
    
    if (!movieTitle) {
      return res.status(400).json({ error: "Movie title is required" });
    }

    try {
      // Get all users who have an email
      // We limit to 50 for safety in this demo
      const usersSnap = await firestore.collection("users").limit(50).get();
      const notifications = [];

      for (const doc of usersSnap.docs) {
        const userData = doc.data();
        if (userData.email) {
          notifications.push(
            sendEmail({
              to: userData.email,
              subject: `New Release: ${movieTitle}`,
              text: `Exciting news! ${movieTitle} is now available on our platform starting from ${releaseDate || 'today'}. Log in now to watch it!`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #141414; color: white; padding: 20px; border-radius: 8px;">
                  <h1 style="color: #E50914;">New Release Alert!</h1>
                  <p>Exciting news! <strong>${movieTitle}</strong> is now available on our platform.</p>
                  ${posterPath ? `<img src="https://image.tmdb.org/t/p/w500${posterPath}" style="width: 100%; border-radius: 8px; margin: 10px 0;" />` : ''}
                  <div style="margin-top: 20px;">
                    <a href="${process.env.APP_URL || '#'}" style="background: #E50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Watch Now</a>
                  </div>
                </div>
              `
            })
          );
        }
      }

      await Promise.allSettled(notifications);
      res.json({ success: true, message: `Sent ${notifications.length} notifications for ${movieTitle}` });
    } catch (error) {
      console.error("Error sending release notifications:", error);
      res.status(500).json({ error: "Failed to send notifications" });
    }
  });

  // Stream Orchestration
  app.post("/api/stream/find-and-resolve", async (req, res) => {
    const { title, year, tmdbId, type, userId } = req.body;
    
    if (!title || !tmdbId) {
      return res.status(400).json({ error: "Movie title and TMDB ID are required" });
    }
 
    try {
        // 1. Check for user-specific RD key
        let userRdKey = null;
        if (userId && firestore) {
          try {
            console.log(`[Firestore] Fetching user doc: ${userId} in db: ${databaseId || '(default)'}`);
            const userDoc = await firestore.collection("users").doc(userId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              if (userData?.realDebridApiKey) {
                userRdKey = userData.realDebridApiKey;
                console.log(`[Firestore] Found RD key for user ${userId}`);
              } else {
                console.log(`[Firestore] User ${userId} has no RD key`);
              }
            } else {
              console.log(`[Firestore] User doc ${userId} not found`);
            }
          } catch (e: any) {
            console.error(`[Firestore] Error fetching RD key: ${e.message}`, { code: e.code });
            if (e.code === 7) {
              console.warn("[Firestore] PERMISSION_DENIED: Ensure the service account has access to this database.");
            }
          }
        }

        const effectiveRdKey = userRdKey || process.env.REAL_DEBRID_API_KEY;
        const activeRdService = effectiveRdKey ? new RealDebridService(effectiveRdKey) : null;

        // 2. Get better titles from TMDB
        let searchTitles = [title];
        const tmdbApiKey = process.env.TMDB_API_KEY;
        if (!tmdbApiKey || tmdbApiKey.length < 10) {
            console.error("TMDB_API_KEY is missing or looks like a placeholder");
        } else {
            try {
                const url = `https://api.themoviedb.org/3/${type || 'movie'}/${tmdbId}`;
                const tmdbRes = await axios.get(url, {
                    params: { api_key: tmdbApiKey, language: 'en' }
                });
                if (tmdbRes.data.title) searchTitles.push(tmdbRes.data.title);
                if (tmdbRes.data.original_title) searchTitles.push(tmdbRes.data.original_title);
                if (tmdbRes.data.name) searchTitles.push(tmdbRes.data.name);
                console.log(`[TMDB] Titles found: ${searchTitles.join(', ')}`);
            } catch (e: any) {
                const tmdbError = e.response?.data?.status_message || e.message;
                console.error(`[TMDB] Error for ${tmdbId}: ${tmdbError}`);
            }
        }
        
        // 3. Search Torrent
        let torrents: any[] = [];
        for (const t of searchTitles) {
            const searchTitle = year ? `${t} ${year}` : t;
            const results = await torrentSearch.search(searchTitle, 'Movies', 3);
            torrents = [...torrents, ...results];
        }
        
        // Unique torrents by magnet
        const seenMagnets = new Set();
        torrents = torrents.filter(t => {
            if (!t.magnet || seenMagnets.has(t.magnet)) return false;
            seenMagnets.add(t.magnet);
            return true;
        });
        
        if (torrents.length === 0) {
            return res.status(404).json({ error: "No torrents found" });
        }
 
        // 4. Resolve via Debrid
        if (activeRdService) {
            try {
              const streamUrl = await activeRdService.resolveMagnet(torrents[0].magnet);
              return res.json({
                  success: true,
                  streamUrl,
                  message: userRdKey ? "Stream resolved via your Real-Debrid account" : "Stream resolved via system Real-Debrid"
              });
            } catch (rdError: any) {
              console.warn("Real-Debrid resolution failed, falling back to magnet:", rdError.message);
            }
        }
        
        return res.json({
            success: true,
            streamUrl: torrents[0].magnet,
            message: activeRdService ? "RD resolution failed, showing magnet link" : "Magnet link found, RD not configured"
        });
    } catch (error) {
        console.error("Stream resolution error:", error);
        res.status(500).json({ error: "Failed to resolve stream" });
    }
  });

  // Paymob Payment Initialization
  app.post("/api/payment/paymob/init", async (req, res) => {
    const { userId, amountCents = "10000" } = req.body; // Default 100 EGP
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    try {
      const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
      const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
      const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

      if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
        return res.status(500).json({ error: "Paymob credentials not configured on server" });
      }

      // 1. Authentication Request
      const authResponse = await axios.post("https://accept.paymob.com/api/auth/tokens", {
        api_key: PAYMOB_API_KEY
      });
      const token = authResponse.data.token;

      // 2. Order Registration
      const orderResponse = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: amountCents,
        currency: "EGP",
        items: []
      });
      const orderId = orderResponse.data.id;

      // 3. Payment Key Request
      const paymentKeyResponse = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
        auth_token: token,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: "user@cinestream.com", 
          floor: "NA",
          first_name: "CineStream",
          street: "NA",
          building: "NA",
          phone_number: "+201000000000",
          shipping_method: "NA",
          postal_code: "NA",
          city: "NA",
          country: "NA",
          last_name: userId, // Using last_name to pass userId back via webhook
          state: "NA"
        },
        currency: "EGP",
        integration_id: PAYMOB_INTEGRATION_ID
      });

      const paymentKey = paymentKeyResponse.data.token;

      // 4. Return the iframe URL
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
      
      res.json({ success: true, iframeUrl, orderId });
    } catch (error: any) {
      console.error("Paymob init error:", error?.response?.data || error.message);
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  // Paymob Webhook (Processed Callback)
  app.post("/api/payment/paymob/webhook", async (req, res) => {
    // In production, verify HMAC signature using process.env.PAYMOB_HMAC_SECRET
    try {
      const transaction = req.body?.obj;
      // We look for success in the transaction object
      if (transaction && transaction.success === true) {
        const userId = transaction.order.billing_data.last_name; 
        const amountCents = transaction.amount_cents;
        
        let daysToAdd = 30;
        if (amountCents === 15000) {
          daysToAdd = 180; // 6 months
        } else if (amountCents === 25000) {
          daysToAdd = 365; // 1 year
        }
        
        // Upgrade user in Firestore
        const userRef = firestore.collection("users").doc(userId);
        await userRef.set({
          isPremium: true,
          premiumUntil: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        
        console.log(`Payment successful. Upgraded user: ${userId} for ${daysToAdd} days`);
      } else {
        console.log(`Payment failed or pending for order: ${transaction?.order?.id}`);
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).send("Error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
