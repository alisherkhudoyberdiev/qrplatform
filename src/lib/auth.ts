// Simple session-based auth for admin (iron-session)
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  adminId: string;
  restaurantId: string;
  email: string;
  isLoggedIn: boolean;
  isSuperAdmin?: boolean;
}

const defaultSession: SessionData = {
  adminId: "",
  restaurantId: "",
  email: "",
  isLoggedIn: false,
  isSuperAdmin: false,
};

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "qr-menu-mvp-secret-change-in-production",
  cookieName: "qr-menu-admin",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) return null;
  // SuperAdmin can access without restaurantId; otherwise need restaurantId
  if (!session.isSuperAdmin && !session.restaurantId) return null;
  return session;
}

export async function requireSuperAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.isSuperAdmin) return null;
  return session;
}
