import { NextResponse } from "next/server";
import Csrf from "csrf";

const csrf = new Csrf();

export async function GET() {
  const token = csrf.secretSync();

  const response = NextResponse.json({ csrfToken: token });

  response.cookies.set("XSRF-TOKEN", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return response;
}
