"use server";

import prisma from "@/lib/prisma";
import { createClient } from '@supabase/supabase-js';
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
  const imageFile = formData.get("image") as File | null;

  if (!uniqueCode || !name || !categoryId) return { error: "Campi obbligatori mancanti" };

  const parsedQuantity = parseInt(quantityStr, 10);
  if (isNaN(parsedQuantity) || parsedQuantity < 0) {
    return { error: "La giacenza deve essere un numero maggiore o uguale a 0" };
  }

  let imageUrl = null;

  // Caricamento Immagine su Supabase Storage se presente
  if (imageFile && imageFile.size > 0) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Variabili d'ambiente Supabase mancanti per l'upload dell'immagine.");
      // Procediamo senza immagine se mancano le chiavi
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Convertiamo il file in ArrayBuffer (necessario per alcuni ambienti Serverless)
      const fileBuffer = await imageFile.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, fileBuffer, {
          contentType: imageFile.type,
        });
        
      if (error) {
        console.error("Errore upload immagine:", error);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
    }
  }

  try {
    await prisma.product.create({
      data: {
        uniqueCode,
        name,
        description,
        quantity: parsedQuantity,
        categoryId,
        imageUrl,
      },
    });
    revalidatePath("/admin");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (e) {
    return { error: "Errore o codice SKU già esistente" };
  }
}

export async function updateStock(productId: string, quantity: number) {
  await checkAdmin();
  if (isNaN(quantity) || quantity < 0) {
    return { error: "La quantità deve essere maggiore o uguale a 0" };
  }
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { quantity },
    });
    revalidatePath("/admin");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (e) {
    return { error: "Errore durante l'aggiornamento della giacenza" };
  }
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

export async function updateProduct(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const uniqueCode = formData.get("uniqueCode") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const quantityStr = formData.get("quantity") as string;
  const categoryId = formData.get("categoryId") as string;
  const imageFile = formData.get("image") as File | null;

  if (!id || !uniqueCode || !name || !categoryId) return { error: "Campi obbligatori mancanti" };

  const parsedQuantity = parseInt(quantityStr, 10);
  if (isNaN(parsedQuantity) || parsedQuantity < 0) {
    return { error: "La giacenza deve essere un numero maggiore o uguale a 0" };
  }

  let imageUrl: string | undefined = undefined;

  // Caricamento Immagine se fornita una nuova
  if (imageFile && imageFile.size > 0) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const fileBuffer = await imageFile.arrayBuffer();

      const { data, error } = await supabase.storage.from('product-images').upload(fileName, fileBuffer, {
        contentType: imageFile.type,
      });
      if (!error) {
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      } else {
        console.error("Errore upload immagine update:", error);
      }
    }
  }

  try {
    const updateData: any = {
      uniqueCode,
      name,
      description,
      quantity: parsedQuantity,
      categoryId,
    };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    await prisma.product.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (e) {
    return { error: "Errore durante l'aggiornamento o codice SKU già esistente" };
  }
}

export async function deleteProduct(productId: string) {
  await checkAdmin();
  
  // Check if product is in any orders
  const ordersWithProduct = await prisma.orderItem.findFirst({
    where: { productId }
  });

  if (ordersWithProduct) {
    return { error: "Non puoi eliminare un prodotto presente negli ordini passati. Se non è più disponibile, imposta la sua giacenza a 0." };
  }

  try {
    // Delete from carts first
    await prisma.cartItem.deleteMany({
      where: { productId }
    });

    await prisma.product.delete({
      where: { id: productId }
    });
    
    revalidatePath("/admin");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (e) {
    return { error: "Errore durante l'eliminazione del prodotto" };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  await checkAdmin();
  const normalizedStatus = status.toUpperCase();
  const allowedStatuses = ["NUOVO", "EVASO"];
  if (!orderId || !allowedStatuses.includes(normalizedStatus)) {
    return { error: "Stato ordine non valido" };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: normalizedStatus },
    });
    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/ordini");
    revalidatePath(`/ordini/${orderId}`);
    return { success: true };
  } catch (e) {
    return { error: "Errore durante l'aggiornamento dello stato dell'ordine" };
  }
}

export async function updateUser(formData: FormData) {
  await checkAdmin();
  const id = formData.get("id") as string;
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();
  const role = ((formData.get("role") as string) || "USER").toUpperCase();

  if (!id || !firstName || !lastName || !email || !username) {
    return { error: "Compila tutti i campi obbligatori" };
  }

  if (role !== "USER" && role !== "ADMIN") {
    return { error: "Ruolo non valido" };
  }

  try {
    const updateData: {
      firstName: string;
      lastName: string;
      email: string;
      username: string;
      role: string;
      passwordHash?: string;
    } = {
      firstName,
      lastName,
      email,
      username,
      role,
    };

    if (password && password.length > 0) {
      updateData.passwordHash = password;
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/users/${id}/edit`);
    return { success: true };
  } catch (e) {
    return { error: "Errore durante l'aggiornamento: Username o Email già in uso" };
  }
}
