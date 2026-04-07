import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, plan, payment_method, reference } = body;

    if (!name || !email || !company || !phone || !plan || !payment_method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        company,
        phone,
        plan,
        paymentMethod: payment_method,
        reference,
        status: "pending",
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
