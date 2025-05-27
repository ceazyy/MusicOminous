import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  log(`[DEBUG] Incoming request: ${req.method} ${req.path}`);
  log(`[DEBUG] Environment: ${app.get("env")}`);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Debug middleware for 404s
  app.use((req, res, next) => {
    log(`[DEBUG] 404 Handler - Request path: ${req.path}`);
    log(`[DEBUG] 404 Handler - Request method: ${req.method}`);
    log(`[DEBUG] 404 Handler - Environment: ${app.get("env")}`);
    
    // Check if we're in production and log the dist directory contents
    if (app.get("env") === "production") {
      const distPath = path.resolve(process.cwd(), "client/dist");
      try {
        const files = fs.readdirSync(distPath);
        log(`[DEBUG] Dist directory contents: ${JSON.stringify(files)}`);
      } catch (error) {
        log(`[DEBUG] Error reading dist directory: ${error}`);
      }
    }
    
    next();
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`[DEBUG] Error handler - Status: ${status}, Message: ${message}`);
    log(`[DEBUG] Error stack: ${err.stack}`);

    res.status(status).json({ 
      message,
      debug: {
        status,
        path: _req.path,
        method: _req.method,
        environment: app.get("env")
      }
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    log("[DEBUG] Setting up Vite in development mode");
    await setupVite(app, server);
  } else {
    log("[DEBUG] Setting up static file serving in production mode");
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`[DEBUG] Server started on port ${port}`);
    log(`[DEBUG] Current working directory: ${process.cwd()}`);
    log(`[DEBUG] Node environment: ${process.env.NODE_ENV}`);
  });
})();
