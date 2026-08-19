"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";

async function checkAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createCategory(formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  if (!name) return { error: "Nome categoria mancante" };

  try {
    await prisma.category.create({ data: { name } });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { error: "Errore o categoria già esistente" };
  }
}

export async function createProduct(formData: FormData) {
  await checkAdmin();
  const uniqueCode = formData.get("uniqueCode") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const quantityStr = formData.get("quantity") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!uniqueCode || !name || !categoryId) return { error: "Campi obbligatori mancanti" };

  try {
    await prisma.product.create({
      data: {
        uniqueCode,
        name,
        description,
        quantity: parseInt(quantityStr) || 0,
        categoryId,
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { error: "Errore o codice SKU già esistente" };
  }
}

export async function updateStock(productId: string, quantity: number) {
  await checkAdmin();
  await prisma.product.update({
    where: { id: productId },
    data: { quantity },
  });
  revalidatePath("/admin");
  revalidatePath("/catalogo");
}

export async function createUser(formData: FormData) {
  await checkAdmin();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  
  if (!username || !password || !email || !firstName || !lastName) {
    return { error: "Tutti i campi sono obbligatori" };
  }

  try {
    await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        passwordHash: password, // plain text for prototype
        role: "USER"
      }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { error: "Username o Email già esistente" };
  }
}
