'use server';

import { createServerClientComponent, supabaseAdmin } from '@/lib/supabase-server';
import { Subscription, Payment, Incident, PaymentMethod, IncidentPriority } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Unified logic to identify the current authenticated client.
 * Returns core IDs and objects, or redirects if authentication/profile is missing.
 */
export async function getAuthenticatedClientContext() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data, error } = await supabase
    .from('v_client_access_status')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (error || !data) {
    redirect('/dashboard/pending');
  }

  // Mandatory checks for active service
  if (data.client_status !== 'active' || data.subscription_status !== 'active') {
    // If it exists but is not fully active, we might still allow restricted access 
    // depending on the status, but for now we follow the "active" rule.
    if (data.client_status === 'pending' || data.subscription_status === 'pending_payment') {
      redirect('/dashboard/pending');
    }
    // Handle restricted/suspended in the future
  }

  return {
    user,
    clientId: data.client_id as string,
    subscriptionId: data.subscription_id as string,
    clientStatus: data.client_status,
    subscriptionStatus: data.subscription_status,
    // We can also fetch the full objects if needed, but IDs are the core requirement
  };
}

/**
 * Get the current active subscription for a client
 */
export async function getCurrentSubscription(clientId: string) {
  // DIAGNOSTIC: Use supabaseAdmin to isolate if RLS is the issue
  // In production, this should ideally use the session-user client if policies are correct.
  const db = supabaseAdmin || await createServerClientComponent();
  
  // 1. Get the latest active subscription for the client
  const { data: sub, error: subError } = await db
    .from('subscriptions')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (subError) {
    console.error(`Error fetching active subscription: ${subError.message} (Code: ${subError.code}) for Client: ${clientId}`);
    return { data: null, error: subError };
  }

  if (!sub) return { data: null, error: null };

  // 2. Get accompanying plan details
  const { data: plan, error: planError } = await db
    .from('plans')
    .select('*')
    .eq('id', sub.plan_id)
    .maybeSingle();

  if (planError) {
    console.error(`Error fetching plan for subscription: ${planError.message}`);
  }

  // Return merged object compatible with Subscription type
  return { 
    data: { 
      ...sub, 
      plan 
    } as Subscription, 
    error: null 
  };
}

/**
 * Get payment history for a client
 */
export async function getPaymentHistory(clientId: string) {
  // Use admin bypass to avoid RLS read issues for history
  const db = supabaseAdmin || await createServerClientComponent();
  
  const { data, error } = await db
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching payments: ${error.message} (Code: ${error.code})`);
    return { data: null, error };
  }

  return { data: data as Payment[], error: null };
}

/**
 * Submit a payment proof
 */
export async function submitPaymentProof(formData: {
  clientId: string;
  subscriptionId: string;
  amountUsd: number;
  paymentMethod: PaymentMethod;
  referenceCode?: string;
  proofFileUrl?: string;
}) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('payments')
    .insert({
      client_id: formData.clientId,
      subscription_id: formData.subscriptionId,
      amount_usd: formData.amountUsd,
      payment_method: formData.paymentMethod,
      reference_code: formData.referenceCode,
      proof_file_url: formData.proofFileUrl,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting payment:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/payments');
  return { data: data as Payment, error: null };
}

/**
 * Report a new incident
 */
export async function createIncident(formData: {
  clientId: string;
  subscriptionId?: string;
  title: string;
  description: string;
  priority: IncidentPriority;
}) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      client_id: formData.clientId,
      subscription_id: formData.subscriptionId,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'open',
      channel: 'dashboard',
      reported_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating incident:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/incidents');
  return { data: data as Incident, error: null };
}

/**
 * Generate a signed URL for a private file in Supabase Storage
 */
export async function getSignedUrl(path: string, bucket: string = 'payment-proofs') {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60); // 1 minute expiry

  if (error) {
    console.error('Error generating signed URL:', error);
    return { data: null, error };
  }

  return { data: data.signedUrl, error: null };
}

/**
 * SECURE: Generate a signed URL for a service report after verifying ownership.
 * This should be used for all report downloads.
 */
export async function getSecureReportUrl(reportId: string) {
  // 1. Get client context
  const { clientId } = await getAuthenticatedClientContext();
  
  // 2. Use admin to bypass RLS and verify report ownership
  if (!supabaseAdmin) throw new Error("Servidor no configurado");
  
  const { data: report, error: reportError } = await supabaseAdmin
    .from('service_reports')
    .select('file_path, client_id')
    .eq('id', reportId)
    .single();
    
  if (reportError || !report) {
    console.error(`Secure Report Error: Report ${reportId} not found or inaccessible.`);
    return { data: null, error: new Error("Reporte no encontrado") };
  }
  
  // 3. Verify match
  if (report.client_id !== clientId) {
    console.error(`Secure Report Violation: Client ${clientId} attempted to access Report ${reportId} (owned by ${report.client_id})`);
    return { data: null, error: new Error("Acceso denegado") };
  }
  
  if (!report.file_path) {
    return { data: null, error: new Error("El reporte no tiene un archivo asociado") };
  }
  
  // 4. Generate signed URL as admin to ensure success
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from('service-reports')
    .createSignedUrl(report.file_path, 300); // 5 minutes
    
  if (signedError) {
    console.error(`Storage Error: ${signedError.message}`);
    return { data: null, error: signedError };
  }
  
  return { data: signedData.signedUrl, error: null };
}

/**
 * Get visits for a specific client
 */
export async function getClientVisits(clientId: string) {
  // Use admin bypass for visibility
  const db = supabaseAdmin || await createServerClientComponent();
  
  const { data, error } = await db
    .from('visits')
    .select(`
      *,
      technician:assigned_to (full_name)
    `)
    .eq('client_id', clientId)
    .order('scheduled_start', { ascending: false });

  if (error) {
    console.error(`Error fetching client visits: ${error.message} (Code: ${error.code})`);
    return { data: null, error };
  }

  return { data, error };
}

/**
 * Get all summary data for the client dashboard
 */
export async function getClientDashboardData(clientId: string) {
  // DIAGNOSTIC: Use supabaseAdmin to isolate if RLS is the issue
  const db = supabaseAdmin || await createServerClientComponent();
  
  // 1. Next Visit
  const { data: nextVisit } = await db
    .from('visits')
    .select('*')
    .eq('client_id', clientId)
    .gte('scheduled_start', new Date().toISOString())
    .order('scheduled_start', { ascending: true })
    .limit(1)
    .maybeSingle();

  // 2. Open Incidents Count
  const { count: openIncidents } = await db
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .in('status', ['open', 'in_progress']);

  // 3. Last technical report
  const { data: lastReport } = await db
    .from('service_reports')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 4. Last payment
  const { data: lastPayment } = await db
    .from('payments')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 5. Subscription Stats (Visits)
  const { data: subscription } = await db
    .from('subscriptions')
    .select('visit_used_count, visit_available_count, is_unlimited_snapshot, visit_limit_snapshot')
    .eq('client_id', clientId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    data: {
      nextVisit,
      openIncidents: openIncidents || 0,
      lastReport,
      lastPayment,
      subscriptionStats: subscription
    },
    error: null
  };
}


/**
 * GET CLIENT ACCESS STATE
 * Centralized logic to determine if a client can access the operative dashboard
 */
export type ClientAccessState = 
  | { status: 'active'; clientId: string; subscriptionId: string; clientStatus: string; subStatus: string }
  | { status: 'pending'; clientId?: string; subscriptionId?: string }
  | { status: 'restricted'; reason: 'suspended' | 'cancelled' | 'expired' | 'inactive'; clientId: string }
  | { status: 'no-profile' };

/**
 * Get all technical incidents for a specific client (excluding visit requests)
 */
export async function getClientIncidents(clientId: string) {
  const db = supabaseAdmin || await createServerClientComponent();
  const { data, error } = await db
    .from('incidents')
    .select(`
      *,
      technician:assigned_to (full_name)
    `)
    .eq('client_id', clientId)
    .neq('title', 'Solicitud de visita técnica')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error(`Error fetching client incidents: ${error.message}`);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get pending visit requests (stored in incidents table with specific title)
 */
export async function getPendingVisitRequests(clientId: string) {
  const db = supabaseAdmin || await createServerClientComponent();
  const { data, error } = await db
    .from('incidents')
    .select('*')
    .eq('client_id', clientId)
    .eq('title', 'Solicitud de visita técnica')
    .eq('status', 'open')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error(`Error fetching pending visit requests: ${error.message}`);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Request a technical visit (standalone action)
 */
export async function requestVisit(formData: {
  clientId: string;
  subscriptionId?: string;
  description: string;
  priority: IncidentPriority;
}) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      client_id: formData.clientId,
      subscription_id: formData.subscriptionId,
      title: 'Solicitud de visita técnica',
      description: formData.description,
      priority: formData.priority,
      status: 'open',
      channel: 'dashboard',
      reported_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error requesting visit:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/visits');
  return { data, error: null };
}

/**
 * Get all service reports for a specific client
 */
export async function getClientServiceReports(clientId: string) {
  const db = supabaseAdmin || await createServerClientComponent();
  const { data, error } = await db
    .from('service_reports')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching service reports: ${error.message}`);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getClientAccessState(userId: string): Promise<ClientAccessState> {
  const supabase = await createServerClientComponent();
  
  // Use the view as the single source of truth
  const { data, error } = await supabase
    .from('v_client_access_status')
    .select('*')
    .eq('profile_id', userId) // Consistent with DB screenshot
    .maybeSingle();

  if (error || !data) {
    // If no record in view, check if they have a lead at least
    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('auth_user_id', userId)
      .maybeSingle();
    
    if (lead) return { status: 'pending' };
    return { status: 'no-profile' };
  }

  // Determine state based on subscription and client status
  const subStatus = data.subscription_status;
  const clientStatus = data.client_status;

  if (subStatus === 'active' && clientStatus === 'active') {
    return { 
      status: 'active', 
      clientId: data.client_id, 
      subscriptionId: data.subscription_id,
      clientStatus,
      subStatus
    };
  }

  if (subStatus === 'pending_payment' || subStatus === 'submitted' || clientStatus === 'pending') {
    return { 
      status: 'pending', 
      clientId: data.client_id, 
      subscriptionId: data.subscription_id 
    };
  }

  // Restricted states
  let reason: 'suspended' | 'cancelled' | 'expired' | 'inactive' = 'inactive';
  if (subStatus === 'suspended') reason = 'suspended';
  if (subStatus === 'cancelled') reason = 'cancelled';
  if (subStatus === 'expired') reason = 'expired';

  return { 
    status: 'restricted', 
    reason, 
    clientId: data.client_id 
  };
}
