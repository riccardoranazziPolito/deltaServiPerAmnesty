"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export async function login(state: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Compila tutti i campi" };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  // In a real app, compare with bcrypt. Here we just match the plain string for the prototype.
  if (!user || user.passwordHash !== password) {
    return { error: "Credenziali non valide" };
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set("session_user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
  
  cookieStore.set("session_user_role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/catalogo");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_user_id");
  cookieStore.delete("session_user_role");
  redirect("/");
}

export async function getSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;
  const role = cookieStore.get("session_user_role")?.value;

  if (!userId) return null;

  return { userId, role };
}
