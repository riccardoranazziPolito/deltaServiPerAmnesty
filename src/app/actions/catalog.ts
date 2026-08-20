"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "./auth";
import { sendOrderConfirmation } from "@/lib/email";

export async function addToCart(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Devi effettuare l'accesso" };

  const productId = formData.get("productId") as string;
  const quantityStr = formData.get("quantity") as string;
  const requestedQuantity = parseInt(quantityStr);

  if (!productId || isNaN(requestedQuantity) || requestedQuantity <= 0) {
    return { error: "Quantità non valida" };
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { error: "Prodotto non trovato" };

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId: session.userId, productId: productId }
    });

    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentCartQuantity + requestedQuantity;

    if (product.quantity < newTotalQuantity) {
      // Se si usa useActionState il return verrebbe mostrato. Qui evitiamo l'aggiunta in silenzio o lanciamo errore
      throw new Error(`Non puoi aggiungere questa quantità. Hai già ${currentCartQuantity} pezzi nel carrello e la disponibilità massima è ${product.quantity}.`);
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newTotalQuantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: session.userId,
          productId,
          quantity: requestedQuantity
        }
      });
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: "Errore durante l'aggiunta al carrello" };
  }
}

export async function removeFromCart(cartItemId: string) {
  const session = await getSession();
  if (!session) return { error: "Devi effettuare l'accesso" };

  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });
  
  revalidatePath("/", "layout");
}

export async function checkout(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Devi effettuare l'accesso" };

  const savedRecipientId = formData.get("savedRecipientId") as string;
  let shippingAddress = "";

  if (savedRecipientId && savedRecipientId !== "new") {
    const recipient = await prisma.recipient.findUnique({
      where: { id: savedRecipientId }
    });
    if (!recipient) {
      return { error: "Destinatario non valido" };
    }
    shippingAddress = `Destinatario: ${recipient.firstName} ${recipient.lastName}\n`;
    if (recipient.company) shippingAddress += `Azienda: ${recipient.company}\n`;
    shippingAddress += `${recipient.address}, ${recipient.civic}\n${recipient.zipCode} ${recipient.city} (${recipient.province})`;
  } else {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const company = formData.get("company") as string;
    const address = formData.get("address") as string;
    const civic = formData.get("civic") as string;
    const zipCode = formData.get("zipCode") as string;
    const city = formData.get("city") as string;
    const province = formData.get("province") as string;

    if (!firstName || !lastName || !address || !civic || !zipCode || !city || !province) {
      return { error: "Compila tutti i campi obbligatori dell'indirizzo" };
    }

    shippingAddress = `Destinatario: ${firstName} ${lastName}\n`;
    if (company && company.trim() !== '') {
      shippingAddress += `Azienda: ${company}\n`;
    }
    shippingAddress += `${address}, ${civic}\n${zipCode} ${city} (${province})`;

    await prisma.recipient.create({
      data: {
        userId: session.userId,
        firstName,
        lastName,
        company: company && company.trim() !== '' ? company : null,
        address,
        civic,
        zipCode,
        city,
        province
      }
    });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { product: true }
    });

    if (cartItems.length === 0) {
      return { error: "Il carrello è vuoto" };
    }

    // Transaction to safely process the order
    const order = await prisma.$transaction(async (tx) => {
      // 1. Verify stock for all items
      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Giacenza insufficiente per ${item.product.name}`);
        }
      }

      // 2. Decrement stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // 3. Create Order
      const newOrder = await tx.order.create({
        data: {
          userId: session.userId,
          shippingAddress,
          items: {
            create: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        }
      });

      // 4. Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: session.userId }
      });

      return newOrder;
    });

    // --- SEND EMAILS ---
    try {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      
      const adminEmail = process.env.ADMIN_EMAIL || admin?.email;

      if (user && user.email && adminEmail) {
        const itemsList = cartItems.map(item => ({
          productName: item.product.name,
          uniqueCode: item.product.uniqueCode,
          quantity: item.quantity
        }));
        
        sendOrderConfirmation(
          order.id, 
          user.email, 
          adminEmail, 
          shippingAddress, 
          itemsList
        ).catch(e => console.error("Email error:", e));
      }
    } catch (emailError) {
      console.error("Failed to send order email:", emailError);
      // We don't throw an error here to prevent the user from seeing a "Failed Checkout" error 
      // if the DB transaction succeeded but only the email failed.
    }

    revalidatePath("/catalogo");
    revalidatePath("/carrello");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Errore durante il checkout" };
  }
}
