import { parse } from "cookie";

export const validateCsrfToken = (req: Request) => {
  const cookies = parse(req.headers.get("cookie") || "");
  let csrfTokenFromCookie = cookies["next-auth.csrf-token"];
  const csrfTokenFromHeader = req.headers.get("x-csrf-token");

  if (!csrfTokenFromCookie || !csrfTokenFromHeader) {
    throw new Error("CSRF token is missing");
  }

  // Extract actual token from NextAuth formatted cookie
  csrfTokenFromCookie = csrfTokenFromCookie.split("|")[0];

  if (csrfTokenFromCookie !== csrfTokenFromHeader) {
    throw new Error("Invalid CSRF token");
  }
};
