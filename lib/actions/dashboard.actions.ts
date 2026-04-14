'use server';

import { createServerClientComponent, supabaseAdmin } from '@/lib/supabase-server';
import {
  Subscription,
  Payment,
  Incident,
  PaymentMethod,
  IncidentPriority,
  VisitRequest,
  ClientNotification,
  ClientProfilePanelData,
} from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function serializeErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

function normalizeStoragePath(path: string, bucket: string) {
  const trimmed = path.trim();
  if (!trimmed) return '';

  let normalized = trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      normalized = decodeURIComponent(url.pathname);
    } catch {
      normalized = trimmed;
    }
  }

  normalized = normalized.replace(/^\/+/, '');

  // Remove known supabase storage prefixes
  const objectPrefix = `storage/v1/object/${bucket}/`;
  if (normalized.startsWith(objectPrefix)) {
    normalized = normalized.slice(objectPrefix.length);
  }

  const objectPublicPrefix = `storage/v1/object/public/${bucket}/`;
  if (normalized.startsWith(objectPublicPrefix)) {
    normalized = normalized.slice(objectPublicPrefix.length);
  }

  const objectSignPrefix = `storage/v1/object/sign/${bucket}/`;
  if (normalized.startsWith(objectSignPrefix)) {
    normalized = normalized.slice(objectSignPrefix.length);
  }

  if (normalized.startsWith(`${bucket}/`)) {
    normalized = normalized.slice(bucket.length + 1);
  }

  return normalized;
}

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
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    return { data: null, error: 'Sesión inválida' };
  }

  const db = supabaseAdmin || supabase;
  const { data: ownClient } = await db
    .from('clients')
    .select('id')
    .eq('owner_profile_id', user.id)
    .maybeSingle();

  if (!ownClient?.id || ownClient.id !== formData.clientId) {
    return { data: null, error: 'Cliente inválido para esta sesión' };
  }

  const { data: ownSubscription } = await db
    .from('subscriptions')
    .select('id')
    .eq('id', formData.subscriptionId)
    .eq('client_id', ownClient.id)
    .maybeSingle();

  if (!ownSubscription?.id) {
    return { data: null, error: 'La suscripción indicada no pertenece al cliente autenticado' };
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      client_id: ownClient.id,
      subscription_id: ownSubscription.id,
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
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user;

  if (authError || !user) {
    return { data: null, error: 'Sesión inválida' };
  }

  const db = supabaseAdmin || supabase;
  const { data: ownClient } = await db
    .from('clients')
    .select('id')
    .eq('owner_profile_id', user.id)
    .maybeSingle();

  if (!ownClient?.id || ownClient.id !== formData.clientId) {
    return { data: null, error: 'Cliente inválido para esta sesión' };
  }

  let validatedSubscriptionId: string | null = null;
  if (formData.subscriptionId) {
    const { data: ownSubscription } = await db
      .from('subscriptions')
      .select('id')
      .eq('id', formData.subscriptionId)
      .eq('client_id', ownClient.id)
      .maybeSingle();

    if (!ownSubscription?.id) {
      return { data: null, error: 'La suscripción indicada no pertenece al cliente autenticado' };
    }

    validatedSubscriptionId = ownSubscription.id;
  }

  const { data, error } = await supabase
    .from('incidents')
    .insert({
      client_id: ownClient.id,
      subscription_id: validatedSubscriptionId,
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
  try {
    if (!path || !path.trim()) {
      return { data: null, error: 'Ruta de archivo inválida' };
    }

    const normalizedPath = normalizeStoragePath(path, bucket);
    if (!normalizedPath) {
      return { data: null, error: 'No se pudo interpretar la ruta del archivo' };
    }

    const supabase = await createServerClientComponent();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { data: null, error: 'Sesión inválida' };
    }

    const roleClient = supabaseAdmin || supabase;
    const { data: profile } = await roleClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    const isAdmin = profile?.role === 'admin';

    // Payment proofs are normally stored as: {user_id}/{subscription_id}/{filename}
    // but we also support legacy paths by verifying ownership against the client's payments.
    if (bucket === 'payment-proofs' && !isAdmin) {
      const userPrefix = `${user.id}/`;
      let canAccess = normalizedPath.startsWith(userPrefix);

      if (!canAccess) {
        const { data: client } = await roleClient
          .from('clients')
          .select('id')
          .eq('owner_profile_id', user.id)
          .maybeSingle();

        if (client?.id) {
          const { data: payments } = await roleClient
            .from('payments')
            .select('proof_file_url, proof_file_path')
            .eq('client_id', client.id)
            .order('created_at', { ascending: false })
            .limit(200);

          const requestedVariants = new Set<string>([path.trim(), normalizedPath]);
          for (const payment of payments || []) {
            const rawUrl = payment.proof_file_url?.trim();
            const rawPath = payment.proof_file_path?.trim();
            const normalizedUrl = rawUrl ? normalizeStoragePath(rawUrl, bucket) : '';
            const normalizedDbPath = rawPath ? normalizeStoragePath(rawPath, bucket) : '';

            if (
              (rawUrl && requestedVariants.has(rawUrl)) ||
              (rawPath && requestedVariants.has(rawPath)) ||
              (normalizedUrl && requestedVariants.has(normalizedUrl)) ||
              (normalizedDbPath && requestedVariants.has(normalizedDbPath))
            ) {
              canAccess = true;
              break;
            }
          }
        }
      }

      if (!canAccess) {
        return { data: null, error: 'Acceso denegado al archivo solicitado' };
      }
    }

    const signer = supabaseAdmin || supabase;
    const { data, error } = await signer.storage
      .from(bucket)
      .createSignedUrl(normalizedPath, 60); // 1 minute expiry

    if (error) {
      console.error('Error generating signed URL:', error);
      return { data: null, error: serializeErrorMessage(error, 'No se pudo generar el enlace seguro') };
    }

    return { data: data.signedUrl, error: null };
  } catch (err: unknown) {
    console.error('Unexpected error generating signed URL:', err);
    return { data: null, error: serializeErrorMessage(err, 'No se pudo generar el enlace seguro') };
  }
}

/**
 * SECURE: Generate a signed URL for a service report after verifying ownership.
 * This should be used for all report downloads.
 */
export async function getSecureReportUrl(reportId: string) {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: "Sesión inválida" };
  }

  // Use service role to verify ownership and create signed URL
  if (!supabaseAdmin) {
    return { data: null, error: "Servidor no configurado" };
  }

  // 1. Determine role
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isAdmin = profile?.role === 'admin';
  
  // 2. Load report metadata
  const { data: report, error: reportError } = await supabaseAdmin
    .from('service_reports')
    .select('file_path, client_id')
    .eq('id', reportId)
    .single();
    
  if (reportError || !report) {
    console.error(`Secure Report Error: Report ${reportId} not found or inaccessible.`);
    return { data: null, error: "Reporte no encontrado" };
  }
  
  // 3. Ownership check only for non-admin users
  if (!isAdmin) {
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('owner_profile_id', user.id)
      .maybeSingle();

    const requesterClientId = client?.id;
    if (!requesterClientId || report.client_id !== requesterClientId) {
      console.error(`Secure Report Violation: User ${user.id} attempted to access Report ${reportId} (owned by ${report.client_id})`);
      return { data: null, error: "Acceso denegado" };
    }
  }
  
  if (!report.file_path) {
    return { data: null, error: "El reporte no tiene un archivo asociado" };
  }
  
  // 4. Generate signed URL
  const { data: signedData, error: signedError } = await supabaseAdmin.storage
    .from('service-reports')
    .createSignedUrl(report.file_path, 300); // 5 minutes
    
  if (signedError) {
    console.error(`Storage Error: ${signedError.message}`);
    return { data: null, error: serializeErrorMessage(signedError, 'No se pudo generar el enlace del reporte') };
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
    .neq('title', 'Solicitud de visita técnica')
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
 * Get visit requests for a client
 */
export async function getClientVisitRequests(clientId: string, status: 'pending' | 'scheduled' | 'rejected' | 'all' = 'pending') {
  const db = supabaseAdmin || await createServerClientComponent();
  let query = db
    .from('visit_requests')
    .select('*')
    .eq('client_id', clientId)
    .order('requested_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching client visit requests: ${error.message}`);
    return { data: null, error };
  }

  return { data: (data || []) as VisitRequest[], error: null };
}

/**
 * Request a technical visit from the authenticated client context
 */
export async function requestVisitAction(formData: {
  description: string;
  priority: IncidentPriority;
  subscriptionId?: string;
}) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase.rpc('create_visit_request', {
    p_description: formData.description,
    p_priority: formData.priority,
    p_subscription_id: formData.subscriptionId || null,
    p_title: 'Solicitud de visita técnica',
  });

  if (error) {
    console.error('Error requesting visit:', error);
    return { data: null, error };
  }

  revalidatePath('/dashboard/visits');
  revalidatePath('/dashboard');
  return { data, error: null };
}

/**
 * Backward-compatible wrapper while UI references are fully migrated
 */
export async function requestVisit(formData: {
  description: string;
  priority: IncidentPriority;
  subscriptionId?: string;
}) {
  return requestVisitAction(formData);
}

/**
 * Backward-compatible wrapper while call sites are migrated
 */
export async function getPendingVisitRequests(clientId: string) {
  return getClientVisitRequests(clientId, 'pending');
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

/**
 * Build client-facing notifications from operational events.
 */
export async function getClientNotifications(limit: number = 20) {
  try {
    const supabase = await createServerClientComponent();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { data: [] as ClientNotification[], unreadCount: 0, error: 'Sesión inválida' };
    }

    const db = supabaseAdmin || supabase;
    const { data: client } = await db
      .from('clients')
      .select('id')
      .eq('owner_profile_id', user.id)
      .maybeSingle();

    if (!client?.id) {
      return { data: [] as ClientNotification[], unreadCount: 0, error: null };
    }

    const [paymentsRes, incidentsRes, reportsRes, visitRequestsRes] = await Promise.all([
      db
        .from('payments')
        .select('id, reference_code, verified_at, updated_at')
        .eq('client_id', client.id)
        .eq('status', 'verified')
        .order('verified_at', { ascending: false })
        .limit(20),
      db
        .from('incidents')
        .select('id, title, resolved_at, updated_at')
        .eq('client_id', client.id)
        .neq('title', 'Solicitud de visita técnica')
        .in('status', ['resolved', 'closed'])
        .order('resolved_at', { ascending: false })
        .limit(20),
      db
        .from('service_reports')
        .select('id, title, created_at')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false })
        .limit(20),
      db
        .from('visit_requests')
        .select('id, title, reviewed_at, updated_at')
        .eq('client_id', client.id)
        .eq('status', 'scheduled')
        .order('reviewed_at', { ascending: false })
        .limit(20),
    ]);

    const notifications: ClientNotification[] = [];

    for (const payment of paymentsRes.data || []) {
      const occurredAt = payment.verified_at || payment.updated_at || new Date().toISOString();
      notifications.push({
        id: `payment-${payment.id}`,
        type: 'payment_approved',
        title: 'Pago aprobado',
        message: payment.reference_code
          ? `Tu comprobante ${payment.reference_code} fue validado.`
          : 'Tu comprobante de pago fue validado.',
        occurred_at: occurredAt,
        href: '/dashboard/payments',
      });
    }

    for (const incident of incidentsRes.data || []) {
      const occurredAt = incident.resolved_at || incident.updated_at || new Date().toISOString();
      notifications.push({
        id: `incident-${incident.id}`,
        type: 'incident_resolved',
        title: 'Incidencia resuelta',
        message: `Se cerró el ticket: ${incident.title}.`,
        occurred_at: occurredAt,
        href: '/dashboard/incidents',
      });
    }

    for (const report of reportsRes.data || []) {
      notifications.push({
        id: `report-${report.id}`,
        type: 'report_received',
        title: 'Reporte recibido',
        message: `Se publicó el reporte: ${report.title}.`,
        occurred_at: report.created_at || new Date().toISOString(),
        href: '/dashboard/reports',
      });
    }

    for (const request of visitRequestsRes.data || []) {
      const occurredAt = request.reviewed_at || request.updated_at || new Date().toISOString();
      notifications.push({
        id: `visit-${request.id}`,
        type: 'visit_approved',
        title: 'Visita aprobada',
        message: `Tu solicitud "${request.title || 'Visita técnica'}" fue aprobada.`,
        occurred_at: occurredAt,
        href: '/dashboard/visits',
      });
    }

    notifications.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    const sliced = notifications.slice(0, Math.max(1, limit));

    return { data: sliced, unreadCount: sliced.length, error: null };
  } catch (err: unknown) {
    console.error('Error fetching client notifications:', err);
    return {
      data: [] as ClientNotification[],
      unreadCount: 0,
      error: serializeErrorMessage(err, 'No se pudieron cargar las notificaciones'),
    };
  }
}

export async function getClientProfilePanelData() {
  try {
    const supabase = await createServerClientComponent();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { data: null as ClientProfilePanelData | null, error: 'Sesión inválida' };
    }

    const db = supabaseAdmin || supabase;

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('id, email, full_name, phone, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { data: null as ClientProfilePanelData | null, error: 'No se encontró el perfil' };
    }

    const { data: client } = await db
      .from('clients')
      .select('id, business_name, contact_name, main_email, main_phone, city, zone, address, billing_email, administrative_contact')
      .eq('owner_profile_id', user.id)
      .maybeSingle();

    const payload: ClientProfilePanelData = {
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
      },
      client: client
        ? {
            id: client.id,
            business_name: client.business_name,
            contact_name: client.contact_name,
            main_email: client.main_email,
            main_phone: client.main_phone,
            city: client.city,
            zone: client.zone,
            address: client.address,
            billing_email: client.billing_email,
            administrative_contact: client.administrative_contact,
          }
        : null,
    };

    return { data: payload, error: null };
  } catch (err: unknown) {
    console.error('Error loading profile panel data:', err);
    return { data: null as ClientProfilePanelData | null, error: serializeErrorMessage(err, 'No se pudo cargar el perfil') };
  }
}

export async function updateClientProfilePanelAction(formData: {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  contactName?: string;
  mainPhone?: string;
  city?: string;
  zone?: string;
  address?: string;
  billingEmail?: string;
  administrativeContact?: string;
}) {
  try {
    const supabase = await createServerClientComponent();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { data: null, error: 'Sesión inválida' };
    }

    const fullName = formData.fullName?.trim();
    if (!fullName) {
      return { data: null, error: 'El nombre completo es obligatorio' };
    }

    const db = supabaseAdmin || supabase;
    const nowIso = new Date().toISOString();
    const profileUpdatePayload: {
      full_name: string;
      phone: string | null;
      updated_at: string;
      avatar_url?: string | null;
    } = {
      full_name: fullName,
      phone: formData.phone?.trim() || null,
      updated_at: nowIso,
    };

    if (typeof formData.avatarUrl !== 'undefined') {
      profileUpdatePayload.avatar_url = formData.avatarUrl?.trim() || null;
    }

    const { error: profileUpdateError } = await db
      .from('profiles')
      .update(profileUpdatePayload)
      .eq('id', user.id);

    if (profileUpdateError) {
      return { data: null, error: 'No se pudo actualizar el perfil' };
    }

    const { data: client } = await db
      .from('clients')
      .select('id')
      .eq('owner_profile_id', user.id)
      .maybeSingle();

    if (client?.id) {
      const { error: clientUpdateError } = await db
        .from('clients')
        .update({
          contact_name: formData.contactName?.trim() || fullName,
          main_phone: formData.mainPhone?.trim() || null,
          city: formData.city?.trim() || null,
          zone: formData.zone?.trim() || null,
          address: formData.address?.trim() || null,
          billing_email: formData.billingEmail?.trim() || null,
          administrative_contact: formData.administrativeContact?.trim() || null,
          updated_at: nowIso,
        })
        .eq('id', client.id);

      if (clientUpdateError) {
        return { data: null, error: 'Se actualizó el perfil, pero falló la información empresarial' };
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/visits');
    revalidatePath('/dashboard/payments');

    return { data: { updated: true }, error: null };
  } catch (err: unknown) {
    console.error('Error updating profile panel:', err);
    return { data: null, error: serializeErrorMessage(err, 'No se pudo actualizar tu perfil') };
  }
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
