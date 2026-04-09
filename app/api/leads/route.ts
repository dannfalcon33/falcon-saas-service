import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract fields
    const full_name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const company_name = formData.get('company') as string;
    const phone = formData.get('phone') as string;
    const planName = formData.get('plan') as string;
    const payment_method = formData.get('payment_method') as string;
    const reference_code = formData.get('reference') as string;
    const proofFile = formData.get('proof') as File | null;
    const password = formData.get('password') as string;

    if (!full_name || !email || !company_name || !phone || !planName || !password) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Error de configuración del servidor" }, { status: 500 });
    }

    // 1. Create Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so they can login immediately
      user_metadata: { full_name }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        // Find existing user if already registered to link the lead
        // Or reject based on business logic. The prompt says "manejar error si el email ya existe"
        return NextResponse.json({ error: "Este correo ya está registrado. Por favor, inicia sesión." }, { status: 400 });
      }
      throw authError;
    }

    const userId = authUser.user.id;

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name,
        phone,
        role: 'client',
        is_active: true
      });

    if (profileError) throw profileError;

    // 3. Get Plan ID
    const { data: planData } = await supabaseAdmin
      .from('plans')
      .select('id')
      .ilike('name', `%${planName.replace('Plan ', '')}%`)
      .maybeSingle();

    // 4. Create Lead Record
    const leadId = crypto.randomUUID();
    let proof_file_path = null;

    // 5. Upload File
    if (proofFile) {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public-intake/${leadId}/${fileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('payment-proofs')
        .upload(filePath, proofFile);

      if (!uploadError) {
        proof_file_path = filePath;
      }
    }

    // 6. Insert Lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert({
        id: leadId,
        full_name,
        email,
        company_name,
        phone,
        plan_interest_id: planData?.id,
        payment_method,
        reference_code,
        proof_file_path,
        status: 'new',
        submitted_at: new Date().toISOString(),
        source: 'billing_page',
        auth_user_id: userId // Linking to auth user
      })
      .select()
      .single();

    if (leadError) throw leadError;

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Error de configuración" }, { status: 500 });
    }

    // This is for internal check or authenticated admin only really, 
    // but the route currently doesn't have protection beyond being 'api/leads'.
    // In production this should be protected.
    const { data: leads, error } = await supabaseAdmin
      .from('leads')
      .select('*, plan:plan_interest_id(name)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(leads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
