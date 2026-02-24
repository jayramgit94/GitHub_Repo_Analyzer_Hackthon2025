/*
 * ============================================
 * /api/admin/login — Admin Authentication
 * ============================================
 *
 * Simple JWT-based admin auth
 * In production: Use NextAuth.js with OAuth providers
 *
 * FLOW:
 * 1. Admin submits email + password
 * 2. Server validates against env vars
 * 3. Returns JWT token (expires in 24h)
 * 4. Frontend stores in localStorage
 * 5. All admin API calls include Authorization header
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@test.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate credentials
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // In production, ADMIN_PASSWORD should be a bcrypt hash
    // For dev, we compare plaintext
    const isValidPassword =
      ADMIN_PASSWORD.startsWith("$2") // bcrypt hash
        ? await bcrypt.compare(password, ADMIN_PASSWORD)
        : password === ADMIN_PASSWORD; // plaintext for dev

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT
    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      token,
      message: "Login successful",
      expiresIn: "24h",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// Helper to verify JWT in other admin routes
export function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === "admin";
  } catch {
    return false;
  }
}
