import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeShipping } from "@/lib/shipping";

interface CheckoutItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

function generateOrderCode() {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RT-${Date.now().toString().slice(-6)}${rand}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName,
    phone,
    email,
    address,
    department,
    city,
    notes,
    items,
  } = body as {
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    department: string;
    city: string;
    notes?: string;
    items: CheckoutItem[];
  };

  if (!customerName || !phone || !address || !department || !city) {
    return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = await computeShipping(department, city, subtotal);
  const total = subtotal + shipping.cost;

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerName,
      phone,
      email: email || null,
      address,
      department,
      city,
      notes: notes || null,
      itemsJson: JSON.stringify(items),
      subtotal,
      shippingCost: shipping.cost,
      total,
    },
  });

  return NextResponse.json({
    code: order.code,
    subtotal,
    shippingCost: shipping.cost,
    total,
    eta: shipping.etaLabel,
  });
}
