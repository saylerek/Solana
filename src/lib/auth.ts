import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  phantomWallet?: string;
  secretKey?: string;
  isLoggedIn?: boolean;
};

export const sessionOptions = {
  password: process.env.SESSION_PASSWORD!, // min 32 chars
  cookieName: "auth-session",
cookieOptions: {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/", // <- najważniejsze
}

};

export async function getSession() {
  const cookieStore = await cookies();
  return await getIronSession<SessionData>(cookieStore, sessionOptions);
}