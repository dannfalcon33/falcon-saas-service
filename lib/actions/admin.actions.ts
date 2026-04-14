'use server';

import { createServerClientComponent, supabaseAdmin } from '@/lib/supabase-server';
import {
  AdminNotification,
  Client,
  Payment,
  ClientStatus,
  Subscription,
  Visit,
  VisitRequest,
  VisitType,
} from '@/lib/types';
import { revalidatePath } from 'next/cache';

function serializeErrorMessage(err: unknown, fallback: string) {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

/**
 * Get all clients with their current subscription and plan info
 */
export async function getClients(query?: string) {
  const supabase = await createServerClientComponent();
  
  let fetch = supabase
    .from('clients')
    .select(`
      *,
      profiles:owner_profile_id (*),
      subscriptions (
        id,
        status,
        end_date,
        plan:plan_id (name)
      )
    `)
    .order('business_name');

  if (query) {
    fetch = fetch.or(`business_name.ilike.%${query}%,contact_name.ilike.%${query}%,main_email.ilike.%${query}%`);
  }

  const { data, error } = await fetch;
  return { data, error };
}

/**
 * Create a new client manually
 */
export async function createClient(clientData: Partial<Client>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .insert(clientData)
    .select()
    .single();
  
  if (!error) revalidatePath('/admin/clients');
  return { data, error };
}

/**
 * Update client data
 */
export async function updateClient(clientId: string, clientData: Partial<Client>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)
    .select()
    .single();
  
  if (!error) revalidatePath('/admin/clients');
  return { data, error };
}

/**
 * Delete a client
 */
export async function deleteClient(clientId: string) {
  const supabase = await createServerClientComponent();
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);
  
  if (!error) revalidatePath('/admin/clients');
  return { error };
}

// Subscription Management
export async function getSubscriptions(filter?: string) {
  const supabase = await createServerClientComponent();
  
  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      client:client_id (id, business_name),
      plan:plan_id (id, name, monthly_visit_limit, is_unlimited_visits)
    `)
    .order('created_at', { ascending: false });

  if (filter && filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createSubscription(subData: Partial<Subscription>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subData)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/clients');
  }
  return { data, error };
}

export async function updateSubscription(id: string, subData: Partial<Subscription>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('subscriptions')
    .update(subData)
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/subscriptions');
    revalidatePath('/admin/clients');
  }
  return { data, error };
}

/**
 * Get all submitted payments for validation
 */
export async function getPendingPayments() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('payments')
    .select('*, clients:client_id(business_name, contact_name)')
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending payments:', error);
    return { data: null, error };
  }

  return { data: data as Payment[], error: null };
}

/**
 * Verify a payment and activate subscription using the SQL function
 */
export async function verifyPayment(paymentId: string, adminProfileId: string) {
  if (!supabaseAdmin) throw new Error('Supabase Service Role Key is missing');

  const { data, error } = await supabaseAdmin.rpc('activate_subscription_from_verified_payment', {
    p_payment_id: paymentId,
    p_admin_profile_id: adminProfileId,
  });

  if (error) {
    console.error('Error verifying payment:', error);
    return { data: null, error };
  }

  revalidatePath('/admin/payments');
  revalidatePath('/admin/subscriptions');
  revalidatePath('/dashboard');

  // Trigger automated access flow if the client doesn't have an owner yet
  try {
    const { data: pay } = await supabaseAdmin
      .from('payments')
      .select('client_id')
      .eq('id', paymentId)
      .single();

    if (pay?.client_id) {
       await enableClientAccess(pay.client_id);
    }
  } catch (err) {
    console.error("Failed to auto-enable access:", err);
  }

  return { data, error: null };
}

/**
 * Enable dashboard access for a client (Invite + Profile)
 */
export async function enableClientAccess(clientId: string) {
  if (!supabaseAdmin) throw new Error('Servidor no configurado correctamente');

  try {
    // 1. Get Client Data
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) throw new Error('Cliente no encontrado');

    // 2. Check if user already exists in Auth
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
    let user = authData?.users.find(u => u.email === client.main_email);

    if (!user) {
      // 3. Invite user
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        client.main_email,
        { 
          redirectTo: 'http://localhost:3000/auth/set-password'
        }
      );
      if (inviteError) {
        console.error('Invite error:', inviteError);
        throw inviteError;
      }
      user = inviteData.user;
    }

    if (!user) throw new Error('No se pudo crear o encontrar el usuario');

    // 4. Create/Update Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: client.main_email,
        full_name: client.contact_name,
        role: 'client',
        is_active: true,
        updated_at: new Date().toISOString()
      });

    if (profileError) throw profileError;

    // 5. Update Client with owner ID and audit
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({
        owner_profile_id: user.id,
        invitation_sent_at: new Date().toISOString(),
        access_enabled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId);

    if (updateError) throw updateError;

    revalidatePath('/admin/clients');
    return { success: true, userId: user.id };

  } catch (error: unknown) {
    console.error("Enable Access Error:", error);
    return { error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}


/**
 * Manually update client status
 */
export async function updateClientStatus(clientId: string, status: ClientStatus) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('clients')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', clientId);

  if (error) {
    console.error('Error updating client status:', error);
    return { data: null, error };
  }

  revalidatePath('/admin/clients');
  return { data, error: null };
}

// Visit Management
export async function getVisits() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('visits')
    .select(`
      *,
      client:client_id (business_name),
      technician:assigned_to (full_name)
    `)
    .order('scheduled_start', { ascending: false });
  
  return { data, error };
}

export async function getVisitRequests(status: 'pending' | 'scheduled' | 'rejected' | 'all' = 'pending') {
  const supabase = await createServerClientComponent();
  let query = supabase
    .from('visit_requests')
    .select(`
      *,
      client:client_id (business_name),
      requested_by_profile:requested_by (full_name),
      reviewed_by_profile:reviewed_by (full_name)
    `)
    .order('requested_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data: (data || []) as VisitRequest[], error };
}

export async function scheduleVisitRequestAction(params: {
  requestId: string;
  assignedTo?: string;
  scheduledStart: string;
  scheduledEnd?: string;
  visitType: VisitType;
  title?: string;
  description?: string;
  adminNotes?: string;
}) {
  const supabase = await createServerClientComponent();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { data: null, error: new Error('Sesión inválida') };
  }

  const { data, error } = await supabase.rpc('schedule_visit_from_request', {
    p_request_id: params.requestId,
    p_admin_profile_id: authData.user.id,
    p_assigned_to: params.assignedTo || null,
    p_scheduled_start: params.scheduledStart,
    p_scheduled_end: params.scheduledEnd || null,
    p_visit_type: params.visitType,
    p_title: params.title || null,
    p_description: params.description || null,
    p_admin_notes: params.adminNotes || null,
  });

  if (!error) {
    revalidatePath('/admin/visits');
    revalidatePath('/dashboard/visits');
    revalidatePath('/dashboard');
  }

  return { data, error };
}

export async function rejectVisitRequestAction(params: { requestId: string; adminNotes?: string }) {
  const supabase = await createServerClientComponent();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { data: null, error: new Error('Sesión inválida') };
  }

  const { data, error } = await supabase.rpc('reject_visit_request', {
    p_request_id: params.requestId,
    p_admin_profile_id: authData.user.id,
    p_admin_notes: params.adminNotes || null,
  });

  if (!error) {
    revalidatePath('/admin/visits');
    revalidatePath('/dashboard/visits');
  }

  return { data, error };
}

export async function createVisit(visitData: Partial<Visit>) {
  const supabase = await createServerClientComponent();
  
  const { data: visit, error: visitError } = await supabase
    .from('visits')
    .insert(visitData)
    .select()
    .single();
  
  if (visitError) return { data: null, error: visitError };

  // Logic: Deduct from subscription if it's an 'included' visit
  if (visit.visit_type === 'included' && visit.client_id) {
    // 1. Find active subscription
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, visit_used_count, visit_available_count')
      .eq('client_id', visit.client_id)
      .eq('status', 'active')
      .maybeSingle();

    if (sub) {
      // 2. Update stats
      await supabase
        .from('subscriptions')
        .update({
          visit_used_count: sub.visit_used_count + 1,
          visit_available_count: Math.max(0, sub.visit_available_count - 1),
          updated_at: new Date().toISOString()
        })
        .eq('id', sub.id);
        
      // Also tag the visit with the subscription ID if it wasn't there
      if (!visit.subscription_id) {
        await supabase.from('visits').update({ subscription_id: sub.id }).eq('id', visit.id);
      }
    }
  }

  revalidatePath('/admin/visits');
  revalidatePath('/dashboard/visits');
  revalidatePath('/dashboard');
  
  return { data: visit, error: null };
}

export async function updateVisit(id: string, visitData: Partial<Visit>) {
  const supabase = await createServerClientComponent();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { data: null, error: 'Sesión inválida' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return { data: null, error: 'No autorizado para actualizar visitas' };
  }

  const db = supabaseAdmin || supabase;
  
  // 1. Get current state to check for type changes
  const { data: oldVisit } = await db
    .from('visits')
    .select('*')
    .eq('id', id)
    .single();

  const { data: visit, error } = await db
    .from('visits')
    .update(visitData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) return { data: null, error };

  // 2. Logic: Handle visit_type toggles
  if (oldVisit && oldVisit.visit_type !== visit.visit_type) {
    const subId = visit.subscription_id;
    if (subId) {
      const { data: sub } = await db.from('subscriptions').select('*').eq('id', subId).single();
      if (sub) {
        let newUsed = sub.visit_used_count;
        let newAvail = sub.visit_available_count;

        // Transition TO included
        if (visit.visit_type === 'included') {
          newUsed++;
          newAvail = Math.max(0, newAvail - 1);
        } 
        // Transition FROM included
        else if (oldVisit.visit_type === 'included') {
          newUsed = Math.max(0, newUsed - 1);
          newAvail++;
        }

        await db.from('subscriptions').update({
          visit_used_count: newUsed,
          visit_available_count: newAvail,
          updated_at: new Date().toISOString()
        }).eq('id', subId);
      }
    }
  }
  
  revalidatePath('/admin/visits');
  revalidatePath('/dashboard/visits');
  revalidatePath('/dashboard');
  
  return { data: visit, error };
}

/**
 * Delete a visit and revert counts if it was 'included'
 */
export async function deleteVisit(id: string) {
  const supabase = await createServerClientComponent();

  // 1. Get visit before deletion
  const { data: visit } = await supabase.from('visits').select('*').eq('id', id).single();
  
  if (visit && visit.visit_type === 'included' && visit.subscription_id) {
    // 2. Revert counts in subscription
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('id', visit.subscription_id).single();
    if (sub) {
      await supabase.from('subscriptions').update({
        visit_used_count: Math.max(0, sub.visit_used_count - 1),
        visit_available_count: sub.visit_available_count + 1,
        updated_at: new Date().toISOString()
      }).eq('id', sub.id);
    }
  }

  const { error } = await supabase.from('visits').delete().eq('id', id);

  if (!error) {
    revalidatePath('/admin/visits');
    revalidatePath('/dashboard/visits');
    revalidatePath('/dashboard');
  }

  return { error };
}

// Incident Management
export async function getIncidents() {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      client:client_id (business_name),
      reporter:reported_by (full_name),
      technician:assigned_to (full_name)
    `)
    .neq('title', 'Solicitud de visita técnica')
    .order('reported_at', { ascending: false });
  
  return { data, error };
}

export async function updateIncident(id: string, incidentData: Record<string, unknown>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('incidents')
    .update({
      ...incidentData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/incidents');
    revalidatePath('/dashboard/incidents');
  }
  return { data, error };
}

// Service Report Management
export async function getServiceReports(clientId?: string) {
  const supabase = await createServerClientComponent();
  let query = supabase
    .from('service_reports')
    .select(`
      *,
      client:client_id (business_name),
      visit:visit_id (title, scheduled_start),
      incident:incident_id (title)
    `)
    .order('created_at', { ascending: false });

  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createServiceReport(reportData: Record<string, unknown>) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('service_reports')
    .insert(reportData)
    .select()
    .single();
  
  if (!error) {
    revalidatePath('/admin/reports');
    revalidatePath('/dashboard/reports');
  }
  return { data, error };
}

// Lead Management
export async function getLeads(status?: string) {
  const supabase = await createServerClientComponent();
  let query = supabase
    .from('leads')
    .select('*, plan:plan_interest_id(*)')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!error) revalidatePath('/admin/leads');
  return { data, error };
}

export async function updateLeadNotes(id: string, notes: string) {
  const supabase = await createServerClientComponent();
  const { data, error } = await supabase
    .from('leads')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (!error) revalidatePath('/admin/leads');
  return { data, error };
}

/**
 * CONVERT LEAD TO CLIENT
 * Uses the SQL function for atomic conversion
 */
export async function convertLeadToClient(leadId: string, adminId: string, activateNow: boolean = true) {
  if (!supabaseAdmin) throw new Error('Servidor no configurado correctamente');

  const { data, error } = await supabaseAdmin.rpc('convert_lead_to_client', {
    p_lead_id: leadId,
    p_admin_profile_id: adminId,
    p_activate_now: activateNow
  });

  if (error) {
    console.error("Conversion Error:", error);
    return { error: error.message };
  }

  revalidatePath('/admin/leads');
  revalidatePath('/admin/clients');
  revalidatePath('/dashboard');
  
  return { success: true, data };
}


/**
 * Get overall admin dashboard statistics
 */
export async function getAdminStats() {
  const supabase = await createServerClientComponent();
  
  // 1. Active Clients
  const { count: activeClients } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 2. Pending Payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'submitted');

  // 3. Subscriptions (Active, Expiring, Expired)
  const { data: subsData } = await supabase
    .from('subscriptions')
    .select('status, price_snapshot_usd, days_remaining')
    .in('status', ['active', 'expired', 'suspended']);

  let mrr = 0;
  let expiringSoon = 0;
  let expired = 0;
  let activeSubs = 0;

  subsData?.forEach(sub => {
    if (sub.status === 'active') {
      activeSubs++;
      mrr += Number(sub.price_snapshot_usd);
      if (sub.days_remaining <= 7) {
        expiringSoon++;
      }
    } else if (sub.status === 'expired') {
      expired++;
    }
  });

  // 4. Incidents
  const { data: incidentsData } = await supabase
    .from('incidents')
    .select('status, priority')
    .neq('title', 'Solicitud de visita técnica')
    .in('status', ['open', 'in_progress']);

  const openIncidents = incidentsData?.length || 0;
  const criticalIncidents = incidentsData?.filter(i => i.priority === 'critical').length || 0;

  // 5. Visits this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const { count: visitsThisWeek } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_start', startOfWeek.toISOString())
    .lte('scheduled_start', endOfWeek.toISOString());

  // 6. Leads metrics
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  const { count: leadsLast7Days } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    data: {
      activeClients: activeClients || 0,
      mrr,
      pendingPayments: pendingPayments || 0,
      activeSubscriptions: activeSubs || 0,
      expiringSoon,
      expired,
      openIncidents,
      criticalIncidents,
      visitsThisWeek: visitsThisWeek || 0,
      totalLeads: totalLeads || 0,
      leadsLast7Days: leadsLast7Days || 0,
    },
    error: null
  };
}

/**
 * Build admin-facing notifications from operational events.
 */
export async function getAdminNotifications(limit: number = 20) {
  try {
    const supabase = await createServerClientComponent();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { data: [] as AdminNotification[], unreadCount: 0, error: 'Sesión inválida' };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return { data: [] as AdminNotification[], unreadCount: 0, error: 'Acceso denegado' };
    }

    const db = supabaseAdmin || supabase;

    const [leadsRes, paymentsRes, incidentsRes, visitRequestsRes, reportsRes] = await Promise.all([
      db
        .from('leads')
        .select('id, full_name, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
      db
        .from('payments')
        .select('id, reference_code, submitted_at, created_at, clients:client_id(business_name)')
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(20),
      db
        .from('incidents')
        .select('id, title, priority, reported_at, updated_at, clients:client_id(business_name)')
        .neq('title', 'Solicitud de visita técnica')
        .in('status', ['open', 'in_progress'])
        .order('reported_at', { ascending: false })
        .limit(20),
      db
        .from('visit_requests')
        .select('id, title, requested_at, priority, clients:client_id(business_name)')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(20),
      db
        .from('service_reports')
        .select('id, title, created_at, clients:client_id(business_name)')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const notifications: AdminNotification[] = [];

    for (const lead of leadsRes.data || []) {
      notifications.push({
        id: `lead-${lead.id}`,
        type: 'lead_received',
        title: 'Nuevo prospecto',
        message: `${lead.company_name || lead.full_name || 'Lead'} ingresó al embudo comercial.`,
        occurred_at: lead.created_at || new Date().toISOString(),
        href: '/admin/leads',
      });
    }

    for (const payment of paymentsRes.data || []) {
      const occurredAt = payment.submitted_at || payment.created_at || new Date().toISOString();
      const clientName = (payment.clients as { business_name?: string } | null)?.business_name;
      notifications.push({
        id: `payment-submitted-${payment.id}`,
        type: 'payment_submitted',
        title: 'Pago por validar',
        message: clientName
          ? `${clientName} cargó un comprobante${payment.reference_code ? ` (${payment.reference_code})` : ''}.`
          : `Se recibió un nuevo comprobante${payment.reference_code ? ` (${payment.reference_code})` : ''}.`,
        occurred_at: occurredAt,
        href: '/admin/payments',
      });
    }

    for (const incident of incidentsRes.data || []) {
      const clientName = (incident.clients as { business_name?: string } | null)?.business_name;
      notifications.push({
        id: `incident-open-${incident.id}`,
        type: 'incident_opened',
        title: 'Incidencia activa',
        message: clientName
          ? `${clientName}: ${incident.title}`
          : incident.title,
        occurred_at: incident.reported_at || incident.updated_at || new Date().toISOString(),
        href: '/admin/incidents',
      });
    }

    for (const request of visitRequestsRes.data || []) {
      const clientName = (request.clients as { business_name?: string } | null)?.business_name;
      notifications.push({
        id: `visit-request-${request.id}`,
        type: 'visit_request_pending',
        title: 'Solicitud de visita pendiente',
        message: clientName
          ? `${clientName}: ${request.title || 'Solicitud técnica'}`
          : request.title || 'Solicitud técnica pendiente por programar.',
        occurred_at: request.requested_at || new Date().toISOString(),
        href: '/admin/visits',
      });
    }

    for (const report of reportsRes.data || []) {
      const clientName = (report.clients as { business_name?: string } | null)?.business_name;
      notifications.push({
        id: `report-${report.id}`,
        type: 'report_uploaded',
        title: 'Reporte técnico registrado',
        message: clientName
          ? `${clientName}: ${report.title}`
          : report.title,
        occurred_at: report.created_at || new Date().toISOString(),
        href: '/admin/reports',
      });
    }

    notifications.sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());
    const sliced = notifications.slice(0, Math.max(1, limit));

    return { data: sliced, unreadCount: sliced.length, error: null };
  } catch (err: unknown) {
    console.error('Error fetching admin notifications:', err);
    return {
      data: [] as AdminNotification[],
      unreadCount: 0,
      error: serializeErrorMessage(err, 'No se pudieron cargar las notificaciones'),
    };
  }
}
