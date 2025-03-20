import helmet from "helmet";

export const secureHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  xssFilter: true,
  hidePoweredBy: true,
  frameguard: { action: "deny" },
  hsts: { maxAge: 31536000, includeSubDomains: true },
});
