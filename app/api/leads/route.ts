import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, plan, payment_method, reference } = body;

    if (!name || !email || !company || !phone || !plan || !payment_method) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase configuration error" }, { status: 500 });
    }

    // Since this is a new lead reporting a payment, we save it to leads table.
    // The leads table doesn't have payment_method/reference by default in the SQL provided
    // but we can store them in the 'notes' or 'source' field, or just save the lead.
    // However, the provided SQL has 'plan_interest_id'.
    // We should find the plan ID by name first.

    const { data: planData } = await supabaseAdmin
      .from('plans')
      .select('id')
      .eq('name', plan)
      .maybeSingle();

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert({
        full_name: name,
        email,
        company_name: company,
        phone,
        plan_interest_id: planData?.id,
        status: 'new',
        notes: `Interés en plan: ${plan}. Pago por: ${payment_method}. Ref: ${reference}`,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase configuration error" }, { status: 500 });
    }

    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
