import { getSession } from "@/app/actions/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { EditProductForm } from "@/components/AdminForms";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  const categories = await prisma.category.findMany();

  if (!product) {
    redirect("/admin");
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Modifica Prodotto</h2>
        <Link href="/admin" className="btn btn-secondary">Torna ad Admin</Link>
      </div>

      <div className="glass-panel">
        <EditProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
