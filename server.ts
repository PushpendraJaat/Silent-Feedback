import express from "express";
import next from "next";
import helmet from "helmet";
import { rateLimiter } from "@/middlewares/rateLimiter";
import { sanitizeInput } from "@/middlewares/inputSanitizer";

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // ✅ Secure HTTP headers using Helmet
  server.use(helmet());

  // ✅ Apply rate limiting
  server.use(rateLimiter);

  // ✅ Parse JSON body (for handling POST requests)
  server.use(express.json());

  // ✅ Input sanitization middleware
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

  // ✅ Handle all Next.js routes
  server.all("*", (req, res) => handle(req, res));

  // ✅ Start server
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
