import express from "express";
import next from "next";
import helmet from "helmet";
import { rateLimiter } from "@/middlewares/rateLimiter";
import { csrfProtection } from "@/middlewares/csrf";
import { sanitizeInput } from "@/middlewares/inputSanitizer";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Secure HTTP headers using Helmet
  server.use(helmet());

  // Apply rate limiting
  server.use(rateLimiter);

  // CSRF Protection
  server.use(csrfProtection);

  // Input Sanitization
  server.use((req, res, next) => {
    if (req.body && typeof req.body === "object") {
      for (const key in req.body) {
        if (typeof req.body[key] === "string") {
          req.body[key] = sanitizeInput(req.body[key]);
        }
      }
    }
    next();
  });

  // API Routing
  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, () => {
    
  });
});
