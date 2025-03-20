import { parse } from "cookie";

export const validateCsrfToken = (req: Request) => {
  const cookies = parse(req.headers.get("cookie") || "");
  const csrfTokenFromCookie = cookies["next-auth.csrf-token"];
  const csrfTokenFromHeader = req.headers.get("x-csrf-token");

  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    throw new Error("CSRF token is missing");
  }

  if (csrfTokenFromCookie !== csrfTokenFromHeader) {
    throw new Error("Invalid CSRF token");
  }
};
