import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all albums
  app.get("/api/albums", async (req, res) => {
    try {
      const albums = await storage.getAllAlbums();
      res.json(albums);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch albums" });
    }
  });

  // Get single album
  app.get("/api/albums/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const album = await storage.getAlbum(id);
      
      if (!album) {
        res.status(404).json({ error: "Album not found" });
        return;
      }
      
      res.json(album);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch album" });
    }
  });

  // Initialize payment (to be integrated with Cashfree)
  app.post("/api/initiate-payment", async (req, res) => {
    try {
      const { albumId } = req.body;
      const album = await storage.getAlbum(albumId);
      
      if (!album) {
        res.status(404).json({ error: "Album not found" });
        return;
      }
      
      if (!album.isReleased) {
        res.status(400).json({ error: "Album not yet released" });
        return;
      }

      // TODO: Integrate with Cashfree here
      // This is a placeholder response
      res.json({ 
        success: true,
        message: "Payment initialization successful",
        album: {
          id: album.id,
          title: album.title,
          price: album.price,
          coverImage: album.coverImage
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: "Error initiating payment: " + error.message });
    }
  });

  // Payment verification endpoint (to be integrated with Cashfree)
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { paymentId, albumId } = req.body;
      const album = await storage.getAlbum(albumId);
      
      if (!album) {
        res.status(404).json({ error: "Album not found" });
        return;
      }
      
      if (!album.isReleased) {
        res.status(400).json({ error: "Album not yet released" });
        return;
      }
      
      // TODO: Verify payment with Cashfree here
      res.json({ 
        success: true, 
        message: "Payment verified successfully",
        downloadUrl: `/download/${album.id}`
      });
    } catch (error) {
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
